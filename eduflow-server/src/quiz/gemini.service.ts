import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
const pdfParse = require('pdf-parse');

@Injectable()
export class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    // Khởi tạo SDK với API Key từ file .env
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async generateQuestionsFromPdf(fileBuffer: Buffer, numQuestions: number = 5) {
    // 1. Trích xuất Text từ file PDF
    let pdfText = '';
    try {
      const pdfData = await pdfParse(fileBuffer);
      pdfText = pdfData.text;
    } catch (error) {
      throw new BadRequestException(
        'Không thể đọc file PDF. File có thể bị hỏng, có mật khẩu hoặc là dạng hình ảnh scan.',
      );
    }

    if (!pdfText || pdfText.trim().length === 0) {
      throw new BadRequestException('File PDF trống hoặc không chứa văn bản.');
    }

    // 2. Cấu hình Gemini Model
    // Sử dụng gemini-1.5-flash vì nó cực kỳ nhanh, rẻ và hỗ trợ context window siêu lớn (đọc được file PDF hàng trăm trang)
    const model = this.genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    // 3. Xây dựng Prompt Engineering
    const prompt = `
      Bạn là một chuyên gia giáo dục. Hãy đọc kỹ toàn bộ nội dung tài liệu dưới đây.
      
      Nhiệm vụ của bạn:
      - Nếu tài liệu là một bài lý thuyết, hãy tạo ra một bộ câu hỏi trắc nghiệm bao phủ TOÀN BỘ các kiến thức cốt lõi. (Tài liệu càng dài thì tạo càng nhiều câu hỏi).
      - Nếu tài liệu đã chứa sẵn các bài tập trắc nghiệm, hãy trích xuất TOÀN BỘ các câu hỏi đó.
      
      Định dạng trả về BẮT BUỘC là một mảng JSON với cấu trúc chính xác như sau:
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
      
      Tài liệu:
      """
      ${pdfText}
      """
    `;

    // 4. Gửi yêu cầu tới AI và Parse kết quả
    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Chuyển đổi text JSON từ AI thành Javascript Array
      const generatedQuestions = JSON.parse(responseText);

      return generatedQuestions;
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new InternalServerErrorException(
        'Lỗi trong quá trình AI phân tích tài liệu và sinh câu hỏi.',
      );
    }
  }
}
