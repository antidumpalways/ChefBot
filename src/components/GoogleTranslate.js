// Google Translate Widget Integration
export const GoogleTranslate = {
  init: () => {
    if (typeof window !== 'undefined' && !window.googleTranslateElementInit) {
      window.googleTranslateElementInit = () => {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,id,es,fr,de,it,pt,ru,ja,ko,zh,ar',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
          },
          'google_translate_element'
        );
      };

      // Load Google Translate script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.head.appendChild(script);
    }
  },

  show: () => {
    if (window.google && window.google.translate) {
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.style.display = 'block';
      }
    }
  },

  hide: () => {
    if (window.google && window.google.translate) {
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.style.display = 'none';
      }
    }
  },

  translate: (targetLanguage) => {
    if (window.google && window.google.translate) {
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.value = targetLanguage;
        selectElement.dispatchEvent(new Event('change'));
      }
    }
  }
};

export default GoogleTranslate;

