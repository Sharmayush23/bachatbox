import { apiRequest } from "@/lib/queryClient";

/**
 * Gets a response from the chatbot API
 * @param message User's message to the chatbot
 * @returns AI response text
 */
export const getChatbotResponse = async (message: string): Promise<string> => {
  try {
    const response = await apiRequest('POST', '/api/chatbot', { message });
    const data = await response.json();
    return data.reply;
  } catch (error) {
    console.error('Error getting chatbot response:', error);
    throw new Error('Failed to get response from the chatbot');
  }
};

/**
 * Gets financial insights based on user's transaction data
 * @returns Object containing insights and analysis
 */
export const getFinancialInsights = async (): Promise<any> => {
  try {
    const response = await apiRequest('POST', '/api/financial-insights');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting financial insights:', error);
    throw new Error('Failed to generate financial insights');
  }
};

/**
 * Gets savings recommendations based on transaction history
 * @returns Object containing recommendations and potential savings amount
 */
export const getSavingsRecommendations = async (): Promise<any> => {
  try {
    const response = await apiRequest('POST', '/api/savings-recommendations');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting savings recommendations:', error);
    throw new Error('Failed to generate savings recommendations');
  }
};