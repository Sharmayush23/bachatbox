import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Goal } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface GoalReminderProps {
  goal: Goal;
  onSetReminder: (goalId: number, reminderData: any) => void;
}

const reminderSchema = z.object({
  enabled: z.boolean(),
  reminderDate: z.date().optional(),
  reminderEmail: z.string().email().optional(),
  reminderMessage: z.string().optional()
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

const GoalReminder = ({ goal, onSetReminder }: GoalReminderProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  // Initialize form with current reminder settings if they exist
  const form = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      enabled: goal.reminderEnabled || false,
      reminderDate: goal.reminderDate ? new Date(goal.reminderDate) : undefined,
      reminderEmail: goal.reminderEmail || '',
      reminderMessage: goal.reminderMessage || `Reminder for your goal: ${goal.name}`
    }
  });
  
  const handleSubmit = (data: ReminderFormValues) => {
    try {
      onSetReminder(goal.id, data);
      toast({
        title: "Reminder set",
        description: data.enabled 
          ? "You'll be notified about this goal" 
          : "Reminder has been disabled",
      });
      setOpen(false);
    } catch (error) {
      toast({
        title: "Error setting reminder",
        description: "There was a problem setting your reminder",
        variant: "destructive",
      });
    }
  };
  
  const reminderStatus = goal.reminderEnabled
    ? `Reminder set for ${goal.reminderDate ? format(new Date(goal.reminderDate), 'PP') : 'goal deadline'}`
    : "No reminder set";
  
  return (
    <>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1"
      >
        <i className="fas fa-bell text-xs mr-1"></i>
        {goal.reminderEnabled ? "Edit Reminder" : "Set Reminder"}
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Goal Reminder</DialogTitle>
            <DialogDescription>
              Set up a reminder for your goal "{goal.name}"
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base font-medium">
                        Enable Reminder
                      </FormLabel>
                      <FormDescription className="text-sm text-muted-foreground">
                        Receive notifications about this goal
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch("enabled") && (
                <>
                  <FormField
                    control={form.control}
                    name="reminderDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Reminder Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className="w-full pl-3 text-left font-normal"
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span className="text-muted-foreground">Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              disabled={(date) => date < new Date()}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reminderEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address (optional)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter email for notification" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="reminderMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Reminder Message</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Custom reminder message" 
                            {...field} 
                            value={field.value || ''}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Reminder</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default GoalReminder;