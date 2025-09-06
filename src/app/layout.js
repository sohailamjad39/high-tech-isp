import { Lexend } from "next/font/google";
import "./globals.css";
import Navbar from "./components/ui/Navbar";
import { connectToDatabase } from "./lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" });

connectToDatabase().catch(console.error);

export const metadata = {
  title: "HIGH TECH Internet",
  description: "Best internet connect in your area.",
};

async function RootLayout({ children }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en" className={lexend.variable}>
      <body className="font-sans">
        <Navbar initialSession={session}/>
        {children}
      </body>
    </html>
  );
}

export default RootLayout;
