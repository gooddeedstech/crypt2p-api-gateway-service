import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsEnum, IsNumberString } from 'class-validator';
import { BvnStatus, KycLevel } from '../enum/users.enum';

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty()
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ChangePinDto {
  @ApiProperty()
  @IsString()
  @MinLength(4)
  oldPin: string;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  newPin: string;
}

export class UpdateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  dob?: string; // ISO date string
}

export enum DeviceType {
  ANDROID = 'ANDROID',
  IOS = 'IOS',
  WEB = 'WEB',
}

export enum DeviceStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  REVOKED = 'REVOKED',
}

export class UserResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() email: string;
  @ApiProperty() firstName: string;
  @ApiProperty() lastName: string;
  @ApiProperty() gender: Gender;
  @ApiProperty() phoneNumber: string;

  @ApiProperty() rewardPoint: string | null;
  @ApiProperty() kycLevel: KycLevel;
  @ApiProperty() bvnStatus: BvnStatus;
  @ApiProperty() isDisabled: boolean;
  @ApiProperty() isDeleted: boolean;

  @ApiProperty({ type: () => [Object] }) wallets: any[];
  @ApiProperty({ type: () => [Object] }) bankAccounts: any[];
  @ApiProperty({ type: () => [Object] }) transactions: any[];

  @ApiProperty() createdAt: Date;
  @ApiProperty() lastLoginAt: Date | null;
}

export class AdminListUsersDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumberString()
  limit?: string;

  @ApiPropertyOptional({ example: 'samuel' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: KycLevel })
  @IsOptional()
  kycLevel?: KycLevel;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isDisabled?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  isDeleted?: boolean;

  @ApiPropertyOptional({ enum: BvnStatus })
  @IsOptional()
  bvnStatus?: BvnStatus;

  @ApiPropertyOptional({
    example: 'createdAt',
    enum: ['createdAt', 'lastLoginAt'],
  })
  @IsOptional()
  sort?: string;

  @ApiPropertyOptional({
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  order?: string;
}