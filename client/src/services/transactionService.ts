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
    const newTransactions: Transaction[] = csvData.map((row: any, index) => {
      // Check if this is a bank statement format with Credit/Debit columns
      const hasCreditDebitColumns = 
        (row['credit amount'] !== undefined || row['debit amount'] !== undefined) || 
        (row.hasOwnProperty('credit amount') || row.hasOwnProperty('debit amount'));
      
      let amount = 0;
      let transactionType = 'expense';
      
      if (hasCreditDebitColumns) {
        // Process as bank statement format
        const creditAmount = parseFloat(row['credit amount'] || '0');
        const debitAmount = parseFloat(row['debit amount'] || '0');
        
        if (creditAmount > 0) {
          amount = creditAmount;
          transactionType = 'income';
        } else {
          amount = debitAmount;
          transactionType = 'expense';
        }
      } else if (row.type?.toLowerCase() === 'credit') {
        // If the transaction has a type field with "Credit"
        amount = parseFloat(row.amount || '0');
        transactionType = 'income';
      } else {
        // Standard amount field
        amount = parseFloat(row.amount || '0');
        transactionType = row.type?.toLowerCase() === 'income' || amount > 0 ? 'income' : 'expense';
      }
      
      // Determine category - use the existing category if available or derive from type
      let category = row.category;
      if (!category && row.type && row.type !== 'Credit' && row.type !== 'Debit') {
        category = row.type;
      }
      
      // Handle various date formats
      let transactionDate = new Date();
      
      if (row.date) {
        try {
          // Try to parse the date (handles various formats)
          if (row.date.includes('/')) {
            // Handle formats like MM/DD/YYYY, DD/MM/YYYY
            const parts = row.date.split('/');
            if (parts.length === 3) {
              if (parts[2].length === 4) {
                // MM/DD/YYYY or DD/MM/YYYY
                // Assume DD/MM/YYYY for bank statement
                transactionDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
              } else if (parts[2].length === 2) {
                // DD/MM/YY format
                transactionDate = new Date(`20${parts[2]}-${parts[1]}-${parts[0]}`);
              }
            }
          } else {
            // Standard ISO format
            transactionDate = new Date(row.date);
          }
          
          // If date is invalid, use current date
          if (isNaN(transactionDate.getTime())) {
            transactionDate = new Date();
          }
        } catch (e) {
          console.warn("Could not parse date:", row.date);
          transactionDate = new Date();
        }
      }
      
      return {
        id: mockTransactions.length + index + 1,
        userId: 1,
        amount: Math.abs(amount),
        description: row.description || (row.day ? `Transaction on ${row.day}` : 'Imported transaction'),
        category: category || (transactionType === 'income' ? 'Income' : 'Others'),
        transactionType: transactionType,
        date: transactionDate.toISOString(),
      };
    });
    
    // Filter out any transactions with zero amount and no category
    const validTransactions = newTransactions.filter(t => 
      t.amount > 0 || t.category !== 'None'
    );
    
    // For demo, add to mock transactions
    mockTransactions = [...validTransactions, ...mockTransactions];
    
    return validTransactions;
  } catch (error) {
    console.error('Error processing CSV transactions:', error);
    throw new Error('Failed to process CSV transactions');
  }
};
