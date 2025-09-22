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
    <footer className={`footer w-full py-16 ${
      currentTheme === "dark" 
        ? "text-gray-100" 
        : "bg-white border-t border-gray-200 text-gray-900"
    }`}
    style={{
      backgroundColor: currentTheme === "dark" ? "var(--dark-bg)" : "white",
      color: currentTheme === "dark" ? "var(--dark-text-primary)" : undefined
    }}>
      <div className="w-full mx-auto max-w-sm sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="w-full">
          {/* Desktop Layout - 3 Columns */}
          <div className="hidden lg:flex lg:justify-between lg:items-center">
            {/* Left Section - Branding (Kiri) */}
            <div className="text-left w-1/3">
              <div className="flex items-center gap-1 mb-2">
                {/* ChefB - DM Serif Display */}
                <span className={`text-2xl font-dm-serif-display font-normal tracking-tight ${
                  currentTheme === "dark" ? "text-gray-100" : "text-gray-900"
                }`}>
                  ChefB
                </span>
                {/* Target Symbol - AI Precision */}
                <div className="relative w-6 h-6 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 rounded-full flex items-center justify-center"
                  style={{
                    borderColor: "var(--accent)"
                  }}>
                    <div className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: "var(--accent)"
                    }}></div>
                  </div>
                </div>
                {/* t - DM Serif Display */}
                <span className="text-2xl font-dm-serif-display font-normal tracking-tight"
                style={{
                  color: "var(--accent)"
                }}>
                  t
                </span>
              </div>
              <p className={`text-sm ${
                currentTheme === "dark" ? "text-gray-400" : "text-gray-600"
              }`}
              style={{
                color: currentTheme === "dark" ? "var(--dark-text-secondary)" : undefined
              }}>
                Personalized recipes, powered by Sensay AI.
              </p>
            </div>

            {/* Center Section - Links (Tengah) */}
            <div className="flex flex-col items-center justify-center space-y-3 w-1/3">
              <div className="flex items-center gap-3">
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
            <div className="text-right w-1/3">
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
          <div className="lg:hidden flex flex-col items-center space-y-8">
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
                  <div className="w-6 h-6 border-2 rounded-full flex items-center justify-center"
                  style={{
                    borderColor: "var(--accent)"
                  }}>
                    <div className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor: "var(--accent)"
                    }}></div>
                  </div>
                </div>
                {/* t - DM Serif Display */}
                <span className="text-2xl font-dm-serif-display font-normal tracking-tight"
                style={{
                  color: "var(--accent)"
                }}>
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
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-3">
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
        </div>

      </div>
    </footer>
  );
};

export default Footer;
