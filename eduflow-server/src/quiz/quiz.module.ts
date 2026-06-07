import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { GeminiService } from './gemini.service';

@Module({
  providers: [QuizService, GeminiService],
  controllers: [QuizController]
})
export class QuizModule {}
