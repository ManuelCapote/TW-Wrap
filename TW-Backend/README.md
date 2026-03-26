# TW-Backend

A Node.js/Express backend API for a family wishlist management application. This backend provides authentication, user management, wishlist management, and family organization features.

## Features

- **Authentication & Authorization**
  - JWT-based authentication
  - User registration and login
  - Token refresh and verification
  - Password hashing with bcrypt

- **User Management**
  - User profiles with avatars
  - Family-based user organization
  - Demo accounts for testing

- **Wishlist Management**
  - Create, read, update, delete wishlist items
  - Product information (title, description, price, store, etc.)
  - Priority levels (low, medium, high)
  - Purchase tracking
  - Family-wide wishlist visibility

- **Family Organization**
  - Family-based grouping of users
  - Shared wishlists among family members
  - Family member management

- **Security & Performance**
  - Helmet.js for security headers
  - CORS configuration
  - Rate limiting
  - Request logging with Morgan
  - Environment-based configuration

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Development:** nodemon, ts-node
- **Security:** helmet, cors
- **Logging:** morgan

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd "TW Wrap/TW-Backend"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment setup:**
   ```bash
   cp .env.example .env
   ```

   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=24h
   
   # CORS Configuration
   FRONTEND_URL=http://localhost:5173
   
   # Security
   BCRYPT_ROUNDS=12
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```
The server will start on `http://localhost:3000` with hot-reload enabled.

### Production Mode
```bash
# Build the application
npm run build

# Start the production server
npm start
```

## Demo Accounts

The application comes with pre-configured demo accounts for testing:

| Email | Password | Name |
|-------|----------|------|
| `demo@family.com` | `demo123` | Demo User |
| `mom@family.com` | `demo123` | Mom |
| `dad@family.com` | `demo123` | Dad |

All demo accounts belong to the "Demo Family" and share wishlists.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/verify` - Verify token validity
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update current user profile
- `GET /api/users/family` - Get family members

### Wishlists
- `GET /api/wishlists` - Get wishlist items (supports filtering)
- `POST /api/wishlists` - Create new wishlist item
- `GET /api/wishlists/:id` - Get specific wishlist item
- `PUT /api/wishlists/:id` - Update wishlist item
- `DELETE /api/wishlists/:id` - Delete wishlist item
- `POST /api/wishlists/:id/purchase` - Mark item as purchased

### Families
- `GET /api/families/current` - Get current family information
- `GET /api/families/:id/wishlists` - Get family wishlists

### Health Check
- `GET /health` - API health status
- `GET /test` - Simple test endpoint

## Project Structure

```
src/
├── controllers/     # Route controllers (future use)
├── middleware/      # Express middleware
│   ├── auth.ts     # JWT authentication middleware
│   ├── errorHandler.ts  # Global error handling
│   └── rateLimiter.ts   # Rate limiting configuration
├── models/         # Data models (future database integration)
├── routes/         # API route definitions
│   ├── auth.ts     # Authentication routes
│   ├── families.ts # Family management routes
│   ├── users.ts    # User management routes
│   └── wishlists.ts # Wishlist management routes
├── services/       # Business logic services
│   ├── auth.ts     # Authentication service
│   └── database.ts # In-memory database (development)
├── types/          # TypeScript type definitions
│   └── index.ts    # All interface definitions
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## Development Notes

### Database
Currently uses an in-memory database for development with demo data. The `database.ts` service provides a simple interface that can be easily replaced with a real database (PostgreSQL, MongoDB, etc.) in production.

**Note:** All data is stored in memory and will be reset when the server restarts. This is ideal for development and testing but should be replaced with a persistent database for production use.

### Authentication
- JWT tokens expire in 24 hours by default
- Passwords are hashed with bcrypt using 12 salt rounds
- All protected routes require the `Authorization: Bearer <token>` header

### CORS
Configured to allow requests from the frontend URL specified in environment variables.

### Rate Limiting
Basic rate limiting is implemented to prevent abuse. Adjust settings in `middleware/rateLimiter.ts`.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `24h` |
| `FRONTEND_URL` | Frontend CORS origin | `http://localhost:5173` |
| `BCRYPT_ROUNDS` | Password hashing rounds | `12` |

## API Response Format

All API responses follow this consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "message": "Optional additional context"
}
```

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Email verification system
- Password reset functionality
- Advanced family management
- Product URL scraping for automatic metadata
- Push notifications
- Admin panel
- API documentation with Swagger/OpenAPI

## Integration with Frontend

This backend is designed to work with the [Turtle Wrap frontend application](../Turtle Wrap/README.md).

### Running Full Stack
See the [root README](../README.md) for instructions on running both frontend and backend together.

### CORS Configuration
Make sure your `FRONTEND_URL` environment variable matches your frontend's URL (default: `http://localhost:5173`).

## Contributing

This is currently a personal project, but contributions and suggestions are welcome!

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.