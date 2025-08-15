#!/bin/bash

# Script to install dependencies for the Lambda function

echo "Installing dependencies for UptimeKite Checker Worker..."

# Install production dependencies
npm install @aws-sdk/client-sqs pg

# Install development dependencies
npm install --save-dev @types/aws-lambda @types/node typescript @types/pg

echo "Dependencies installed successfully!"
