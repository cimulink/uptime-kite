/**
 * Example usage of the SQS client
 * 
 * This file demonstrates how to use the SQS client and utility functions
 * that we've created in sqsClient.ts
 */

import sqsClient, { sendMessage, receiveMessages, deleteMessage } from "./sqsClient";

/**
 * Example function to send a message to the SQS queue
 */
export const sendExampleMessage = async () => {
  try {
    const messageBody = JSON.stringify({
      id: "example-id",
      data: "This is an example message",
      timestamp: new Date().toISOString(),
    });

    const messageId = await sendMessage(messageBody);
    console.log("Message sent successfully with ID:", messageId);
    return messageId;
  } catch (error) {
    console.error("Error sending example message:", error);
    throw error;
  }
};

/**
 * Example function to receive messages from the SQS queue
 */
export const receiveExampleMessages = async () => {
  try {
    // Receive up to 5 messages with long polling (wait up to 10 seconds)
    const messages = await receiveMessages(5, 10);
    
    console.log(`Received ${messages.length} messages:`);
    messages.forEach((message, index) => {
      console.log(`Message ${index + 1}:`, message.Body);
      
      // Process the message here
      // ...
      
      // After processing, you might want to delete the message
      // deleteMessage(message.ReceiptHandle!);
    });
    
    return messages;
  } catch (error) {
    console.error("Error receiving example messages:", error);
    throw error;
  }
};

/**
 * Example function to delete a message from the SQS queue
 * @param receiptHandle The receipt handle of the message to delete
 */
export const deleteExampleMessage = async (receiptHandle: string) => {
  try {
    await deleteMessage(receiptHandle);
    console.log("Message deleted successfully");
  } catch (error) {
    console.error("Error deleting example message:", error);
    throw error;
  }
};

// Example usage:
// sendExampleMessage();
// receiveExampleMessages();
