import numpy as np
import pandas as pd

class FeatureEngineeringPipeline:
    """
    Reusable Feature Engineering and Preprocessing Pipeline for Real-Time Fraud Shield.
    Enforces identical feature transformation across Training, Validation, Testing,
    and Production Inference to prevent train-serving skew.
    """
    def __init__(self, normal_amount_baseline=3000.0, normal_frequency_baseline=2.5):
        self.normal_amount_baseline = float(normal_amount_baseline)
        self.normal_frequency_baseline = float(normal_frequency_baseline)
        self.is_fitted = False
        
        # Canonical feature names in exact column sequence
        self.feature_names = [
            'amount',
            'amount_to_normal_ratio',
            'transaction_hour',
            'is_unusual_hour',
            'is_new_receiver',
            'is_new_device',
            'location_change',
            'receiver_risk',
            'device_risk',
            'failed_transactions',
            'failed_attempts_risk',
            'transaction_frequency',
            'transaction_frequency_ratio',
            'account_age_days',
            'account_age_bucket'
        ]

    def fit(self, df):
        """Fit baseline statistics on training split only (prevents data leakage)."""
        if isinstance(df, pd.DataFrame) and 'amount' in df.columns:
            median_amt = df['amount'].median()
            self.normal_amount_baseline = float(median_amt if median_amt > 0 else 3000.0)
            
        if isinstance(df, pd.DataFrame) and 'transaction_frequency' in df.columns:
            mean_freq = df['transaction_frequency'].mean()
            self.normal_frequency_baseline = float(mean_freq if mean_freq > 0 else 2.5)
            
        self.is_fitted = True
        return self

    def _extract_dict(self, data):
        """Extract and sanitize raw features from a single dictionary or API payload."""
        def to_binary(val):
            if val is True or str(val).lower() == 'true' or str(val) == '1':
                return 1
            return 0

        amount = float(data.get('amount', 0.0))
        hour = int(data.get('transaction_hour', 12))
        is_new_receiver = to_binary(data.get('is_new_receiver', 0))
        is_new_device = to_binary(data.get('is_new_device', 0))
        location_change = to_binary(data.get('location_change', 0))
        failed_tx = int(data.get('failed_transactions', 0))
        freq = int(data.get('transaction_frequency', 1))
        account_age = int(data.get('account_age_days', 365))

        return self._compute_features(
            amount, hour, is_new_receiver, is_new_device,
            location_change, failed_tx, freq, account_age
        )

    def _compute_features(self, amount, hour, is_new_receiver, is_new_device,
                          location_change, failed_tx, freq, account_age):
        """Compute core and interaction features deterministically."""
        # 1. Amount to normal ratio
        amount_to_normal_ratio = float(np.round(amount / (self.normal_amount_baseline + 1e-5), 4))
        
        # 2. Unusual hour indicator (e.g. late night 23:00 - 05:59)
        is_unusual_hour = 1 if (hour < 6 or hour >= 23) else 0
        
        # 3. Receiver composite risk
        receiver_risk = 1 if (is_new_receiver == 1 and (amount > 15000 or is_unusual_hour == 1)) else 0
        
        # 4. Device composite risk
        device_risk = 1 if (is_new_device == 1 and (failed_tx > 0 or freq >= 6 or location_change == 1)) else 0
        
        # 5. Failed attempts risk index (0.0 to 1.0)
        failed_attempts_risk = float(np.round(min(failed_tx * 0.30, 1.0), 3))
        
        # 6. Transaction frequency ratio
        transaction_frequency_ratio = float(np.round(freq / (self.normal_frequency_baseline + 1e-5), 4))
        
        # 7. Account age bucket (3: <30d, 2: 30-180d, 1: 180-365d, 0: >365d)
        if account_age < 30:
            account_age_bucket = 3
        elif account_age < 180:
            account_age_bucket = 2
        elif account_age < 365:
            account_age_bucket = 1
        else:
            account_age_bucket = 0

        return [
            amount,
            amount_to_normal_ratio,
            hour,
            is_unusual_hour,
            is_new_receiver,
            is_new_device,
            location_change,
            receiver_risk,
            device_risk,
            failed_tx,
            failed_attempts_risk,
            freq,
            transaction_frequency_ratio,
            account_age,
            account_age_bucket
        ]

    def transform(self, data):
        """
        Transform raw DataFrame or dictionary into 2D numpy array of engineered features.
        """
        if isinstance(data, dict):
            row = self._extract_dict(data)
            return np.array([row], dtype=np.float64)
            
        if isinstance(data, pd.DataFrame):
            rows = []
            for _, row in data.iterrows():
                row_dict = row.to_dict()
                rows.append(self._extract_dict(row_dict))
            return np.array(rows, dtype=np.float64)
            
        raise ValueError("Unsupported input type for transformation. Must be dict or pd.DataFrame.")

    def fit_transform(self, df):
        """Fit baselines on df and return transformed feature matrix."""
        return self.fit(df).transform(df)

    def get_feature_names(self):
        """Return canonical feature names."""
        return list(self.feature_names)
