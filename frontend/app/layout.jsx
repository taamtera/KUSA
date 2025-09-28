// app/layout.jsx
import "./globals.css"

export const metadata = {
  title: "Kusa",
  description: "Your app description",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
