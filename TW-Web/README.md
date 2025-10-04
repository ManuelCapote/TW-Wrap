# 🎁 TW-Web - Family Wishlist Application

A modern, responsive web application for managing family wishlists. Share what you want, see what others need, and avoid duplicate gifts!

## ✨ Features

### 🏠 Core Functionality
- **Personal Wishlist Management** - Add, edit, and organize your own wishlist items
- **Family Wishlist Viewing** - Browse family members' wishlists to find perfect gifts
- **Smart URL Parsing** - Paste product links from any store to automatically extract product names and store information
- **Purchase Tracking** - Mark items as purchased to avoid duplicates
- **Priority System** - Organize items by importance (High, Medium, Low)

### 🎨 User Experience
- **Dark/Light/Auto Theme Toggle** - Seamless theme switching with system preference detection
- **Mobile-First Responsive Design** - Optimized for all device sizes with touch-friendly interfaces
- **Smooth Animations** - Polished transitions and hover effects throughout the app
- **Intuitive Navigation** - Clean, accessible interface with clear visual hierarchy

### 🛠 Technical Features
- **Vue 3 Composition API** - Modern, reactive component architecture
- **TypeScript** - Full type safety and enhanced developer experience
- **Persistent Theme Storage** - User preferences saved across sessions
- **Cross-Platform URL Support** - Works with major retailers and e-commerce sites

## 🏗 Architecture

### Tech Stack
- **Frontend Framework**: Vue 3 with Composition API
- **Type System**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia (ready for future implementation)
- **Routing**: Vue Router
- **Styling**: Modern CSS with CSS Variables and Grid/Flexbox layouts

### Project Structure
```
src/
├── assets/          # Global styles and static assets
├── components/      # Reusable Vue components
│   ├── AddItemForm.vue     # Product URL parsing and item creation
│   ├── EditItemForm.vue    # Simple item editing (name, quantity, priority)
│   └── ThemeToggle.vue     # Dark/light/auto theme switcher
├── composables/     # Vue composables for shared logic
│   └── useTheme.ts         # Theme management with localStorage
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
│   └── urlParser.ts        # URL parsing and product extraction
├── views/           # Page-level components
│   ├── DashboardView.vue   # Family overview dashboard
│   ├── FamilyView.vue      # Individual family member wishlists
│   └── MyWishlistView.vue  # Personal wishlist management
└── router/          # Vue Router configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Backend API running (see [TW-Backend documentation](../TW-Backend/README.md))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "TW Wrap/TW-Web"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API endpoint** (if needed)
   The frontend is configured to connect to the backend at `http://localhost:3000` by default.
   Update API configuration in your environment or config files if using a different URL.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173` (or the port shown in terminal)

### Full Stack Setup

To run the complete application with both frontend and backend:

1. **Start the backend server** (in one terminal)
   ```bash
   cd "TW Wrap/TW-Backend"
   npm run dev
   ```

2. **Start the frontend server** (in another terminal)
   ```bash
   cd "TW Wrap/TW-Web"
   npm run dev
   ```

See the [root README](../README.md) for more details on the full project setup.

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Lint code with ESLint
- `npm run format` - Format code with Prettier
- `npm run test:unit` - Run unit tests with Vitest

## 📱 Usage Guide

### Adding Items to Your Wishlist

1. **Navigate to "My Wishlist"**
2. **Click "Add Item"**
3. **Paste any product URL** (Amazon, Target, Best Buy, etc.)
4. **Click "Parse"** to automatically extract product information
5. **Fill in additional details** (description, price, priority)
6. **Save to your wishlist**

### Viewing Family Wishlists

1. **Go to "Family" section**
2. **Click on any family member** to expand their wishlist
3. **Browse their items** and see details, prices, and priorities
4. **Mark items as purchased** when you buy them
5. **Use "View Product" links** to go directly to the store

### Managing Your Items

- **Edit**: Change item name, quantity, or priority level
- **Remove**: Delete items you no longer want
- **Priority Colors**: 
  - 🔴 **High** - Most wanted items
  - 🟡 **Medium** - Nice to have
  - 🟢 **Low** - Optional items

### Theme Customization

Click the theme toggle in the header to cycle through:
- ☀️ **Light Mode** - Clean, bright interface
- 🌙 **Dark Mode** - Easy on the eyes
- 🔄 **Auto Mode** - Follows your system preference

## 🎯 Development Highlights

### Smart URL Parsing
The application features intelligent URL parsing that works across multiple retailers:
- Extracts product names from URL patterns
- Identifies store/retailer information
- Handles various e-commerce URL formats
- Provides fallback parsing for unknown sites

### Mobile-First Design
Responsive design with carefully crafted breakpoints:
- **768px and below**: Stacked navigation, full-width cards
- **480px and below**: Optimized for mobile phones with touch-friendly buttons
- **Font sizing**: Prevents iOS zoom on form inputs
- **Touch targets**: Minimum 44px for accessibility

### Theme System
Advanced theming with CSS custom properties:
- System preference detection via `prefers-color-scheme`
- Manual override capabilities
- Smooth transitions between themes
- Persistent user preferences via localStorage

## 🛣 Roadmap

### Planned Features
- [x] **Backend Integration** - Connected to Express.js API (see [TW-Backend](../TW-Backend/README.md))
- [x] **User Authentication** - JWT-based secure login and family management
- [ ] **Real-time Updates** - Live synchronization of wishlist changes via WebSockets
- [ ] **Enhanced URL Parsing** - Price extraction and image fetching
- [ ] **Notifications** - Alert family members of new items or purchases
- [ ] **Gift Suggestions** - AI-powered recommendations based on interests
- [ ] **Shopping Lists** - Convert wishlist items to shopping lists
- [ ] **Price Tracking** - Monitor price changes over time

### Technical Improvements
- [ ] **Progressive Web App** - Offline support and install prompts
- [ ] **Advanced Testing** - Comprehensive unit and integration tests
- [ ] **Performance Optimization** - Code splitting and lazy loading
- [ ] **Accessibility Enhancement** - WCAG 2.1 AA compliance
- [ ] **Internationalization** - Multi-language support

## 🏆 Key Accomplishments

### Completed Features ✅
- ✅ **Full Vue 3 + TypeScript Setup** - Modern development environment
- ✅ **Complete UI/UX Design** - Polished interface with smooth interactions
- ✅ **URL Parsing System** - Extract product information from any retailer
- ✅ **Responsive Design** - Works perfectly on desktop, tablet, and mobile
- ✅ **Dark/Light Theme Toggle** - Advanced theming with system preference support
- ✅ **Item Management** - Add, edit, remove, and organize wishlist items
- ✅ **Family Viewing** - Browse and interact with family members' wishlists
- ✅ **Priority System** - Visual priority indicators and organization
- ✅ **Purchase Tracking** - Mark items as purchased to avoid duplicates

### Development Workflow ✅
- ✅ **TypeScript Integration** - Full type safety throughout the application
- ✅ **Modern Build System** - Vite for fast development and optimized builds
- ✅ **Code Quality Tools** - ESLint, Prettier, and Vue TypeScript compiler
- ✅ **Mobile Optimization** - Touch-friendly interfaces and responsive layouts
- ✅ **Git Workflow** - Proper version control with meaningful commits

## 🤝 Contributing

This is currently a personal project, but contributions and suggestions are welcome! 

### Development Setup
1. Follow the installation steps above
2. Make sure all tests pass: `npm run test:unit`
3. Ensure type checking passes: `npm run type-check`
4. Run linting: `npm run lint`
5. Format code: `npm run format`

### Code Standards
- **TypeScript**: Use proper typing throughout
- **Vue 3**: Composition API with `<script setup>` syntax
- **Mobile-First**: Always consider mobile experience
- **Accessibility**: Follow WCAG guidelines
- **Performance**: Keep bundle size and runtime performance in mind

## 📄 License

This project is private and currently not open for public distribution.

---

Built with ❤️ using Vue 3, TypeScript, and modern web technologies.