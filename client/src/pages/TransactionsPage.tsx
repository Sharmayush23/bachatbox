import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Transaction } from '@shared/schema';
import { 
  fetchTransactions, 
  createTransaction, 
  updateTransaction, 
  deleteTransaction,
  processCSVTransactions
} from '../services/transactionService';
import TransactionTable from '../components/transactions/TransactionTable';
import { parseFileData } from '../services/csvService';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewData, setPreviewData] = useState<any[]>([]);
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
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      
      if (fileExt === 'csv' || fileExt === 'xlsx' || fileExt === 'xls') {
        setSelectedFile(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please select a CSV or Excel file (.csv, .xlsx, .xls)",
          variant: "destructive",
        });
      }
    }
  };

  const handlePreviewData = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to preview",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      // Parse the file but don't process it yet
      const data = await parseFileData(selectedFile);
      setPreviewData(data);
      setShowPreviewDialog(true);
    } catch (error) {
      toast({
        title: "Error previewing file",
        description: "There was an error reading your file",
        variant: "destructive",
      });
      console.error("Preview error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleProcessFile = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select a file to process",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const importedTransactions = await processCSVTransactions(selectedFile);
      await loadTransactions();
      toast({
        title: "File Processed Successfully",
        description: `Imported ${importedTransactions.length} transactions`,
      });
      setSelectedFile(null);
      setShowPreviewDialog(false);
      
      // Reset the file input
      const fileInput = document.getElementById('fileInput') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      toast({
        title: "Error processing file",
        description: "There was an error processing your file. Check the format and try again.",
        variant: "destructive",
      });
      console.error("Processing error:", error);
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

  // Get preview column headers for the table
  const getPreviewHeaders = () => {
    if (previewData.length === 0) return [];
    return Object.keys(previewData[0]);
  };

  return (
    <section id="transactions" className="pt-8">
      <h2 className="text-2xl font-bold mb-6">Transactions</h2>
      
      {/* Upload Section */}
      <Card className="bg-card border border-border p-6 mb-8">
        <CardContent className="p-0 pt-6">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="upload">Upload Transactions</TabsTrigger>
              <TabsTrigger value="format">File Formats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload">
              <div className="text-center py-4">
                <div className="mx-auto bg-background rounded-lg p-6 border border-dashed border-border inline-block mb-4">
                  <i className="fas fa-file-upload text-primary text-3xl mb-2"></i>
                </div>
                <h3 className="text-lg font-medium mb-2">Import Transaction Data</h3>
                <p className="text-muted-foreground mb-4">Upload your bank statement or transaction data (CSV, Excel)</p>
                <div className="flex justify-center flex-wrap gap-4">
                  <label className="cursor-pointer bg-background hover:bg-primary/10 border border-primary text-primary font-medium rounded-lg py-2 px-4 transition-colors">
                    <span>{selectedFile ? selectedFile.name : 'Select File'}</span>
                    <Input 
                      type="file" 
                      id="fileInput" 
                      accept=".csv,.xlsx,.xls" 
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </label>
                  <Button 
                    onClick={handlePreviewData}
                    disabled={!selectedFile || isProcessing}
                    className="bg-primary hover:bg-primary/80 text-white font-medium rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    {isProcessing ? 'Processing...' : 'Preview & Import'}
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="format">
              <div className="space-y-4 p-4">
                <div>
                  <h4 className="text-md font-medium mb-2">Supported File Formats</h4>
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>CSV (.csv): Comma-separated values file</li>
                    <li>Excel (.xlsx, .xls): Microsoft Excel spreadsheets</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-md font-medium mb-2">Compatible Formats</h4>
                  <p className="text-sm text-muted-foreground mb-2">We support various bank statement formats, including:</p>
                  <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1 pl-4">
                    <li>Standard bank statements with date, description, debit/credit amounts</li>
                    <li>Credit card statements with transaction details</li>
                    <li>Export files from personal finance apps</li>
                  </ol>
                </div>
                
                <div className="bg-background/50 p-4 rounded-md border border-border">
                  <h4 className="text-md font-medium mb-2">Column Mapping</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Our system automatically detects and maps these common columns:
                  </p>
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr>
                        <th className="text-left font-medium text-muted-foreground py-2">Column Type</th>
                        <th className="text-left font-medium text-muted-foreground py-2">Sample Column Names</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="py-1 pr-4">Date</td>
                        <td>Date, Transaction Date, Day</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4">Amount</td>
                        <td>Amount, Debit Amount, Credit Amount</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4">Category</td>
                        <td>Category, Type, Tag</td>
                      </tr>
                      <tr>
                        <td className="py-1 pr-4">Description</td>
                        <td>Description, Particulars, Details</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Transactions Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="px-4 py-3 bg-card flex items-center justify-between">
          <h3 className="font-medium">Your Transactions</h3>
          <div className="text-sm text-muted-foreground">
            {transactions.length} transactions
          </div>
        </div>
        <TransactionTable 
          transactions={transactions} 
          isDetailed={true}
          onEdit={handleEditTransaction}
          onDelete={handleDeleteTransaction}
        />
      </div>

      {/* Data Preview Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview Transaction Data</DialogTitle>
            <DialogDescription>
              Review your imported data before processing. We detected {previewData.length} transactions.
            </DialogDescription>
          </DialogHeader>
          
          {previewData.length > 0 && (
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {getPreviewHeaders().map((header, index) => (
                      <TableHead key={index} className="whitespace-nowrap">
                        {header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 10).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {getPreviewHeaders().map((header, colIndex) => (
                        <TableCell key={colIndex} className="py-2">
                          {row[header] || '-'}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {previewData.length > 10 && (
                <div className="p-2 text-center text-sm text-muted-foreground">
                  Showing first 10 of {previewData.length} records
                </div>
              )}
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleProcessFile} 
              disabled={isLoading}
              className="bg-primary text-white"
            >
              {isLoading ? 'Processing...' : 'Import All'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
