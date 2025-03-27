import { Transaction } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';
import { parseCSV } from './csvService';

// Mock data for demo purposes
let mockTransactions: Transaction[] = [
  {
    id: 1,
    userId: 1,
    amount: 1899,
    description: 'Online Shopping',
    category: 'Shopping',
    transactionType: 'expense',
    date: new Date('2024-06-12').toISOString(),
  },
  {
    id: 2,
    userId: 1,
    amount: 42500,
    description: 'Salary Deposit',
    category: 'Income',
    transactionType: 'income',
    date: new Date('2024-06-01').toISOString(),
  },
  {
    id: 3,
    userId: 1,
    amount: 1450,
    description: 'Dinner with Friends',
    category: 'Food & Dining',
    transactionType: 'expense',
    date: new Date('2024-06-08').toISOString(),
  },
  {
    id: 4,
    userId: 1,
    amount: 18000,
    description: 'Rent Payment',
    category: 'Housing',
    transactionType: 'expense',
    date: new Date('2024-06-05').toISOString(),
  },
  {
    id: 5,
    userId: 1,
    amount: 2150,
    description: 'Electricity Bill',
    category: 'Utilities',
    transactionType: 'expense',
    date: new Date('2024-06-07').toISOString(),
  },
];

// Function to fetch all transactions
export const fetchTransactions = async (): Promise<Transaction[]> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('GET', '/api/transactions');
    // const transactions = await response.json();
    
    // For demo, return the mock transactions
    return mockTransactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw new Error('Failed to fetch transactions');
  }
};

// Function to create a new transaction
export const createTransaction = async (transactionData: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('POST', '/api/transactions', { ...transactionData });
    // const newTransaction = await response.json();
    
    // For demo, create a new transaction with mock data
    const newTransaction: Transaction = {
      id: mockTransactions.length + 1,
      userId: 1,
      ...transactionData,
    };
    
    mockTransactions.push(newTransaction);
    return newTransaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw new Error('Failed to create transaction');
  }
};

// Function to update a transaction
export const updateTransaction = async (id: number, transactionData: Partial<Transaction>): Promise<Transaction> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('PUT', `/api/transactions/${id}`, { ...transactionData });
    // const updatedTransaction = await response.json();
    
    // For demo, update the mock transaction
    const index = mockTransactions.findIndex(transaction => transaction.id === id);
    if (index === -1) {
      throw new Error('Transaction not found');
    }
    
    const updatedTransaction: Transaction = {
      ...mockTransactions[index],
      ...transactionData,
    };
    
    mockTransactions[index] = updatedTransaction;
    return updatedTransaction;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw new Error('Failed to update transaction');
  }
};

// Function to delete a transaction
export const deleteTransaction = async (id: number): Promise<void> => {
  try {
    // In a real app, this would hit the API
    // await apiRequest('DELETE', `/api/transactions/${id}`);
    
    // For demo, delete from the mock transactions
    mockTransactions = mockTransactions.filter(transaction => transaction.id !== id);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw new Error('Failed to delete transaction');
  }
};

// Function to process CSV file and import transactions
export const processCSVTransactions = async (file: File): Promise<Transaction[]> => {
  try {
    // Parse the CSV file
    const csvData = await parseCSV(file);
    
    // Transform CSV data to transaction objects
    const newTransactions: Transaction[] = csvData.map((row, index) => {
      const amount = parseFloat(row.amount || '0');
      const isIncome = row.type?.toLowerCase() === 'income' || amount > 0;
      
      return {
        id: mockTransactions.length + index + 1,
        userId: 1,
        amount: Math.abs(amount),
        description: row.description || 'Imported transaction',
        category: row.category || (isIncome ? 'Income' : 'Others'),
        transactionType: isIncome ? 'income' : 'expense',
        date: row.date ? new Date(row.date).toISOString() : new Date().toISOString(),
      };
    });
    
    // In a real app, this would hit the API to bulk import
    // const response = await apiRequest('POST', '/api/transactions/import', { transactions: newTransactions });
    // const importedTransactions = await response.json();
    
    // For demo, add to mock transactions
    mockTransactions = [...newTransactions, ...mockTransactions];
    
    return newTransactions;
  } catch (error) {
    console.error('Error processing CSV transactions:', error);
    throw new Error('Failed to process CSV transactions');
  }
};
