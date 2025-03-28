import { Wallet, WalletTransaction } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';

// Mock data for demo purposes
let mockWallet: Wallet = {
  id: 1,
  userId: 1,
  balance: "10760", // Store as string to match schema
};

let mockTransactions: WalletTransaction[] = [
  {
    id: 1,
    walletId: 1,
    amount: "450", // numeric in schema requires string
    description: 'Paid to friend@upi (Food)',
    transactionType: 'debit',
    category: 'food',
    date: new Date('2024-06-14T19:30:00'),
  },
  {
    id: 2,
    walletId: 1,
    amount: "5000", // numeric in schema requires string
    description: 'Added money to wallet',
    transactionType: 'credit',
    category: null,
    date: new Date('2024-06-12T14:15:00'),
  },
  {
    id: 3,
    walletId: 1,
    amount: "1250", // numeric in schema requires string
    description: 'Paid to store@upi (Shopping)',
    transactionType: 'debit',
    category: 'shopping',
    date: new Date('2024-06-10T11:20:00'),
  },
  {
    id: 4,
    walletId: 1,
    amount: "340", // numeric in schema requires string
    description: 'Paid to cab@upi (Transport)',
    transactionType: 'debit',
    category: 'transportation',
    date: new Date('2024-06-09T08:45:00'),
  },
  {
    id: 5,
    walletId: 1,
    amount: "10000", // numeric in schema requires string
    description: 'Added money to wallet',
    transactionType: 'credit',
    category: null,
    date: new Date('2024-06-05T17:30:00'),
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
      balance: String(Number(mockWallet.balance) + amount), // Convert to string for schema
    };
    
    const newTransaction: WalletTransaction = {
      id: mockTransactions.length + 1,
      walletId: mockWallet.id,
      amount: String(amount), // Convert to string for schema
      description: 'Added money to wallet',
      transactionType: 'credit',
      category: null,
      date: new Date(), // Use Date object for schema
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
      balance: String(Number(mockWallet.balance) - amount), // Convert to string for schema
    };
    
    const newTransaction: WalletTransaction = {
      id: mockTransactions.length + 1,
      walletId: mockWallet.id,
      amount: String(amount), // Convert to string for schema
      description: `Paid to ${receiverUPI} (${getCategoryName(category)})`,
      transactionType: 'debit',
      category,
      date: new Date(), // Use Date object for schema
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

// Function to import wallet transactions from payment providers
export const importTransactions = async (file: File, provider: string): Promise<WalletTransaction[]> => {
  try {
    // In a real app, this would hit the API
    // const formData = new FormData();
    // formData.append('file', file);
    // formData.append('provider', provider);
    // const response = await apiRequest('POST', '/api/wallet/import', formData);
    // const importedTransactions = await response.json();
    
    // For demo, parse the file and return mock transactions
    const fileReader = new FileReader();
    
    const fileContents = await new Promise<string>((resolve, reject) => {
      fileReader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file'));
        }
      };
      fileReader.onerror = () => {
        reject(fileReader.error);
      };
      fileReader.readAsText(file);
    });
    
    // Parse CSV data
    const rows = fileContents.split('\n');
    const headers = rows[0].split(',');
    const importedTransactions: WalletTransaction[] = [];
    
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i].trim()) continue;
      
      const values = rows[i].split(',');
      const record: { [key: string]: string } = {};
      
      // Create object from CSV row
      headers.forEach((header, index) => {
        record[header.trim()] = values[index]?.trim() || '';
      });
      
      // Map provider-specific CSV fields to wallet transaction
      let transaction: WalletTransaction;
      
      // Process the transaction based on provider
      if (provider === 'google_pay') {
        transaction = {
          id: mockTransactions.length + i,
          walletId: mockWallet.id,
          amount: String(Number(record.amount || 0)),
          description: `${record.description || 'Google Pay Transaction'}`,
          transactionType: record.type?.toLowerCase() === 'credit' ? 'credit' : 'debit',
          category: mapProviderCategory(record.category, provider),
          date: new Date(record.date || new Date()),
        };
      } else if (provider === 'paytm') {
        transaction = {
          id: mockTransactions.length + i,
          walletId: mockWallet.id,
          amount: String(Number(record.amount || 0)),
          description: `${record.narration || 'Paytm Transaction'}`,
          transactionType: record.type?.toLowerCase() === 'credit' ? 'credit' : 'debit',
          category: mapProviderCategory(record.category, provider),
          date: new Date(record.date || new Date()),
        };
      } else if (provider === 'phonepe') {
        transaction = {
          id: mockTransactions.length + i,
          walletId: mockWallet.id,
          amount: String(Number(record.amount || 0)),
          description: `${record.description || 'PhonePe Transaction'}`,
          transactionType: record.transaction_type?.toLowerCase() === 'credit' ? 'credit' : 'debit',
          category: mapProviderCategory(record.category, provider),
          date: new Date(record.transaction_date || new Date()),
        };
      } else {
        // Generic mapping
        transaction = {
          id: mockTransactions.length + i,
          walletId: mockWallet.id,
          amount: String(Number(record.amount || 0)),
          description: record.description || `${provider} Transaction`,
          transactionType: (record.type || record.transaction_type || '')?.toLowerCase().includes('credit') ? 'credit' : 'debit',
          category: mapProviderCategory(record.category, provider),
          date: new Date(record.date || record.transaction_date || new Date()),
        };
      }
      
      importedTransactions.push(transaction);
    }
    
    // Update mock data
    mockTransactions = [...importedTransactions, ...mockTransactions];
    
    // Update wallet balance
    const totalCredit = importedTransactions
      .filter(t => t.transactionType === 'credit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    const totalDebit = importedTransactions
      .filter(t => t.transactionType === 'debit')
      .reduce((sum, t) => sum + Number(t.amount), 0);
      
    mockWallet = {
      ...mockWallet,
      balance: String(Number(mockWallet.balance) + totalCredit - totalDebit), // Convert to string for schema
    };
    
    return importedTransactions;
  } catch (error) {
    console.error('Error importing transactions:', error);
    throw new Error('Failed to import transactions');
  }
};

// Map provider-specific categories to our internal categories
const mapProviderCategory = (category: string, provider: string): string => {
  if (!category) return 'others';
  
  const categoryLower = category.toLowerCase();
  
  if (categoryLower.includes('food') || categoryLower.includes('restaurant') || categoryLower.includes('dining')) {
    return 'food';
  } else if (categoryLower.includes('shop') || categoryLower.includes('retail') || categoryLower.includes('store')) {
    return 'shopping';
  } else if (categoryLower.includes('transport') || categoryLower.includes('travel') || categoryLower.includes('cab') || 
             categoryLower.includes('taxi') || categoryLower.includes('ride')) {
    return 'transportation';
  } else if (categoryLower.includes('bill') || categoryLower.includes('util')) {
    return 'utilities';
  } else if (categoryLower.includes('entertainment') || categoryLower.includes('movie') || categoryLower.includes('game')) {
    return 'entertainment';
  } else if (categoryLower.includes('health') || categoryLower.includes('doctor') || categoryLower.includes('medical')) {
    return 'healthcare';
  } else if (categoryLower.includes('edu') || categoryLower.includes('school') || categoryLower.includes('college')) {
    return 'education';
  } else if (categoryLower.includes('rent') || categoryLower.includes('house') || categoryLower.includes('home')) {
    return 'rent';
  } else {
    return 'others';
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
