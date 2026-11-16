import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./global.css";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/api/query-client";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import App from "./app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="system" storageKey="tm-theme">
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
