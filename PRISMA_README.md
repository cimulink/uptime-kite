# Prisma Database Setup

This project uses Prisma as the ORM for database operations. The database schema is defined in `prisma/schema.prisma`.

## Database Schema

The schema includes the following tables based on the UptimeKite TRD:

1. **User** - Stores user information
2. **Monitor** - Stores monitoring configurations
3. **CheckResult** - Stores monitoring results
4. **AlertIntegration** - Stores alert notification configurations

## Data Access Objects (DAOs)

Database operations are handled through DAO files:

- `userDao.ts` - User-related database operations
- `monitorDao.ts` - Monitor-related database operations
- `alertDao.ts` - Alert integration database operations
- `checkResultDao.ts` - Check result database operations

## Prisma Commands

- `npx prisma generate` - Generates the Prisma client
- `npx prisma studio` - Opens Prisma Studio for database browsing
- `npx prisma migrate dev` - Creates and runs migrations (when using a local database)

## Environment Variables

The database connection is configured through environment variables in the `.env` file. The project uses Supabase connection pooling for optimal performance:

- `DATABASE_URL_LOCAL` - Database connection string for local development
- `DATABASE_URL` - Supabase connection pool URL for application queries (port 6543 with pgbouncer=true)
- `DIRECT_URL` - Direct connection to Supabase for migrations (port 5432)

For authentication, you also need:
- `NEXTAUTH_SECRET` - A secret key for NextAuth.js
- `NEXTAUTH_URL` - The URL of your application (e.g., http://localhost:3000)

### Environment Switching

The application automatically switches between local and production databases based on the `NODE_ENV` environment variable:
- When `NODE_ENV` is set to `production`, the application uses `DATABASE_URL` (Supabase connection pool)
- When `NODE_ENV` is set to `development` or `test`, the application uses `DATABASE_URL_LOCAL`

To deploy to production, make sure to set `NODE_ENV=production` in your production environment.

### Supabase Connection Pooling

This project uses Supabase's connection pooling for better performance and scalability:
- `DATABASE_URL` uses port 6543 with `pgbouncer=true` for application queries
- `DIRECT_URL` uses port 5432 for direct database connections (used by Prisma migrations)

This setup ensures optimal performance in production while maintaining compatibility with Prisma's migration system.
