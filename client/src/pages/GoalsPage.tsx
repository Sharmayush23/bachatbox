import { useState, useEffect } from 'react';
import GoalForm from '../components/goals/GoalForm';
import GoalCard from '../components/goals/GoalCard';
import { useToast } from '@/hooks/use-toast';
import { Goal } from '@shared/schema';
import { 
  createGoal, 
  fetchGoals, 
  updateGoal, 
  deleteGoal,
  updateGoalReminder
} from '../services/goalService';

// Dialog for updating goal progress
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const GoalsPage = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newAmount, setNewAmount] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      setIsLoading(true);
      const data = await fetchGoals();
      setGoals(data);
    } catch (error) {
      toast({
        title: "Error loading goals",
        description: "There was a problem loading your financial goals",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (formData: any) => {
    try {
      const newGoal = await createGoal(formData);
      setGoals([...goals, newGoal]);
      toast({
        title: "Goal Created",
        description: "Your financial goal has been created successfully",
      });
    } catch (error) {
      toast({
        title: "Error Creating Goal",
        description: "There was a problem creating your financial goal",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGoal = (id: number) => {
    const goal = goals.find(g => g.id === id);
    if (goal) {
      setSelectedGoal(goal);
      setNewAmount(goal.currentAmount.toString());
      setUpdateDialogOpen(true);
    }
  };

  const confirmUpdate = async () => {
    if (selectedGoal && newAmount) {
      try {
        const amount = parseFloat(newAmount);
        if (isNaN(amount) || amount < 0 || amount > Number(selectedGoal.targetAmount)) {
          throw new Error("Invalid amount");
        }

        const updatedGoal = await updateGoal(selectedGoal.id, {
          ...selectedGoal,
          currentAmount: amount.toString()
        });

        setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
        toast({
          title: "Goal Updated",
          description: "Your goal progress has been updated successfully",
        });
        setUpdateDialogOpen(false);
        setSelectedGoal(null);
      } catch (error) {
        toast({
          title: "Error Updating Goal",
          description: "Please enter a valid amount less than or equal to the target amount",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteGoal = async (id: number) => {
    try {
      await deleteGoal(id);
      setGoals(goals.filter(g => g.id !== id));
      toast({
        title: "Goal Deleted",
        description: "Your financial goal has been deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error Deleting Goal",
        description: "There was a problem deleting your financial goal",
        variant: "destructive",
      });
    }
  };
  
  const handleSetReminder = async (goalId: number, reminderData: any) => {
    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;
      
      const updatedGoal = await updateGoalReminder(goalId, {
        reminderEnabled: reminderData.enabled,
        reminderDate: reminderData.reminderDate,
        reminderEmail: reminderData.reminderEmail,
        reminderMessage: reminderData.reminderMessage,
      });
      
      setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    } catch (error) {
      toast({
        title: "Error Setting Reminder",
        description: "There was a problem setting the reminder for this goal",
        variant: "destructive",
      });
    }
  };

  return (
    <section id="goals" className="pt-8">
      <h2 className="text-2xl font-bold mb-6">Financial Goals</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal Form */}
        <div>
          <GoalForm onSubmit={handleCreateGoal} />
        </div>
        
        {/* Goal Cards */}
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border p-6">
            <h3 className="font-medium text-foreground mb-4">Your Goals & Progress</h3>
            <div id="goalsList" className="space-y-4">
              {isLoading ? (
                <p className="text-center text-muted-foreground py-4">Loading goals...</p>
              ) : goals.length > 0 ? (
                goals.map(goal => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onUpdate={handleUpdateGoal}
                    onDelete={handleDeleteGoal}
                    onSetReminder={handleSetReminder}
                  />
                ))
              ) : (
                <p className="text-center text-muted-foreground py-4">No financial goals yet. Create one to get started!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Update Goal Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Goal Progress</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="currentAmount">Current Saved Amount (₹)</Label>
            <Input
              id="currentAmount"
              type="number"
              value={newAmount}
              onChange={(e) => setNewAmount(e.target.value)}
              className="mt-2"
              min="0"
              max={selectedGoal ? Number(selectedGoal.targetAmount) : undefined}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter the total amount you've saved so far for this goal
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpdate}>
              Update Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GoalsPage;
