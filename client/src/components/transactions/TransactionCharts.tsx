import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, 
  AreaChart, Area, Cell, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, Sector 
} from 'recharts';
import type { Transaction } from '@shared/schema';

interface TransactionChartsProps {
  transactions: Transaction[];
}

// Enhanced color palette for improved visual appeal
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316'  // Orange
];

const TransactionCharts = ({ transactions }: TransactionChartsProps) => {
  const [timeRange, setTimeRange] = useState('last6Months');
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Function for active sector in pie chart
  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  // Active sector for pie chart
  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    
    return (
      <g>
        <text x={cx} y={cy} dy={-20} textAnchor="middle" fill="#999">
          {payload.name}
        </text>
        <text x={cx} y={cy} dy={10} textAnchor="middle" fill="#999" fontSize={20} fontWeight="bold">
          {formatCurrency(value)}
        </text>
        <text x={cx} y={cy} dy={30} textAnchor="middle" fill="#999">
          {`${(percent * 100).toFixed(2)}%`}
        </text>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 5}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };
  
  // Process transaction data for charts
  
  // 1. Get date ranges
  const getDateRanges = () => {
    const today = new Date();
    
    // Last 30 days
    const last30Days = new Date();
    last30Days.setDate(today.getDate() - 30);
    
    // Last 3 months
    const last3Months = new Date();
    last3Months.setMonth(today.getMonth() - 3);
    
    // Last 6 months
    const last6Months = new Date();
    last6Months.setMonth(today.getMonth() - 6);
    
    // Last year
    const lastYear = new Date();
    lastYear.setFullYear(today.getFullYear() - 1);
    
    return { last30Days, last3Months, last6Months, lastYear };
  };
  
  // 2. Filter transactions by selected time range
  const filterTransactionsByTime = () => {
    const { last30Days, last3Months, last6Months, lastYear } = getDateRanges();
    
    let startDate;
    switch (timeRange) {
      case 'last30Days':
        startDate = last30Days;
        break;
      case 'last3Months':
        startDate = last3Months;
        break;
      case 'last6Months':
        startDate = last6Months;
        break;
      case 'lastYear':
        startDate = lastYear;
        break;
      default:
        startDate = last6Months;
    }
    
    return transactions.filter(t => new Date(t.date) >= startDate);
  };
  
  // 3. Process data for monthly trend chart (line/area)
  const getMonthlyTrendData = () => {
    const filteredTransactions = filterTransactionsByTime();
    
    // Group transactions by month
    const monthlyData: {[key: string]: {income: number, expense: number}} = {};
    
    filteredTransactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { income: 0, expense: 0 };
      }
      
      if (transaction.transactionType === 'income') {
        monthlyData[monthYear].income += Number(transaction.amount);
      } else {
        monthlyData[monthYear].expense += Number(transaction.amount);
      }
    });
    
    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([monthYear, data]) => {
        const [year, month] = monthYear.split('-').map(Number);
        return {
          name: new Date(year, month - 1, 1).toLocaleDateString('default', { month: 'short', year: 'numeric' }),
          income: data.income,
          expense: data.expense,
          balance: data.income - data.expense,
          date: new Date(year, month - 1, 1)
        };
      })
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  };
  
  // 4. Process data for category distribution (pie chart)
  const getCategoryData = () => {
    const filteredTransactions = filterTransactionsByTime();
    const expenseTransactions = filteredTransactions.filter(t => t.transactionType === 'expense');
    
    // Group by category
    const categoryData: {[key: string]: number} = {};
    
    expenseTransactions.forEach(transaction => {
      const category = transaction.category || 'Uncategorized';
      
      if (!categoryData[category]) {
        categoryData[category] = 0;
      }
      
      categoryData[category] += Number(transaction.amount);
    });
    
    // Convert to array and sort by amount
    return Object.entries(categoryData)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };
  
  // 5. Process data for income vs expense (bar chart)
  const getIncomeVsExpenseData = () => {
    const monthlyData = getMonthlyTrendData();
    return monthlyData.map(({ name, income, expense }) => ({
      name,
      income,
      expense
    }));
  };
  
  // Generate chart data
  const monthlyTrendData = getMonthlyTrendData();
  const categoryData = getCategoryData();
  const incomeVsExpenseData = getIncomeVsExpenseData();
  
  // Format currency for tooltip
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(value);
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transaction Analytics</CardTitle>
          <CardDescription>Visualize your financial data</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="last30Days">Last 30 Days</SelectItem>
            <SelectItem value="last3Months">Last 3 Months</SelectItem>
            <SelectItem value="last6Months">Last 6 Months</SelectItem>
            <SelectItem value="lastYear">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="trend">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="trend">Monthly Trend</TabsTrigger>
            <TabsTrigger value="category">Categories</TabsTrigger>
            <TabsTrigger value="incomeVsExpense">Income vs Expense</TabsTrigger>
            <TabsTrigger value="cumulative">Cumulative Flow</TabsTrigger>
          </TabsList>
          
          {/* Monthly Trend Line Chart */}
          <TabsContent value="trend" className="pt-4">
            <h3 className="text-lg font-medium mb-4">Monthly Cash Flow</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyTrendData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{ fill: '#888' }} />
                  <YAxis tick={{ fill: '#888' }} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#eee' }}
                    labelStyle={{ color: '#ccc' }}
                  />
                  <Legend 
                    iconType="circle" 
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke={COLORS[0]} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={3}
                    name="Income"
                    dot={{ strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expense" 
                    stroke={COLORS[3]} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={3}
                    name="Expense"
                    dot={{ strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="balance" 
                    stroke={COLORS[1]} 
                    activeDot={{ r: 8 }} 
                    strokeWidth={3}
                    name="Balance"
                    dot={{ strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* Category Pie Chart */}
          <TabsContent value="category" className="pt-4">
            <h3 className="text-lg font-medium mb-4">Expense by Category</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    onMouseEnter={onPieEnter}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#eee' }}
                    labelStyle={{ color: '#ccc' }}
                  />
                  <Legend 
                    iconType="circle"
                    layout="vertical"
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* Income vs Expense Bar Chart */}
          <TabsContent value="incomeVsExpense" className="pt-4">
            <h3 className="text-lg font-medium mb-4">Income vs Expense</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={incomeVsExpenseData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{ fill: '#888' }} />
                  <YAxis tick={{ fill: '#888' }} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#eee' }}
                    labelStyle={{ color: '#ccc' }}
                  />
                  <Legend 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  <Bar 
                    dataKey="income" 
                    name="Income" 
                    fill={COLORS[0]} 
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                  <Bar 
                    dataKey="expense" 
                    name="Expense" 
                    fill={COLORS[3]} 
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          {/* Cumulative Flow Area Chart */}
          <TabsContent value="cumulative" className="pt-4">
            <h3 className="text-lg font-medium mb-4">Cumulative Cash Flow</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyTrendData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="name" tick={{ fill: '#888' }} />
                  <YAxis tick={{ fill: '#888' }} />
                  <Tooltip 
                    formatter={(value) => formatCurrency(Number(value))}
                    contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#333', borderRadius: '8px' }}
                    itemStyle={{ color: '#eee' }}
                    labelStyle={{ color: '#ccc' }}
                  />
                  <Legend 
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '10px' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="income" 
                    name="Income"
                    stackId="1" 
                    stroke={COLORS[0]} 
                    fill={COLORS[0]} 
                    fillOpacity={0.6}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="expense" 
                    name="Expense"
                    stackId="2" 
                    stroke={COLORS[3]} 
                    fill={COLORS[3]} 
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TransactionCharts;