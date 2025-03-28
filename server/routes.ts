import type { Express } from "express";
import { createServer, type Server } from "http";
import OpenAI from "openai";
import { storage } from "./storage";
import { insertUserSchema, insertTransactionSchema, insertGoalSchema, insertWalletSchema, insertWalletTransactionSchema } from "@shared/schema";
import { z } from "zod";

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  console.warn('Warning: OPENAI_API_KEY is not set. AI features will not work.');
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const user = await storage.createUser(userData);
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Don't return the password
      const { password: _, ...userWithoutPassword } = user;
      
      res.json({ user: userWithoutPassword, token: "mock-jwt-token" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  // Transaction routes
  app.get("/api/transactions", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const transactions = await storage.getTransactionsByUserId(userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.post("/api/transactions", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId
      });
      
      const transaction = await storage.createTransaction(transactionData);
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.put("/api/transactions/:id", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const transactionId = parseInt(req.params.id);
      
      const existingTransaction = await storage.getTransaction(transactionId);
      
      if (!existingTransaction || existingTransaction.userId !== userId) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const updatedTransaction = await storage.updateTransaction(transactionId, req.body);
      res.json(updatedTransaction);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.delete("/api/transactions/:id", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const transactionId = parseInt(req.params.id);
      
      const existingTransaction = await storage.getTransaction(transactionId);
      
      if (!existingTransaction || existingTransaction.userId !== userId) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      await storage.deleteTransaction(transactionId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  // Goal routes
  app.get("/api/goals", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const goals = await storage.getGoalsByUserId(userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.post("/api/goals", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const goalData = insertGoalSchema.parse({
        ...req.body,
        userId
      });
      
      const goal = await storage.createGoal(goalData);
      res.status(201).json(goal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.put("/api/goals/:id", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const goalId = parseInt(req.params.id);
      
      const existingGoal = await storage.getGoal(goalId);
      
      if (!existingGoal || existingGoal.userId !== userId) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const updatedGoal = await storage.updateGoal(goalId, req.body);
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.delete("/api/goals/:id", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const goalId = parseInt(req.params.id);
      
      const existingGoal = await storage.getGoal(goalId);
      
      if (!existingGoal || existingGoal.userId !== userId) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      await storage.deleteGoal(goalId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  // Wallet routes
  app.get("/api/wallet", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      let wallet = await storage.getWalletByUserId(userId);
      
      // Create wallet if it doesn't exist
      if (!wallet) {
        wallet = await storage.createWallet({ userId, balance: 0 });
      }
      
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.post("/api/wallet/add", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const { amount, paymentMethod } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      let wallet = await storage.getWalletByUserId(userId);
      
      // Create wallet if it doesn't exist
      if (!wallet) {
        wallet = await storage.createWallet({ userId, balance: 0 });
      }
      
      // Update wallet balance
      wallet = await storage.updateWallet(wallet.id, {
        balance: Number(wallet.balance) + Number(amount)
      });
      
      // Add transaction
      await storage.createWalletTransaction({
        walletId: wallet.id,
        amount,
        description: "Added money to wallet",
        transactionType: "credit",
        category: null,
        date: new Date().toISOString()
      });
      
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.post("/api/wallet/pay", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const { receiverUPI, amount, category } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      
      let wallet = await storage.getWalletByUserId(userId);
      
      // Check if wallet exists and has enough balance
      if (!wallet) {
        return res.status(400).json({ message: "Wallet not found" });
      }
      
      if (Number(wallet.balance) < Number(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      
      // Update wallet balance
      wallet = await storage.updateWallet(wallet.id, {
        balance: Number(wallet.balance) - Number(amount)
      });
      
      // Add transaction
      await storage.createWalletTransaction({
        walletId: wallet.id,
        amount,
        description: `Paid to ${receiverUPI} (${category})`,
        transactionType: "debit",
        category,
        date: new Date().toISOString()
      });
      
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  
  app.get("/api/wallet/transactions", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const wallet = await storage.getWalletByUserId(userId);
      
      if (!wallet) {
        return res.json([]);
      }
      
      const transactions = await storage.getWalletTransactionsByWalletId(wallet.id);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // ------------------- AI Chatbot and Insights Routes -------------------

  // Chatbot route
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      const userId = getUserIdFromRequest(req);
      
      // Get user's transactions and financial data for context
      const transactions = await storage.getTransactionsByUserId(userId);
      const goals = await storage.getGoalsByUserId(userId);
      const wallet = await storage.getWalletByUserId(userId);
      
      // Create system prompt with financial context
      const systemPrompt = `You are a helpful financial assistant for the BachatBox personal finance app. 
      The user has ${transactions.length} transactions, ${goals.length} financial goals, and a current balance of ${wallet?.balance || 0}.
      Answer the user's question in a helpful, friendly way. Keep responses concise but informative.
      Provide specific financial advice when possible. Don't make things up or share information not included in the prompt.`;
      
      // Get response from OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 300,
      });
      
      const reply = completion.choices[0].message.content;
      
      res.json({ reply });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ message: "Failed to get response from AI assistant" });
    }
  });
  
  // Financial insights route
  app.post("/api/financial-insights", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const transactions = await storage.getTransactionsByUserId(userId);
      
      if (transactions.length === 0) {
        return res.json({ 
          insights: ["Not enough transaction data to generate insights. Add more transactions."],
          topCategories: []
        });
      }
      
      // Process transaction data
      const categories: Record<string, number> = {};
      let totalExpenses = 0;
      let totalIncome = 0;
      
      transactions.forEach(transaction => {
        if (transaction.transactionType === 'expense') {
          totalExpenses += Number(transaction.amount);
          if (transaction.category) {
            categories[transaction.category] = (categories[transaction.category] || 0) + Number(transaction.amount);
          }
        } else {
          totalIncome += Number(transaction.amount);
        }
      });
      
      // Sort categories by amount spent
      const topCategories = Object.entries(categories)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([category, amount]) => ({ category, amount }));
      
      // Generate insights with OpenAI
      const promptData = {
        totalTransactions: transactions.length,
        totalExpenses,
        totalIncome,
        savingsRate: totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0,
        topCategories,
      };
      
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { 
            role: "system", 
            content: "You are a financial insights generator for the BachatBox finance app. Generate 3-5 practical financial insights based on the provided data. Keep insights concise (1-2 sentences each) and actionable. Focus on spending patterns, savings opportunities, and financial health."
          },
          { 
            role: "user", 
            content: JSON.stringify(promptData)
          }
        ],
        response_format: { type: "json_object" },
      });
      
      // Parse JSON response from OpenAI
      let aiResponse;
      try {
        aiResponse = JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        // Fallback if parsing fails
        aiResponse = { insights: ["Based on your spending patterns, there may be opportunities to save."] };
      }
      
      res.json({ 
        insights: aiResponse.insights || [],
        topCategories,
        savingsRate: promptData.savingsRate,
        totalExpenses,
        totalIncome
      });
      
    } catch (error) {
      console.error("Financial insights error:", error);
      res.status(500).json({ message: "Failed to generate financial insights" });
    }
  });
  
  // Goal reminder route
  app.patch("/api/goals/:id/reminder", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const goalId = parseInt(req.params.id);
      
      const existingGoal = await storage.getGoal(goalId);
      
      if (!existingGoal || existingGoal.userId !== userId) {
        return res.status(404).json({ message: "Goal not found" });
      }
      
      const { reminderEnabled, reminderDate, reminderEmail, reminderMessage } = req.body;
      
      const updatedGoal = await storage.updateGoal(goalId, {
        reminderEnabled,
        reminderDate: reminderDate ? new Date(reminderDate) : null,
        reminderEmail,
        reminderMessage
      });
      
      res.json(updatedGoal);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });

  // Savings recommendations route
  app.post("/api/savings-recommendations", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const transactions = await storage.getTransactionsByUserId(userId);
      
      if (transactions.length < 5) {
        return res.json({ 
          recommendations: ["Add more transactions to get personalized savings recommendations."],
          potentialSavings: 0
        });
      }
      
      // Get the expense transactions
      const expenses = transactions.filter(t => t.transactionType === 'expense');
      
      // Format data for OpenAI
      const transactionData = expenses.map(t => ({
        amount: Number(t.amount),
        category: t.category,
        description: t.description,
        date: t.date
      }));
      
      // Generate savings recommendations with OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { 
            role: "system", 
            content: "You are a savings recommendation engine for the BachatBox finance app. Analyze the expense transactions and suggest 3 specific ways the user could save money. Format your response as a JSON object with 'recommendations' (array of strings) and 'potentialSavings' (numeric estimate of monthly savings)."
          },
          { 
            role: "user", 
            content: JSON.stringify({ expenses: transactionData })
          }
        ],
        response_format: { type: "json_object" },
      });
      
      // Parse JSON response from OpenAI
      let aiResponse;
      try {
        aiResponse = JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        // Fallback if parsing fails
        aiResponse = { 
          recommendations: ["Look for recurring subscriptions you might not need.", 
                           "Consider cutting back on discretionary spending.", 
                           "Track your expenses more carefully to identify saving opportunities."],
          potentialSavings: 0
        };
      }
      
      res.json(aiResponse);
      
    } catch (error) {
      console.error("Savings recommendations error:", error);
      res.status(500).json({ message: "Failed to generate savings recommendations" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to extract user ID from request
// In a real app, this would get the user ID from JWT token
function getUserIdFromRequest(req: any): number {
  // For demo purposes, always return user ID 1
  return 1;
}
