import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type WalletCardProps = {
  balance: number;
  onAddMoney: () => void;
};

const WalletCard = ({ balance, onAddMoney }: WalletCardProps) => {
  return (
    <Card className="bg-gradient-to-r from-primary to-[#0F766E] rounded-xl p-6 flex flex-col">
      <h3 className="font-medium text-white/90 mb-2">Wallet Balance</h3>
      <p id="walletBalance" className="text-3xl font-bold text-white mb-6">
        ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </p>
      <Button 
        id="addMoneyBtn" 
        onClick={onAddMoney}
        className="mt-auto bg-white text-[#0F766E] font-medium rounded-lg py-2 px-4 focus:outline-none hover:bg-white/90 transition-colors"
      >
        Add Money
      </Button>
    </Card>
  );
};

export default WalletCard;
