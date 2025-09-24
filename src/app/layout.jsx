import { Inter, Lora, DM_Serif_Display, Roboto_Condensed, Poppins } from "next/font/google";
import "./globals.css";
import ScrollToTop from "../components/ScrollToTop";
import { AuthProvider } from "../contexts/AuthContext";
import SessionManager from "../components/SessionManager";
import SpoonCursor from "../components/SpoonCursor";
import Chatbot from "../components/Chatbot";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap'
});

const lora = Lora({ 
  subsets: ["latin"],
  variable: '--font-lora',
  display: 'swap'
});

const dmSerifDisplay = DM_Serif_Display({ 
  subsets: ["latin"],
  variable: '--font-dm-serif-display',
  display: 'swap',
  weight: ['400']
});

const robotoCondensed = Roboto_Condensed({ 
  subsets: ["latin"],
  variable: '--font-roboto-condensed',
  display: 'swap',
  weight: ['300', '400', '700']
});

const poppins = Poppins({ 
  subsets: ["latin"],
  variable: '--font-poppins',
  display: 'swap',
  weight: ['400', '500', '600', '700']
});

export const metadata = {
  title: "ChefBot Pro",
  description: "Your AI-powered culinary companion powered by Sensay AI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><path d='M50 15 L35 25 L35 70 L65 70 L65 25 Z' fill='none' stroke='black' stroke-width='3'/><path d='M30 70 L70 70' stroke='black' stroke-width='3'/><path d='M40 25 L40 35 M45 25 L45 35 M50 25 L50 35 M55 25 L55 35 M60 25 L60 35' stroke='black' stroke-width='2'/></svg>"
        />
      </head>
      <body className={`${inter.variable} ${lora.variable} ${dmSerifDisplay.variable} ${robotoCondensed.variable} ${poppins.variable} font-roboto-condensed`}>
        <AuthProvider>
          <SessionManager />
          <SpoonCursor />
          {children}
          <ScrollToTop></ScrollToTop>
          <Chatbot />
        </AuthProvider>
      </body>
    </html>
  );
}