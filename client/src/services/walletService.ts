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
    // Use a stream-based approach to handle the file in smaller chunks
    // This optimized method processes chunks of data rather than loading the entire file at once
    return new Promise<WalletTransaction[]>((resolve, reject) => {
      const importedTransactions: WalletTransaction[] = [];
      let headers: string[] = [];
      let processedLines = 0;
      let buffer = '';
      
      // Batch size for processing rows
      const BATCH_SIZE = 100;
      
      // Create a temporary ID counter to avoid conflicts
      const tempIdStart = 10000 + mockTransactions.length;
      
      // Create a FileReader that processes chunks of data
      const reader = new FileReader();
      const chunkSize = 1024 * 1024; // 1MB chunks
      let offset = 0;
      
      // Process CSV row and convert to transaction object
      const processRow = (rowStr: string, rowIndex: number): WalletTransaction | null => {
        if (!rowStr.trim()) return null;
        
        const values = rowStr.split(',');
        if (values.length !== headers.length) return null;
        
        const record: { [key: string]: string } = {};
        
        // Create object from CSV row
        headers.forEach((header, index) => {
          record[header.trim()] = values[index]?.trim() || '';
        });
        
        // Extract data based on standard banking CSV format
        // First, determine amount and transaction type based on provider format
        let amount = '0';
        let transactionType: 'credit' | 'debit' = 'debit';
        let description = '';
        let category = '';
        let date = new Date();
        
        // Bank statement format
        if (record['Debit Amount'] !== undefined && record['Credit Amount'] !== undefined) {
          // This is a banking statement format
          const debitAmount = parseFloat(record['Debit Amount'] || '0');
          const creditAmount = parseFloat(record['Credit Amount'] || '0');
          
          if (creditAmount > 0) {
            amount = String(creditAmount);
            transactionType = 'credit';
          } else {
            amount = String(debitAmount);
            transactionType = 'debit';
          }
          
          description = record['Type'] ? `${record['Type']} transaction` : 'Bank transaction';
          category = record['Category'] || '';
          
          // Parse date with format flexibility
          if (record['Date']) {
            try {
              // Handle various date formats
              const dateStr = record['Date'];
              if (dateStr.includes('/')) {
                const [d, m, y] = dateStr.split('/');
                date = new Date(`${m}/${d}/${y.length === 2 ? '20' + y : y}`);
              } else {
                date = new Date(dateStr);
              }
            } catch (e) {
              date = new Date();
            }
          }
        } else {
          // Handle provider-specific formats
          switch (provider) {
            case 'google_pay':
              amount = record.amount || '0';
              transactionType = record.type?.toLowerCase() === 'credit' ? 'credit' : 'debit';
              description = record.description || 'Google Pay Transaction';
              category = record.category || '';
              date = record.date ? new Date(record.date) : new Date();
              break;
              
            case 'paytm':
              amount = record.amount || '0';
              transactionType = record.type?.toLowerCase() === 'credit' ? 'credit' : 'debit';
              description = record.narration || 'Paytm Transaction';
              category = record.category || '';
              date = record.date ? new Date(record.date) : new Date();
              break;
              
            case 'phonepe':
              amount = record.amount || '0';
              transactionType = record.transaction_type?.toLowerCase() === 'credit' ? 'credit' : 'debit';
              description = record.description || 'PhonePe Transaction';
              category = record.category || '';
              date = record.transaction_date ? new Date(record.transaction_date) : new Date();
              break;
              
            default:
              // Generic fallback mapping
              amount = record.amount || '0';
              transactionType = (record.type || record.transaction_type || '')?.toLowerCase().includes('credit') 
                ? 'credit' : 'debit';
              description = record.description || `${provider} Transaction`;
              category = record.category || '';
              
              // Try different date fields
              const dateField = record.date || record.transaction_date || record.Date;
              date = dateField ? new Date(dateField) : new Date();
          }
        }
        
        // Create the transaction object
        return {
          id: tempIdStart + rowIndex,
          walletId: mockWallet.id,
          amount: String(amount),
          description,
          transactionType,
          category: mapProviderCategory(category, provider),
          date
        };
      };
      
      // Process a batch of lines from the buffer
      const processLines = () => {
        const lines = buffer.split('\n');
        
        // Keep the last line in the buffer if it's not complete
        if (lines.length > 1) {
          buffer = lines.pop() || '';
          
          // Process the header row if we haven't already
          if (headers.length === 0 && lines.length > 0) {
            headers = lines.shift()?.split(',').map(h => h.trim()) || [];
          }
          
          // Process each complete line in batches
          for (let i = 0; i < lines.length; i++) {
            const transaction = processRow(lines[i], processedLines);
            if (transaction) {
              importedTransactions.push(transaction);
            }
            processedLines++;
            
            // Process in batches to avoid blocking the UI
            if (i % BATCH_SIZE === 0 && i > 0) {
              setTimeout(() => processLines(), 0);
              return;
            }
          }
        }
      };
      
      // Handle each chunk as it's read
      reader.onload = (e) => {
        if (e.target?.result) {
          // Append the new chunk to our buffer
          buffer += e.target.result;
          
          // Process lines that we have so far
          processLines();
          
          // Read the next chunk if we have more data
          offset += chunkSize;
          if (offset < file.size) {
            readNextChunk();
          } else {
            // We've read the entire file, finalize the processing
            finalizeImport();
          }
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      
      // Read the file in chunks
      const readNextChunk = () => {
        const slice = file.slice(offset, offset + chunkSize);
        reader.readAsText(slice);
      };
      
      // Start reading the first chunk
      readNextChunk();
      
      // Finalize the import process
      const finalizeImport = () => {
        // Process any remaining data in the buffer
        if (buffer.trim()) {
          const transaction = processRow(buffer, processedLines);
          if (transaction) {
            importedTransactions.push(transaction);
          }
        }
        
        // Update wallet balance
        const totalCredit = importedTransactions
          .filter(t => t.transactionType === 'credit')
          .reduce((sum, t) => sum + Number(t.amount), 0);
          
        const totalDebit = importedTransactions
          .filter(t => t.transactionType === 'debit')
          .reduce((sum, t) => sum + Number(t.amount), 0);
          
        mockWallet = {
          ...mockWallet,
          balance: String(Number(mockWallet.balance) + totalCredit - totalDebit)
        };
        
        // Update mock transactions
        mockTransactions = [...importedTransactions, ...mockTransactions];
        
        // Resolve with the imported transactions
        resolve(importedTransactions);
      };
    });
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
