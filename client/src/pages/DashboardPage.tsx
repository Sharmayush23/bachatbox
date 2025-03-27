import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import SummaryCard from '../components/dashboard/SummaryCard';
import SummaryCardSmall from '../components/dashboard/SummaryCardSmall';
import ChartCard from '../components/dashboard/ChartCard';
import CsvUploader from '../components/dashboard/CsvUploader';
import TransactionTable from '../components/transactions/TransactionTable';
import { useToast } from '@/hooks/use-toast';
import { Transaction } from '@shared/schema';
import { fetchTransactions } from '../services/transactionService';
import { parseCSV } from '../services/csvService';

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
  
  // Dashboard charts state
  const [monthlyChartData, setMonthlyChartData] = useState({
    labels: ['January', 'February', 'March', 'April', 'May', 'June'],
    income: [39000, 41200, 38500, 42000, 41500, 42500],
    expenses: [31000, 29800, 33200, 34500, 32100, 31740]
  });
  const [categoryChartData, setCategoryChartData] = useState({
    labels: ['Housing', 'Food', 'Transportation', 'Utilities', 'Entertainment', 'Shopping', 'Others'],
    values: [18000, 5200, 2100, 2150, 1350, 1899, 1041]
  });
  
  // Additional charts for CSV data visualization
  const [weeklyTrendData, setWeeklyTrendData] = useState({
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Spending',
        data: [5200, 6100, 4800, 7500]
      }
    ]
  });
  const [savingsRateData, setSavingsRateData] = useState({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Savings Rate',
        data: [12, 19, 14, 15, 18, 21]
      }
    ]
  });
  const [spendingByDayData, setSpendingByDayData] = useState({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Amount Spent',
        data: [1200, 900, 850, 1400, 2100, 1800, 850]
      }
    ]
  });
  const [budgetComplianceData, setBudgetComplianceData] = useState({
    labels: ['Grocery', 'Transport', 'Entertainment', 'Utilities', 'Shopping'],
    datasets: [
      {
        label: 'Budget',
        data: [2000, 1500, 1000, 1200, 1500]
      },
      {
        label: 'Actual',
        data: [1800, 1300, 1400, 1100, 1600]
      }
    ]
  });
  
  // Time frame states
  const [monthlyTimeframe, setMonthlyTimeframe] = useState("Last 6 Months");
  const [categoryTimeframe, setCategoryTimeframe] = useState("This Month");
  const { toast } = useToast();
  
  // CSV data state
  const [csvData, setCsvData] = useState<any[]>([]);
  const [hasCsvData, setHasCsvData] = useState(false);

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
  
  const handleCsvDataImported = (data: any[]) => {
    setCsvData(data);
    setHasCsvData(true);
    
    // Process and visualize the imported data
    // In a real app, this would transform the raw CSV data into chart formats
    
    // For this demo, we'll just show that we've received the data
    toast({
      title: "CSV data processed",
      description: `Visualizing spending patterns from ${data.length} records`,
    });
    
    // Update charts with "new" data
    // In a real implementation, we would calculate these from the actual CSV data
    setWeeklyTrendData({
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Spending',
          data: [Math.random() * 3000 + 2000, Math.random() * 3000 + 2000, 
                 Math.random() * 3000 + 2000, Math.random() * 3000 + 2000]
        }
      ]
    });
    
    setSavingsRateData({
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Savings Rate (%)',
          data: [Math.random() * 10 + 10, Math.random() * 10 + 10,
                 Math.random() * 10 + 10, Math.random() * 10 + 10,
                 Math.random() * 10 + 10, Math.random() * 10 + 10]
        }
      ]
    });
  };

  return (
    <section id="dashboard" className="pt-6">
      <h2 className="text-2xl font-bold mb-6">Financial Dashboard</h2>
      
      {/* Main Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
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
      
      {/* Small Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <SummaryCardSmall
          title="Groceries"
          value={2340}
          icon="fa-shopping-basket"
          change={-2.5}
          variant="warning"
        />
        <SummaryCardSmall
          title="Utilities"
          value={980}
          icon="fa-bolt"
          change={1.8}
          variant="info"
        />
        <SummaryCardSmall
          title="Entertainment"
          value={1250}
          icon="fa-film"
          change={-8.4}
          variant="danger"
        />
        <SummaryCardSmall
          title="Savings"
          value={3500}
          icon="fa-piggy-bank"
          change={12.3}
          variant="success"
        />
        <SummaryCardSmall
          title="Transport"
          value={1120}
          icon="fa-car"
          change={-3.2}
          variant="warning"
        />
        <SummaryCardSmall
          title="Healthcare"
          value={750}
          icon="fa-heartbeat"
          change={0}
          variant="primary"
        />
      </div>
      
      {/* CSV Upload Section */}
      <div className="mb-6">
        <CsvUploader onDataImported={handleCsvDataImported} />
      </div>
      
      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ChartCard 
          title="Monthly Overview" 
          type="monthly" 
          data={monthlyChartData}
          options={["Last 6 Months", "Last Year", "All Time"]}
          onOptionChange={handleMonthlyTimeframeChange}
          description="Compare your monthly income and expenses over time."
        />
        <ChartCard 
          title="Expense Categories" 
          type="category" 
          data={categoryChartData}
          options={["This Month", "Last Month", "Last 3 Months"]}
          onOptionChange={handleCategoryTimeframeChange}
          description="Breakdown of where your money goes by category."
        />
      </div>
      
      {/* CSV Data Visualization Charts */}
      {hasCsvData && (
        <>
          <h3 className="text-xl font-bold mb-4">CSV Data Visualization</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartCard
              title="Weekly Spending Trends"
              type="line"
              data={weeklyTrendData}
              description="Track your spending patterns on a weekly basis."
            />
            <ChartCard
              title="Savings Rate (%)"
              type="bar"
              data={savingsRateData}
              description="Monitor your monthly savings as a percentage of income."
            />
            <ChartCard
              title="Spending by Day of Week"
              type="bar"
              data={spendingByDayData}
              description="See which days of the week you tend to spend more."
            />
            <ChartCard
              title="Budget vs. Actual"
              type="bar"
              data={budgetComplianceData}
              description="Compare your actual spending against your budget by category."
            />
          </div>
        </>
      )}
      
      {/* Recent Transactions */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-4">Recent Transactions</h3>
        <TransactionTable 
          transactions={transactions.slice(0, 5)} 
          viewAllLink="/transactions" 
        />
      </div>
    </section>
  );
};

export default DashboardPage;
