import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Đánh dấu Global để không phải import PrismaModule ở mọi nơi
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export ra để dùng
})
export class PrismaModule {}
