"use client";

import React, { useEffect, useState } from 'react'

const Footer = () => {
    const [currentTheme, setCurrentTheme] = useState('light');

  useEffect(() => {
    // Create a MutationObserver to watch for theme changes
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

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Set initial theme
    const initialTheme =
      document.documentElement.getAttribute("data-theme") || "light";
    setCurrentTheme(initialTheme);

    // Cleanup function
    return () => observer.disconnect();
  }, []);

  return (
    <footer className={`footer py-10 ${
      currentTheme === "dark" 
        ? "bg-gray-800/90 border-t border-gray-600 text-gray-100" 
        : "bg-amber-50/90 border-t border-gray-200 text-gray-900"
    }`}>
      <div className="footer-container">
        <div className="w-full">
          {/* Desktop Layout - 3 Columns */}
          <div className="hidden lg:flex lg:justify-center lg:items-center lg:gap-x-24">
            {/* Left Section - Branding (Kiri) */}
            <div className="text-left">
              <div className="flex items-center gap-1 mb-2">
                {/* ChefB - DM Serif Display */}
                <span className={`text-2xl font-dm-serif-display font-normal tracking-tight ${
                  currentTheme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}>
                  ChefB
                </span>
                {/* Target Symbol - AI Precision */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
                    currentTheme === "dark" ? "border-orange-400" : "border-orange-600"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      currentTheme === "dark" ? "bg-orange-400" : "bg-orange-600"
                    }`}></div>
                  </div>
                </div>
                {/* t - DM Serif Display */}
                <span className={`text-2xl font-dm-serif-display font-normal tracking-tight ${
                  currentTheme === "dark" ? "text-orange-400" : "text-orange-600"
                }`}>
                  t
                </span>
              </div>
              <p className={`text-sm ${
                currentTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Personalized recipes, powered by Sensay AI.
              </p>
            </div>

            {/* Center Section - Links (Tengah) */}
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center gap-4">
                <a
                  href="https://sensay.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn btn-outline btn-sm px-3 py-1.5 text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                    currentTheme === "dark" 
                      ? "bg-transparent border-gray-500 text-gray-200 hover:bg-gray-700 hover:text-white" 
                      : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base mr-2">🤖</span>
                  Sensay AI
                </a>
                <a
                  href="https://docs.sensay.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`btn btn-outline btn-sm px-3 py-1.5 text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                    currentTheme === "dark" 
                      ? "bg-transparent border-gray-500 text-gray-200 hover:bg-gray-700 hover:text-white" 
                      : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base mr-2">📚</span>
                  Documentation
                </a>
              </div>
              <div className="text-center">
                <p className={`text-xs ${
                  currentTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Sensay Connect Hackathon
                </p>
              </div>
            </div>

            {/* Right Section - Copyright (Kanan) */}
            <div className="text-right">
              <p className={`text-sm ${
                currentTheme === "dark" ? "text-gray-100" : "text-gray-900"
              }`}>
                &copy; {new Date().getFullYear()} ChefBot Pro
              </p>
              <p className={`text-xs mt-1 ${
                currentTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                All Rights Reserved
              </p>
            </div>
          </div>

          {/* Mobile Layout - Stacked */}
          <div className="lg:hidden flex flex-col items-center space-y-6">
            {/* Branding */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-2">
                {/* ChefB - DM Serif Display */}
                <span className={`text-2xl font-dm-serif-display font-normal tracking-tight ${
                  currentTheme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}>
                  ChefB
                </span>
                {/* Target Symbol - AI Precision */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center ${
                    currentTheme === "dark" ? "border-orange-400" : "border-orange-600"
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      currentTheme === "dark" ? "bg-orange-400" : "bg-orange-600"
                    }`}></div>
                  </div>
                </div>
                {/* t - DM Serif Display */}
                <span className={`text-2xl font-dm-serif-display font-normal tracking-tight ${
                  currentTheme === "dark" ? "text-orange-400" : "text-orange-600"
                }`}>
                  t
                </span>
              </div>
              <p className={`text-sm ${
                currentTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}>
                Personalized recipes, powered by Sensay AI.
          </p>
        </div>

            {/* Links */}
            <div className="flex flex-col items-center space-y-3">
              <div className="flex items-center gap-4">
          <a
                  href="https://sensay.io"
            target="_blank"
            rel="noopener noreferrer"
                  className={`btn btn-outline btn-sm px-3 py-1.5 text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                    currentTheme === "dark" 
                      ? "bg-transparent border-gray-500 text-gray-200 hover:bg-gray-700 hover:text-white" 
                      : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:text-gray-900"
                  }`}
          >
                  <span className="text-base mr-2">🤖</span>
                  Sensay AI
          </a>
            <a
                  href="https://docs.sensay.io"
              target="_blank"
              rel="noopener noreferrer"
                  className={`btn btn-outline btn-sm px-3 py-1.5 text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                    currentTheme === "dark" 
                      ? "bg-transparent border-gray-500 text-gray-200 hover:bg-gray-700 hover:text-white" 
                      : "bg-white border-gray-300 text-gray-800 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="text-base mr-2">📚</span>
                  Documentation
            </a>
          </div>
              <div className="text-center">
                <p className={`text-xs ${
                  currentTheme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}>
                  Sensay Connect Hackathon
                </p>
          </div>
        </div>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-neutral">
                &copy; {new Date().getFullYear()} ChefBot Pro
              </p>
              <p className="text-xs text-neutral mt-1">
                All Rights Reserved
          </p>
        </div>
          </div>
        </div>

        {/* Bottom Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-base-300 to-transparent mt-8"></div>
      </div>
    </footer>
  );
};

export default Footer;
