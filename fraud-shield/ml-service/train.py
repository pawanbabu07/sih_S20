import os
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib

def generate_synthetic_data(file_path, num_records=5000):
    np.random.seed(42)
    
    # Generate realistic features
    # Amount: Exponential distribution (average 6000, clipped at 100k)
    amount = np.random.exponential(scale=6000, size=num_records) + 10
    amount = np.clip(amount, 10, 100000).round(2)
    
    # Hour of transaction: day (85%), night (15%)
    hours = np.concatenate([
        np.random.randint(6, 23, size=int(num_records * 0.85)),
        np.random.randint(0, 6, size=int(num_records * 0.10)),
        np.random.randint(23, 24, size=num_records - int(num_records * 0.85) - int(num_records * 0.10))
    ])
    np.random.shuffle(hours)
    
    # Probabilistic feature generation
    is_new_receiver = np.random.choice([0, 1], size=num_records, p=[0.75, 0.25])
    is_new_device = np.random.choice([0, 1], size=num_records, p=[0.85, 0.15])
    location_change = np.random.choice([0, 1], size=num_records, p=[0.80, 0.20])
    
    failed_transactions = np.random.choice([0, 1, 2, 3, 4, 5], size=num_records, p=[0.65, 0.18, 0.08, 0.05, 0.03, 0.01])
    
    transaction_frequency = np.random.negative_binomial(n=4, p=0.35, size=num_records) + 1
    transaction_frequency = np.clip(transaction_frequency, 1, 30)
    
    account_age_days = np.random.randint(1, 1000, size=num_records)

    # Cumulative risk scorecard
    risk_score = np.zeros(num_records)
    
    # Base risk points
    risk_score += np.where(is_new_receiver == 1, 0.15, 0.0)
    risk_score += np.where(is_new_device == 1, 0.18, 0.0)
    risk_score += np.where(location_change == 1, 0.15, 0.0)
    
    # Night time risk (hour < 5 or hour > 22)
    unusual_time = ((hours < 5) | (hours > 22)).astype(int)
    risk_score += np.where(unusual_time == 1, 0.12, 0.0)
    
    # Failed transaction history
    risk_score += np.where(failed_transactions >= 3, 0.22, 0.0)
    risk_score += np.where((failed_transactions > 0) & (failed_transactions < 3), 0.08, 0.0)
    
    # Amount based risk
    risk_score += np.where(amount > 40000, 0.25, 0.0)
    risk_score += np.where((amount > 15000) & (amount <= 40000), 0.12, 0.0)
    
    # Frequency risk
    risk_score += np.where(transaction_frequency >= 10, 0.15, 0.0)
    
    # Brand new account risk
    risk_score += np.where(account_age_days < 30, 0.10, 0.0)
    
    # Add random background variance / noise
    risk_score += np.random.uniform(0.0, 0.1, size=num_records)
    
    # Scale and clamp
    risk_score = np.clip(risk_score, 0.0, 1.0)
    
    # Define threshold for labeling fraud (e.g. score >= 0.40)
    # This yields a realistic fraud class distribution of ~8% to 15%
    is_fraud = (risk_score >= 0.42).astype(int)
    
    # Flip 1.5% labels randomly to add realistic classification noise
    noise_mask = np.random.choice([False, True], size=num_records, p=[0.985, 0.015])
    is_fraud[noise_mask] = 1 - is_fraud[noise_mask]
    
    df = pd.DataFrame({
        'amount': amount,
        'transaction_hour': hours,
        'is_new_receiver': is_new_receiver,
        'is_new_device': is_new_device,
        'location_change': location_change,
        'failed_transactions': failed_transactions,
        'transaction_frequency': transaction_frequency,
        'account_age_days': account_age_days,
        'is_fraud': is_fraud
    })
    
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    df.to_csv(file_path, index=False)
    print(f"Synthetic dataset of {num_records} records generated and saved to {file_path}")
    print(f"Fraud distribution:\n{df['is_fraud'].value_counts(normalize=True)}")

def main():
    dataset_path = 'data/fraud_dataset.csv'
    
    # Always regenerate for correct risk distribution in Phase 2
    generate_synthetic_data(dataset_path)
    
    df = pd.read_csv(dataset_path)
    
    feature_cols = [
        'amount', 'transaction_hour', 'is_new_receiver', 'is_new_device',
        'location_change', 'failed_transactions', 'transaction_frequency', 'account_age_days'
    ]
    
    X = df[feature_cols]
    y = df['is_fraud']
    
    # Stratified split to maintain balance
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Train Random Forest Classifier
    model = RandomForestClassifier(n_estimators=100, random_state=42, class_weight='balanced')
    model.fit(X_train_scaled, y_train)
    
    y_pred = model.predict(X_test_scaled)
    
    print("\n--- Model Training Results ---")
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
    print(f"F1 Score:  {f1_score(y_test, y_pred):.4f}")
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    # Export artifacts
    os.makedirs('models', exist_ok=True)
    joblib.dump(model, 'models/fraud_model.pkl')
    joblib.dump(scaler, 'models/scaler.pkl')
    print("\nModel saved to models/fraud_model.pkl")
    print("Scaler saved to models/scaler.pkl")

if __name__ == '__main__':
    main()
