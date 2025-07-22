import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';
import { 
  Home, 
  User, 
  Settings, 
  FileText, 
  Calendar, 
  Users, 
  Download, 
  Upload, 
  HelpCircle, 
  UserPlus, 
  Trophy, 
  LogIn, 
  UserCheck, 
  Shield, 
  Eye,
  ExternalLink,
  Globe,
  MessageSquare,
  Briefcase,
  Code,
  Database,
  Monitor,
  Book,
  Star,
  Package,
  Search
} from 'lucide-react';


// Category mapping for different page types
const getCategoryForPage = (pageName: string, path: string) => {
  const name = pageName.toLowerCase();
  const pathLower = path.toLowerCase();
  
  // API routes
  if (pathLower.includes('/api/')) return 'API';
  
  // Admin pages
  if (name.includes('admin') || name.includes('dashboard') || name.includes('validation')) return 'Admin';
  
  // Auth pages
  if (name.includes('login') || name.includes('signup') || name.includes('verification') || name.includes('access-denied')) return 'Auth';
  
  // User pages
  if (name.includes('profile') || name.includes('avatar') || name.includes('join')) return 'User';
  
  // Academic pages
  if (name.includes('notes') || name.includes('pdf')) return 'Academic';
  
  // Community pages
  if (name.includes('team') || name.includes('groups') || name.includes('events') || name.includes('leaderboard')) return 'Community';
  
  // Career pages
  if (name.includes('internship') || name.includes('wishlist')) return 'Career';
  
  // Content pages
  if (name.includes('blog') || name.includes('preview')) return 'Content';
  
  // Demo/Test pages
  if (name.includes('demo') || name.includes('test') || name.includes('mobile') || name.includes('coming')) return 'Demo';
  
  // Core pages
  if (name === 'home' || name.includes('about') || name.includes('index')) return 'Core';
  
  return 'Other';
};

// Status mapping for different page types
const getStatusForPage = (pageName: string, path: string) => {
  const name = pageName.toLowerCase();
  
  if (name.includes('admin') || name.includes('dashboard')) return 'Restricted';
  if (name.includes('demo') || name.includes('test') || name.includes('coming') || name.includes('mobile')) return 'Demo';
  if (name.includes('verification') && name.includes('failed')) return 'Error';
  if (name.includes('access') && name.includes('denied')) return 'Error';
  
  return 'Active';
};

// Description mapping for different page types
const getDescriptionForPage = (pageName: string, path: string) => {
  const name = pageName.toLowerCase();
  const pathLower = path.toLowerCase();
  
  // Specific descriptions
  const descriptions: { [key: string]: string } = {
    'home': 'Main landing page with latest updates',
    'about': 'Learn about JEHUB and our mission',
    'blog': 'Latest articles and updates',
    'login': 'User login page',
    'signup': 'Create new account',
    'profile': 'User profile and settings',
    'team': 'Meet our team members',
    'join-team': 'Apply to join the JEHUB team',
    'events': 'Upcoming events and activities',
    'groups': 'Join college groups and communities',
    'notes-download': 'Download study materials and notes',
    'notes-upload': 'Upload notes and study materials',
    'notes-request': 'Request specific study materials',
    'internships': 'Find internship opportunities',
    'leaderboard': 'Top contributors and achievers',
    'admin-pdf-validation': 'PDF validation and management',
    'team-dashboard': 'Team management dashboard',
    'old-team-members': 'Former team members archive',
    'mobile-demo': 'Mobile interface demonstration',
    'mobile-test': 'Mobile testing interface',
    'coming-soon': 'Coming soon placeholder page',
    'avatar-customizer': 'Customize your profile avatar',
    'wishlist-register': 'Register for opportunity updates',
    'pageindex': 'Complete directory of all pages',
    'access-denied': 'Access denied error page',
    'verification-failed': 'Verification failed error page'
  };
  
  // Check for exact matches first
  const exactMatch = descriptions[name] || descriptions[path.substring(1)];
  if (exactMatch) return exactMatch;
  
  // API routes
  if (pathLower.includes('/api/')) {
    if (name.includes('notes')) return 'API endpoint for notes management';
    if (name.includes('comments')) return 'API endpoint for comments';
    if (name.includes('upload')) return 'API endpoint for file uploads';
    if (name.includes('ip')) return 'API endpoint for IP information';
    return 'API endpoint';
  }
  
  // Generic descriptions based on patterns
  if (name.includes('preview')) return 'Preview content and documents';
  if (name.includes('test')) return 'Testing and development page';
  if (name.includes('pdf')) return 'PDF document management';
  
  return `${pageName} page - automatically indexed`;
};

interface PageData {
  id: number;
  name: string;
  path: string;
  category: string;
  description: string;
  icon: string;
  status: string;
}

interface PageIndexProps {
  pages: PageData[];
}

const PageIndex: React.FC<PageIndexProps> = ({ pages }) => {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState('All');

  const filteredPages = categoryFilter === 'All'
    ? pages
    : pages.filter(page => page.category === categoryFilter);

  const handleViewPage = (path: string) => {
    router.push(path);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Restricted': return 'bg-red-100 text-red-800';
      case 'Demo': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Core': return 'bg-purple-100 text-purple-800';
      case 'Academic': return 'bg-blue-100 text-blue-800';
      case 'Community': return 'bg-green-100 text-green-800';
      case 'Auth': return 'bg-orange-100 text-orange-800';
      case 'User': return 'bg-teal-100 text-teal-800';
      case 'Career': return 'bg-indigo-100 text-indigo-800';
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Demo': return 'bg-gray-100 text-gray-800';
      case 'Content': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Dynamically generate categories from the pages
  const allCategories = Array.from(new Set(pages.map(p => p.category))).sort();
  const categories = ['All', ...allCategories];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-6 shadow-lg">
            <Globe className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            JEHUB <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Page Index</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete directory of all pages available on the JEHUB platform
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{pages.length}</div>
            <div className="text-gray-600 font-medium">Total Pages</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{pages.filter(p => p.status === 'Active').length}</div>
            <div className="text-gray-600 font-medium">Active Pages</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{pages.filter(p => p.status === 'Restricted').length}</div>
            <div className="text-gray-600 font-medium">Restricted</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{new Set(pages.map(p => p.category)).size}</div>
            <div className="text-gray-600 font-medium">Categories</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Category</h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setCategoryFilter(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  categoryFilter === category
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                }`}
              >
                {category} {category !== 'All' && `(${pages.filter(p => p.category === category).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Pages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => {
            const IconComponent = iconMap[page.icon] || Package;
            return (
              <div key={page.id} className="bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 group overflow-hidden">
                <div className="p-6">
                  {/* Page Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {page.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(page.category)}`}>
                            {page.category}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(page.status)}`}>
                            {page.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* URL Display */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                    <div className="flex items-center space-x-2">
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-mono text-gray-600">{page.path}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                    {page.description}
                  </p>

                  {/* Action Button */}
                  <button
                    onClick={() => handleViewPage(page.path)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-2 group"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="font-medium">View Page</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredPages.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No pages found
            </h3>
            <p className="text-gray-600">
              No pages match the selected category filter.
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
            <p className="text-blue-800 font-medium mb-2">
              💡 Page Index Help
            </p>
            <p className="text-blue-700 text-sm">
              This page provides a comprehensive overview of all available pages on the JEHUB platform. 
              Use the category filters to navigate through different sections, and click &quot;View Page&quot; to visit any page directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Map of icon keys to icon components
const iconMap: Record<string, any> = {
  home: Home,
  user: User,
  settings: Settings,
  fileText: FileText,
  calendar: Calendar,
  users: Users,
  download: Download,
  upload: Upload,
  helpCircle: HelpCircle,
  userPlus: UserPlus,
  trophy: Trophy,
  logIn: LogIn,
  userCheck: UserCheck,
  shield: Shield,
  eye: Eye,
  externalLink: ExternalLink,
  globe: Globe,
  messageSquare: MessageSquare,
  briefcase: Briefcase,
  code: Code,
  database: Database,
  monitor: Monitor,
  book: Book,
  star: Star,
  package: Package,
  search: Search
};

// Function to get icon key for different page types
const getIconKeyForPage = (pageName: string, path: string) => {
  const name = pageName.toLowerCase();
  const pathLower = path.toLowerCase();
  
  // Specific page mappings
  if (name === 'home' || path === '/') return 'home';
  if (name.includes('about')) return 'user';
  if (name.includes('blog')) return 'fileText';
  if (name.includes('login')) return 'logIn';
  if (name.includes('signup') || name.includes('sign up')) return 'userCheck';
  if (name.includes('profile')) return 'user';
  if (name.includes('team') && !name.includes('join')) return 'users';
  if (name.includes('join')) return 'userPlus';
  if (name.includes('events')) return 'calendar';
  if (name.includes('groups')) return 'users';
  if (name.includes('notes') && name.includes('download')) return 'download';
  if (name.includes('notes') && name.includes('upload')) return 'upload';
  if (name.includes('notes') && name.includes('request')) return 'helpCircle';
  if (name.includes('internship')) return 'briefcase';
  if (name.includes('leaderboard') || name.includes('trophy')) return 'trophy';
  if (name.includes('admin') || name.includes('dashboard')) return 'shield';
  if (name.includes('mobile') || name.includes('demo')) return 'monitor';
  if (name.includes('coming') || name.includes('soon')) return 'globe';
  if (name.includes('avatar') || name.includes('customizer')) return 'user';
  if (name.includes('wishlist')) return 'messageSquare';
  if (name.includes('pdf') || name.includes('validation')) return 'fileText';
  if (name.includes('test')) return 'code';
  if (name.includes('access') && name.includes('denied')) return 'shield';
  if (name.includes('verification') && name.includes('failed')) return 'shield';
  if (name.includes('preview')) return 'eye';
  if (name.includes('pageindex')) return 'search';
  
  // Default icon based on category inference
  if (pathLower.includes('/api/')) return 'database';
  return 'package'; // Default icon
};

// Get static props to scan pages directory at build time
export const getStaticProps: GetStaticProps = async () => {
  const pagesDirectory = path.join(process.cwd(), 'pages');
  
  const scanDirectory = (dir: string, basePath: string = ''): PageData[] => {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    const pages: PageData[] = [];
    let idCounter = 1;
    
    for (const item of items) {
      const itemPath = path.join(dir, item.name);
      const relativePath = path.join(basePath, item.name);
      
      if (item.isDirectory()) {
        // Skip certain directories
        if (['api'].includes(item.name)) {
          // For API directory, we'll handle it separately
          if (item.name === 'api') {
            const apiFiles = fs.readdirSync(itemPath, { withFileTypes: true });
            for (const apiFile of apiFiles) {
              if (apiFile.isFile() && apiFile.name.endsWith('.ts')) {
                const apiName = apiFile.name.replace('.ts', '');
                const apiPath = `/api/${apiName}`;
                const pageName = apiName.split('-').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ') + ' API';
                
                pages.push({
                  id: idCounter++,
                  name: pageName,
                  path: apiPath,
                  category: getCategoryForPage(pageName, apiPath),
                  description: getDescriptionForPage(apiName, apiPath),
                  icon: getIconKeyForPage(pageName, apiPath),
                  status: getStatusForPage(pageName, apiPath)
                });
              }
            }
          }
          continue;
        }
        // Recursively scan subdirectories
        const subPages = scanDirectory(itemPath, relativePath);
        pages.push(...subPages);
      } else if (item.isFile()) {
        // Process TypeScript/JavaScript files
        if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
          // Skip special Next.js files
          if (['_app.tsx', '_document.tsx', '404.tsx', '500.tsx'].includes(item.name)) {
            continue;
          }
          
          const fileName = item.name.replace(/\.(tsx|ts)$/, '');
          let pageName = fileName;
          let pagePath = '';
          
          // Handle special cases
          if (fileName === 'index') {
            if (basePath === '') {
              pageName = 'Home';
              pagePath = '/';
            } else {
              pageName = basePath.split('/').pop() || 'Index';
              pagePath = `/${basePath}`;
            }
          } else if (fileName.startsWith('[') && fileName.endsWith(']')) {
            // Dynamic route
            const paramName = fileName.slice(1, -1);
            pageName = `Dynamic ${paramName.charAt(0).toUpperCase() + paramName.slice(1)}`;
            pagePath = basePath ? `/${basePath}/${fileName}` : `/${fileName}`;
          } else {
            // Regular page
            pageName = fileName.split('-').map(word => 
              word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
            pagePath = basePath ? `/${basePath}/${fileName}` : `/${fileName}`;
          }
          
          pages.push({
            id: idCounter++,
            name: pageName,
            path: pagePath,
            category: getCategoryForPage(pageName, pagePath),
            description: getDescriptionForPage(fileName, pagePath),
            icon: getIconKeyForPage(pageName, pagePath),
            status: getStatusForPage(pageName, pagePath)
          });
        }
      }
    }
    
    return pages;
  };
  
  const pages = scanDirectory(pagesDirectory);
  
  // Sort pages by category and then by name
  pages.sort((a, b) => {
    if (a.category === b.category) {
      return a.name.localeCompare(b.name);
    }
    return a.category.localeCompare(b.category);
  });
  
  return {
    props: {
      pages
    },
    // Regenerate the page every 60 seconds in development
    // Remove this in production or adjust the interval as needed
    revalidate: process.env.NODE_ENV === 'development' ? 60 : false
  };
};

export default PageIndex;
