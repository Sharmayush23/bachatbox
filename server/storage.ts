import { 
  users, type User, type InsertUser,
  transactions, type Transaction, type InsertTransaction,
  goals, type Goal, type InsertGoal,
  wallets, type Wallet, type InsertWallet,
  walletTransactions, type WalletTransaction, type InsertWalletTransaction
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Transaction operations
  getTransaction(id: number): Promise<Transaction | undefined>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(id: number, transaction: Partial<Transaction>): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;

  // Goal operations
  getGoal(id: number): Promise<Goal | undefined>;
  getGoalsByUserId(userId: number): Promise<Goal[]>;
  createGoal(goal: InsertGoal): Promise<Goal>;
  updateGoal(id: number, goal: Partial<Goal>): Promise<Goal>;
  deleteGoal(id: number): Promise<void>;

  // Wallet operations
  getWallet(id: number): Promise<Wallet | undefined>;
  getWalletByUserId(userId: number): Promise<Wallet | undefined>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWallet(id: number, wallet: Partial<Wallet>): Promise<Wallet>;

  // Wallet transaction operations
  getWalletTransaction(id: number): Promise<WalletTransaction | undefined>;
  getWalletTransactionsByWalletId(walletId: number): Promise<WalletTransaction[]>;
  createWalletTransaction(transaction: InsertWalletTransaction): Promise<WalletTransaction>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private transactions: Map<number, Transaction>;
  private goals: Map<number, Goal>;
  private wallets: Map<number, Wallet>;
  private walletTransactions: Map<number, WalletTransaction>;
  private userIds: number;
  private transactionIds: number;
  private goalIds: number;
  private walletIds: number;
  private walletTransactionIds: number;

  constructor() {
    this.users = new Map();
    this.transactions = new Map();
    this.goals = new Map();
    this.wallets = new Map();
    this.walletTransactions = new Map();
    this.userIds = 1;
    this.transactionIds = 1;
    this.goalIds = 1;
    this.walletIds = 1;
    this.walletTransactionIds = 1;

    // Initialize with demo data
    this.initializeDemoData();
  }

  private initializeDemoData(): void {
    // Add a demo user
    const user: User = {
      id: this.userIds++,
      username: "demouser",
      password: "password123",
      email: "demo@example.com"
    };
    this.users.set(user.id, user);

    // Add demo transactions
    const demoTransactions: Omit<Transaction, "id">[] = [
      {
        userId: user.id,
        amount: 1899,
        description: "Online Shopping",
        category: "Shopping",
        transactionType: "expense",
        date: new Date("2024-06-12").toISOString()
      },
      {
        userId: user.id,
        amount: 42500,
        description: "Salary Deposit",
        category: "Income",
        transactionType: "income",
        date: new Date("2024-06-01").toISOString()
      },
      {
        userId: user.id,
        amount: 1450,
        description: "Dinner with Friends",
        category: "Food & Dining",
        transactionType: "expense",
        date: new Date("2024-06-08").toISOString()
      },
      {
        userId: user.id,
        amount: 18000,
        description: "Rent Payment",
        category: "Housing",
        transactionType: "expense",
        date: new Date("2024-06-05").toISOString()
      },
      {
        userId: user.id,
        amount: 2150,
        description: "Electricity Bill",
        category: "Utilities",
        transactionType: "expense",
        date: new Date("2024-06-07").toISOString()
      }
    ];

    demoTransactions.forEach(transaction => {
      const id = this.transactionIds++;
      this.transactions.set(id, { ...transaction, id });
    });

    // Add demo goals
    const demoGoals: Omit<Goal, "id">[] = [
      {
        userId: user.id,
        name: "New Laptop",
        targetAmount: 75000,
        currentAmount: 25000,
        targetDate: new Date("2024-09-15").toISOString(),
        monthlyIncome: 42500
      },
      {
        userId: user.id,
        name: "Vacation Fund",
        targetAmount: 100000,
        currentAmount: 40000,
        targetDate: new Date("2024-12-20").toISOString(),
        monthlyIncome: 42500
      }
    ];

    demoGoals.forEach(goal => {
      const id = this.goalIds++;
      this.goals.set(id, { ...goal, id });
    });

    // Add demo wallet
    const wallet: Wallet = {
      id: this.walletIds++,
      userId: user.id,
      balance: 10760
    };
    this.wallets.set(wallet.id, wallet);

    // Add demo wallet transactions
    const demoWalletTransactions: Omit<WalletTransaction, "id">[] = [
      {
        walletId: wallet.id,
        amount: 450,
        description: "Paid to friend@upi (Food)",
        transactionType: "debit",
        category: "food",
        date: new Date("2024-06-14T19:30:00").toISOString()
      },
      {
        walletId: wallet.id,
        amount: 5000,
        description: "Added money to wallet",
        transactionType: "credit",
        category: null,
        date: new Date("2024-06-12T14:15:00").toISOString()
      },
      {
        walletId: wallet.id,
        amount: 1250,
        description: "Paid to store@upi (Shopping)",
        transactionType: "debit",
        category: "shopping",
        date: new Date("2024-06-10T11:20:00").toISOString()
      },
      {
        walletId: wallet.id,
        amount: 340,
        description: "Paid to cab@upi (Transport)",
        transactionType: "debit",
        category: "transportation",
        date: new Date("2024-06-09T08:45:00").toISOString()
      },
      {
        walletId: wallet.id,
        amount: 10000,
        description: "Added money to wallet",
        transactionType: "credit",
        category: null,
        date: new Date("2024-06-05T17:30:00").toISOString()
      }
    ];

    demoWalletTransactions.forEach(transaction => {
      const id = this.walletTransactionIds++;
      this.walletTransactions.set(id, { ...transaction, id });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIds++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Transaction methods
  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactions.get(id);
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values()).filter(
      (transaction) => transaction.userId === userId
    );
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIds++;
    const transaction: Transaction = { ...insertTransaction, id };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async updateTransaction(id: number, updateData: Partial<Transaction>): Promise<Transaction> {
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error("Transaction not found");
    }
    const updatedTransaction = { ...transaction, ...updateData };
    this.transactions.set(id, updatedTransaction);
    return updatedTransaction;
  }

  async deleteTransaction(id: number): Promise<void> {
    this.transactions.delete(id);
  }

  // Goal methods
  async getGoal(id: number): Promise<Goal | undefined> {
    return this.goals.get(id);
  }

  async getGoalsByUserId(userId: number): Promise<Goal[]> {
    return Array.from(this.goals.values()).filter(
      (goal) => goal.userId === userId
    );
  }

  async createGoal(insertGoal: InsertGoal): Promise<Goal> {
    const id = this.goalIds++;
    const goal: Goal = { ...insertGoal, id };
    this.goals.set(id, goal);
    return goal;
  }

  async updateGoal(id: number, updateData: Partial<Goal>): Promise<Goal> {
    const goal = this.goals.get(id);
    if (!goal) {
      throw new Error("Goal not found");
    }
    const updatedGoal = { ...goal, ...updateData };
    this.goals.set(id, updatedGoal);
    return updatedGoal;
  }

  async deleteGoal(id: number): Promise<void> {
    this.goals.delete(id);
  }

  // Wallet methods
  async getWallet(id: number): Promise<Wallet | undefined> {
    return this.wallets.get(id);
  }

  async getWalletByUserId(userId: number): Promise<Wallet | undefined> {
    return Array.from(this.wallets.values()).find(
      (wallet) => wallet.userId === userId
    );
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const id = this.walletIds++;
    const wallet: Wallet = { ...insertWallet, id };
    this.wallets.set(id, wallet);
    return wallet;
  }

  async updateWallet(id: number, updateData: Partial<Wallet>): Promise<Wallet> {
    const wallet = this.wallets.get(id);
    if (!wallet) {
      throw new Error("Wallet not found");
    }
    const updatedWallet = { ...wallet, ...updateData };
    this.wallets.set(id, updatedWallet);
    return updatedWallet;
  }

  // Wallet transaction methods
  async getWalletTransaction(id: number): Promise<WalletTransaction | undefined> {
    return this.walletTransactions.get(id);
  }

  async getWalletTransactionsByWalletId(walletId: number): Promise<WalletTransaction[]> {
    return Array.from(this.walletTransactions.values())
      .filter((transaction) => transaction.walletId === walletId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createWalletTransaction(insertTransaction: InsertWalletTransaction): Promise<WalletTransaction> {
    const id = this.walletTransactionIds++;
    const transaction: WalletTransaction = { ...insertTransaction, id };
    this.walletTransactions.set(id, transaction);
    return transaction;
  }
}

export const storage = new MemStorage();
