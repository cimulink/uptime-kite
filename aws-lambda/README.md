# AWS Lambda Functions for UptimeKite

This directory contains AWS Lambda functions for the UptimeKite monitoring service.

## Checker Worker

The `checker-worker` directory contains the Lambda function that:

1. Consumes messages from an AWS SQS queue
2. Performs health checks on monitored endpoints (HTTP or cron jobs)
3. Updates the database with check results
4. Sends notifications when monitor status changes
5. Deletes processed messages from the queue

### Key Features

- **SQS Integration**: Consumes messages from AWS SQS
- **Health Checks**: Performs HTTP requests or cron job verification
- **Database Updates**: Records check results and updates monitor status
- **Notifications**: Sends alerts when monitor status changes
- **Error Handling**: Properly handles and logs errors
- **Scalability**: Designed to process messages in parallel

### Deployment

See the [DEPLOYMENT.md](checker-worker/DEPLOYMENT.md) file in the checker-worker directory for detailed deployment instructions.

### Testing

The checker-worker directory includes several test scripts:

- `test-http-check.ts`: Tests HTTP endpoint checking
- `test-db-connection.ts`: Tests database connectivity
- `test-sqs.ts`: Tests SQS integration
- `test-notifications.ts`: Tests notification service
- `test-lambda-handler.ts`: Tests the Lambda handler
- `local-test.ts`: Simulates the AWS Lambda environment locally
- `integration-test.ts`: Runs a complete integration test

### Directory Structure

```
checker-worker/
├── index.ts              # Main Lambda function
├── notificationService.ts # Notification service
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript configuration
├── README.md             # Documentation
├── DEPLOYMENT.md         # Deployment guide
├── terraform.tf          # Terraform configuration
├── terraform.tfvars.example # Terraform variables example
├── build.sh              # Build script (Linux/Mac)
├── build.bat             # Build script (Windows)
├── install-deps.sh       # Dependency installation script (Linux/Mac)
├── install-deps.bat      # Dependency installation script (Windows)
├── local-test.ts         # Local testing script
├── test-http-check.ts    # HTTP check testing
├── test-db-connection.ts # Database connection testing
├── test-sqs.ts           # SQS testing
├── test-notifications.ts # Notification service testing
├── test-lambda-handler.ts # Lambda handler testing
└── integration-test.ts   # Integration testing
```

### Environment Variables

The checker worker requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `AWS_REGION`: AWS region (e.g., ap-south-1)
- `AWS_SQS_URL`: SQS queue URL

### Future Improvements

- Implement actual notification sending (Email, SMS, Slack)
- Add support for different authentication methods for HTTP checks
- Implement retry logic for failed checks
- Add more sophisticated health check logic
- Implement detailed logging and monitoring
