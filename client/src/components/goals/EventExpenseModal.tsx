import { useState } from 'react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const expenseSchema = z.object({
  name: z.string().min(1, "Expense name is required"),
  amount: z.number().min(1, "Amount must be at least 1"),
  isPaid: z.boolean().default(false),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

type EventExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: ExpenseFormValues) => void;
  eventName: string;
};

const EventExpenseModal = ({ 
  isOpen, 
  onClose, 
  onAddExpense,
  eventName 
}: EventExpenseModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      name: '',
      amount: 0,
      isPaid: false,
    }
  });
  
  const isPaid = watch('isPaid');
  
  const handleFormSubmit = (data: ExpenseFormValues) => {
    setIsSubmitting(true);
    
    try {
      onAddExpense(data);
      reset();
      onClose();
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleClose = () => {
    reset();
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Expense Item for "{eventName}"</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
          <div>
            <Label htmlFor="expenseName" className="block text-muted-foreground text-sm mb-1">Expense Name</Label>
            <Input 
              id="expenseName" 
              placeholder="Venue, Catering, Decorations, etc." 
              {...register('name')}
              className="bg-background border border-border text-foreground"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="expenseAmount" className="block text-muted-foreground text-sm mb-1">Amount (₹)</Label>
            <Input 
              id="expenseAmount" 
              type="number" 
              placeholder="1000" 
              {...register('amount', { valueAsNumber: true })}
              className="bg-background border border-border text-foreground"
            />
            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isPaid"
              checked={isPaid}
              onCheckedChange={(checked) => setValue('isPaid', !!checked)}
            />
            <Label htmlFor="isPaid" className="text-sm font-normal cursor-pointer">
              Mark as paid
            </Label>
          </div>
          
          <DialogFooter className="pt-4">
            <Button variant="outline" type="button" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-primary text-white"
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventExpenseModal;