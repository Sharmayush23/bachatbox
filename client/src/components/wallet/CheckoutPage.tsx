import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type CheckoutPageProps = {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
};

type PaymentMethod = 'credit-card' | 'debit-card' | 'netbanking' | 'upi';

const CheckoutPage = ({ amount, onSuccess, onCancel }: CheckoutPageProps) => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit-card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (paymentMethod === 'credit-card' || paymentMethod === 'debit-card') {
      if (!cardNumber || !cardName || !expiryDate || !cvv) {
        toast({
          title: "Missing Information",
          description: "Please fill in all card details",
          variant: "destructive"
        });
        return;
      }
    } else if (paymentMethod === 'upi' && !upiId) {
      toast({
        title: "Missing Information",
        description: "Please enter your UPI ID",
        variant: "destructive"
      });
      return;
    }
    
    // Process payment (simulate API call)
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      
      toast({
        title: "Payment Successful",
        description: `₹${amount.toLocaleString('en-IN')} has been processed successfully`,
      });
      
      onSuccess();
    }, 2000);
  };
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setCardNumber(formattedValue);
  };
  
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    setExpiryDate(value);
  };
  
  return (
    <Card className="max-w-md mx-auto border border-border bg-card">
      <div className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold mb-2">Complete Your Payment</h2>
          <p className="text-muted-foreground">Amount: ₹{amount.toLocaleString('en-IN')}</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <Label className="text-base font-medium mb-3 block">Payment Method</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-2 gap-4"
            >
              <div className="flex items-center space-x-2 border border-border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="credit-card" id="credit-card" />
                <Label htmlFor="credit-card" className="cursor-pointer w-full">
                  <div className="flex items-center">
                    <i className="fas fa-credit-card mr-2"></i>
                    <span>Credit Card</span>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border border-border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="debit-card" id="debit-card" />
                <Label htmlFor="debit-card" className="cursor-pointer w-full">
                  <div className="flex items-center">
                    <i className="fas fa-credit-card mr-2"></i>
                    <span>Debit Card</span>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border border-border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="netbanking" id="netbanking" />
                <Label htmlFor="netbanking" className="cursor-pointer w-full">
                  <div className="flex items-center">
                    <i className="fas fa-university mr-2"></i>
                    <span>Net Banking</span>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 border border-border rounded-md p-3 cursor-pointer hover:bg-muted/50">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="cursor-pointer w-full">
                  <div className="flex items-center">
                    <i className="fas fa-mobile-alt mr-2"></i>
                    <span>UPI</span>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          {(paymentMethod === 'credit-card' || paymentMethod === 'debit-card') && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="card-number">Card Number</Label>
                <Input
                  id="card-number"
                  value={cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="bg-background border border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="card-name">Name on Card</Label>
                <Input
                  id="card-name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-background border border-border text-foreground"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiry-date">Expiry Date</Label>
                  <Input
                    id="expiry-date"
                    value={expiryDate}
                    onChange={handleExpiryDateChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className="bg-background border border-border text-foreground"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    type="password"
                    maxLength={3}
                    placeholder="123"
                    className="bg-background border border-border text-foreground"
                  />
                </div>
              </div>
            </div>
          )}
          
          {paymentMethod === 'upi' && (
            <div>
              <Label htmlFor="upi-id">UPI ID</Label>
              <Input
                id="upi-id"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@upi"
                className="bg-background border border-border text-foreground"
              />
            </div>
          )}
          
          {paymentMethod === 'netbanking' && (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center space-x-2 h-16"
                onClick={() => toast({
                  title: "Bank Selected",
                  description: "HDFC Bank selected for payment",
                })}
              >
                <div className="font-semibold">HDFC Bank</div>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center space-x-2 h-16"
                onClick={() => toast({
                  title: "Bank Selected",
                  description: "ICICI Bank selected for payment",
                })}
              >
                <div className="font-semibold">ICICI Bank</div>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center space-x-2 h-16"
                onClick={() => toast({
                  title: "Bank Selected",
                  description: "SBI selected for payment",
                })}
              >
                <div className="font-semibold">SBI</div>
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className="flex items-center justify-center space-x-2 h-16"
                onClick={() => toast({
                  title: "Bank Selected",
                  description: "Axis Bank selected for payment",
                })}
              >
                <div className="font-semibold">Axis Bank</div>
              </Button>
            </div>
          )}
          
          <div className="mt-6 flex space-x-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              className="flex-1 bg-primary text-white"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <i className="fas fa-circle-notch fa-spin mr-2"></i>
                  Processing...
                </>
              ) : (
                `Pay ₹${amount.toLocaleString('en-IN')}`
              )}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
};

export default CheckoutPage;