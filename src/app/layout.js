// app/layout.js
import { Lexend } from "next/font/google";
import "./globals.css";
import Navbar from "./components/ui/Navbar";
import { connectToDatabase } from "./lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { Providers } from "@/app/components/providers/QueryClientProvider";

const lexend = Lexend({ subsets: ["latin"], variable: "--font-lexend" });

// Connect to database at module level
connectToDatabase().catch(console.error);

export const metadata = {
  title: "HIGH TECH Internet",
  description: "Best internet connect in your area.",
};

// Mark the layout as a Server Component
async function RootLayout({ children }) {
  let session = null;
  
  try {
    // This will be handled dynamically, not during static generation
    session = await getServerSession(authOptions);
  } catch (error) {
    console.error('Error getting server session:', error);
  }

  return (
    <html lang="en" className={lexend.variable}>
      <body className="font-sans">
        <Providers>
          <Navbar initialSession={session} />
          {children}
        </Providers>
      </body>
    </html>
  );
}

// Opt out of static rendering for pages that need dynamic data
export const dynamic = 'force-dynamic';

export default RootLayout;