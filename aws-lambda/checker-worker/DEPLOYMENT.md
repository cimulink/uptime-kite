# Deployment Guide for UptimeKite Checker Worker

This guide explains how to deploy the UptimeKite Checker Worker Lambda function to AWS.

## Prerequisites

1. AWS Account with appropriate permissions
2. AWS CLI configured with your credentials
3. Node.js and npm installed
4. Terraform installed (optional, for infrastructure as code)

## Deployment Steps

### Option 1: Manual Deployment

1. **Install Dependencies**
   ```bash
   # On Linux/Mac
   ./install-deps.sh
   
   # On Windows
   install-deps.bat
   ```

2. **Build the Function**
   ```bash
   # On Linux/Mac
   ./build.sh
   
   # On Windows
   build.bat
   ```

3. **Deploy to AWS Lambda**
   - Go to the AWS Lambda console
   - Create a new function
   - Choose "Author from scratch"
   - Set the function name to "uptimekite-checker-worker"
   - Set the runtime to "Node.js 20.x"
   - Upload the `checker-worker.zip` file
   - Set the handler to `index.handler`
   - Configure environment variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `AWS_REGION`: Your AWS region (e.g., ap-south-1)
     - `AWS_SQS_URL`: Your SQS queue URL

4. **Configure SQS Trigger**
   - In the Lambda function designer, add an SQS trigger
   - Select your SQS queue
   - Set batch size to 10

### Option 2: Terraform Deployment

1. **Install Dependencies**
   ```bash
   # On Linux/Mac
   ./install-deps.sh
   
   # On Windows
   install-deps.bat
   ```

2. **Build the Function**
   ```bash
   # On Linux/Mac
   ./build.sh
   
   # On Windows
   build.bat
   ```

3. **Configure Variables**
   - Copy `terraform.tfvars.example` to `terraform.tfvars`
   - Fill in the required values:
     ```hcl
     aws_region     = "ap-south-1"
     project_name   = "uptimekite"
     database_url   = "postgresql://username:password@hostname:port/database"
     sqs_queue_url  = "https://sqs.ap-south-1.amazonaws.com/account-id/queue-name"
     ```

4. **Deploy with Terraform**
   ```bash
   terraform init
   terraform plan
   terraform apply
   ```

## Environment Variables

The Lambda function requires the following environment variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `AWS_REGION` | AWS region | `ap-south-1` |
| `AWS_SQS_URL` | SQS queue URL | `https://sqs.region.amazonaws.com/account/queue` |

## Monitoring and Logging

- The function logs to CloudWatch Logs
- Check CloudWatch Logs under `/aws/lambda/uptimekite-checker-worker`
- Set up CloudWatch Alarms for error rates and latency

## Scaling Considerations

- The function is designed to process messages in parallel
- Adjust the batch size in the SQS trigger based on your workload
- Monitor concurrency limits in AWS Lambda
- Consider using provisioned concurrency for consistent performance

## Security Considerations

- Ensure the Lambda execution role has minimal required permissions
- Use IAM policies to restrict access to only necessary resources
- Store sensitive information like database credentials in AWS Secrets Manager
- Enable VPC access if your database is not publicly accessible

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify the `DATABASE_URL` is correct
   - Ensure the database is accessible from AWS Lambda
   - Check if VPC configuration is needed

2. **SQS Permission Errors**
   - Verify the Lambda execution role has SQS permissions
   - Check the SQS queue policy allows the Lambda function

3. **Timeout Errors**
   - Increase the Lambda function timeout
   - Optimize the health check logic
   - Consider using async processing for long-running checks

### Testing Locally

You can test the function locally using the provided test scripts:

```bash
# Test HTTP endpoint checking
npx ts-node test-http-check.ts

# Test the full Lambda function with mock data
npx ts-node local-test.ts
```

## Updating the Function

To update the function:

1. Make your changes to the code
2. Rebuild the function:
   ```bash
   # On Linux/Mac
   ./build.sh
   
   # On Windows
   build.bat
   ```
3. Redeploy using your preferred method

## Cost Considerations

- AWS Lambda charges based on requests and execution time
- SQS charges for requests and data transfer
- CloudWatch Logs have storage costs
- Monitor your usage to optimize costs
