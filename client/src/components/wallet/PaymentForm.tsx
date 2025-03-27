import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const paymentSchema = z.object({
  receiverUPI: z.string().min(3, "UPI ID is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Please select a category"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

type PaymentFormProps = {
  onSubmit: (data: PaymentFormValues) => void;
  currentBalance: number;
};

const PaymentForm = ({ onSubmit, currentBalance }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      receiverUPI: '',
      amount: 0,
      category: '',
    }
  });
  
  const amount = watch('amount');
  const isAmountValid = amount > 0 && amount <= currentBalance;
  
  const handleFormSubmit = (data: PaymentFormValues) => {
    if (!isAmountValid) return;
    
    setIsSubmitting(true);
    onSubmit(data);
    reset();
    setIsSubmitting(false);
  };
  
  // This is needed to handle the Select component which doesn't work directly with register
  const handleCategoryChange = (value: string) => {
    setValue('category', value, { shouldValidate: true });
  };
  
  return (
    <Card className="bg-card border border-border p-6">
      <h3 className="font-medium text-foreground mb-4">Make Payment</h3>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="receiverUPI" className="block text-muted-foreground text-sm mb-1">UPI ID</Label>
          <Input 
            id="receiverUPI" 
            placeholder="example@upi" 
            {...register('receiverUPI')}
            className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
          />
          {errors.receiverUPI && <p className="text-red-500 text-xs mt-1">{errors.receiverUPI.message}</p>}
        </div>
        
        <div>
          <Label htmlFor="paymentAmount" className="block text-muted-foreground text-sm mb-1">Amount (₹)</Label>
          <Input 
            id="paymentAmount" 
            type="number" 
            placeholder="1000" 
            {...register('amount', { valueAsNumber: true })}
            className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
          />
          {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
          {amount > currentBalance && <p className="text-red-500 text-xs mt-1">Amount exceeds wallet balance</p>}
        </div>
        
        <div>
          <Label htmlFor="paymentCategory" className="block text-muted-foreground text-sm mb-1">Category</Label>
          <Select onValueChange={handleCategoryChange}>
            <SelectTrigger id="paymentCategory" className="bg-background border border-border text-foreground rounded-lg w-full p-2.5 focus:ring-primary focus:border-primary">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="food">Food & Dining</SelectItem>
              <SelectItem value="shopping">Shopping</SelectItem>
              <SelectItem value="transportation">Transportation</SelectItem>
              <SelectItem value="utilities">Utilities</SelectItem>
              <SelectItem value="entertainment">Entertainment</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="education">Education</SelectItem>
              <SelectItem value="rent">Rent & Housing</SelectItem>
              <SelectItem value="others">Others</SelectItem>
            </SelectContent>
          </Select>
          {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || !isAmountValid}
          className="w-full bg-gradient-to-r from-primary to-[#0F766E] text-white font-medium rounded-lg py-2.5 px-5 focus:outline-none focus:ring-2 focus:ring-primary hover:opacity-90 transition-opacity"
        >
          Pay Now
        </Button>
      </form>
    </Card>
  );
};

export default PaymentForm;
