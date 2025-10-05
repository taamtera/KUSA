"use client";

import { ThemeProvider, CssBaseline, createTheme } from "@mui/material";

const theme = createTheme({
  palette: {
    mode: "light",
  },
  typography: {
    fontFamily: 'var(--font-manrope), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  },
});

export default function Providers({ children }) {
  return (
    <ThemeProvider theme={theme}>
      {/* If you see double-reset issues with Tailwind Preflight, remove CssBaseline or disable Preflight. */}
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
