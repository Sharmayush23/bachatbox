import { formatDistance, format } from 'date-fns';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Calendar, Users, Map, DollarSign } from 'lucide-react';

type EventPlan = {
  id: number;
  eventName: string;
  eventDate: Date;
  estimatedBudget: number;
  eventCategory: string;
  description?: string;
  guestCount?: number;
  location?: string;
  savedAmount?: number;
  expenseItems?: Array<{
    name: string;
    amount: number;
    isPaid: boolean;
  }>;
};

type EventCardProps = {
  event: EventPlan;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAddExpense?: (id: number) => void;
};

const EventCard = ({ event, onEdit, onDelete, onAddExpense }: EventCardProps) => {
  const getCategoryColor = (category: string): string => {
    const categories: Record<string, string> = {
      'wedding': 'bg-pink-500',
      'birthday': 'bg-blue-500',
      'graduation': 'bg-yellow-500',
      'holiday': 'bg-green-500',
      'vacation': 'bg-purple-500',
      'religious': 'bg-indigo-500',
      'corporate': 'bg-gray-500',
      'other': 'bg-orange-500',
    };
    
    return categories[category] || 'bg-gray-500';
  };
  
  const getCategoryIcon = (category: string): string => {
    const icons: Record<string, string> = {
      'wedding': 'fa-rings',
      'birthday': 'fa-birthday-cake',
      'graduation': 'fa-graduation-cap',
      'holiday': 'fa-holly-berry',
      'vacation': 'fa-umbrella-beach',
      'religious': 'fa-pray',
      'corporate': 'fa-briefcase',
      'other': 'fa-calendar-alt',
    };
    
    return icons[category] || 'fa-calendar-alt';
  };
  
  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      'wedding': 'Wedding/Anniversary',
      'birthday': 'Birthday',
      'graduation': 'Graduation',
      'holiday': 'Holiday',
      'vacation': 'Vacation',
      'religious': 'Religious',
      'corporate': 'Corporate',
      'other': 'Other',
    };
    
    return labels[category] || 'Event';
  };
  
  // Calculate days until event
  const daysUntil = Math.ceil((event.eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate savings progress
  const savedAmount = event.savedAmount || 0;
  const savingsProgress = Math.min(Math.round((savedAmount / event.estimatedBudget) * 100), 100);
  
  // Calculate monthly savings goal
  const monthsLeft = Math.max(1, Math.ceil(daysUntil / 30));
  const monthlySavingGoal = (event.estimatedBudget - savedAmount) / monthsLeft;
  
  // Calculate total expenses from expense items
  const totalExpenses = event.expenseItems?.reduce((sum, item) => sum + item.amount, 0) || 0;
  const paidExpenses = event.expenseItems?.filter(item => item.isPaid).reduce((sum, item) => sum + item.amount, 0) || 0;
  
  // Whether all expenses have been paid
  const allExpensesPaid = totalExpenses > 0 && totalExpenses === paidExpenses;
  
  return (
    <Card className="bg-card border border-border hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className={`rounded-full ${getCategoryColor(event.eventCategory)} p-2 text-white`}>
              <i className={`fas ${getCategoryIcon(event.eventCategory)}`}></i>
            </div>
            <div>
              <h3 className="font-bold text-lg">{event.eventName}</h3>
              <p className="text-sm text-muted-foreground">
                {getCategoryLabel(event.eventCategory)}
              </p>
            </div>
          </div>
          
          <div className="flex space-x-1">
            <Button variant="ghost" size="sm" onClick={() => onEdit(event.id)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onDelete(event.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{format(event.eventDate, 'MMM d, yyyy')}</span>
          </div>
          
          {event.guestCount !== undefined && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="h-4 w-4 mr-1" />
              <span>{event.guestCount} guests</span>
            </div>
          )}
          
          {event.location && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Map className="h-4 w-4 mr-1" />
              <span>{event.location}</span>
            </div>
          )}
          
          <div className="flex items-center text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-1" />
            <span>₹{event.estimatedBudget.toLocaleString()}</span>
          </div>
        </div>
        
        {event.description && (
          <div className="mt-3 text-sm text-muted-foreground">
            {event.description}
          </div>
        )}
        
        <div className="mt-4 space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Savings Progress</span>
              <span className="text-sm font-medium">{savingsProgress}%</span>
            </div>
            <Progress value={savingsProgress} />
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>₹{savedAmount.toLocaleString()} saved</span>
              <span>₹{event.estimatedBudget.toLocaleString()} goal</span>
            </div>
          </div>
          
          <div className="bg-background border border-border rounded-md p-3">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium">Event Details</h4>
              <Badge variant={daysUntil <= 30 ? "destructive" : "outline"}>
                {daysUntil} days left
              </Badge>
            </div>
            
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly Saving Goal:</span>
                <span className="font-medium">₹{monthlySavingGoal.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
              
              {totalExpenses > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expenses Paid:</span>
                  <span className="font-medium">
                    ₹{paidExpenses.toLocaleString()} / ₹{totalExpenses.toLocaleString()}
                    {allExpensesPaid && <span className="ml-1 text-green-500">✓</span>}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {onAddExpense && (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={() => onAddExpense(event.id)}
          >
            <i className="fas fa-plus mr-2"></i>
            Add Expense Item
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EventCard;