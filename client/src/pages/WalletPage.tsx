import { useState, useEffect } from 'react';
import WalletCard from '../components/wallet/WalletCard';
import PaymentForm from '../components/wallet/PaymentForm';
import AddMoneyModal from '../components/wallet/AddMoneyModal';
import { Card } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { Wallet, WalletTransaction } from '@shared/schema';
import { 
  getWallet, 
  addMoney, 
  makePayment, 
  getWalletTransactions 
} from '../services/walletService';

const WalletPage = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddMoneyModalOpen, setIsAddMoneyModalOpen] = useState(false);
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

  return (
    <section id="wallet" className="pt-8">
      <h2 className="text-2xl font-bold mb-6">Digital Wallet</h2>
      
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
          <h3 className="font-medium text-foreground mb-4">Recent Transactions</h3>
          <div id="transactionsList" className="space-y-3 max-h-80 overflow-y-auto">
            {isLoading ? (
              <p className="text-center text-muted-foreground py-4">Loading transactions...</p>
            ) : transactions.length > 0 ? (
              transactions.map(transaction => (
                <div 
                  key={transaction.id} 
                  className="flex justify-between items-center p-3 bg-background rounded-lg border border-border"
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
    </section>
  );
};

export default WalletPage;
