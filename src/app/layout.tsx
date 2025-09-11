import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Class Schedule Planner',
  description: 'Create and manage your weekly class schedule with color-coded timetables and easy-to-use planning tools.',
  keywords: ['schedule', 'planner', 'class', 'timetable', 'education', 'time management'],
  authors: [{ name: 'Schedule Planner Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen`}>
        <div className="flex flex-col min-h-screen">
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">SP</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Class Schedule Planner</h1>
                    <p className="text-sm text-gray-500">Organize your weekly schedule with ease</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  Plan • Schedule • Succeed
                </div>
              </div>
            </div>
          </header>
          
          <main className="flex-1">
            {children}
          </main>
          
          <footer className="bg-white border-t mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="text-center text-sm text-gray-500">
                <p>© 2024 Class Schedule Planner. Built for students and educators.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}