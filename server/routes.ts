import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertTransactionSchema, insertGoalSchema, insertWalletSchema, insertWalletTransactionSchema } from "@shared/schema";
import { z } from "zod";

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

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to extract user ID from request
// In a real app, this would get the user ID from JWT token
function getUserIdFromRequest(req: any): number {
  // For demo purposes, always return user ID 1
  return 1;
}
