import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { AppConfig } from '../types';

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Creates the strict system instruction based on the config object.
 */
const getSystemInstruction = (config: AppConfig): string => {
  return `
    You are a specialized AI assistant strictly focused on the topic: "${config.topic}".
    
    Scope definition: ${config.topicDescription}.

    Rules:
    1. You MUST answer questions related to ${config.topic} accurately and helpfully.
    2. If a user asks a question unrelated to ${config.topic}, you MUST politely decline.
    3. Do NOT answer off-topic questions, even if you know the answer.
    4. When declining, steer the user back to the topic of ${config.topic}.
    5. Keep your tone professional, helpful, and enthusiastic about ${config.topic}.
    6. Do not mention that you are a language model, simply state you are the ${config.assistantName} focused on ${config.topic}.
  `;
};

export const createChatSession = (config: AppConfig): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(config),
      temperature: 0.7,
    },
    history: [],
  });
};

export const sendMessageStream = async (
  chat: Chat, 
  message: string
): Promise<AsyncIterable<GenerateContentResponse>> => {
  try {
    const result = await chat.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }
};
