// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

// MongoDB connection handling
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  
  // Optional: Verify connection on startup
  prisma.$connect()
    .then(() => console.log('Connected to MongoDB via Prisma'))
    .catch((err: any) => console.error('MongoDB connection error', err))
}

export default prisma