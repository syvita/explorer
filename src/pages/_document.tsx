import * as React from 'react';

import Document, {
  DocumentContext,
  DocumentInitialProps,
  DocumentProps,
  Head,
  Html,
  Main,
  NextScript,
} from 'next/document';
import { extractCritical } from '@emotion/server';
import { GlobalStyles, ProgressBarStyles, TextAreaOverrides } from '@components/global-styles';

export const THEME_STORAGE_KEY = 'theme';

export default class MyDocument extends Document<DocumentProps> {
  static async getInitialProps({ renderPage }: DocumentContext): Promise<DocumentInitialProps> {
    const page = await renderPage();
    const styles = extractCritical(page.html);
    return {
      ...page,
      styles: (
        <>
          {GlobalStyles}
          {ProgressBarStyles}
          {TextAreaOverrides}
          <style
            data-emotion-css={styles.ids.join(' ')}
            dangerouslySetInnerHTML={{ __html: styles.css }}
          />
        </>
      ),
    };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          <meta name="theme-color" content="#6B50FF" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="#9146FF" />
          <link rel="preconnect" href="https://mainnet.syvita.org" />
          <link rel="preconnect" href="https://x.syvita.org" />

          <script
            dangerouslySetInnerHTML={{
              __html: `(function () {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      console.log('dark mode');
      // dark mode
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      var bgValue = getComputedStyle(document.documentElement).getPropertyValue('--colors-bg');
      document.documentElement.style.background = bgValue;
    } else {
      console.log('light mode');
      // light mode
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      var bgValue = getComputedStyle(document.documentElement).getPropertyValue('--colors-bg');
      document.documentElement.style.background = bgValue;
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      console.log('detected change. changing to...');
      const newColorScheme = e.matches ? "dark" : "light";
      console.log(newColorScheme);
      const oppositeColorScheme = e.matches ? "light" : "dark";

      document.documentElement.classList.remove(oppositeColorScheme);
      document.documentElement.classList.add(newColorScheme);
      var bgValue = getComputedStyle(document.documentElement).getPropertyValue('--colors-bg');
      document.documentElement.style.background = bgValue;
    });
  } catch (e) {}
})();`,
            }}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
