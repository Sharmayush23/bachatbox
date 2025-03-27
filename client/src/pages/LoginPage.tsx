import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from '../context/AuthContext';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    
    try {
      await login(data.email, data.password);
      toast({
        title: "Login successful",
        description: "Welcome to BachatBox!",
      });
      setLocation('/dashboard');
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="login" className="min-h-screen flex items-center justify-center -mt-16">
      <Card className="bg-card rounded-xl shadow-lg p-8 w-full max-w-md border border-border">
        <div className="text-center mb-6">
          <i className="fas fa-wallet text-primary text-4xl mb-4"></i>
          <h2 className="text-2xl font-bold text-foreground">Login to BachatBox</h2>
          <p className="text-muted-foreground mt-2">Welcome back! Please login to your account.</p>
        </div>
        
        <CardContent className="p-0">
          <form onSubmit={handleSubmit(onSubmit)}>
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
            
            <div className="mb-6">
              <Label htmlFor="password" className="block text-foreground text-sm font-medium mb-2">Password</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-lock text-muted-foreground text-sm"></i>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password" 
                  {...register('password')}
                  className="bg-background border border-border text-foreground rounded-lg block w-full pl-10 p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Checkbox 
                  id="remember-me" 
                  {...register('rememberMe')}
                  className="h-4 w-4 text-primary focus:ring-primary border-border rounded bg-background"
                />
                <Label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">Remember me</Label>
              </div>
              <a href="#" className="text-sm font-medium text-primary hover:text-primary/80">Forgot password?</a>
            </div>
            
            <Button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-primary to-[#0F766E] text-white font-medium rounded-lg py-2.5 px-5 focus:outline-none focus:ring-2 focus:ring-primary hover:opacity-90 transition-opacity"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            
            <p className="text-center mt-4 text-sm text-muted-foreground">
              Don't have an account? <a href="/signup" className="font-medium text-primary hover:text-primary/80">Sign up</a>
            </p>
          </form>
        </CardContent>
      </Card>
    </section>
  );
};

export default LoginPage;
