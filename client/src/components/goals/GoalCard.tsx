import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Goal } from '@shared/schema';
import GoalReminder from './GoalReminder';

type GoalCardProps = {
  goal: Goal;
  onUpdate: (id: number) => void;
  onDelete: (id: number) => void;
  onSetReminder?: (goalId: number, reminderData: any) => void;
};

type SavingsPlan = {
  monthsLeft: number;
  requiredMonthlySaving: number;
  recommendedSavingPercentage: number;
  suggestedCuts: string[];
};

const GoalCard = ({ goal, onUpdate, onDelete, onSetReminder }: GoalCardProps) => {
  const calculateSavingsPlan = (goal: Goal): SavingsPlan => {
    const targetAmount = Number(goal.targetAmount);
    const monthlyIncome = Number(goal.monthlyIncome);
    const currentAmount = Number(goal.currentAmount);
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    
    const monthsLeft = 
      (targetDate.getFullYear() - today.getFullYear()) * 12 + 
      (targetDate.getMonth() - today.getMonth());
    
    const remainingAmount = targetAmount - currentAmount;
    const requiredMonthlySaving = remainingAmount / Math.max(1, monthsLeft);
    const recommendedSavingPercentage = (requiredMonthlySaving / monthlyIncome) * 100;

    return {
      monthsLeft,
      requiredMonthlySaving,
      recommendedSavingPercentage,
      suggestedCuts: generateSavingSuggestions(recommendedSavingPercentage)
    };
  };

  const generateSavingSuggestions = (savingPercentage: number): string[] => {
    const suggestions = [];
    if (savingPercentage > 30) {
      suggestions.push("Consider reducing non-essential expenses");
      suggestions.push("Look for additional income sources");
    }
    if (savingPercentage > 20) {
      suggestions.push("Review and optimize monthly subscriptions");
      suggestions.push("Consider meal planning to reduce food expenses");
    }
    suggestions.push("Track daily expenses to identify saving opportunities");
    return suggestions;
  };

  const savingsPlan = calculateSavingsPlan(goal);
  const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100;

  return (
    <Card className="bg-background rounded-lg p-4 border border-border">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-foreground">{goal.name}</h4>
        <span className="text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5">
          {savingsPlan.monthsLeft} {savingsPlan.monthsLeft === 1 ? 'month' : 'months'} left
        </span>
      </div>
      
      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Progress</span>
          <span className="text-foreground">
            ₹{Number(goal.currentAmount).toLocaleString('en-IN')} / ₹{Number(goal.targetAmount).toLocaleString('en-IN')}
          </span>
        </div>
        <div className="w-full bg-background border border-border rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full progress-bar-fill" 
            style={{ width: `${Math.min(100, progress)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-card rounded-lg p-3 mb-3">
        <h5 className="font-medium text-sm text-foreground mb-2">Monthly Savings Plan</h5>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">Required monthly:</span>
            <p className="text-foreground font-medium">
              ₹{savingsPlan.requiredMonthlySaving.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Saving rate:</span>
            <p className="text-foreground font-medium">
              {savingsPlan.recommendedSavingPercentage.toFixed(1)}% of income
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-card rounded-lg p-3 mb-3">
        <h5 className="font-medium text-sm text-foreground mb-2">Recommendations</h5>
        <ul className="text-xs text-muted-foreground space-y-1 pl-4 list-disc">
          {savingsPlan.suggestedCuts.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      </div>
      
      <div className="flex items-center gap-2 mb-3">
        {onSetReminder && <GoalReminder goal={goal} onSetReminder={onSetReminder} />}
        <div className="text-xs text-muted-foreground">
          {goal.reminderEnabled ? 
            <span className="flex items-center"><i className="fas fa-bell text-amber-500 mr-1"></i> Reminder set</span> : 
            <span className="flex items-center"><i className="fas fa-bell-slash text-muted-foreground mr-1"></i> No reminder</span>}
        </div>
      </div>

      <div className="flex space-x-2">
        <Button 
          variant="outline"
          className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg py-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
          onClick={() => onUpdate(goal.id)}
        >
          Update Progress
        </Button>
        <Button 
          variant="outline"
          className="flex-none bg-red-500/10 hover:bg-red-500/20 text-red-500 text-sm font-medium rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-red-500"
          onClick={() => onDelete(goal.id)}
        >
          <i className="fas fa-trash"></i>
        </Button>
      </div>
    </Card>
  );
};

export default GoalCard;
