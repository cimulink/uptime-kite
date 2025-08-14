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

The database connection is configured through the `DATABASE_URL` environment variable in the `.env` file.

For authentication, you also need:
- `NEXTAUTH_SECRET` - A secret key for NextAuth.js
- `NEXTAUTH_URL` - The URL of your application (e.g., http://localhost:3000)
