import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import SummaryCard from '../components/dashboard/SummaryCard';
import ChartCard from '../components/dashboard/ChartCard';
import TransactionTable from '../components/transactions/TransactionTable';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@shared/schema';
import { fetchTransactions } from '../services/transactionService';

const DashboardPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalIncome: 42500,
    incomeChange: 8.2,
    totalExpenses: 31740,
    expenseChange: 12.3,
    balance: 10760,
    balanceChange: 3.4
  });
  const [monthlyChartData, setMonthlyChartData] = useState({
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    income: [39000, 41200, 38500, 42000, 41500, 42500],
    expenses: [31000, 29800, 33200, 34500, 32100, 31740]
  });
  const [categoryChartData, setCategoryChartData] = useState({
    labels: ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Others'],
    values: [18000, 5200, 2100, 2150, 1350, 1899, 1041]
  });
  const [monthlyTimeframe, setMonthlyTimeframe] = useState("Last 6 Months");
  const [categoryTimeframe, setCategoryTimeframe] = useState("This Month");
  const { toast } = useToast();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await fetchTransactions();
      setTransactions(data);
      
      // Calculate dashboard stats
      if (data.length > 0) {
        const income = data
          .filter(t => t.transactionType === 'income')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        const expenses = data
          .filter(t => t.transactionType === 'expense')
          .reduce((sum, t) => sum + Number(t.amount), 0);
        
        setStats({
          totalIncome: income,
          incomeChange: 8.2, // This would be calculated based on historical data
          totalExpenses: expenses,
          expenseChange: 12.3, // This would be calculated based on historical data
          balance: income - expenses,
          balanceChange: 3.4 // This would be calculated based on historical data
        });
      }
    } catch (error) {
      toast({
        title: "Error loading transactions",
        description: "There was a problem loading your transaction data",
        variant: "destructive",
      });
    }
  };

  const handleMonthlyTimeframeChange = (timeframe: string) => {
    setMonthlyTimeframe(timeframe);
    // In a real app, we would fetch new data based on the timeframe
  };

  const handleCategoryTimeframeChange = (timeframe: string) => {
    setCategoryTimeframe(timeframe);
    // In a real app, we would fetch new data based on the timeframe
  };

  return (
    <section id="dashboard" className="pt-8">
      <h2 className="text-2xl font-bold mb-6">Financial Dashboard</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard 
          title="Total Income" 
          amount={stats.totalIncome} 
          change={stats.incomeChange} 
          icon="fa-wallet" 
          type="income" 
        />
        <SummaryCard 
          title="Total Expenses" 
          amount={stats.totalExpenses} 
          change={stats.expenseChange} 
          icon="fa-money-bill-wave" 
          type="expense" 
        />
        <SummaryCard 
          title="Balance" 
          amount={stats.balance} 
          change={stats.balanceChange} 
          icon="fa-piggy-bank" 
          type="balance" 
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard 
          title="Monthly Overview" 
          type="monthly" 
          data={monthlyChartData}
          options={["Last 6 Months", "Last Year", "All Time"]}
          onOptionChange={handleMonthlyTimeframeChange}
        />
        <ChartCard 
          title="Expense Categories" 
          type="category" 
          data={categoryChartData}
          options={["This Month", "Last Month", "Last 3 Months"]}
          onOptionChange={handleCategoryTimeframeChange}
        />
      </div>
      
      {/* Recent Transactions */}
      <TransactionTable 
        transactions={transactions.slice(0, 5)} 
        viewAllLink="/transactions" 
      />
    </section>
  );
};

export default DashboardPage;
