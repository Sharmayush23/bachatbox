import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SummaryCardSmallProps = {
  title: string;
  value: string | number;
  icon: string;
  change?: number;
  variant?: 'primary' | 'success' | 'danger' | 'warning' | 'info';
};

const SummaryCardSmall = ({ 
  title, 
  value, 
  icon, 
  change, 
  variant = 'primary' 
}: SummaryCardSmallProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          iconBg: 'bg-green-100 dark:bg-green-900/30',
          iconColor: 'text-green-600 dark:text-green-400',
          borderColor: 'border-green-200 dark:border-green-900/50'
        };
      case 'danger':
        return {
          iconBg: 'bg-red-100 dark:bg-red-900/30',
          iconColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-200 dark:border-red-900/50'
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-100 dark:bg-amber-900/30',
          iconColor: 'text-amber-600 dark:text-amber-400',
          borderColor: 'border-amber-200 dark:border-amber-900/50'
        };
      case 'info':
        return {
          iconBg: 'bg-blue-100 dark:bg-blue-900/30',
          iconColor: 'text-blue-600 dark:text-blue-400',
          borderColor: 'border-blue-200 dark:border-blue-900/50'
        };
      default:
        return {
          iconBg: 'bg-primary/10',
          iconColor: 'text-primary',
          borderColor: 'border-primary/20'
        };
    }
  };

  const styles = getVariantStyles();
  
  // Format value if it's a number
  const formattedValue = typeof value === 'number' 
    ? new Intl.NumberFormat('en-US', { 
        style: 'currency', 
        currency: 'USD',
        maximumFractionDigits: 0 
      }).format(value)
    : value;
  
  return (
    <Card className={cn("bg-card p-4 border", styles.borderColor)}>
      <div className="flex items-center">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mr-3", styles.iconBg)}>
          <i className={cn(`fas ${icon} text-lg`, styles.iconColor)}></i>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
          <div className="mt-1 flex items-baseline">
            <span className="text-lg font-semibold text-foreground">{formattedValue}</span>
            {change !== undefined && (
              <span className={cn(
                "ml-2 text-xs",
                change >= 0 ? "text-green-500" : "text-red-500"
              )}>
                <i className={cn(
                  "fas",
                  change >= 0 ? "fa-arrow-up" : "fa-arrow-down"
                )}></i>
                {" "}
                {Math.abs(change).toFixed(1)}%
              </span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default SummaryCardSmall;