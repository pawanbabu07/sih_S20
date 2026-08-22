#!/bin/bash
echo "======================================================"
echo "  EXPLAINABLE REAL-TIME FRAUD SHIELD - SIH DEMO START "
echo "======================================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

echo "[1/3] Starting Python ML Microservice (Port 8000)..."
(cd "$SCRIPT_DIR/fraud-shield/ml-service" && python app.py) &
ML_PID=$!

sleep 2

echo "[2/3] Starting Node.js Backend Server (Port 5000)..."
(cd "$SCRIPT_DIR/fraud-shield/server" && npm run dev) &
SERVER_PID=$!

sleep 2

echo "[3/3] Starting Vite React Frontend (Port 5173)..."
(cd "$SCRIPT_DIR/fraud-shield/client" && npm run dev) &
CLIENT_PID=$!

echo ""
echo "======================================================"
echo "  All 3 services running in background!"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5000"
echo "  ML API:   http://localhost:8000"
echo "======================================================"
echo "Press Ctrl+C to stop all services."

trap "kill $ML_PID $SERVER_PID $CLIENT_PID; exit" INT TERM
wait
