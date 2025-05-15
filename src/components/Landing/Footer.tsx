import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Github, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="glass-dark py-12">
      <div className="container-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <BookOpen className="h-6 w-6 text-primary-500" />
              <span className="font-bold text-xl">Trakly</span>
            </Link>
            <p className="text-dark-400 mb-4">
              The smart way to manage your college assignments and stay ahead of surprise tests.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com/Amaanx6" className="text-dark-400 hover:text-primary-400 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://x.com/amaanx_6" className="text-dark-400 hover:text-primary-400 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://www.instagram.com/amaanx_6/" className="text-dark-400 hover:text-primary-400 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">Features</a></li>
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">Pricing</a></li>
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">Testimonials</a></li>
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">About</a></li>
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">Blog</a></li>
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">Careers</a></li>
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">Contact</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="text-dark-400 hover:text-primary-400 transition-colors">Data Processing</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-dark-700 mt-12 pt-8 text-center text-dark-500 text-sm">
          &copy; {new Date().getFullYear()} Trakly. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;