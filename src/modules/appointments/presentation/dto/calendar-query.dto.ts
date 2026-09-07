import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CalendarQueryDto {
  @IsString({ message: 'Mês deve ser texto.' })
  @IsNotEmpty({ message: 'Mês é obrigatório.' })
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'Mês deve estar no formato YYYY-MM.',
  })
  mes!: string;
}
