# 🐢 Turtle Wrap - Family Wishlist Platform

A full-stack family wishlist management application that helps families share gift ideas, track purchases, and avoid duplicate gifts.

## 📦 Project Structure

This is a monorepo containing both frontend and backend applications:

```
TW Wrap/
├── TW-Web/              # Vue 3 + TypeScript frontend
├── TW-Backend/          # Node.js + Express backend API
└── docker-compose.yml   # Full-stack Docker orchestration
```

### TW-Web (Frontend)
Modern, responsive web application built with Vue 3, TypeScript, and Vite.

**Key Features:**
- Personal wishlist management
- Family wishlist viewing
- Smart URL parsing for product links
- Dark/light/auto theme toggle
- Mobile-first responsive design

[📖 View Frontend Documentation →](TW-Web/README.md)

### TW-Backend (API)
RESTful API backend built with Node.js, Express, and TypeScript.

**Key Features:**
- JWT-based authentication
- User and family management
- Wishlist CRUD operations
- Purchase tracking
- Security with Helmet & CORS

> ⚠️ **Security note:** `JWT_SECRET` in `.env.example` is a placeholder. Before deploying to any environment, generate a strong random secret (e.g. `openssl rand -base64 48`) and rotate it periodically. Never reuse the example value in production.

[📖 View Backend Documentation →](TW-Backend/README.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "TW Wrap"
   ```

2. **Setup Backend**
   ```bash
   cd TW-Backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```
   Backend runs at `http://localhost:3000`

3. **Setup Frontend** (in a new terminal)
   ```bash
   cd TW-Web
   npm install
   npm run dev
   ```
   Frontend runs at `http://localhost:5173`

## 🎯 Demo Accounts

Try the application with these pre-configured accounts:

| Email | Password | Name |
|-------|----------|------|
| `demo@family.com` | `demo123` | Demo User |
| `mom@family.com` | `demo123` | Mom |
| `dad@family.com` | `demo123` | Dad |

All accounts belong to the same family and can view each other's wishlists.

## 🛠 Tech Stack

### Frontend
- **Framework:** Vue 3 with Composition API
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** Vue Router
- **State Management:** Pinia
- **Styling:** Tailwind CSS
- **UI Components:** Radix Vue, Headless UI

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT
- **Security:** Helmet, CORS
- **Logging:** Morgan

## 📚 Documentation

- [Frontend Documentation](TW-Web/README.md) - Detailed frontend setup, features, and development guide
- [Backend Documentation](TW-Backend/README.md) - API endpoints, authentication, and backend architecture

## 🔄 Development Workflow

### Running Both Applications

**Option 1: Separate Terminals**
```bash
# Terminal 1 - Backend
cd TW-Backend && npm run dev

# Terminal 2 - Frontend
cd TW-Web && npm run dev
```

**Option 2: Using a Process Manager** (optional)
You can use `concurrently` or `pm2` to run both applications simultaneously.

### Available Scripts

#### Backend (TW-Backend/)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Run production build

#### Frontend (TW-Web/)
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Lint code with ESLint
- `npm run test:unit` - Run unit tests with Vitest

## 🎨 Features

### For Users
- ✅ Create and manage personal wishlists
- ✅ View family members' wishlists
- ✅ Smart product URL parsing (Amazon, Target, Best Buy, etc.)
- ✅ Priority levels for wishlist items (High, Medium, Low)
- ✅ Mark items as purchased to avoid duplicates
- ✅ Dark/Light/Auto theme toggle
- ✅ Fully responsive mobile design

### For Developers
- ✅ Full TypeScript implementation
- ✅ Modern Vue 3 Composition API
- ✅ RESTful API with JWT authentication
- ✅ Component-based architecture
- ✅ Hot module replacement (HMR)
- ✅ Type-safe development experience

## 🛣 Roadmap

### Backend
- [x] Database integration (PostgreSQL + Prisma)
- [x] Family management with role-based permissions
- [ ] Email verification system
- [ ] Password reset functionality
- [ ] Product URL metadata scraping
- [ ] API documentation with Swagger/OpenAPI

### Frontend
- [x] Dark/light/auto theme toggle
- [x] Family management UI
- [ ] Real-time updates via WebSockets
- [ ] Enhanced URL parsing (price & image extraction)
- [ ] Price tracking over time
- [ ] Gift suggestions and recommendations
- [ ] Progressive Web App (PWA) support
- [ ] Internationalization (i18n)

### DevOps
- [x] Docker containerization
- [x] Docker Compose orchestration
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Production deployment guides

## 🤝 Contributing

This is currently a personal project, but contributions and suggestions are welcome!

### Code Standards
- **TypeScript:** Use proper typing throughout
- **Vue 3:** Composition API with `<script setup>` syntax
- **Mobile-First:** Always consider mobile experience
- **Accessibility:** Follow WCAG guidelines
- **API Design:** RESTful principles with consistent response formats

## 📄 License

This project is private and currently not open for public distribution.

---

Built with ❤️ using Vue 3, TypeScript, Node.js, and modern web technologies.
