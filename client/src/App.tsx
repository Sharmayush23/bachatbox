import { Switch, Route, Router } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/layout/Navbar";
import ChatBot from "./components/chatbot/ChatBot";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import TransactionsPage from "./pages/TransactionsPage";
import GoalsPage from "./pages/GoalsPage";
import WalletPage from "./pages/WalletPage";
import NotFound from "@/pages/not-found";
import { useLocation } from "wouter";
import { useAuth } from "./context/AuthContext";
import { getBasePath } from "./lib/github-pages-router";

// This is a separate component to be used within the AuthProvider
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/login");
    return null;
  }

  return <Component />;
}

// This is a separate component to be used within the AuthProvider
function MainAppContent() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Switch>
          <Route path="/login" component={LoginPage} />
          <Route path="/signup" component={SignupPage} />
          <Route path="/">
            {isAuthenticated ? <DashboardPage /> : <LoginPage />}
          </Route>
          <Route path="/dashboard">
            <ProtectedRoute component={DashboardPage} />
          </Route>
          <Route path="/transactions">
            <ProtectedRoute component={TransactionsPage} />
          </Route>
          <Route path="/goals">
            <ProtectedRoute component={GoalsPage} />
          </Route>
          <Route path="/wallet">
            <ProtectedRoute component={WalletPage} />
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>
      
      {/* Add ChatBot only for authenticated users */}
      {isAuthenticated && <ChatBot />}
      
      <footer className="bg-card border-t border-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <i className="fas fa-wallet text-primary mr-2"></i>
              <span className="text-primary font-medium">BachatBox</span>
            </div>
            <div className="text-muted-foreground text-sm">
              &copy; 2024 BachatBox. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

// This is a component to wrap with all the providers
function AppWithProviders() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <MainAppContent />
          <Toaster />
        </QueryClientProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

// The main App component now just returns the fully wrapped tree with proper GitHub Pages routing
function App() {
  // Get the base path for GitHub Pages deployment
  const basePath = getBasePath();
  
  return (
    <Router base={basePath}>
      <AppWithProviders />
    </Router>
  );
}

export default App;