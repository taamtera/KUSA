// app/layout.jsx
import "./globals.css"
import { Manrope } from "next/font/google";


export const metadata = {
  title: "Kusa",
  description: "Your app description",
}

// Manrope for headings (e.g., KUSA). Using Thin by default; add more weights if needed.
const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800"]
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} bg-white text-black`}>
        {children}
      </body>
    </html>
  );
}
