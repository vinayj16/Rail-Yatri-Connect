// Chatbot implementation
import { getAIResponse } from "./perplexity-ai";

/**
 * Get a response from the chatbot
 * Will attempt to use the Perplexity AI API if available, otherwise falls back to rule-based responses
 * @param message The user's message
 * @returns A promise that resolves to the chatbot response
 */
export async function getChatbotResponse(message: string): Promise<string> {
  return await getAIResponse(message);
}