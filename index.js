// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import OpenAI from "openai";

// server/storage.ts
var MemStorage = class {
  users;
  transactions;
  goals;
  wallets;
  walletTransactions;
  userIds;
  transactionIds;
  goalIds;
  walletIds;
  walletTransactionIds;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.transactions = /* @__PURE__ */ new Map();
    this.goals = /* @__PURE__ */ new Map();
    this.wallets = /* @__PURE__ */ new Map();
    this.walletTransactions = /* @__PURE__ */ new Map();
    this.userIds = 1;
    this.transactionIds = 1;
    this.goalIds = 1;
    this.walletIds = 1;
    this.walletTransactionIds = 1;
    this.initializeDemoData();
  }
  initializeDemoData() {
    const user = {
      id: this.userIds++,
      username: "demouser",
      password: "password123",
      email: "demo@example.com"
    };
    this.users.set(user.id, user);
    const demoTransactions = [
      {
        userId: user.id,
        amount: 1899,
        description: "Online Shopping",
        category: "Shopping",
        transactionType: "expense",
        date: (/* @__PURE__ */ new Date("2024-06-12")).toISOString()
      },
      {
        userId: user.id,
        amount: 42500,
        description: "Salary Deposit",
        category: "Income",
        transactionType: "income",
        date: (/* @__PURE__ */ new Date("2024-06-01")).toISOString()
      },
      {
        userId: user.id,
        amount: 1450,
        description: "Dinner with Friends",
        category: "Food & Dining",
        transactionType: "expense",
        date: (/* @__PURE__ */ new Date("2024-06-08")).toISOString()
      },
      {
        userId: user.id,
        amount: 18e3,
        description: "Rent Payment",
        category: "Housing",
        transactionType: "expense",
        date: (/* @__PURE__ */ new Date("2024-06-05")).toISOString()
      },
      {
        userId: user.id,
        amount: 2150,
        description: "Electricity Bill",
        category: "Utilities",
        transactionType: "expense",
        date: (/* @__PURE__ */ new Date("2024-06-07")).toISOString()
      }
    ];
    demoTransactions.forEach((transaction) => {
      const id = this.transactionIds++;
      this.transactions.set(id, { ...transaction, id });
    });
    const demoGoals = [
      {
        userId: user.id,
        name: "New Laptop",
        targetAmount: 75e3,
        currentAmount: 25e3,
        targetDate: (/* @__PURE__ */ new Date("2024-09-15")).toISOString(),
        monthlyIncome: 42500
      },
      {
        userId: user.id,
        name: "Vacation Fund",
        targetAmount: 1e5,
        currentAmount: 4e4,
        targetDate: (/* @__PURE__ */ new Date("2024-12-20")).toISOString(),
        monthlyIncome: 42500
      }
    ];
    demoGoals.forEach((goal) => {
      const id = this.goalIds++;
      this.goals.set(id, { ...goal, id });
    });
    const wallet = {
      id: this.walletIds++,
      userId: user.id,
      balance: 10760
    };
    this.wallets.set(wallet.id, wallet);
    const demoWalletTransactions = [
      {
        walletId: wallet.id,
        amount: 450,
        description: "Paid to friend@upi (Food)",
        transactionType: "debit",
        category: "food",
        date: (/* @__PURE__ */ new Date("2024-06-14T19:30:00")).toISOString()
      },
      {
        walletId: wallet.id,
        amount: 5e3,
        description: "Added money to wallet",
        transactionType: "credit",
        category: null,
        date: (/* @__PURE__ */ new Date("2024-06-12T14:15:00")).toISOString()
      },
      {
        walletId: wallet.id,
        amount: 1250,
        description: "Paid to store@upi (Shopping)",
        transactionType: "debit",
        category: "shopping",
        date: (/* @__PURE__ */ new Date("2024-06-10T11:20:00")).toISOString()
      },
      {
        walletId: wallet.id,
        amount: 340,
        description: "Paid to cab@upi (Transport)",
        transactionType: "debit",
        category: "transportation",
        date: (/* @__PURE__ */ new Date("2024-06-09T08:45:00")).toISOString()
      },
      {
        walletId: wallet.id,
        amount: 1e4,
        description: "Added money to wallet",
        transactionType: "credit",
        category: null,
        date: (/* @__PURE__ */ new Date("2024-06-05T17:30:00")).toISOString()
      }
    ];
    demoWalletTransactions.forEach((transaction) => {
      const id = this.walletTransactionIds++;
      this.walletTransactions.set(id, { ...transaction, id });
    });
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  async createUser(insertUser) {
    const id = this.userIds++;
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  // Transaction methods
  async getTransaction(id) {
    return this.transactions.get(id);
  }
  async getTransactionsByUserId(userId) {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }
  async createTransaction(insertTransaction) {
    const id = this.transactionIds++;
    const transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }
  async updateTransaction(id, updateData) {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    const updatedTransaction = { ...transaction, ...updateData };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }
  async deleteTransaction(id) {
    this.transactions.delete(id);
  }
  // Goal methods
  async getGoal(id) {
    return this.goals.get(id);
  }
  async getGoalsByUserId(userId) {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }
  async createGoal(insertGoal) {
    const id = this.goalIds++;
    const goal = { ...insertGoal, id };
    this.goals.set(id, goal);
    return goal;
  }
  async updateGoal(id, updateData) {
    const goal = this.goals.get(id);
    if (!goal) {
      throw new Error("Goal not found");
    }
    const updatedGoal = { ...goal, ...updateData };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }
  async deleteGoal(id) {
    this.goals.delete(id);
  }
  // Wallet methods
  async getWallet(id) {
    return this.wallets.get(id);
  }
  async getWalletByUserId(userId) {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.userId === userId
    );
  }
  async createWallet(insertWallet) {
    const id = this.walletIds++;
    const wallet = { ...insertWallet, id };
    this.wallets.set(id, wallet);
    return wallet;
  }
  async updateWallet(id, updateData) {
    const wallet = this.wallets.get(id);
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    const updatedWallet = { ...wallet, ...updateData };
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }
  // Wallet transaction methods
  async getWalletTransaction(id) {
    return this.walletTransactions.get(id);
  }
  async getWalletTransactionsByWalletId(walletId) {
    return Array.from(this.walletTransactions.values()).filter((transaction) => transaction.walletId === walletId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }
  async createWalletTransaction(insertTransaction) {
    const id = this.walletTransactionIds++;
    const transaction = { ...insertTransaction, id };
    this.walletTransactions.set(id, transaction);
    return transaction;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true
});
var transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  transactionType: text("transaction_type").notNull(),
  // "income" or "expense"
  date: timestamp("date").notNull().defaultNow()
});
var insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  amount: true,
  description: true,
  category: true,
  transactionType: true,
  date: true
});
var goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetAmount: numeric("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: numeric("current_amount", { precision: 10, scale: 2 }).notNull(),
  targetDate: timestamp("target_date").notNull(),
  monthlyIncome: numeric("monthly_income", { precision: 10, scale: 2 }).notNull(),
  reminderEnabled: boolean("reminder_enabled").default(false),
  reminderDate: timestamp("reminder_date"),
  reminderEmail: text("reminder_email"),
  reminderMessage: text("reminder_message")
});
var insertGoalSchema = createInsertSchema(goals).pick({
  userId: true,
  name: true,
  targetAmount: true,
  currentAmount: true,
  targetDate: true,
  monthlyIncome: true,
  reminderEnabled: true,
  reminderDate: true,
  reminderEmail: true,
  reminderMessage: true
});
var wallets = pgTable("wallets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  balance: numeric("balance", { precision: 10, scale: 2 }).notNull().default("0")
});
var insertWalletSchema = createInsertSchema(wallets).pick({
  userId: true,
  balance: true
});
var walletTransactions = pgTable("wallet_transactions", {
  id: serial("id").primaryKey(),
  walletId: integer("wallet_id").notNull().references(() => wallets.id),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  transactionType: text("transaction_type").notNull(),
  // "credit" or "debit"
  category: text("category"),
  date: timestamp("date").notNull().defaultNow()
});
var insertWalletTransactionSchema = createInsertSchema(walletTransactions).pick({
  walletId: true,
  amount: true,
  description: true,
  transactionType: true,
  category: true,
  date: true
});

// server/routes.ts
import { z } from "zod";
if (!process.env.OPENAI_API_KEY) {
  console.warn("Warning: OPENAI_API_KEY is not set. AI features will not work.");
}
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "An error occurred" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword, token: "mock-jwt-token" });
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  app2.get("/api/transactions", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const transactions2 = await storage.getTransactionsByUserId(userId);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  app2.post("/api/transactions", async (req, res) => {
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
  app2.put("/api/transactions/:id", async (req, res) => {
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
  app2.delete("/api/transactions/:id", async (req, res) => {
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
  app2.get("/api/goals", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const goals2 = await storage.getGoalsByUserId(userId);
      res.json(goals2);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  app2.post("/api/goals", async (req, res) => {
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
  app2.put("/api/goals/:id", async (req, res) => {
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
  app2.delete("/api/goals/:id", async (req, res) => {
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
  app2.get("/api/wallet", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      let wallet = await storage.getWalletByUserId(userId);
      if (!wallet) {
        wallet = await storage.createWallet({ userId, balance: 0 });
      }
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  app2.post("/api/wallet/add", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const { amount, paymentMethod } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      let wallet = await storage.getWalletByUserId(userId);
      if (!wallet) {
        wallet = await storage.createWallet({ userId, balance: 0 });
      }
      wallet = await storage.updateWallet(wallet.id, {
        balance: Number(wallet.balance) + Number(amount)
      });
      await storage.createWalletTransaction({
        walletId: wallet.id,
        amount,
        description: "Added money to wallet",
        transactionType: "credit",
        category: null,
        date: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  app2.post("/api/wallet/pay", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const { receiverUPI, amount, category } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      let wallet = await storage.getWalletByUserId(userId);
      if (!wallet) {
        return res.status(400).json({ message: "Wallet not found" });
      }
      if (Number(wallet.balance) < Number(amount)) {
        return res.status(400).json({ message: "Insufficient balance" });
      }
      wallet = await storage.updateWallet(wallet.id, {
        balance: Number(wallet.balance) - Number(amount)
      });
      await storage.createWalletTransaction({
        walletId: wallet.id,
        amount,
        description: `Paid to ${receiverUPI} (${category})`,
        transactionType: "debit",
        category,
        date: (/* @__PURE__ */ new Date()).toISOString()
      });
      res.json(wallet);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  app2.get("/api/wallet/transactions", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const wallet = await storage.getWalletByUserId(userId);
      if (!wallet) {
        return res.json([]);
      }
      const transactions2 = await storage.getWalletTransactionsByWalletId(wallet.id);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "An error occurred" });
    }
  });
  app2.post("/api/chatbot", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      const userId = getUserIdFromRequest(req);
      const transactions2 = await storage.getTransactionsByUserId(userId);
      const goals2 = await storage.getGoalsByUserId(userId);
      const wallet = await storage.getWalletByUserId(userId);
      const systemPrompt = `You are a helpful financial assistant for the BachatBox personal finance app. 
      The user has ${transactions2.length} transactions, ${goals2.length} financial goals, and a current balance of ${wallet?.balance || 0}.
      Answer the user's question in a helpful, friendly way. Keep responses concise but informative.
      Provide specific financial advice when possible. Don't make things up or share information not included in the prompt.`;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        max_tokens: 300
      });
      const reply = completion.choices[0].message.content;
      res.json({ reply });
    } catch (error) {
      console.error("Chatbot error:", error);
      res.status(500).json({ message: "Failed to get response from AI assistant" });
    }
  });
  app2.post("/api/financial-insights", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const transactions2 = await storage.getTransactionsByUserId(userId);
      if (transactions2.length === 0) {
        return res.json({
          insights: ["Not enough transaction data to generate insights. Add more transactions."],
          topCategories: []
        });
      }
      const categories = {};
      let totalExpenses = 0;
      let totalIncome = 0;
      transactions2.forEach((transaction) => {
        if (transaction.transactionType === "expense") {
          totalExpenses += Number(transaction.amount);
          if (transaction.category) {
            categories[transaction.category] = (categories[transaction.category] || 0) + Number(transaction.amount);
          }
        } else {
          totalIncome += Number(transaction.amount);
        }
      });
      const topCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([category, amount]) => ({ category, amount }));
      const promptData = {
        totalTransactions: transactions2.length,
        totalExpenses,
        totalIncome,
        savingsRate: totalIncome > 0 ? (totalIncome - totalExpenses) / totalIncome : 0,
        topCategories
      };
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
        response_format: { type: "json_object" }
      });
      let aiResponse;
      try {
        aiResponse = JSON.parse(completion.choices[0].message.content);
      } catch (error) {
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
  app2.patch("/api/goals/:id/reminder", async (req, res) => {
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
  app2.post("/api/savings-recommendations", async (req, res) => {
    try {
      const userId = getUserIdFromRequest(req);
      const transactions2 = await storage.getTransactionsByUserId(userId);
      if (transactions2.length < 5) {
        return res.json({
          recommendations: ["Add more transactions to get personalized savings recommendations."],
          potentialSavings: 0
        });
      }
      const expenses = transactions2.filter((t) => t.transactionType === "expense");
      const transactionData = expenses.map((t) => ({
        amount: Number(t.amount),
        category: t.category,
        description: t.description,
        date: t.date
      }));
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
        response_format: { type: "json_object" }
      });
      let aiResponse;
      try {
        aiResponse = JSON.parse(completion.choices[0].message.content);
      } catch (error) {
        aiResponse = {
          recommendations: [
            "Look for recurring subscriptions you might not need.",
            "Consider cutting back on discretionary spending.",
            "Track your expenses more carefully to identify saving opportunities."
          ],
          potentialSavings: 0
        };
      }
      res.json(aiResponse);
    } catch (error) {
      console.error("Savings recommendations error:", error);
      res.status(500).json({ message: "Failed to generate savings recommendations" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}
function getUserIdFromRequest(req) {
  return 1;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2, { dirname as dirname2 } from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var __filename2 = fileURLToPath2(import.meta.url);
var __dirname2 = dirname2(__filename2);
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
