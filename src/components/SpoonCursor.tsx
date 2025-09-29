"use client";

import { useEffect, useState } from 'react';

export default function SpoonCursor() {
  const [isClicking, setIsClicking] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    // Check if device is mobile/touch device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);
    
    // Don't show custom cursor on mobile devices
    if (isMobile) {
      // Ensure system cursor is visible if we early return
      document.documentElement.style.cursor = 'auto';
      document.body.style.cursor = 'auto';
      const existing = document.getElementById('spoon-cursor');
      if (existing && existing.parentElement) existing.parentElement.removeChild(existing);
      return;
    }

    // Create cursor element
    const cursor = document.createElement('div');
    cursor.id = 'spoon-cursor';
    cursor.innerHTML = '🥄';
    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999';
    cursor.style.fontSize = '20px';
    cursor.style.transition = 'transform 0.1s ease, filter 0.3s ease';
    cursor.style.transform = 'translate(-50%, -50%)';
    cursor.style.filter = currentTheme === "dark" ? "brightness(0) invert(1)" : "brightness(0)";
    cursor.style.left = '0px';
    cursor.style.top = '0px';
    document.body.appendChild(cursor);

    // Hide default cursor globally
    document.documentElement.style.cursor = 'none';
    document.body.style.cursor = 'none';

    // Theme observer
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
          const newTheme = document.documentElement.getAttribute("data-theme") || "light";
          setCurrentTheme(newTheme);
          cursor.style.filter = newTheme === "dark" ? "brightness(0) invert(1)" : "brightness(0)";
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const initialTheme = document.documentElement.getAttribute("data-theme") || "light";
    setCurrentTheme(initialTheme);
    cursor.style.filter = initialTheme === "dark" ? "brightness(0) invert(1)" : "brightness(0)";

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      // If the element was detached by navigation or other scripts, re-attach it
      if (!document.getElementById('spoon-cursor')) {
        document.body.appendChild(cursor);
        document.documentElement.style.cursor = 'none';
        document.body.style.cursor = 'none';
      }
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    // Mouse down handler (click animation)
    const handleMouseDown = () => {
      setIsClicking(true);
      cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    };

    // Mouse up handler
    const handleMouseUp = () => {
      setIsClicking(false);
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    };

    // Ensure cursor survives tab switches / visibility changes
    const handleVisibilityOrFocus = () => {
      const exists = document.getElementById('spoon-cursor');
      if (!exists) {
        document.body.appendChild(cursor);
      }
      document.documentElement.style.cursor = 'none';
      document.body.style.cursor = 'none';
    };

    // Add event listeners
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // Cleanup
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      observer.disconnect();
      if (document.body.contains(cursor)) {
        document.body.removeChild(cursor);
      }
      // Restore default cursor
      document.documentElement.style.cursor = 'auto';
      document.body.style.cursor = 'auto';
    };
  }, [currentTheme]);

  return null;
}
