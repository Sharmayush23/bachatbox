import { useState } from 'react';
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
import { AlertCircle } from "lucide-react";
import { WalletTransaction } from '@shared/schema';

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExt === 'csv') {
        setSelectedFile(file);
        setError(null);
      } else {
        setSelectedFile(null);
        setError('Please select a CSV file');
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a file');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      await onImport(selectedFile, provider);
      onClose();
    } catch (error) {
      setError('Failed to import transactions. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Transactions</DialogTitle>
          <DialogDescription>
            Import your transactions from Google Pay, Paytm, PhonePe, or other payment apps.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            <p className="text-sm text-muted-foreground">
              Upload a CSV export file from your payment app.
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="bg-muted/50 p-3 rounded-md">
            <h4 className="font-medium text-sm mb-2">File Format Guidelines</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Your CSV file should include these columns:
            </p>
            <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
              <li>Date (transaction date)</li>
              <li>Amount (transaction amount)</li>
              <li>Type (credit/debit)</li>
              <li>Description (transaction details)</li>
              <li>Category (optional)</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!selectedFile || isLoading}>
            {isLoading ? 'Importing...' : 'Import Transactions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportTransactionsModal;