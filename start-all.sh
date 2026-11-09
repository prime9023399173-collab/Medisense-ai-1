#!/bin/bash
echo "========================================================================="
echo "   MEDISENSE AI - CONNECTED HEALTHCARE ECOSYSTEM"
echo "   Production-Style MVP [Backend + Frontend + PGlite Embedded Database]"
echo "========================================================================="

# Start Backend
cd backend && npm run start &
BACKEND_PID=$!

sleep 3

# Start Frontend
cd ../frontend && npm run dev &
FRONTEND_PID=$!

echo "Medisense AI Ecosystem running!"
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:3000"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
