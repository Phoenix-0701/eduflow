import { IsNotEmpty, IsObject } from 'class-validator';

export class SaveDraftDto {
  // FE sẽ gửi lên một object dạng key-value: { "id_cau_hoi_1": "id_dap_an_A", "id_cau_hoi_2": "id_dap_an_B" }
  @IsObject()
  @IsNotEmpty()
  answers: Record<string, string>;
}
