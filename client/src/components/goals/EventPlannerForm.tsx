import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const eventPlannerSchema = z.object({
  eventName: z.string().min(2, "Event name is required"),
  eventDate: z.date({
    required_error: "Event date is required",
  }).refine((date) => date > new Date(), {
    message: "Event date must be in the future",
  }),
  estimatedBudget: z.number().min(1, "Budget must be at least 1"),
  eventCategory: z.string().min(1, "Please select an event category"),
  description: z.string().optional(),
  guestCount: z.number().min(0, "Guest count must be positive").optional(),
  location: z.string().optional(),
});

type EventPlannerFormValues = z.infer<typeof eventPlannerSchema>;

type EventPlannerFormProps = {
  onSubmit: (data: EventPlannerFormValues) => void;
};

const EventPlannerForm = ({ onSubmit }: EventPlannerFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<EventPlannerFormValues>({
    resolver: zodResolver(eventPlannerSchema),
    defaultValues: {
      eventName: '',
      eventDate: undefined,
      estimatedBudget: 0,
      eventCategory: '',
      description: '',
      guestCount: 0,
      location: '',
    }
  });

  const eventDate = watch('eventDate');
  
  const handleFormSubmit = (data: EventPlannerFormValues) => {
    setIsSubmitting(true);
    
    try {
      onSubmit(data);
      reset();
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handlers for components that don't work directly with register
  const handleEventCategoryChange = (value: string) => {
    setValue('eventCategory', value, { shouldValidate: true });
  };
  
  const handleDateChange = (date: Date | undefined) => {
    setValue('eventDate', date as Date, { shouldValidate: true });
  };
  
  return (
    <Card className="bg-card border border-border p-6">
      <h3 className="font-medium text-foreground mb-4">Plan an Event</h3>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="eventName" className="block text-muted-foreground text-sm mb-1">Event Name</Label>
          <Input 
            id="eventName" 
            placeholder="Wedding, Birthday Party, etc." 
            {...register('eventName')}
            className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
          />
          {errors.eventName && <p className="text-red-500 text-xs mt-1">{errors.eventName.message}</p>}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="eventDate" className="block text-muted-foreground text-sm mb-1">Event Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-background border border-border text-foreground",
                    !eventDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {eventDate ? format(eventDate, "PPP") : <span>Select date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={eventDate}
                  onSelect={handleDateChange}
                  initialFocus
                  disabled={(date) => date < new Date()}
                />
              </PopoverContent>
            </Popover>
            {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="eventCategory" className="block text-muted-foreground text-sm mb-1">Event Category</Label>
            <Select onValueChange={handleEventCategoryChange}>
              <SelectTrigger 
                id="eventCategory" 
                className="bg-background border border-border text-foreground w-full"
              >
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wedding">Wedding/Anniversary</SelectItem>
                <SelectItem value="birthday">Birthday</SelectItem>
                <SelectItem value="graduation">Graduation</SelectItem>
                <SelectItem value="holiday">Holiday</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="religious">Religious Celebration</SelectItem>
                <SelectItem value="corporate">Corporate Event</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.eventCategory && <p className="text-red-500 text-xs mt-1">{errors.eventCategory.message}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="estimatedBudget" className="block text-muted-foreground text-sm mb-1">Estimated Budget (₹)</Label>
            <Input 
              id="estimatedBudget" 
              type="number" 
              placeholder="5000" 
              {...register('estimatedBudget', { valueAsNumber: true })}
              className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
            />
            {errors.estimatedBudget && <p className="text-red-500 text-xs mt-1">{errors.estimatedBudget.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="guestCount" className="block text-muted-foreground text-sm mb-1">Number of Guests (Optional)</Label>
            <Input 
              id="guestCount" 
              type="number" 
              placeholder="50" 
              {...register('guestCount', { valueAsNumber: true })}
              className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
            />
            {errors.guestCount && <p className="text-red-500 text-xs mt-1">{errors.guestCount.message}</p>}
          </div>
        </div>
        
        <div>
          <Label htmlFor="location" className="block text-muted-foreground text-sm mb-1">Event Location (Optional)</Label>
          <Input 
            id="location" 
            placeholder="Event venue, city, etc." 
            {...register('location')}
            className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div>
          <Label htmlFor="description" className="block text-muted-foreground text-sm mb-1">Description (Optional)</Label>
          <Textarea 
            id="description" 
            placeholder="Additional notes about the event..." 
            {...register('description')}
            className="bg-background border border-border text-foreground rounded-lg block w-full p-2.5 focus:ring-primary focus:border-primary"
            rows={3}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-primary to-[#0F766E] text-white font-medium rounded-lg py-2.5 px-5 focus:outline-none focus:ring-2 focus:ring-primary hover:opacity-90 transition-opacity"
        >
          {isSubmitting ? 'Creating Event Plan...' : 'Create Event Plan'}
        </Button>
      </form>
    </Card>
  );
};

export default EventPlannerForm;