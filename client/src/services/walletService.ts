import { Wallet, WalletTransaction } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';

// Mock data for demo purposes
let mockWallet: Wallet = {
  id: 1,
  userId: 1,
  balance: 10760,
};

let mockTransactions: WalletTransaction[] = [
  {
    id: 1,
    walletId: 1,
    amount: 450,
    description: 'Paid to friend@upi (Food)',
    transactionType: 'debit',
    category: 'food',
    date: new Date('2024-06-14T19:30:00').toISOString(),
  },
  {
    id: 2,
    walletId: 1,
    amount: 5000,
    description: 'Added money to wallet',
    transactionType: 'credit',
    category: null,
    date: new Date('2024-06-12T14:15:00').toISOString(),
  },
  {
    id: 3,
    walletId: 1,
    amount: 1250,
    description: 'Paid to store@upi (Shopping)',
    transactionType: 'debit',
    category: 'shopping',
    date: new Date('2024-06-10T11:20:00').toISOString(),
  },
  {
    id: 4,
    walletId: 1,
    amount: 340,
    description: 'Paid to cab@upi (Transport)',
    transactionType: 'debit',
    category: 'transportation',
    date: new Date('2024-06-09T08:45:00').toISOString(),
  },
  {
    id: 5,
    walletId: 1,
    amount: 10000,
    description: 'Added money to wallet',
    transactionType: 'credit',
    category: null,
    date: new Date('2024-06-05T17:30:00').toISOString(),
  },
];

// Function to get the wallet for the current user
export const getWallet = async (): Promise<Wallet> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('GET', '/api/wallet');
    // const wallet = await response.json();
    
    // For demo, return the mock wallet
    return mockWallet;
  } catch (error) {
    console.error('Error fetching wallet:', error);
    throw new Error('Failed to fetch wallet');
  }
};

// Function to add money to the wallet
export const addMoney = async (amount: number, paymentMethod: string): Promise<Wallet> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('POST', '/api/wallet/add', { amount, paymentMethod });
    // const updatedWallet = await response.json();
    
    // For demo, update the mock wallet and add a transaction
    mockWallet = {
      ...mockWallet,
      balance: Number(mockWallet.balance) + amount,
    };
    
    const newTransaction: WalletTransaction = {
      id: mockTransactions.length + 1,
      walletId: mockWallet.id,
      amount,
      description: 'Added money to wallet',
      transactionType: 'credit',
      category: null,
      date: new Date().toISOString(),
    };
    
    mockTransactions = [newTransaction, ...mockTransactions];
    
    return mockWallet;
  } catch (error) {
    console.error('Error adding money:', error);
    throw new Error('Failed to add money to wallet');
  }
};

// Function to make a payment
export const makePayment = async (receiverUPI: string, amount: number, category: string): Promise<Wallet> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('POST', '/api/wallet/pay', { receiverUPI, amount, category });
    // const updatedWallet = await response.json();
    
    // For demo, update the mock wallet and add a transaction
    if (amount > Number(mockWallet.balance)) {
      throw new Error('Insufficient balance');
    }
    
    mockWallet = {
      ...mockWallet,
      balance: Number(mockWallet.balance) - amount,
    };
    
    const newTransaction: WalletTransaction = {
      id: mockTransactions.length + 1,
      walletId: mockWallet.id,
      amount,
      description: `Paid to ${receiverUPI} (${getCategoryName(category)})`,
      transactionType: 'debit',
      category,
      date: new Date().toISOString(),
    };
    
    mockTransactions = [newTransaction, ...mockTransactions];
    
    return mockWallet;
  } catch (error) {
    console.error('Error making payment:', error);
    throw new Error('Failed to make payment');
  }
};

// Function to get wallet transactions
export const getWalletTransactions = async (): Promise<WalletTransaction[]> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('GET', '/api/wallet/transactions');
    // const transactions = await response.json();
    
    // For demo, return the mock transactions
    return mockTransactions;
  } catch (error) {
    console.error('Error fetching wallet transactions:', error);
    throw new Error('Failed to fetch wallet transactions');
  }
};

// Helper function to get category display name
const getCategoryName = (category: string): string => {
  const categories: { [key: string]: string } = {
    food: 'Food & Dining',
    shopping: 'Shopping',
    transportation: 'Transportation',
    utilities: 'Utilities',
    entertainment: 'Entertainment',
    healthcare: 'Healthcare',
    education: 'Education',
    rent: 'Rent & Housing',
    others: 'Others',
  };
  
  return categories[category] || category;
};
