#!/bin/bash

# Build script for the UptimeKite Checker Worker Lambda function

echo "Building UptimeKite Checker Worker..."

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf dist
rm -f checker-worker.zip

# Install dependencies
echo "Installing dependencies..."
npm install

# Compile TypeScript to JavaScript
echo "Compiling TypeScript..."
npx tsc

# Create deployment package
echo "Creating deployment package..."
cd dist
zip -r ../checker-worker.zip .
cd ..

echo "Build complete! Deployment package created: checker-worker.zip"
echo "To deploy:"
echo "1. Upload checker-worker.zip to AWS Lambda"
echo "2. Set the handler to 'index.handler'"
echo "3. Configure environment variables (DATABASE_URL, AWS_REGION, AWS_SQS_URL)"
