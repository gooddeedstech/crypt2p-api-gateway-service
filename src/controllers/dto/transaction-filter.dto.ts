import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CryptoTransactionStatus, CryptoTransactionType } from '../enum/users.enum';

export class TransactionFilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ enum: ['today', 'week', 'month', 'year'] })
  date?: 'today' | 'week' | 'month' | 'year';

  @IsOptional()
  @IsEnum(CryptoTransactionType)
  @Transform(({ value }) => {
    if (!value) return undefined;
    const upper = value.toUpperCase();
    return Object.values(CryptoTransactionType).includes(upper as any)
      ? (upper as CryptoTransactionType)
      : undefined;
  })
  @ApiPropertyOptional({ enum: CryptoTransactionType })
  type?: CryptoTransactionType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  asset?: string;

  @IsOptional()
  @IsEnum(CryptoTransactionStatus)
  @Transform(({ value }) => {
    if (!value) return undefined;
    const upper = value.toUpperCase();
    return Object.values(CryptoTransactionStatus).includes(upper as any)
      ? (upper as CryptoTransactionStatus)
      : undefined;
  })
  @ApiPropertyOptional({ enum: CryptoTransactionStatus })
  status?: CryptoTransactionStatus;
}

export class TransactionDashboardFilterDto {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ enum: ['today', 'week', 'month', 'year'] })
  date?: 'today' | 'week' | 'month' | 'year';

  @IsOptional()
  @IsEnum(CryptoTransactionType)
  @Transform(({ value }) => {
    if (!value) return undefined;
    const upper = value.toUpperCase();
    return Object.values(CryptoTransactionType).includes(upper as any)
      ? (upper as CryptoTransactionType)
      : undefined;
  })
  @ApiPropertyOptional({ enum: CryptoTransactionType })
  type?: CryptoTransactionType;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional()
  asset?: string;

  
}