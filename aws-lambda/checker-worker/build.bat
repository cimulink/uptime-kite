@echo off

REM Build script for the UptimeKite Checker Worker Lambda function (Windows)

echo Building UptimeKite Checker Worker...

REM Clean previous builds
echo Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist checker-worker.zip del checker-worker.zip

REM Install dependencies
echo Installing dependencies...
npm install

REM Compile TypeScript to JavaScript
echo Compiling TypeScript...
npx tsc

REM Create deployment package
echo Creating deployment package...
cd dist
tar -a -cf ../checker-worker.zip *
cd ..

echo Build complete! Deployment package created: checker-worker.zip
echo To deploy:
echo 1. Upload checker-worker.zip to AWS Lambda
echo 2. Set the handler to 'index.handler'
echo 3. Configure environment variables (DATABASE_URL, AWS_REGION, AWS_SQS_URL)
