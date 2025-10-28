# 🗄️ Database Setup Guide

## Current Status
✅ PostgreSQL service is running
✅ Prisma schema created
✅ Environment variables configured
⏳ Waiting for Prisma dependencies installation

## What You Need To Do

### Step 1: Fix npm Cache Permissions
Run this in your terminal:
```bash
sudo chown -R 501:20 "/Users/alexkpot/.npm"
```

### Step 2: Install Prisma Dependencies
```bash
cd "/Users/alexkpot/01_Development/03_Experiments/TW Wrap/TW-Backend"
npm install prisma @prisma/client
```

### Step 3: Let Me Know When Complete
Once the above commands finish successfully, let me know and I'll continue with:
- Creating the database
- Running migrations
- Implementing the Prisma database service

---

## What We've Accomplished So Far

### 1. Prisma Schema ([prisma/schema.prisma](prisma/schema.prisma))
I've created a complete schema that maps your TypeScript types to database tables:

**Models:**
- `Family` - Groups of users
- `User` - Individual family members (with password storage)
- `WishlistItem` - Gift items with purchase tracking

**Key Features:**
- **Relationships**: Family ↔ Users ↔ WishlistItems
- **Foreign Keys**: Enforced data integrity
- **Cascade Deletes**: Delete family → deletes users → deletes items
- **Indexes**: Optimized for your common queries
- **Enums**: Priority levels (LOW, MEDIUM, HIGH)

### 2. Environment Configuration
Updated `.env` with correct database connection string:
```
DATABASE_URL=postgresql://alexkpot@localhost:5432/tw_wrap_dev
```

---

## Next Steps (After Dependencies Install)

### 1. Create Database
```bash
createdb tw_wrap_dev
```

### 2. Run First Migration
```bash
npx prisma migrate dev --name init
```
This will:
- Create all tables in PostgreSQL
- Generate Prisma Client (TypeScript types)
- Apply the schema to your database

### 3. View Database
```bash
npx prisma studio
```
Opens a GUI to browse your data

---

## Understanding the Schema

### Why PostgreSQL + Prisma?

**PostgreSQL:**
- Industry-standard relational database
- Perfect for data with relationships
- ACID compliant (data integrity)
- Free and open source

**Prisma:**
- Type-safe database queries
- Auto-generates TypeScript types
- Migration system (version control for DB)
- Great developer experience

### Schema Highlights

```prisma
model User {
  id        String   @id @default(uuid())  // Auto-generated unique ID
  email     String   @unique                // No duplicate emails
  familyId  String                          // Foreign key
  family    Family   @relation(...)         // Navigate: user.family
  wishlistItems WishlistItem[]              // Navigate: user.wishlistItems
}
```

**What this gives you:**
```typescript
// Type-safe queries with autocomplete
const user = await prisma.user.findUnique({
  where: { email: 'demo@family.com' },
  include: {
    family: true,              // Include family data
    wishlistItems: true        // Include all wishlist items
  }
})

// TypeScript knows the shape of 'user'!
console.log(user.family.name)  // ✅ Type-safe
console.log(user.invalid)      // ❌ TypeScript error
```

---

## Learning Resources

- [Prisma Quickstart](https://www.prisma.io/docs/getting-started/quickstart)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Basics](https://www.postgresql.org/docs/current/tutorial.html)

---

## Troubleshooting

### "Database does not exist"
```bash
createdb tw_wrap_dev
```

### "Connection refused"
```bash
brew services start postgresql@14
```

### "Permission denied"
Your PostgreSQL user needs permissions:
```bash
psql postgres
CREATE USER alexkpot WITH CREATEDB;
```
