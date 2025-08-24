# Home Dashboard - JEHub

## Overview
The new `Home-Dashboard.tsx` is a modern, responsive dashboard component designed for the Jharkhand Engineer's Hub platform. It provides a clean, application-like interface with a sliding sidebar menu and comprehensive theme support.

## Features

### 🎨 **Theme System**
- **Light/Dark Mode Toggle**: Seamless switching between light and dark themes
- **System Preference Detection**: Automatically detects user's system preference
- **Persistent Theme**: Saves theme preference in localStorage
- **Smooth Transitions**: All elements animate smoothly during theme changes

### 📱 **Responsive Design**
- **Mobile-First Approach**: Optimized for all screen sizes
- **Collapsible Sidebar**: Slides in/out on mobile devices
- **Touch-Friendly**: Mobile-optimized interactions and spacing
- **Adaptive Layout**: Content adjusts based on screen size

### 🗂️ **Navigation System**
- **Slide-Out Sidebar**: Smooth sidebar animations with overlay
- **Active State Management**: Visual indicators for current page
- **Page Routing**: Internal page switching without full reloads
- **User Section**: Profile display and logout functionality

### 🔧 **Component Architecture**
- **Modular Design**: Separate components for different dashboard sections
- **TypeScript Support**: Full type safety throughout
- **Context Integration**: Uses Auth and Theme contexts
- **Performance Optimized**: Proper React patterns and state management

## Component Structure

```
Home-Dashboard.tsx
├── Header Navigation
│   ├── Menu Button (Mobile)
│   ├── Logo & Brand
│   ├── Search Bar
│   ├── Theme Toggle
│   ├── Notifications
│   └── User Profile/Login
├── Sidebar Menu
│   ├── Navigation Items
│   ├── Additional Menu Items
│   └── User Section
└── Main Content Area
    ├── Dashboard Home
    ├── My Library
    ├── Download Notes
    ├── Upload Notes
    └── Community
```

## Pages Available

### 1. **Dashboard Home**
- Welcome message
- Statistics cards (Notes, Downloads, Community, Points)
- Recent activity feed

### 2. **My Library**
- User's saved notes and resources

### 3. **Download Notes**
- Browse and download available notes

### 4. **Upload Notes**
- Upload notes to share with community

### 5. **Community**
- Connect with other students

## Technical Details

### Dependencies
- React 18+ with Hooks
- Next.js (Link, useRouter)
- Framer Motion (Animations)
- Lucide React (Icons)
- Tailwind CSS (Styling)

### Context Requirements
- **AuthContext**: Must provide `user`, `logout`
- **ThemeContext**: Must provide `theme`, `toggleTheme`

### TypeScript Interfaces
```typescript
interface SidebarItemType {
  icon: React.ElementType;
  label: string;
  href?: string;
  count?: number;
  isActive?: boolean;
  onClick?: () => void;
}

interface PageType {
  id: string;
  title: string;
  component: React.ComponentType;
}
```

## Usage

### Basic Implementation
```tsx
import HomeDashboard from './pages/Home-Dashboard';

export default function Dashboard() {
  return <HomeDashboard />;
}
```

### Route Integration
```tsx
// pages/dashboard.tsx
import HomeDashboard from './Home-Dashboard';

export default function DashboardPage() {
  return <HomeDashboard />;
}
```

## Customization

### Adding New Pages
1. Create a new component function
2. Add it to the `pages` object
3. Add corresponding sidebar item

```tsx
const NewPage = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
      New Page
    </h1>
    {/* Your content */}
  </div>
);

// Add to pages object
const pages = {
  // ... existing pages
  'new-page': { id: 'new-page', title: 'New Page', component: NewPage },
};

// Add to sidebar items
const sidebarItems = [
  // ... existing items
  { 
    icon: YourIcon, 
    label: 'New Page',
    isActive: currentPage === 'new-page',
    onClick: () => setCurrentPage('new-page')
  },
];
```

### Styling Customization
The component uses Tailwind CSS with proper dark mode classes. Customize by modifying the className props or extending the Tailwind configuration.

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Notes
- Uses React.memo for optimized re-renders
- Lazy loading for page components
- Efficient state management
- Minimal bundle size impact

## Future Enhancements
- [ ] Real-time notifications
- [ ] Advanced search functionality
- [ ] Customizable dashboard widgets
- [ ] User preference settings
- [ ] Analytics integration
- [ ] Export/import functionality
