import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TransactionTable from '../components/transactions/TransactionTable';
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Transaction } from '@shared/schema';
import { 
  fetchTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  processCSVTransactions
} from '../services/transactionService';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (error) {
      toast({
        title: "Error loading transactions",
        description: "There was a problem loading your transaction data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProcessCSV = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a CSV file to process",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await processCSVTransactions(selectedFile);
      await loadTransactions();
      toast({
        title: "CSV Processed Successfully",
        description: "Your transaction data has been imported",
      });
      setSelectedFile(null);
      
      // Reset the file input
      const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      toast({
        title: "Error processing CSV",
        description: "There was an error processing your CSV file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTransaction = (id: number) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setSelectedTransaction(transaction);
      setIsEditing(true);
    }
  };

  const handleDeleteTransaction = (id: number) => {
    const transaction = transactions.find(t => t.id === id);
    if (transaction) {
      setSelectedTransaction(transaction);
      setShowDeleteDialog(true);
    }
  };

  const confirmDelete = async () => {
    if (selectedTransaction) {
      try {
        await deleteTransaction(selectedTransaction.id);
        setTransactions(transactions.filter(t => t.id !== selectedTransaction.id));
        toast({
          title: "Transaction Deleted",
          description: "The transaction has been deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Error Deleting Transaction",
          description: "There was an error deleting the transaction",
          variant: "destructive",
        });
      } finally {
        setShowDeleteDialog(false);
        setSelectedTransaction(null);
      }
    }
  };

  return (
    <section id="transactions" className="pt-8">
      <h2 className="text-2xl font-bold mb-6">Transactions</h2>
      
      {/* Upload Section */}
      <Card className="bg-card border border-border p-6 mb-8">
        <div className="text-center py-8">
          <div className="mx-auto bg-background rounded-lg p-6 border border-dashed border-border inline-block mb-4">
            <i className="fas fa-file-upload text-primary text-3xl mb-2"></i>
          </div>
          <h3 className="text-lg font-medium mb-2">Upload Transaction Data</h3>
          <p className="text-muted-foreground mb-4">Upload your CSV file to analyze transactions</p>
          <div className="flex justify-center flex-wrap gap-4">
            <label className="cursor-pointer bg-background hover:bg-primary/10 border border-primary text-primary font-medium rounded-lg py-2 px-4 transition-colors">
              <span>{selectedFile ? selectedFile.name : 'Select File'}</span>
              <Input 
                type="file" 
                id="csvFileInput" 
                accept=".csv" 
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            <Button 
              onClick={handleProcessCSV}
              disabled={!selectedFile || isLoading}
              className="bg-primary hover:bg-primary/80 text-white font-medium rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {isLoading ? 'Processing...' : 'Process Transactions'}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Transactions Table */}
      <TransactionTable 
        transactions={transactions} 
        isDetailed={true}
        onEdit={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this transaction?</DialogTitle>
          </DialogHeader>
          <p>
            This action cannot be undone. This will permanently delete the transaction
            from your account.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TransactionsPage;
