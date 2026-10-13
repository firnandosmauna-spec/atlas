import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  return (
    <div className="flex h-screen overflow-hidden bg-atlas-gray font-sans">
      {/* Mobile Drawer Backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-3 sm:p-6 flex flex-col">
          <div className="flex-1 w-full max-w-full">
            <Outlet />
          </div>
          <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-400 pb-2">
            Aplikasi ini adalah implementasi web independen berdasarkan dokumentasi ATLAS dan bukan merupakan produk resmi P2PK Kementerian Keuangan.
          </footer>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
