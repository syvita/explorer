export type ColorModeString = 'dark' | 'light';
export const THEME_STORAGE_KEY = 'theme';

export const getInvertedValue = (string: ColorModeString) =>
  string === 'light' ? 'dark' : 'light';

export const setDocumentStyles = (value: ColorModeString) => {
  if (typeof document !== 'undefined') {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      // dark mode
      console.log('dark mode');
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove(getInvertedValue('dark'));
      document.documentElement.style.background = getComputedStyle(
        document.documentElement
      ).getPropertyValue('--colors-bg');
    } else {
      // light mode
      console.log('light mode');
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove(getInvertedValue('light'));
      document.documentElement.style.background = getComputedStyle(
        document.documentElement
      ).getPropertyValue('--colors-bg');
    }
  }
};
