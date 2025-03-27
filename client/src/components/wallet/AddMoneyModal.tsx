import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const addMoneySchema = z.object({
  amount: z.number().min(100, "Amount must be at least ₹100"),
  paymentMethod: z.string().min(1, "Please select a payment method"),
});

type AddMoneyFormValues = z.infer<typeof addMoneySchema>;

type AddMoneyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAddMoney: (amount: number, paymentMethod: string) => void;
};

const AddMoneyModal = ({ isOpen, onClose, onAddMoney }: AddMoneyModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<AddMoneyFormValues>({
    resolver: zodResolver(addMoneySchema),
    defaultValues: {
      amount: 0,
      paymentMethod: '',
    }
  });
  
  const handleFormSubmit = (data: AddMoneyFormValues) => {
    setIsSubmitting(true);
    onAddMoney(data.amount, data.paymentMethod);
    reset();
    setIsSubmitting(false);
    onClose();
  };
  
  // This is needed to handle the Select component which doesn't work directly with register
  const handlePaymentMethodChange = (value: string) => {
    setValue('paymentMethod', value, { shouldValidate: true });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border border-border p-6 rounded-xl w-full max-w-md relative">
        <DialogHeader>
          <DialogTitle className="font-medium text-foreground text-lg mb-4">Add Money to Wallet</DialogTitle>
          <DialogDescription>
            <form id="addMoneyForm" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="addAmount" className="block text-muted-foreground text-sm mb-1">Amount (₹)</Label>
                <Input 
                  id="addAmount" 
                  type="number" 
                  placeholder="1000" 
                  {...register('amount', { valueAsNumber: true })}
                  className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="paymentMethod" className="block text-muted-foreground text-sm mb-1">Payment Method</Label>
                <Select onValueChange={handlePaymentMethodChange}>
                  <SelectTrigger id="paymentMethod" className="bg-background border border-border text-foreground rounded-lg w-full p-2.5 focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="Select Payment Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Debit Card</SelectItem>
                    <SelectItem value="credit">Credit Card</SelectItem>
                    <SelectItem value="netbanking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
                {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod.message}</p>}
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-primary to-[#0F766E] text-white font-medium rounded-lg py-2.5 px-5 focus:outline-none focus:ring-2 focus:ring-primary hover:opacity-90 transition-opacity"
                >
                  Add Money
                </Button>
                <DialogClose asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </DialogClose>
              </div>
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddMoneyModal;
