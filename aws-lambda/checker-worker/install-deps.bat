@echo off

REM Script to install dependencies for the Lambda function (Windows)

echo Installing dependencies for UptimeKite Checker Worker...

REM Install production dependencies
npm install @aws-sdk/client-sqs pg

REM Install development dependencies
npm install --save-dev @types/aws-lambda @types/node typescript @types/pg

echo Dependencies installed successfully!
