// app/layout.js
import { Inter } from '@next/font/google'
import { ThemeProvider } from '@/components/ThemeProvider'
import Sidebar from '@/components/Sidebar'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Chemora',
  description: 'Chemistry Learning Platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const storedTheme = localStorage.getItem('theme') || 'light';
                  document.documentElement.setAttribute('data-theme', storedTheme);
                } catch (e) {}
              })();
            `,
          }}
        />
        <ThemeProvider>
          <div className="layout-container">
            <Sidebar />
            <div className="content-wrapper">
              <main className="main-content">
                {children}
              </main>
              <footer className="footer">
                © 2025 Chemora. All rights reserved.
              </footer>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
