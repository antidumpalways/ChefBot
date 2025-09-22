"use client";

import { useEffect } from 'react';
import GoogleTranslate from './GoogleTranslate';

export default function GoogleTranslateWrapper({ children }) {
  useEffect(() => {
    GoogleTranslate.init();
  }, []);

  return (
    <div>
      {children}
      <div id="google_translate_element" className="hidden"></div>
    </div>
  );
}

