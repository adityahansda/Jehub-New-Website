# JEHUB Website - Complete File Structure

## 📋 Project Overview
This document contains the complete file structure for the JEHUB Next.js website project.

**Last Updated:** July 22, 2025  
**Project:** JEHUB New Website  
**Framework:** Next.js 14.2.30 with TypeScript

---

## 📁 Complete Directory Structure

```
JEHUB-New-Website/
├── 📁 .bolt/                           # Build configuration
├── 📁 .next/                           # Next.js build output (auto-generated)
├── 📁 docs/                            # Documentation files
├── 📁 node_modules/                    # Dependencies (auto-generated)
├── 📁 pages/                           # Next.js pages (routing)
├── 📁 public/                          # Static assets
├── 📁 scripts/                         # Build and database scripts  
├── 📁 src/                             # Source code
├── 📄 .env                             # Environment variables
├── 📄 .eslintrc.json                   # ESLint configuration
├── 📄 .gitignore                       # Git ignore rules
├── 📄 cleanup-orphaned-accounts.js     # Utility script
├── 📄 MOBILE_NAVIGATION_GUIDE.md       # Mobile navigation docs
├── 📄 MOBILE_UI_IMPROVEMENTS_SUMMARY.md # Mobile UI docs
├── 📄 next-env.d.ts                    # Next.js TypeScript definitions
├── 📄 next.config.js                   # Next.js configuration
├── 📄 package-lock.json                # Dependency lock file
├── 📄 package.json                     # Project dependencies
├── 📄 PDF_VALIDATION_README.md         # PDF validation documentation
├── 📄 PDF_VIEWER_IMPLEMENTATION.md     # PDF viewer documentation
├── 📄 pglite-debug.log                 # Debug log file
├── 📄 postcss.config.js                # PostCSS configuration
├── 📄 README.md                        # Project readme
├── 📄 tailwind.config.js               # Tailwind CSS configuration
├── 📄 test-notes-fetch.js              # Testing script
├── 📄 test-pdf-viewer.html             # PDF viewer test
├── 📄 test-profile-access.js           # Profile access test
├── 📄 test-signup.js                   # Signup test script
├── 📄 tsconfig.json                    # TypeScript configuration
└── 📄 tsconfig.tsbuildinfo             # TypeScript build cache
```

---

## 🌐 Pages Directory (Next.js Routing)

### Root Level Pages
```
📁 pages/
├── 📄 _app.tsx                     → App wrapper component
├── 📄 index.tsx                    → Homepage (/)
├── 📄 login.tsx                    → /login
├── 📄 signup.tsx                   → /signup
├── 📄 leaderboard.tsx              → /leaderboard
├── 📄 notes-download.tsx           → /notes-download
├── 📄 notes-upload.tsx             → /notes-upload  
└── 📄 wishlist.tsx                 → /wishlist
```

### Admin Pages
```
📁 pages/admin/
└── 📄 pdf-validation.tsx           → /admin/pdf-validation
```

### API Routes
```
📁 pages/api/
├── 📄 comments.ts                  → /api/comments
├── 📄 ip.ts                        → /api/ip
├── 📄 notes.ts                     → /api/notes
├── 📄 notes-upload.ts              → /api/notes-upload
├── 📄 reports.ts                   → /api/reports
├── 📄 upload-avatar.ts             → /api/upload-avatar
└── 📁 notes/
    └── 📄 [id].ts                  → /api/notes/[id]
```

### Authentication Pages
```
📁 pages/auth/
├── 📄 access-denied.tsx            → /auth/access-denied
├── 📄 login.tsx                    → /auth/login
├── 📄 signup.tsx                   → /auth/signup
└── 📄 verification-failed.tsx      → /auth/verification-failed
```

### Feature Pages
```
📁 pages/features/
├── 📄 about.tsx                    → /features/about
├── 📄 avatar-customizer.tsx        → /features/avatar-customizer
├── 📄 events.tsx                   → /features/events
├── 📄 groups.tsx                   → /features/groups
├── 📄 internships.tsx              → /features/internships
├── 📄 leaderboard.tsx              → /features/leaderboard
└── 📄 wishlist-register.tsx        → /features/wishlist-register
```

### Miscellaneous Pages
```
📁 pages/misc/
├── 📄 about.tsx                    → /misc/about
├── 📄 blog.tsx                     → /misc/blog
├── 📄 coming-soon.tsx              → /misc/coming-soon
└── 📄 pageindex.tsx                → /misc/pageindex
```

### Notes Pages
```
📁 pages/notes/
├── 📄 download.tsx                 → /notes/download
├── 📄 request.tsx                  → /notes/request
├── 📄 upload.tsx                   → /notes/upload
└── 📁 preview/
    └── 📄 [id].tsx                 → /notes/preview/[id]
```

### Notes Preview (Alternative Route)
```
📁 pages/notes-preview/
└── 📄 [id].tsx                     → /notes-preview/[id]
```

### Team Pages
```
📁 pages/team/
├── 📄 index.tsx                    → /team
├── 📄 join-team.tsx                → /team/join-team
├── 📄 old-team-members.tsx         → /team/old-team-members
└── 📄 team-dashboard.tsx           → /team/team-dashboard
```

### Test Pages
```
📁 pages/test/
├── 📄 mobile-demo.tsx              → /test/mobile-demo
├── 📄 mobile-test.tsx              → /test/mobile-test
└── 📄 test-pdf.tsx                 → /test/test-pdf
```

### User Pages
```
📁 pages/user/
└── 📄 profile.tsx                  → /user/profile
```

---

## 📁 Public Directory (Static Assets)

```
📁 public/
├── 📄 manifest.json                # Web app manifest
├── 📄 standalone-pdf-viewer.html   # Standalone PDF viewer
└── 📁 images/
    ├── 📄 favicon.svg              # Website favicon
    ├── 📄 logoIcon.ai              # Logo icon (Adobe Illustrator)
    └── 📄 whitelogo.svg            # White version of logo
```

---

## 🛠️ Scripts Directory

```
📁 scripts/
├── 📁 build/                       # Build scripts
├── 📁 database/                    # Database scripts
├── 📄 auto-index-manager.js        # Auto index management
├── 📄 create-indexes.js            # Database index creation
└── 📄 monitor-indexes.js           # Index monitoring
```

---

## 💻 Source Code Directory

### Main Source Structure
```
📁 src/
├── 📁 appwrite/                    # Appwrite configuration
├── 📁 components/                  # React components
├── 📁 contexts/                    # React contexts
├── 📁 data/                        # Static data files
├── 📁 lib/                         # Utility libraries
├── 📁 pages/                       # Page components
├── 📁 types/                       # TypeScript type definitions
├── 📁 utils/                       # Utility functions
└── 📄 index.css                    # Global CSS styles
```

### Appwrite Configuration
```
📁 src/appwrite/
└── 📄 config.ts                    # Appwrite client configuration
```

### Components Structure
```
📁 src/components/
├── 📁 admin/                       # Admin-specific components
├── 📁 auth/                        # Authentication components
├── 📁 comments/                    # Comment system components
├── 📁 common/                      # Common/shared components
├── 📁 mobile/                      # Mobile-specific components
├── 📁 notes/                       # Notes-related components
├── 📁 team/                        # Team management components
├── 📁 ui/                          # UI components
├── 📄 EnhancedCommentsSection.tsx  # Enhanced comments component
├── 📄 Footer.tsx                   # Website footer
├── 📄 GoogleDocsPDFViewer.tsx      # PDF viewer component
├── 📄 Layout.tsx                   # Main layout wrapper
├── 📄 LoadingSpinner.tsx           # Loading spinner component
├── 📄 Login.tsx                    # Login form component
├── 📄 Navigation.tsx               # Navigation component
├── 📄 NoteBadge.tsx                # Note badge component
├── 📄 PageHeader.tsx               # Page header component
├── 📄 PageTransition.tsx           # Page transition effects
├── 📄 Register.tsx                 # Registration form
├── 📄 ReportModal.tsx              # Report modal component
├── 📄 ReportsSection.tsx           # Reports section component
└── 📄 UniversalSidebar.tsx         # Universal sidebar component
```

### Admin Components
```
📁 src/components/admin/
├── 📄 BroadcastSection.tsx         # Admin broadcast functionality
├── 📄 DashboardStats.tsx           # Dashboard statistics
├── 📄 FormDataViewer.tsx           # Form data viewer
├── 📄 LeaderboardControl.tsx       # Leaderboard management
├── 📄 NotesCenter.tsx              # Notes management center
├── 📄 PageManagement.tsx           # Page management tools
├── 📄 SystemSettings.tsx           # System settings panel
├── 📄 TeamMemberManager.tsx        # Team member management
└── 📄 UserAccountManager.tsx       # User account management
```

### Mobile Components
```
📁 src/components/mobile/
├── 📄 MobileHead.tsx               # Mobile head component
├── 📄 MobileHeader.js              # Mobile header
├── 📄 MobileHomePage.tsx           # Mobile home page
├── 📄 MobileNavigation.tsx         # Mobile navigation
└── 📄 MobileProfilePage.tsx        # Mobile profile page
```

### Team Components
```
📁 src/components/team/
├── 📄 LeaveRequest.tsx             # Leave request management
├── 📄 NotesUploadZone.tsx          # Notes upload zone
├── 📄 PerformanceMetrics.tsx       # Performance metrics display
├── 📄 ProfileSection.tsx           # Team profile section
├── 📄 ResourcesLibrary.tsx         # Resources library
├── 📄 TaskManagement.tsx           # Task management system
└── 📄 TeamLeaderboard.tsx          # Team leaderboard
```

### Contexts
```
📁 src/contexts/
└── 📄 NavigationContext.tsx        # Navigation state context
```

### Data Files
```
📁 src/data/
├── 📄 mockData.ts                  # Mock data for development
└── 📄 teamData.ts                  # Team-related static data
```

### Library Functions
```
📁 src/lib/
├── 📁 database/                    # Database utilities
├── 📁 utils/                       # Utility functions
├── 📁 validation/                  # Validation utilities
├── 📄 appwrite-server.ts           # Server-side Appwrite config
├── 📄 appwrite.ts                  # Client-side Appwrite config
├── 📄 appwriteConfig.ts            # Appwrite configuration
├── 📄 github.ts                    # GitHub integration
├── 📄 pdfValidation.ts             # PDF validation utilities
└── 📄 profileUtils.ts              # Profile utility functions
```

### Page Components
```
📁 src/pages/
├── 📁 api/                         # API route components
├── 📁 notes-preview/               # Notes preview components
├── 📄 About.tsx                    # About page component
├── 📄 admin-pdf-validation.tsx     # Admin PDF validation page
├── 📄 AvatarCustomizer.tsx         # Avatar customizer page
├── 📄 Blog.tsx                     # Blog page component
├── 📄 ComingSoon.tsx               # Coming soon page
├── 📄 Home_New.tsx                 # New home page design
├── 📄 JoinTeam.tsx                 # Join team page
├── 📄 Leaderboard.tsx              # Leaderboard page
├── 📄 Login.tsx                    # Login page component
├── 📄 NotesDownload.tsx            # Notes download page
├── 📄 NotesRequest.tsx             # Notes request page
├── 📄 NotesUpload.tsx              # Notes upload page
├── 📄 OldTeamMembers.tsx           # Old team members page
├── 📄 Profile.tsx                  # User profile page
├── 📄 SignUp.tsx                   # Sign up page
├── 📄 Team.tsx                     # Team page
├── 📄 TeamDashboard.tsx            # Team dashboard
├── 📄 WishlistRegister.tsx         # Wishlist registration
└── 📄 _document.tsx                # Next.js document component
```

### Notes Preview Components
```
📁 src/pages/notes-preview/
└── 📄 [id].tsx                     # Dynamic notes preview page
```

### Type Definitions
```
📁 src/types/
└── 📄 team.ts                      # Team-related type definitions
```

### Utility Functions
```
📁 src/utils/
├── 📄 countdown.ts                 # Countdown utilities
└── 📄 scheduledValidation.ts       # Scheduled validation utilities
```

---

## ⚙️ Configuration Files

### TypeScript Configuration
- `tsconfig.json` - TypeScript compiler configuration
- `next-env.d.ts` - Next.js TypeScript definitions

### Build Configuration  
- `next.config.js` - Next.js configuration
- `postcss.config.js` - PostCSS configuration
- `tailwind.config.js` - Tailwind CSS configuration

### Code Quality
- `.eslintrc.json` - ESLint configuration for code linting

### Package Management
- `package.json` - Project dependencies and scripts
- `package-lock.json` - Dependency lock file

---

## 📊 Project Statistics

- **Total Pages**: 37 pages
- **API Routes**: 7 endpoints  
- **Components**: 50+ React components
- **TypeScript**: Fully typed with strict mode
- **Styling**: Tailwind CSS with custom configurations
- **Database**: Appwrite integration
- **Authentication**: Custom auth system

---

## 🔧 Import Path Configuration

### Path Mapping (tsconfig.json)
```json
{
  "paths": {
    "@/*": ["./src/*"]
  }
}
```

### Import Examples
```typescript
// Using @ alias (recommended)
import Component from '@/components/Component'
import { utility } from '@/lib/utilities'

// Using relative paths (also valid)  
import Component from '../../src/components/Component'
```

---

## ✅ Build Status

- **TypeScript Compilation**: ✅ Passing
- **ESLint**: ✅ No errors or warnings  
- **Build Process**: ✅ Successfully compiles
- **All Import Paths**: ✅ Correctly resolved
- **Pages Generated**: ✅ 37 static pages

---

## 📝 Notes

1. All pages follow Next.js file-based routing conventions
2. Components are organized by feature/function
3. Both `@/` aliases and relative imports are supported
4. The project uses TypeScript with strict mode enabled
5. Tailwind CSS is configured for styling
6. Appwrite is used for backend services

---

**Generated on**: July 22, 2025  
**Project Version**: Next.js 14.2.30  
**Status**: ✅ All paths verified and working
