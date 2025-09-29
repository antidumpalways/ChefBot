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
        {/* Favicon (multiple sizes for better clarity and larger displays) */}
        <link rel="icon" type="image/png" sizes="16x16" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="64x64" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="128x128" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="256x256" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/images/favicon.png" />
        <link rel="icon" type="image/png" sizes="any" href="/images/favicon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/favicon.png" />
        <link rel="shortcut icon" href="/images/favicon.png" />
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