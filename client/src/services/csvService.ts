import * as XLSX from 'xlsx';

// Function to parse both CSV and Excel files
export const parseFileData = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    // Handle Excel files (xlsx, xls)
    if (fileExt === 'xlsx' || fileExt === 'xls') {
      reader.onload = (event) => {
        try {
          if (!event.target) {
            reject(new Error('Error reading file'));
            return;
          }
          
          const data = event.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
          
          // Convert all keys to lowercase for consistency
          const standardizedData = jsonData.map(row => {
            const newRow: Record<string, any> = {};
            // Ensure row is treated as an object with string keys
            Object.keys(row as Record<string, any>).forEach(key => {
              newRow[key.toLowerCase()] = (row as Record<string, any>)[key];
            });
            return newRow;
          });
          
          resolve(standardizedData);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    } 
    // Handle CSV files
    else {
      reader.onload = (event) => {
        try {
          if (!event.target) {
            reject(new Error('Error reading file'));
            return;
          }
          
          const content = event.target.result as string;
          const rows = content.split('\n');
          
          // Extract headers (first row)
          const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
          
          // Process data rows
          const data = [];
          for (let i = 1; i < rows.length; i++) {
            if (rows[i].trim() === '') continue;
            
            const values = rows[i].split(',');
            const row: any = {};
            
            // Map values to headers
            for (let j = 0; j < headers.length; j++) {
              row[headers[j]] = values[j] ? values[j].trim() : '';
            }
            
            data.push(row);
          }
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading file'));
      };
      reader.readAsText(file);
    }
  });
};

// Keep the original function name for backward compatibility
export const parseCSV = parseFileData;

// Enhanced function to detect column mappings including personal information
export const detectColumnMappings = (headers: string[]): Record<string, string> => {
  const mappings: Record<string, string> = {};
  
  // Define patterns for common column names
  const patterns = {
    date: ['date', 'time', 'when', 'period', 'day', 'month', 'year'],
    amount: ['amount', 'sum', 'value', 'price', 'cost', 'payment', 'fee', 'expense', 'income'],
    description: ['desc', 'narration', 'particular', 'details', 'notes', 'memo', 'comment'],
    type: ['type', 'transaction', 'mode', 'payment method', 'medium'],
    category: ['category', 'tag', 'group', 'classification'],
    
    // Personal information patterns
    name: ['name', 'person', 'customer', 'client', 'user', 'account holder', 'contact'],
    email: ['email', 'e-mail', 'mail', 'electronic mail'],
    phone: ['phone', 'mobile', 'cell', 'contact number', 'telephone', 'tel'],
    address: ['address', 'location', 'residence', 'place'],
    id: ['id', 'identifier', 'account number', 'customer id']
  };
  
  // Check each header against our patterns
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase();
    
    // Check against each pattern category
    Object.entries(patterns).forEach(([category, keywords]) => {
      if (keywords.some(keyword => lowerHeader.includes(keyword))) {
        mappings[category] = header;
      }
    });
  });
  
  return mappings;
};
