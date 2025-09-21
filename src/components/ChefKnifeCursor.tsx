"use client";

import { useEffect } from 'react';

export default function ChefKnifeCursor() {
  useEffect(() => {
    const cursor = document.createElement('div');
    cursor.innerHTML = '🥄';
    cursor.style.position = 'fixed';
    cursor.style.pointerEvents = 'none';
    cursor.style.zIndex = '9999';
    cursor.style.fontSize = '20px';
    cursor.style.transition = 'transform 0.1s ease';
    cursor.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(cursor);

    const updateCursor = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top = e.clientY + 'px';
    };

    const handleMouseMove = (e: MouseEvent) => {
      updateCursor(e);
    };

    const handleMouseDown = () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    };

    const handleMouseUp = () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.removeChild(cursor);
      document.body.style.cursor = 'auto';
    };
  }, []);

  return null;
}
