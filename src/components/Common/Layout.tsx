import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container-xl py-6">
        <Outlet />
      </main>
      <footer className="glass-dark py-4 mt-auto">
        <div className="container-xl text-center text-dark-400 text-sm">
          &copy; {new Date().getFullYear()} College Assignment Tracker. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Layout;