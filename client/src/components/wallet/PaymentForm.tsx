import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PaymentGatewayModal from './PaymentGatewayModal';
import CheckoutPage from './CheckoutPage';

const paymentSchema = z.object({
  receiverUPI: z.string().min(3, "UPI ID is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Please select a category"),
  receiverName: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

type PaymentFormProps = {
  onSubmit: (data: PaymentFormValues) => void;
  currentBalance: number;
};

type PaymentDetails = {
  upiId: string;
  amount: number;
  category: string;
  name?: string;
}

const PaymentForm = ({ onSubmit, currentBalance }: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentGatewayOpen, setPaymentGatewayOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      receiverUPI: '',
      amount: 0,
      category: '',
      receiverName: '',
    }
  });
  
  const amount = watch('amount');
  const isAmountValid = amount > 0 && amount <= currentBalance;
  
  const handleFormSubmit = (data: PaymentFormValues) => {
    if (!isAmountValid) return;
    
    // Store payment details for later submission
    setPaymentDetails({
      upiId: data.receiverUPI,
      amount: data.amount,
      category: data.category,
      name: data.receiverName || undefined
    });
    
    // Open the checkout page instead of the payment gateway
    setCheckoutOpen(true);
  };
  
  const handlePaymentComplete = () => {
    if (paymentDetails) {
      // Only call onSubmit after payment is completed
      setIsSubmitting(true);
      onSubmit({
        receiverUPI: paymentDetails.upiId,
        amount: paymentDetails.amount,
        category: paymentDetails.category,
        receiverName: paymentDetails.name,
      });
      reset();
      setIsSubmitting(false);
      setCheckoutOpen(false);
      setPaymentDetails(null);
    }
  };
  
  // This is needed to handle the Select component which doesn't work directly with register
  const handleCategoryChange = (value: string) => {
    setValue('category', value, { shouldValidate: true });
  };
  
  const getCategoryLabel = (value: string): string => {
    const categories: Record<string, string> = {
      'food': 'Food & Dining',
      'shopping': 'Shopping',
      'transportation': 'Transportation',
      'utilities': 'Utilities',
      'entertainment': 'Entertainment',
      'healthcare': 'Healthcare',
      'education': 'Education',
      'rent': 'Rent & Housing',
      'others': 'Others'
    };
    
    return categories[value] || value;
  };
  
  // For UPI-based payments, use the PaymentGatewayModal
  const handleUpiPayment = () => {
    if (paymentDetails) {
      setCheckoutOpen(false);
      setPaymentGatewayOpen(true);
    }
  };
  
  return (
    <>
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
            <Label htmlFor="receiverName" className="block text-muted-foreground text-sm mb-1">Recipient Name (Optional)</Label>
            <Input 
              id="receiverName" 
              placeholder="John Doe" 
              {...register('receiverName')}
              className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
            />
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
            Continue to Payment
          </Button>
        </form>
      </Card>
      
      {/* Payment Gateway Modal (UPI specific) */}
      {paymentDetails && (
        <PaymentGatewayModal
          isOpen={paymentGatewayOpen}
          onClose={() => setPaymentGatewayOpen(false)}
          amount={paymentDetails.amount}
          receiverDetails={{
            upiId: paymentDetails.upiId,
            name: paymentDetails.name,
            category: getCategoryLabel(paymentDetails.category)
          }}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      
      {/* Checkout Page (Card and other payment methods) */}
      {paymentDetails && checkoutOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="absolute top-4 right-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="bg-background text-foreground rounded-full w-8 h-8 p-0 flex items-center justify-center"
                onClick={() => setCheckoutOpen(false)}
              >
                <i className="fas fa-times"></i>
              </Button>
            </div>
            
            <div className="mt-2">
              <div className="mb-4 text-center">
                <Button
                  variant="outline"
                  className="text-sm"
                  onClick={handleUpiPayment}
                >
                  <i className="fas fa-mobile-alt mr-2"></i>
                  Switch to UPI Payment
                </Button>
              </div>
              
              <CheckoutPage
                amount={paymentDetails.amount}
                onSuccess={handlePaymentComplete}
                onCancel={() => setCheckoutOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentForm;
