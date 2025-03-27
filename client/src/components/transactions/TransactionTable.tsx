import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Transaction } from '@shared/schema';

type TransactionTableProps = {
  transactions: Transaction[];
  isDetailed?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
  viewAllLink?: string;
};

const TransactionTable = ({ 
  transactions,
  isDetailed = false,
  onEdit,
  onDelete,
  viewAllLink
}: TransactionTableProps) => {
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [timeFilter, setTimeFilter] = useState('This Month');

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'shopping':
        return 'fa-shopping-bag text-red-500';
      case 'food & dining':
      case 'food':
        return 'fa-utensils text-red-500';
      case 'housing':
      case 'rent':
      case 'rent & housing':
        return 'fa-home text-red-500';
      case 'transportation':
        return 'fa-car text-red-500';
      case 'utilities':
        return 'fa-bolt text-red-500';
      case 'healthcare':
        return 'fa-medkit text-red-500';
      case 'education':
        return 'fa-graduation-cap text-red-500';
      case 'entertainment':
        return 'fa-film text-red-500';
      case 'income':
        return 'fa-credit-card text-green-500';
      default:
        return 'fa-receipt text-red-500';
    }
  };

  const getBackgroundColor = (category: string) => {
    if (category.toLowerCase() === 'income') {
      return 'bg-green-500/10';
    }
    return 'bg-red-500/10';
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter !== 'all') {
      if (filter === 'income' && transaction.transactionType !== 'income') return false;
      if (filter === 'expense' && transaction.transactionType !== 'expense') return false;
    }
    
    if (categoryFilter !== 'All Categories' && transaction.category !== categoryFilter) {
      return false;
    }
    
    // Time filter would be implemented here with actual date filtering logic
    
    return true;
  });

  return (
    <Card className="bg-card border border-border p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium text-foreground">
          {isDetailed ? 'Transactions' : 'Recent Transactions'}
        </h3>
        {viewAllLink && (
          <a href={viewAllLink} className="text-primary hover:text-primary/80 text-sm font-medium">
            View All
          </a>
        )}
      </div>

      {isDetailed && (
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div className="flex flex-wrap gap-3 mb-4 md:mb-0">
            <Button 
              variant={filter === 'all' ? 'default' : 'outline'}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-primary/10 text-foreground'}`}
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button 
              variant={filter === 'income' ? 'default' : 'outline'}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'income' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-primary/10 text-foreground'}`}
              onClick={() => setFilter('income')}
            >
              Income
            </Button>
            <Button 
              variant={filter === 'expense' ? 'default' : 'outline'}
              className={`px-3 py-1 rounded-full text-sm ${filter === 'expense' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-primary/10 text-foreground'}`}
              onClick={() => setFilter('expense')}
            >
              Expense
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <select 
              className="bg-background border border-border text-foreground text-sm rounded-lg p-2 focus:ring-primary focus:border-primary"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option>All Categories</option>
              <option>Food & Dining</option>
              <option>Shopping</option>
              <option>Housing</option>
              <option>Transportation</option>
              <option>Utilities</option>
              <option>Healthcare</option>
              <option>Entertainment</option>
              <option>Income</option>
            </select>
            <select 
              className="bg-background border border-border text-foreground text-sm rounded-lg p-2 focus:ring-primary focus:border-primary"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>Last 3 Months</option>
              <option>Last 6 Months</option>
              <option>This Year</option>
              <option>Custom Range</option>
            </select>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-muted-foreground border-b border-border">
              <th className="pb-3 text-left font-medium">Description</th>
              <th className="pb-3 text-left font-medium">Category</th>
              <th className="pb-3 text-left font-medium">Date</th>
              <th className="pb-3 text-right font-medium">Amount</th>
              {isDetailed && (
                <th className="pb-3 text-right font-medium">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-border">
                  <td className="py-3 pr-4">
                    <div className="flex items-center">
                      <div className={`rounded-full ${getBackgroundColor(transaction.category)} p-2 mr-3`}>
                        <i className={`fas ${getCategoryIcon(transaction.category)} text-xs`}></i>
                      </div>
                      <span>{transaction.description}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-muted-foreground">{transaction.category}</td>
                  <td className="py-3 pr-4 text-muted-foreground">
                    {new Date(transaction.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </td>
                  <td className={`py-3 text-right font-medium ${transaction.transactionType === 'income' ? 'text-green-500' : 'text-red-500'}`}>
                    {transaction.transactionType === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  {isDetailed && (
                    <td className="py-3 text-right">
                      <button 
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => onEdit && onEdit(transaction.id)}
                      >
                        <i className="fas fa-pen-to-square"></i>
                      </button>
                      <button 
                        className="text-muted-foreground hover:text-red-500 ml-3"
                        onClick={() => onDelete && onDelete(transaction.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isDetailed ? 5 : 4} className="py-4 text-center text-muted-foreground">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default TransactionTable;
