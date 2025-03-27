import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from '@/hooks/use-toast';

type PaymentGatewayModalProps = {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  receiverDetails: {
    upiId: string;
    name?: string;
    category: string;
  };
  onPaymentComplete: () => void;
};

type PaymentOption = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

const PaymentGatewayModal = ({ 
  isOpen, 
  onClose, 
  amount, 
  receiverDetails,
  onPaymentComplete 
}: PaymentGatewayModalProps) => {
  const [currentStep, setCurrentStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  
  const paymentOptions: Record<string, PaymentOption[]> = {
    upi: [
      { id: 'googlePay', name: 'Google Pay', icon: 'fa-google', color: 'bg-blue-500' },
      { id: 'phonePe', name: 'PhonePe', icon: 'fa-mobile-alt', color: 'bg-indigo-600' },
      { id: 'paytm', name: 'Paytm', icon: 'fa-wallet', color: 'bg-blue-400' },
      { id: 'amazonPay', name: 'Amazon Pay', icon: 'fa-amazon', color: 'bg-orange-500' }
    ],
    cards: [
      { id: 'creditCard', name: 'Credit Card', icon: 'fa-credit-card', color: 'bg-gray-700' },
      { id: 'debitCard', name: 'Debit Card', icon: 'fa-credit-card', color: 'bg-green-600' }
    ],
    bank: [
      { id: 'netBanking', name: 'Net Banking', icon: 'fa-university', color: 'bg-blue-800' },
      { id: 'upiId', name: 'UPI ID', icon: 'fa-money-bill-wave', color: 'bg-green-700' }
    ]
  };
  
  const resetState = () => {
    setCurrentStep('select');
    setSelectedOption(null);
    setIsProcessing(false);
  };
  
  const handleClose = () => {
    resetState();
    onClose();
  };
  
  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    setCurrentStep('confirm');
  };
  
  const handleBack = () => {
    if (currentStep === 'confirm') {
      setCurrentStep('select');
      setSelectedOption(null);
    } else {
      handleClose();
    }
  };
  
  const handleProceed = async () => {
    if (!selectedOption) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep('success');
      
      toast({
        title: "Payment Successful",
        description: `₹${amount.toLocaleString('en-IN')} has been sent to ${receiverDetails.upiId}`,
      });
      
      // After payment success, call the onPaymentComplete callback
      // In a real implementation, this would happen after payment gateway confirmation
      onPaymentComplete();
    }, 2000);
  };
  
  const getSelectedPaymentMethod = () => {
    if (!selectedOption) return null;
    
    for (const category in paymentOptions) {
      const option = paymentOptions[category].find(opt => opt.id === selectedOption);
      if (option) return option;
    }
    
    return null;
  };
  
  const selectedPaymentMethod = getSelectedPaymentMethod();
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 'select' && 'Choose Payment Method'}
            {currentStep === 'confirm' && 'Confirm Payment'}
            {currentStep === 'success' && 'Payment Successful'}
          </DialogTitle>
        </DialogHeader>
        
        {currentStep === 'select' && (
          <div className="py-4">
            <Tabs defaultValue="upi" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="upi">UPI</TabsTrigger>
                <TabsTrigger value="cards">Cards</TabsTrigger>
                <TabsTrigger value="bank">Bank</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upi">
                <div className="grid grid-cols-2 gap-3">
                  {paymentOptions.upi.map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      className="h-24 flex flex-col justify-center items-center space-y-2 hover:bg-muted/80"
                      onClick={() => handleSelectOption(option.id)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color} text-white`}>
                        <i className={`fas ${option.icon}`}></i>
                      </div>
                      <span>{option.name}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="cards">
                <div className="grid grid-cols-2 gap-3">
                  {paymentOptions.cards.map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      className="h-24 flex flex-col justify-center items-center space-y-2 hover:bg-muted/80"
                      onClick={() => handleSelectOption(option.id)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color} text-white`}>
                        <i className={`fas ${option.icon}`}></i>
                      </div>
                      <span>{option.name}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="bank">
                <div className="grid grid-cols-2 gap-3">
                  {paymentOptions.bank.map((option) => (
                    <Button
                      key={option.id}
                      variant="outline"
                      className="h-24 flex flex-col justify-center items-center space-y-2 hover:bg-muted/80"
                      onClick={() => handleSelectOption(option.id)}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${option.color} text-white`}>
                        <i className={`fas ${option.icon}`}></i>
                      </div>
                      <span>{option.name}</span>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
        
        {currentStep === 'confirm' && selectedPaymentMethod && (
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-center mb-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${selectedPaymentMethod.color} text-white`}>
                  <i className={`fas ${selectedPaymentMethod.icon} text-2xl`}></i>
                </div>
              </div>
              
              <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <span className="font-medium">{selectedPaymentMethod.name}</span>
                </div>
                <div className="flex justify-between">
                  <Label className="text-muted-foreground">Recipient</Label>
                  <span className="font-medium">{receiverDetails.upiId}</span>
                </div>
                <div className="flex justify-between">
                  <Label className="text-muted-foreground">Category</Label>
                  <span className="font-medium capitalize">{receiverDetails.category}</span>
                </div>
                <div className="flex justify-between">
                  <Label className="text-muted-foreground">Amount</Label>
                  <span className="font-medium">₹{amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                By proceeding, you'll be redirected to {selectedPaymentMethod.name} to complete this payment.
              </p>
            </div>
          </div>
        )}
        
        {currentStep === 'success' && (
          <div className="py-6 text-center space-y-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white">
                <i className="fas fa-check text-xl"></i>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="font-semibold text-xl">₹{amount.toLocaleString('en-IN')}</p>
              <p className="text-muted-foreground">Payment to {receiverDetails.upiId} was successful</p>
            </div>
            
            <Button 
              onClick={handleClose}
              className="mt-4 bg-primary text-white"
            >
              Done
            </Button>
          </div>
        )}
        
        {currentStep !== 'success' && (
          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              {currentStep === 'select' ? 'Cancel' : 'Back'}
            </Button>
            
            {currentStep === 'confirm' && (
              <Button 
                onClick={handleProceed}
                disabled={isProcessing}
                className="bg-primary text-white"
              >
                {isProcessing ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                    Processing...
                  </>
                ) : (
                  'Proceed to Pay'
                )}
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentGatewayModal;