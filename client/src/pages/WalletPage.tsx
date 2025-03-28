import { useState, useEffect } from 'react';
import WalletCard from '../components/wallet/WalletCard';
import PaymentForm from '../components/wallet/PaymentForm';
import AddMoneyModal from '../components/wallet/AddMoneyModal';
import ImportTransactionsModal from '../components/wallet/ImportTransactionsModal';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from '@/hooks/use-toast';
import { Download, Upload } from 'lucide-react';
import { Wallet, WalletTransaction } from '@shared/schema';
import { 
  getWallet, 
  addMoney, 
  makePayment, 
  getWalletTransactions,
  importTransactions
} from '../services/walletService';

const WalletPage = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setIsLoading(true);
      const walletData = await getWallet();
      const transactionsData = await getWalletTransactions();
      
      setWallet(walletData);
      setTransactions(transactionsData);
    } catch (error) {
      toast({
        title: "Error loading wallet",
        description: "There was a problem loading your wallet data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMoney = async (amount: number, paymentMethod: string) => {
    if (!wallet) return;
    
    try {
      const updatedWallet = await addMoney(amount, paymentMethod);
      setWallet(updatedWallet);
      
      // Refresh transactions after adding money
      const transactionsData = await getWalletTransactions();
      setTransactions(transactionsData);
      
      toast({
        title: "Money Added",
        description: `₹${amount.toLocaleString('en-IN')} has been added to your wallet`,
      });
    } catch (error) {
      toast({
        title: "Error Adding Money",
        description: "There was a problem adding money to your wallet",
        variant: "destructive",
      });
    }
  };

  const handlePayment = async (data: { receiverUPI: string; amount: number; category: string }) => {
    if (!wallet) return;
    
    try {
      const updatedWallet = await makePayment(data.receiverUPI, data.amount, data.category);
      setWallet(updatedWallet);
      
      // Refresh transactions after payment
      const transactionsData = await getWalletTransactions();
      setTransactions(transactionsData);
      
      toast({
        title: "Payment Successful",
        description: `₹${data.amount.toLocaleString('en-IN')} has been sent to ${data.receiverUPI}`,
      });
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "There was a problem processing your payment",
        variant: "destructive",
      });
    }
  };
  
  const handleImportTransactions = async (file: File, provider: string) => {
    try {
      setIsLoading(true);
      const importedTransactions = await importTransactions(file, provider);
      
      // Refresh wallet and transactions
      const walletData = await getWallet();
      const transactionsData = await getWalletTransactions();
      
      setWallet(walletData);
      setTransactions(transactionsData);
      
      toast({
        title: "Import Successful",
        description: `Imported ${importedTransactions.length} transactions from ${provider.replace('_', ' ')}`,
      });
      
      return importedTransactions;
    } catch (error) {
      toast({
        title: "Import Failed",
        description: "There was a problem importing your transactions",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="wallet" className="pt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Digital Wallet</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={() => setIsImportModalOpen(true)}
          >
            <Upload className="h-4 w-4" />
            <span>Import Transactions</span>
          </Button>
          {transactions.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1"
              title="Export transactions as CSV"
              onClick={() => {
                // Generate CSV from transactions
                const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
                const rows = transactions.map(t => [
                  new Date(t.date).toLocaleDateString(),
                  t.description,
                  t.amount,
                  t.transactionType,
                  t.category || ''
                ]);
                
                const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = 'wallet_transactions.csv';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Wallet Balance */}
        <WalletCard 
          balance={wallet ? Number(wallet.balance) : 0} 
          onAddMoney={() => setIsAddMoneyModalOpen(true)}
        />
        
        {/* Payment Form */}
        <PaymentForm 
          onSubmit={handlePayment} 
          currentBalance={wallet ? Number(wallet.balance) : 0}
        />
        
        {/* Recent Transactions */}
        <Card className="bg-card border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-foreground">Recent Transactions</h3>
            <Badge variant="outline" className="font-normal">
              {transactions.length} total
            </Badge>
          </div>
          
          <div id="transactionsList" className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading transactions...</p>
            ) : transactions.length > 0 ? (
              transactions.map(transaction => (
                <div 
                  key={transaction.id} 
                  className="flex justify-between items-center p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-foreground text-sm">{transaction.description}</div>
                    <div className="text-muted-foreground text-xs">
                      {new Date(transaction.date).toLocaleString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </div>
                    {transaction.category && (
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {transaction.category}
                      </Badge>
                    )}
                  </div>
                  <div className={transaction.transactionType === 'credit' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                    {transaction.transactionType === 'credit' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No transactions yet. Add money or make a payment to get started!</p>
            )}
          </div>
        </Card>
      </div>

      {/* Add Money Modal */}
      <AddMoneyModal 
        isOpen={isAddMoneyModalOpen}
        onClose={() => setIsAddMoneyModalOpen(false)}
        onAddMoney={handleAddMoney}
      />
      
      {/* Import Transactions Modal */}
      <ImportTransactionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportTransactions}
      />
    </section>
  );
};

export default WalletPage;
