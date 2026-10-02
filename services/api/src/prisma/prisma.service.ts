import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Audit Hook implementation using Prisma Client Extensions could go here
    // Example:
    // Object.assign(this, this.$extends({
    //   query: {
    //     $allModels: {
    //       async $allOperations({ operation, model, args, query }) {
    //         const result = await query(args);
    //         // If operation is create, update, delete, log to Audit table
    //         // (Usually requires AsyncLocalStorage to get user context)
    //         return result;
    //       },
    //     },
    //   },
    // }));
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
