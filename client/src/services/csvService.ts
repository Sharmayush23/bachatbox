// Function to parse CSV file
export const parseCSV = async (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
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
    };
    
    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };
    
    reader.readAsText(file);
  });
};

// Function to auto-detect column mappings
export const detectColumnMappings = (headers: string[]): Record<string, string> => {
  const mappings: Record<string, string> = {};
  
  headers.forEach(header => {
    const lowerHeader = header.toLowerCase();
    
    if (lowerHeader.includes('date') || lowerHeader.includes('time')) {
      mappings.date = header;
    } else if (lowerHeader.includes('amount') || lowerHeader.includes('sum') || lowerHeader.includes('value')) {
      mappings.amount = header;
    } else if (lowerHeader.includes('desc') || lowerHeader.includes('narration') || lowerHeader.includes('particular')) {
      mappings.description = header;
    } else if (lowerHeader.includes('type') || lowerHeader.includes('transaction') || lowerHeader.includes('mode')) {
      mappings.type = header;
    } else if (lowerHeader.includes('category') || lowerHeader.includes('tag')) {
      mappings.category = header;
    }
  });
  
  return mappings;
};
