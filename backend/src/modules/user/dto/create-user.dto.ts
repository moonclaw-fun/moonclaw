import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateUserDto {
  @ApiPropertyOptional({
    description: 'User ID (optional, will be auto-generated if not provided)',
    example: 'user_custom_123',
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe',
  })
  @IsString()
  username: string;

  @ApiPropertyOptional({
    description: 'Initial balance for the user',
    example: 1000,
    minimum: 0,
    default: 1000,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  balance?: number;
}

export class CreateUserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user_1',
  })
  id: string;

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  username: string;

  @ApiProperty({
    description: 'Current balance',
    example: 1000,
  })
  balance: number;

  @ApiProperty({
    description: 'Account creation timestamp',
    example: '2024-01-15T08:30:00.000Z',
  })
  createdAt: Date;
}

export class UserBalanceResponseDto {
  @ApiProperty({
    description: 'Current balance',
    example: 1000,
  })
  balance: number;
}
