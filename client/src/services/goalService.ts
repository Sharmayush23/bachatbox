import { Goal } from '@shared/schema';
import { apiRequest } from '../lib/queryClient';

// Mock data for demo purposes
let mockGoals: Goal[] = [
  {
    id: 1,
    userId: 1,
    name: 'New Laptop',
    targetAmount: '75000',
    currentAmount: '25000',
    targetDate: new Date('2024-09-15'),
    monthlyIncome: '42500',
    reminderEnabled: false,
    reminderDate: null,
    reminderEmail: null,
    reminderMessage: null
  },
  {
    id: 2,
    userId: 1,
    name: 'Vacation Fund',
    targetAmount: '100000',
    currentAmount: '40000',
    targetDate: new Date('2024-12-20'),
    monthlyIncome: '42500',
    reminderEnabled: false,
    reminderDate: null,
    reminderEmail: null,
    reminderMessage: null
  },
];

// Function to create a new goal
export const createGoal = async (goalData: Omit<Goal, 'id' | 'userId'>): Promise<Goal> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('POST', '/api/goals', { ...goalData });
    // const newGoal = await response.json();
    
    // For demo, create a new goal with mock data
    const newGoal: Goal = {
      id: mockGoals.length + 1,
      userId: 1,
      ...goalData,
    };
    
    mockGoals.push(newGoal);
    return newGoal;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw new Error('Failed to create goal');
  }
};

// Function to fetch all goals for the current user
export const fetchGoals = async (): Promise<Goal[]> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('GET', '/api/goals');
    // const goals = await response.json();
    
    // For demo, return the mock goals
    return mockGoals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw new Error('Failed to fetch goals');
  }
};

// Function to update a goal
export const updateGoal = async (id: number, goalData: Partial<Goal>): Promise<Goal> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('PUT', `/api/goals/${id}`, { ...goalData });
    // const updatedGoal = await response.json();
    
    // For demo, update the mock goal
    const index = mockGoals.findIndex(goal => goal.id === id);
    if (index === -1) {
      throw new Error('Goal not found');
    }
    
    const updatedGoal: Goal = {
      ...mockGoals[index],
      ...goalData,
    };
    
    mockGoals[index] = updatedGoal;
    return updatedGoal;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw new Error('Failed to update goal');
  }
};

// Function to delete a goal
export const deleteGoal = async (id: number): Promise<void> => {
  try {
    // In a real app, this would hit the API
    // await apiRequest('DELETE', `/api/goals/${id}`);
    
    // For demo, delete from the mock goals
    mockGoals = mockGoals.filter(goal => goal.id !== id);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw new Error('Failed to delete goal');
  }
};

// Function to update goal reminder settings
export const updateGoalReminder = async (id: number, reminderData: {
  reminderEnabled: boolean,
  reminderDate?: Date,
  reminderEmail?: string,
  reminderMessage?: string
}): Promise<Goal> => {
  try {
    // In a real app, this would hit the API
    // const response = await apiRequest('PATCH', `/api/goals/${id}/reminder`, reminderData);
    // const updatedGoal = await response.json();
    
    // For demo, update the mock goal with reminder settings
    const index = mockGoals.findIndex(goal => goal.id === id);
    if (index === -1) {
      throw new Error('Goal not found');
    }
    
    const updatedGoal: Goal = {
      ...mockGoals[index],
      ...reminderData,
    };
    
    mockGoals[index] = updatedGoal;
    return updatedGoal;
  } catch (error) {
    console.error('Error updating goal reminder:', error);
    throw new Error('Failed to update goal reminder');
  }
};
