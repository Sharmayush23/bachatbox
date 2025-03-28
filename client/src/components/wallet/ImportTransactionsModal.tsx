import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Upload, CheckCircle2 } from "lucide-react";
import { WalletTransaction } from '@shared/schema';
import { Progress } from "@/components/ui/progress";

interface ImportTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (file: File, provider: string) => Promise<WalletTransaction[]>;
}

const ImportTransactionsModal = ({ isOpen, onClose, onImport }: ImportTransactionsModalProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [provider, setProvider] = useState<string>('google_pay');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressStage, setProgressStage] = useState<'idle' | 'reading' | 'processing' | 'complete'>('idle');
  const [progressValue, setProgressValue] = useState(0);
  const [fileSize, setFileSize] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');

  // Reset the state when the modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setProgressStage('idle');
        setProgressValue(0);
        setError(null);
      }, 300);
    }
  }, [isOpen]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExt === 'csv') {
        setSelectedFile(file);
        setFileName(file.name);
        setFileSize(formatBytes(file.size));
        setError(null);
      } else {
        setSelectedFile(null);
        setError('Please select a CSV file');
      }
    }
  };

  const simulateProgress = () => {
    // Simulate the progress of reading and processing the file
    setProgressStage('reading');
    setProgressValue(0);
    
    // Simulate file reading progress
    const readingInterval = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 50) {
          clearInterval(readingInterval);
          setProgressStage('processing');
          
          // Simulate processing progress
          const processingInterval = setInterval(() => {
            setProgressValue(prev => {
              if (prev >= 95) {
                clearInterval(processingInterval);
                return 95;
              }
              return prev + 5;
            });
          }, 300);
          
          return 50;
        }
        return prev + 5;
      });
    }, 200);
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Start simulating progress
      simulateProgress();
      
      // Perform the actual import
      await onImport(selectedFile, provider);
      
      // Complete the progress animation
      setProgressStage('complete');
      setProgressValue(100);
      
      // Close the modal after a short delay
      setTimeout(() => onClose(), 1000);
    } catch (error) {
      setProgressStage('idle');
      setProgressValue(0);
      setError('Failed to import transactions. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Import your transactions from Google Pay, Paytm, PhonePe, or other payment apps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {progressStage === 'idle' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="provider">Payment Provider</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="google_pay">Google Pay</SelectItem>
                    <SelectItem value="paytm">Paytm</SelectItem>
                    <SelectItem value="phonepe">PhonePe</SelectItem>
                    <SelectItem value="amazon_pay">Amazon Pay</SelectItem>
                    <SelectItem value="bank_statement">Bank Statement</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Transaction File (CSV)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                </div>
                {selectedFile && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                    <span>{fileName} ({fileSize})</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  Upload a CSV export file from your payment app.
                </p>
              </div>

              <div className="bg-muted/50 p-3 rounded-md">
                <h4 className="font-medium text-sm mb-2">File Format Guidelines</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Your CSV file should include these columns:
                </p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                  <li>Date (transaction date)</li>
                  <li>Amount (transaction amount)</li>
                  <li>Type (credit/debit)</li>
                  <li>Description/Narration (transaction details)</li>
                  <li>Category (optional)</li>
                </ul>
                <p className="text-xs text-muted-foreground mt-2">
                  Bank statements with Debit Amount/Credit Amount columns are also supported.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-6 py-4">
              <div className="text-center">
                {progressStage === 'complete' ? (
                  <CheckCircle2 className="w-12 h-12 mx-auto text-green-500 mb-2" />
                ) : (
                  <Upload className="w-12 h-12 mx-auto text-primary animate-pulse mb-2" />
                )}
                <h3 className="text-lg font-medium">
                  {progressStage === 'reading' && 'Reading CSV file...'}
                  {progressStage === 'processing' && 'Processing transactions...'}
                  {progressStage === 'complete' && 'Import Complete!'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {progressStage === 'reading' && 'Reading and parsing the CSV data...'}
                  {progressStage === 'processing' && 'Converting data to transactions...'}
                  {progressStage === 'complete' && 'Transactions have been imported successfully.'}
                </p>
              </div>
              
              <Progress value={progressValue} className="h-2" />
              
              <p className="text-xs text-center text-muted-foreground">
                {fileName} ({fileSize})
              </p>
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          {progressStage === 'idle' && (
            <>
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!selectedFile || isLoading}>
                {isLoading ? 'Importing...' : 'Import Transactions'}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportTransactionsModal;