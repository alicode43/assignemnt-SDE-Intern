#!/bin/bash
# Simple start script for production

if [ ! -d "dist" ]; then
    echo "dist folder not found, building..."
    npm run build
fi

echo "Starting the application..."
exec node dist/index.js
