import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class PaginationDto {
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    default: 1,
  })
  page: number;

  @IsNumber()
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    default: 10,
  })
  pageSize: number;
}
