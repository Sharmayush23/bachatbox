import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { insertGoalSchema } from '@shared/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const goalFormSchema = insertGoalSchema
  .omit({ userId: true })
  .extend({
    name: z.string().min(3, { message: "Goal name must be at least 3 characters" }),
    targetAmount: z.number().min(1, { message: "Target amount must be greater than 0" }),
    currentAmount: z.number().min(0, { message: "Current amount cannot be negative" }),
    targetDate: z.string().refine((date) => new Date(date) > new Date(), {
      message: "Target date must be in the future",
    }),
    monthlyIncome: z.number().min(1, { message: "Monthly income must be greater than 0" }),
  });

type GoalFormValues = z.infer<typeof goalFormSchema>;

type GoalFormProps = {
  onSubmit: (data: GoalFormValues) => void;
};

const GoalForm = ({ onSubmit }: GoalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: '',
      monthlyIncome: 0,
    }
  });
  
  const handleFormSubmit = (data: GoalFormValues) => {
    setIsSubmitting(true);
    onSubmit(data);
    reset();
    setIsSubmitting(false);
  };
  
  return (
    <Card className="bg-card border border-border p-6">
      <h3 className="font-medium text-foreground mb-4">Set New Goal</h3>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="goalName" className="block text-muted-foreground text-sm mb-1">Goal Name</Label>
          <Input 
            id="goalName" 
            placeholder="e.g. New Laptop" 
            {...register('name')}
            className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="goalAmount" className="block text-muted-foreground text-sm mb-1">Target Amount (₹)</Label>
          <Input 
            id="goalAmount" 
            type="number" 
            placeholder="50000" 
            {...register('targetAmount', { valueAsNumber: true })}
            className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
          />
          {errors.targetAmount && <p className="text-red-500 text-xs mt-1">{errors.targetAmount.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="goalDate" className="block text-muted-foreground text-sm mb-1">Target Date</Label>
          <Input 
            id="goalDate" 
            type="date" 
            {...register('targetDate')}
            className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
          />
          {errors.targetDate && <p className="text-red-500 text-xs mt-1">{errors.targetDate.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="monthlyIncome" className="block text-muted-foreground text-sm mb-1">Monthly Income (₹)</Label>
          <Input 
            id="monthlyIncome" 
            type="number" 
            placeholder="42500" 
            {...register('monthlyIncome', { valueAsNumber: true })}
            className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
          />
          {errors.monthlyIncome && <p className="text-red-500 text-xs mt-1">{errors.monthlyIncome.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="currentSavings" className="block text-muted-foreground text-sm mb-1">Current Savings (₹)</Label>
          <Input 
            id="currentSavings" 
            type="number" 
            placeholder="15000" 
            {...register('currentAmount', { valueAsNumber: true })}
            className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
          />
          {errors.currentAmount && <p className="text-red-500 text-xs mt-1">{errors.currentAmount.message}</p>}
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-[#0F766E] text-white font-medium rounded-lg py-2.5 px-5 focus:outline-none focus:ring-2 focus:ring-primary hover:opacity-90 transition-opacity"
        >
          Create Goal & Plan
        </Button>
      </form>
    </Card>
  );
};

export default GoalForm;
