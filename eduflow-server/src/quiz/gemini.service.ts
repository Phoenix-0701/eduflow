import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateQuestionsFromPdf(fileBuffer: Buffer, numQuestions: number = 5) {
    // 1. Khởi tạo model chuẩn xác
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-3.5-flash',
    });

    const pdfPart = {
      inlineData: {
        data: fileBuffer.toString('base64'),
        mimeType: 'application/pdf',
      },
    };

    // 2. Prompt đã được tối ưu lại: Giới hạn đúng số câu để AI xử lý siêu tốc
    const prompt = `
      Bạn là một chuyên gia giáo dục. Hãy đọc kỹ nội dung tài liệu PDF đính kèm.
      
      Nhiệm vụ: 
      - Nếu tài liệu là một đề thi/bài tập, hãy trích xuất TOÀN BỘ các câu hỏi trắc nghiệm có trong đó. KHÔNG BỎ SÓT (ví dụ đề có 40 câu thì phải trích xuất đủ 40 câu).
      - Nếu tài liệu là lý thuyết, hãy tạo ra 15 - 20 câu hỏi trắc nghiệm bao quát kiến thức.
      
      Định dạng BẮT BUỘC là một mảng JSON (không có thẻ markdown, không có giải thích) với cấu trúc chính xác như sau:
      [
        {
          "content": "Nội dung câu hỏi...",
          "orderIndex": 1,
          "options": [
            { "content": "Đáp án A...", "isCorrect": false },
            { "content": "Đáp án B...", "isCorrect": true },
            { "content": "Đáp án C...", "isCorrect": false },
            { "content": "Đáp án D...", "isCorrect": false }
          ]
        }
      ]
    `;

    try {
      console.log('🤖 Đang gửi file PDF sang Google Gemini...');

      // 3. Gọi AI
      const result = await model.generateContent([prompt, pdfPart]);

      console.log('✅ Gemini đã xử lý xong! Đang phân tích kết quả...');
      let responseText = result.response.text();

      // "Tẩy rửa" mã markdown nếu có
      responseText = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      // 4. Chuyển đổi thành Javascript Array
      const generatedQuestions = JSON.parse(responseText);

      console.log(`🎉 Đã tạo thành công ${generatedQuestions.length} câu hỏi!`);

      return generatedQuestions;
    } catch (error) {
      console.error('=== CHI TIẾT LỖI GEMINI ===');
      console.error(error);
      throw new InternalServerErrorException(
        'Lỗi trong quá trình AI phân tích tài liệu và sinh câu hỏi.',
      );
    }
  }
}
