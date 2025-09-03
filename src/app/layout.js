import { Lexend } from "next/font/google";
import "./globals.css";
import Navbar from "./components/ui/Navbar";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" });

export const metadata = {
  title: "HIGH TECH Internet",
  description: "Best internet connect in your area.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={lexend.variable}>
      <body className="font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
