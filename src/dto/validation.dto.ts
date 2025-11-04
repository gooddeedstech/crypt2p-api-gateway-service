import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsOptional,
} from 'class-validator';

export class VerifyAccountDto {
  @ApiProperty({
    example: '058',
    description: 'Bank code (3–6 digits depending on region)',
  })
  @IsString()
  @Matches(/^\d+$/, { message: 'bankCode must only contain numbers' })
  @Length(3, 6)
  bankCode!: string;

  @ApiProperty({
    example: '0123456789',
    description: '10-digit NUBAN account number',
  })
  @IsString()
  @Matches(/^\d{10}$/, { message: 'accountNumber must be 10 digits' })
  accountNumber!: string;

  @ApiProperty({
    example: 'Samuel',
    required: false,
    description: 'Firstname for name verification (optional)',
  })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Osarieme',
    required: false,
    description: 'Lastname for name verification (optional)',
  })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class VerifyBvnDto {
  @ApiProperty({
    example: '12345678901',
    description: '11-digit BVN number',
  })
  @IsString()
  @Matches(/^\d{11}$/, { message: 'BVN must be exactly 11 digits' })
  bvn!: string;

  @ApiProperty({
    example: '0123456789',
    description: '10-digit NUBAN',
  })
  @IsString()
  @Matches(/^\d{10}$/, { message: 'accountNumber must be 10 digits' })
  accountNumber!: string;

  @ApiProperty({
    example: '058',
    description: 'Bank code',
  })
  @IsString()
  @Matches(/^\d+$/, { message: 'bankCode must only contain numbers' })
  @Length(3, 6, { message: 'bankCode must be 3-6 digits' })
  bankCode!: string;

  @ApiProperty({
    example: 'Samuel',
    description: 'First name associated with BVN',
  })
  @IsString()
  @IsNotEmpty({ message: 'firstName is required' })
  firstName!: string;

  @ApiProperty({
    example: 'Osarieme',
    description: 'Last name associated with BVN',
  })
  @IsString()
  @IsNotEmpty({ message: 'lastName is required' })
  lastName!: string;
}