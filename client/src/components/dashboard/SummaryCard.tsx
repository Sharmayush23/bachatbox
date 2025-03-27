import { Card } from "@/components/ui/card";

type SummaryCardProps = {
  title: string;
  amount: number;
  change: number;
  icon: string;
  type: 'income' | 'expense' | 'balance';
};

const SummaryCard = ({ title, amount, change, icon, type }: SummaryCardProps) => {
  const getIconBackground = () => {
    switch (type) {
      case 'income':
        return 'bg-green-500/10';
      case 'expense':
        return 'bg-red-500/10';
      case 'balance':
        return 'bg-primary/10';
      default:
        return 'bg-primary/10';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'income':
        return 'text-green-500';
      case 'expense':
        return 'text-red-500';
      case 'balance':
        return 'text-primary';
      default:
        return 'text-primary';
    }
  };

  const getAmountColor = () => {
    switch (type) {
      case 'income':
        return 'text-green-500';
      case 'expense':
        return 'text-red-500';
      case 'balance':
        return 'text-foreground';
      default:
        return 'text-foreground';
    }
  };

  return (
    <Card className="dashboard-card bg-card border border-border p-6 flex flex-col transition-transform hover:translate-y-[-4px]">
      <div className="flex items-center mb-4">
        <div className={`rounded-full ${getIconBackground()} p-3 mr-4`}>
          <i className={`fas ${icon} ${getIconColor()}`}></i>
        </div>
        <h3 className="font-medium text-foreground">{title}</h3>
      </div>
      <p className={`text-2xl font-bold ${getAmountColor()}`}>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      <p className="text-muted-foreground text-sm mt-2">
        <i className={`fas fa-arrow-${change >= 0 ? 'up' : 'down'} ${change >= 0 ? 'text-green-500' : 'text-red-500'} mr-1`}></i>
        <span>{Math.abs(change)}%</span> {type === 'balance' ? 'savings rate' : 'from last month'}
      </p>
    </Card>
  );
};

export default SummaryCard;
