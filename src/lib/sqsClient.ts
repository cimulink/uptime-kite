import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand } from "@aws-sdk/client-sqs";

// Initialize the SQS client
const sqsClient = new SQSClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

// Get the SQS queue URL from environment variables
const queueUrl = process.env.AWS_SQS_URL || "";

/**
 * Send a message to the SQS queue
 * @param messageBody The message body to send
 * @param messageAttributes Optional message attributes
 * @returns The message ID if successful
 */
export const sendMessage = async (messageBody: string, messageAttributes?: Record<string, any>) => {
  try {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
      MessageAttributes: messageAttributes,
    });
    
    const response = await sqsClient.send(command);
    return response.MessageId;
  } catch (error) {
    console.error("Error sending message to SQS:", error);
    throw error;
  }
};

/**
 * Receive messages from the SQS queue
 * @param maxNumberOfMessages Maximum number of messages to receive (1-10)
 * @param waitTimeSeconds Wait time for long polling (0-20 seconds)
 * @returns Array of received messages
 */
export const receiveMessages = async (maxNumberOfMessages: number = 1, waitTimeSeconds: number = 0) => {
  try {
    const command = new ReceiveMessageCommand({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: maxNumberOfMessages,
      WaitTimeSeconds: waitTimeSeconds,
      MessageAttributeNames: ["All"],
    });
    
    const response = await sqsClient.send(command);
    return response.Messages || [];
  } catch (error) {
    console.error("Error receiving messages from SQS:", error);
    throw error;
  }
};

/**
 * Delete a message from the SQS queue
 * @param receiptHandle The receipt handle of the message to delete
 * @returns True if successful
 */
export const deleteMessage = async (receiptHandle: string) => {
  try {
    const command = new DeleteMessageCommand({
      QueueUrl: queueUrl,
      ReceiptHandle: receiptHandle,
    });
    
    await sqsClient.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting message from SQS:", error);
    throw error;
  }
};

export default sqsClient;
