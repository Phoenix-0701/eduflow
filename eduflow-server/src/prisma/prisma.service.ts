import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  // Tự động kết nối tới DB khi module khởi tạo
  async onModuleInit() {
    await this.$connect();
  }

  // Tự động đóng kết nối khi app tắt
  async onModuleDestroy() {
    await this.$disconnect();
  }
}