import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from 'generated/prisma';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    try {
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (err: any) {
      console.error('❌ Database connection error:', err.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔻 Database connection closed');
  }
}
