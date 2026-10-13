import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen overflow-hidden bg-atlas-gray">
      <Sidebar isOpen={isSidebarOpen} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          <div className="flex-1 w-full">
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
