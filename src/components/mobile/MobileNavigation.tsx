import React from 'react';
import Link from 'next/link';
import { 
  Menu,
  X,
  Home,
  FileText,
  Bell,
  Calendar,
  Users,
  HelpCircle
} from 'lucide-react';

const MobileNavigation = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Prevent body scroll when mobile menu is open
  React.useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isMenuOpen]);

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/notes-download', label: 'Notes Download', icon: FileText },
    { href: '/notifications', label: 'Notifications', icon: Bell },
    { href: '/exam-updates', label: 'Exam Updates', icon: Calendar },
    { href: '/counselling-updates', label: 'Counselling Updates', icon: Users },
    { href: '/about', label: 'About Us', icon: HelpCircle },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={toggleMenu}
          className="p-3 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-all duration-200 active:scale-95 touch-manipulation"
          aria-label="Toggle Menu"
          style={{ minWidth: '44px', minHeight: '44px' }}
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
        <div 
          className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300 ease-in-out" 
          onClick={toggleMenu}
          style={{ touchAction: 'none' }}
        />
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
            {navItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center py-3 px-4 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors font-medium"
                  onClick={toggleMenu}
                >
                  {IconComponent && (
                    <IconComponent className="h-5 w-5 mr-3" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Additional Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 space-y-3">
            <Link
              href="/login"
              className="block py-2 px-4 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              onClick={toggleMenu}
            >
              Sign in with Google
            </Link>
            <p className="text-xs text-gray-500 text-center mt-3">
              Quick and secure access with your Google account
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
