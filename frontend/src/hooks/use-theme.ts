import { useContext } from "react";
import {
  ThemeProviderContext,
  type ThemeProviderState,
  type Theme,
} from "@/context/theme-context";

export function useTheme(): ThemeProviderState {
  const context = useContext(ThemeProviderContext);

  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}

export type { Theme, ThemeProviderState };
