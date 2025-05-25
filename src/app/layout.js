import { Inter } from "next/font/google";
import "./globals.css";
import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css';
import Navbar from "@/components/navbar/Navbar";
import Footer from "@/components/footer/Footer";
import { ThemeContextProvider } from "@/context/ThemeContext";
import ThemeProvider from "@/providers/ThemeProvider";
import AuthProvider from "@/providers/AuthProvider";
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Prevent FontAwesome from adding CSS automatically
config.autoAddCss = false;

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "PixelPen",
  description: "Express yourself in Pixels",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Global DOM error handler
              window.addEventListener('error', function(event) {
                const error = event.error;
                if (error && (
                  error.message.includes('removeChild') ||
                  error.message.includes('appendChild') ||
                  error.message.includes('insertBefore') ||
                  error.message.includes('parentNode')
                )) {
                  console.warn('DOM manipulation error caught globally:', error.message);
                  event.preventDefault();
                  return true;
                }
              });
              
              // Global unhandled promise rejection handler
              window.addEventListener('unhandledrejection', function(event) {
                const error = event.reason;
                if (error && typeof error.message === 'string' && (
                  error.message.includes('removeChild') ||
                  error.message.includes('appendChild') ||
                  error.message.includes('insertBefore') ||
                  error.message.includes('parentNode')
                )) {
                  console.warn('DOM manipulation promise rejection caught globally:', error.message);
                  event.preventDefault();
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <AuthProvider>
            <ThemeContextProvider>
              <ThemeProvider>
                <div className="container">
                  <div className="wrapper">
                    <Navbar />
                    {children}
                    <Footer />
                  </div>
                </div>
              </ThemeProvider>
            </ThemeContextProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
