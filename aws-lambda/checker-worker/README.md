# UptimeKite Checker Worker

This is an AWS Lambda function that serves as a "Checker Worker" in the UptimeKite architecture. It consumes messages from an AWS SQS queue, performs health checks on monitored endpoints, and updates the database with results.

## Architecture

The checker worker is part of a distributed, asynchronous architecture:

1. **Scheduler** (Vercel cron job) - Queries the database for monitors that are due for checking
2. **Message Queue** (AWS SQS) - Receives job messages from the scheduler
3. **Checker Workers** (AWS Lambda) - Consume messages from the queue, perform checks, and update results
4. **Database** (PostgreSQL) - Stores monitor configurations, check results, and status
5. **Alerting Service** - Sends notifications when monitor status changes

## Functionality

The Lambda function performs the following tasks:

1. **Consume SQS Messages** - Receives batched messages from the SQS queue
2. **Parse Job Data** - Extracts monitor information from each message
3. **Perform Health Checks** - 
   - For HTTP monitors: Makes HTTPS requests to the target URL
   - For Cron monitors: Verifies that the cron job has run recently
4. **Record Results** - Saves check results to the database
5. **Update Monitor Status** - Updates the monitor's status based on check results
6. **Send Notifications** - Triggers alerts when monitor status changes
7. **Delete Processed Messages** - Removes successfully processed messages from the queue

## Environment Variables

The function requires the following environment variables:

- `DATABASE_URL` - Connection string for the PostgreSQL database
- `AWS_REGION` - AWS region for SQS (defaults to ap-south-1)
- `AWS_SQS_URL` - URL of the SQS queue

## Deployment

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the TypeScript code:
   ```bash
   npx tsc
   ```

3. Package the function for deployment:
   ```bash
   # Create a zip file with the compiled code and dependencies
   cd dist
   zip -r ../checker-worker.zip .
   ```

4. Deploy to AWS Lambda using your preferred method (AWS CLI, AWS Console, Terraform, etc.)

## Monitoring and Error Handling

- The function logs all activities to CloudWatch
- Failed message processing should be handled with a Dead Letter Queue (DLQ) in production
- The function is designed to process messages in parallel for better performance
- All database connections are properly managed and released

## Future Improvements

- Implement actual notification sending (Email, SMS, Slack)
- Add more sophisticated health check logic
- Implement retry logic for failed checks
- Add support for different authentication methods for HTTP checks
- Implement more detailed logging and monitoring
