import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Games from "./pages/Games";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Community from "./pages/Community";
import News from "./pages/News";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import { initGA, trackPageview } from "./analytics/ga";

const queryClient = new QueryClient();
const GA_ID = import.meta.env.VITE_GA_ID as string;

function PageviewTracker() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    trackPageview();
  }, [pathname, search, hash]);

  return null;
}

const App = () => {
  useEffect(() => {
    initGA(GA_ID);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PageviewTracker />
          <Routes>
            
            <Route path="/index" element={<Index />} />
            <Route path="/games" element={<Games />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/community" element={<Community />} />
            <Route path="/news" element={<News />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
