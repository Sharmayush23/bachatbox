import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { parseCSV } from '../../services/csvService';

type CsvUploaderProps = {
  onDataImported: (data: any) => void;
};

const CsvUploader = ({ onDataImported }: CsvUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    
    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV file",
        variant: "destructive",
      });
      return;
    }
  };
  
  const handleUpload = async () => {
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    const file = fileInput.files?.[0];
    
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const data = await parseCSV(file);
      onDataImported(data);
      
      toast({
        title: "CSV imported successfully",
        description: `Imported ${data.length} records from ${file.name}`,
      });
    } catch (error) {
      toast({
        title: "Failed to import CSV",
        description: "There was an error processing your file. Please check the format and try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <Card className="bg-card border border-border">
      <CardContent className="p-6">
        <h3 className="font-medium text-foreground mb-4">Import Monthly Expenditure</h3>
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">
            Upload a CSV file of your monthly expenditures to visualize spending patterns.
          </p>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="file"
                id="csv-upload"
                className="sr-only"
                accept=".csv"
                onChange={handleFileChange}
              />
              <label
                htmlFor="csv-upload"
                className="flex w-full cursor-pointer items-center justify-center rounded-md border border-dashed border-border bg-background py-3 hover:bg-secondary/30"
              >
                <div className="flex items-center space-x-2">
                  <i className="fas fa-file-csv text-primary"></i>
                  <span className="text-sm font-medium text-muted-foreground">
                    {fileName || "Select CSV file"}
                  </span>
                </div>
              </label>
            </div>
            <Button
              onClick={handleUpload}
              disabled={isUploading || !fileName}
              className="bg-primary text-white hover:bg-primary/90"
            >
              {isUploading ? (
                <span className="flex items-center space-x-1">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>Uploading...</span>
                </span>
              ) : (
                "Upload"
              )}
            </Button>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <p>Expected CSV format: Date, Category, Description, Amount, Type</p>
          <p>Example: 2024-03-15, Groceries, Supermarket, 120.45, expense</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default CsvUploader;