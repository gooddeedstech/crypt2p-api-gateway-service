import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsEnum, IsNumberString, IsNumber, Min } from 'class-validator';
import { NotificationChannel, NotificationType } from '../enum/users.enum';
import { Transform } from 'class-transformer';

export class SendBulkNotificationDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationChannel })
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

}



export class NotificationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (default: 1)',
    example: 1,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Items per page (default: 20)',
    example: 20,
  })
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  @IsOptional()
  limit?: number = 20;

 
}