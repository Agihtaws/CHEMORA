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
          <div style={{ display: 'flex' }}>
            <Sidebar />
            <main style={{ marginLeft: '250px', width: '100%' }}>
              {children}
            </main>
          </div>
          <footer className="footer">
            © 2025 Chemora. All rights reserved.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  )
}
