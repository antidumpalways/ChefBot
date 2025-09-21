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
            ? "bg-gray-800 backdrop-blur-lg border-b border-gray-600 shadow-lg shadow-black/20" 
            : "bg-white/80 backdrop-blur-lg border-b border-black/5 shadow-lg shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <div className="navbar-container flex flex-wrap items-center justify-between gap-y-2 py-2 md:py-3">
      {/* Left - Logo */}
      <div className="flex items-center">
        <Link
          href="/"
          id="main"
          className="transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="flex items-center gap-1">
            {/* ChefB - DM Serif Display */}
            <span className={`text-3xl font-dm-serif-display font-normal tracking-tight ${
              currentTheme === "dark" ? "text-gray-100" : "text-gray-900"
            }`}>
              ChefB
            </span>
            {/* Target Symbol - AI Precision */}
            <div className="relative w-8 h-8 flex items-center justify-center">
              <div className={`w-8 h-8 border-2 rounded-full flex items-center justify-center ${
                currentTheme === "dark" ? "border-orange-400" : "border-orange-600"
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  currentTheme === "dark" ? "bg-orange-400" : "bg-orange-600"
                }`}></div>
              </div>
            </div>
            {/* t - DM Serif Display */}
            <span className={`text-3xl font-dm-serif-display font-normal tracking-tight ${
              currentTheme === "dark" ? "text-orange-400" : "text-orange-600"
            }`}>
              t
            </span>
          </div>
        </Link>
      </div>

      {/* Center - Search */}
      <div className="hidden md:flex justify-center flex-1">
        <RecipeSearchBar
          isScrolled={isScrolled}
          handleBlur={handleBlur}
          handleSearchFocus={handleSearchFocus}
          showResults={showResults}
          setShowResults={setShowResults}
          className="w-[22rem] max-w-full"
        />
      </div>

      {/* Right - User Menu & Theme Toggle */}
      <div className="ml-auto md:ml-0 flex items-center gap-6">
        {user ? (
          /* User Profile Dropdown - When logged in */
          <div className="dropdown dropdown-end">
            <div 
              tabIndex={0} 
              role="button" 
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 hover:scale-110 cursor-pointer ${
            currentTheme === "dark" 
              ? "bg-white/30 border-2 border-white/50 hover:bg-white/40" 
              : "bg-gray-300 border-2 border-gray-400 hover:bg-gray-400"
          }`}
            >
              <span className={`text-xl ${
                currentTheme === "dark" ? "text-white" : "text-black"
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
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          /* Login/Signup Links - When not logged in */
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className={`btn btn-ghost btn-sm ${
                currentTheme === "dark" 
                  ? "text-white hover:bg-white/10" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              Sign In
            </Link>
            <Link 
              href="/login" 
              className={`btn btn-primary btn-sm ${
                currentTheme === "dark" 
                  ? "bg-orange-500 hover:bg-orange-600 text-white" 
                  : "bg-orange-600 hover:bg-orange-700 text-white"
              }`}
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
