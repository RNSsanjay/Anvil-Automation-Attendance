'use client';

import { useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "@/lib/theme";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "./ToastProvider";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const enterFullscreen = () => {
      const doc = window.document.documentElement;
      if (doc.requestFullscreen) {
        doc.requestFullscreen().catch(() => {
          // Ignore errors from browser blocking interaction requirements
        });
      }
      // Remove listeners after first successful or failed attempt
      window.removeEventListener('click', enterFullscreen);
      window.removeEventListener('touchstart', enterFullscreen);
    };

    window.addEventListener('click', enterFullscreen);
    window.addEventListener('touchstart', enterFullscreen);

    return () => {
      window.removeEventListener('click', enterFullscreen);
      window.removeEventListener('touchstart', enterFullscreen);
    };
  }, []);

  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
