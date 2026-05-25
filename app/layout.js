import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "./Components/navbar";
import { SearchProvider } from "./context/SearchContext";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});  

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});  

export const metadata = {
  title: "ProMart | The Market for Pros!",
  description: "E-Commerce Template made by arweh.dev",
};  

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">

        <SearchProvider>
          <Navbar />
          {children}
        </SearchProvider>

      </body>
    </html>
  );
}