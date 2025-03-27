import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    }
  });
  
  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    
    try {
      await signup(data.email, data.password, data.username);
      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: "Signup failed",
        description: "Please try again with different credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="signup" className="min-h-screen flex items-center justify-center -mt-16">
      <Card className="bg-card rounded-xl shadow-lg p-8 w-full max-w-md border border-border">
        <div className="text-center mb-6">
          <i className="fas fa-user-plus text-primary text-4xl mb-4"></i>
          <h2 className="text-2xl font-bold text-foreground">Create Account</h2>
          <p className="text-muted-foreground mt-2">Sign up to start tracking your finances</p>
        </div>
        
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <Label htmlFor="username" className="block text-foreground text-sm font-medium mb-2">Username</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-user text-muted-foreground text-sm"></i>
                </div>
                <Input 
                  id="username" 
                  type="text" 
                  placeholder="Choose a username" 
                  {...register('username')}
                  className="bg-background border border-border text-foreground rounded-lg block w-full pl-10 p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
            </div>
            
            <div className="mb-4">
              <Label htmlFor="email" className="block text-foreground text-sm font-medium mb-2">Email</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-envelope text-muted-foreground text-sm"></i>
                </div>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email" 
                  {...register('email')}
                  className="bg-background border border-border text-foreground rounded-lg block w-full pl-10 p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            
            <div className="mb-4">
              <Label htmlFor="password" className="block text-foreground text-sm font-medium mb-2">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-muted-foreground text-sm"></i>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Create a password" 
                  {...register('password')}
                  className="bg-background border border-border text-foreground rounded-lg block w-full pl-10 p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            
            <div className="mb-6">
              <Label htmlFor="confirmPassword" className="block text-foreground text-sm font-medium mb-2">Confirm Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-muted-foreground text-sm"></i>
                </div>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  placeholder="Confirm your password" 
                  {...register('confirmPassword')}
                  className="bg-background border border-border text-foreground rounded-lg block w-full pl-10 p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-[#0F766E] text-white font-medium rounded-lg py-2.5 px-5 focus:outline-none focus:ring-2 focus:ring-primary hover:opacity-90 transition-opacity"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </Button>
            
            <p className="text-center mt-4 text-sm text-muted-foreground">
              Already have an account? <a href="/login" className="font-medium text-primary hover:text-primary/80">Login</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default SignupPage;