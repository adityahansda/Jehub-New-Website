import React from 'react';
import Link from 'next/link';
import { 
  Menu,
  X,
  Home
} from 'lucide-react';

const MobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/services', label: 'Services' },
    { href: '/contact', label: 'Contact' },
    { href: '/blog', label: 'Blog' },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleMenu}
          className="p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          aria-label="Toggle Menu"
        >
          {isMenuOpen ? (
            <X className="h-6 w-6 text-gray-700" />
          ) : (
            <Menu className="h-6 w-6 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={toggleMenu} />
      )}

      {/* Mobile Menu Sidebar */}
      <div className={`md:hidden fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
        isMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 pt-20">
          {/* Home Icon */}
          <div className="flex items-center mb-8">
            <Home className="h-8 w-8 text-blue-600 mr-3" />
            <h2 className="text-xl font-bold text-gray-800">Jehub</h2>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                onClick={toggleMenu}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Additional Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link
              href="/login"
              className="block py-2 px-4 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium mb-3"
              onClick={toggleMenu}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="block py-2 px-4 text-center border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              onClick={toggleMenu}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
