//Navbar Component - by Devika Harshey
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import RecipeSearchBar from "@/components/RecipeSearchBar";
import { useAuth } from "../contexts/AuthContext";

interface NavbarProps {
  showResults?: boolean;
  setShowResults?: React.Dispatch<React.SetStateAction<boolean>>;
  handleBlur?: () => void;
  handleSearchFocus?: () => void;
}

export default function Navbar({
  showResults = false,
  setShowResults = () => {},
  handleBlur = () => {},
  handleSearchFocus = () => {},
}: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("light");
  const { user, signOut } = useAuth() as any;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          const newTheme =
            document.documentElement.getAttribute("data-theme") || "light";
          setCurrentTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const initialTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    setCurrentTheme(initialTheme);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      className={`navbar fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? currentTheme === "dark" 
            ? "backdrop-blur-lg border-b shadow-lg shadow-black/20" 
            : "bg-white/80 backdrop-blur-lg border-b border-black/5 shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
      style={{
        backgroundColor: isScrolled && currentTheme === "dark" ? "var(--dark-bg)" : undefined,
        borderColor: isScrolled && currentTheme === "dark" ? "var(--dark-text-secondary)" : undefined
      }}
    >
      <div className="w-full mx-auto max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-y-2 py-2 md:py-3">
      {/* Left - Logo */}
      <div className="flex items-center flex-1 md:w-1/3">
        <Link
          href="/"
          id="main"
          className="transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-1">
            {/* ChefB - DM Serif Display */}
            <span className={`text-2xl md:text-3xl font-dm-serif-display font-normal tracking-tight ${
              currentTheme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}
            style={{
              color: currentTheme === "dark" ? "var(--dark-text-primary)" : undefined
            }}>
              ChefB
            </span>
            {/* Target Symbol - AI Precision */}
            <div className="relative w-6 h-6 md:w-8 md:h-8 flex items-center justify-center">
              <div className="w-6 h-6 md:w-8 md:h-8 border-2 rounded-full flex items-center justify-center"
              style={{
                borderColor: "var(--accent)"
              }}>
                <div className="w-2 h-2 md:w-3 md:h-3 rounded-full"
                style={{
                  backgroundColor: "var(--accent)"
                }}></div>
              </div>
            </div>
            {/* t - DM Serif Display */}
            <span className="text-2xl md:text-3xl font-dm-serif-display font-normal tracking-tight"
            style={{
              color: "var(--accent)"
            }}>
              t
            </span>
          </div>
        </Link>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex justify-center w-1/3">
        <RecipeSearchBar
          isScrolled={isScrolled}
          handleBlur={handleBlur}
          handleSearchFocus={handleSearchFocus}
          showResults={showResults}
          setShowResults={setShowResults}
          className="w-[22rem] max-w-full"
        />
      </div>

      {/* Right - Home Button, User Menu & Theme Toggle */}
      <div className="flex items-center justify-end gap-2 md:gap-6 flex-1 md:w-1/3">
        {/* Home Button */}
        <Link
          href="/"
          className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-105 ${
            currentTheme === "dark" 
              ? "bg-gray-700 hover:bg-gray-600 text-gray-200" 
              : "bg-gray-100 hover:bg-gray-200 text-gray-700"
          }`}
          title="Home"
        >
          <svg 
            width="16" 
            height="16" 
            className="md:w-5 md:h-5"
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
        </Link>
        
        {user ? (
          /* User Profile Dropdown - When logged in */
          <div className="dropdown dropdown-end">
            <div 
              tabIndex={0} 
              role="button" 
              className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center transition-all duration-300 hover:scale-110 cursor-pointer"
            >
              <span className={`text-lg md:text-xl ${
                currentTheme === "dark" 
                  ? "text-white filter brightness-0 invert" 
                  : "text-black filter brightness-0"
              }`}>👤</span>
            </div>
            <ul 
              tabIndex={0} 
              className={`dropdown-content z-[1] menu p-2 shadow-lg rounded-box w-48 ${
                currentTheme === "dark" 
                  ? "bg-gray-800 border border-gray-600" 
                  : "bg-white border border-gray-200"
              }`}
            >
              {/* Profile/Dashboard */}
              <li>
                <Link 
                  href="/dashboard" 
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    currentTheme === "dark" 
                      ? "hover:bg-gray-700 text-gray-100" 
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                  style={{
                    cursor: "var(--spoon-cursor)"
                  }}
                >
                  Profile/Dashboard
                </Link>
              </li>

              {/* Saved Recipes */}
              <li>
                <Link 
                  href="/favorite" 
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    currentTheme === "dark" 
                      ? "hover:bg-gray-700 text-gray-100" 
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                  style={{
                    cursor: "var(--spoon-cursor)"
                  }}
                >
                  Saved Recipes
                </Link>
              </li>

              {/* My Diet Plan */}
              <li>
                <Link 
                  href="/my-diet-plan" 
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    currentTheme === "dark" 
                      ? "hover:bg-gray-700 text-gray-100" 
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                  style={{
                    cursor: "var(--spoon-cursor)"
                  }}
                >
                  My Diet Plan
                </Link>
              </li>

              {/* Divider */}
              <div className={`h-px my-2 ${
                currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
              }`}></div>

              {/* Cooking History */}
              <li>
                <Link 
                  href="/history" 
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    currentTheme === "dark" 
                      ? "hover:bg-gray-700 text-gray-100" 
                      : "hover:bg-gray-100 text-gray-800"
                  }`}
                  style={{
                    cursor: "var(--spoon-cursor)"
                  }}
                >
                  Cooking History
                </Link>
              </li>

              {/* Divider */}
              <div className={`h-px my-2 ${
                currentTheme === "dark" ? "bg-gray-600" : "bg-gray-200"
              }`}></div>

              {/* Logout */}
              <li>
                <button 
                  className={`px-4 py-3 rounded-lg transition-colors w-full text-left ${
                    currentTheme === "dark" 
                      ? "hover:bg-red-900/30 text-red-400" 
                      : "hover:bg-red-50 text-red-600"
                  }`}
                  onClick={signOut}
                  style={{
                    cursor: "var(--spoon-cursor)"
                  }}
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          /* Login/Signup Links - When not logged in */
          <div className="flex items-center gap-1 md:gap-3 flex-wrap">
            <Link 
              href="/login" 
              className={`btn btn-ghost btn-sm text-sm ${
                currentTheme === "dark" 
                  ? "text-white hover:bg-white/10" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className="btn btn-sm text-sm text-white"
              style={{
                backgroundColor: "var(--accent)",
                border: "none"
              }}
            >
              Sign Up
        </Link>
          </div>
        )}

        {/* Theme Toggle - Posisi paling kanan */}
        <ThemeToggle />
      </div>

      {/* Mobile Search below */}
      <div className="w-full md:hidden">
        <RecipeSearchBar
          isScrolled={isScrolled}
          handleBlur={handleBlur}
          handleSearchFocus={handleSearchFocus}
          showResults={showResults}
          setShowResults={setShowResults}
          className="w-full"
        />
      </div>
      </div>
    </div>
  );
}
