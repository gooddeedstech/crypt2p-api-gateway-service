import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class GenerateDepositWalletDto {
  @ApiProperty({
    example: 'USDT',
    description: 'The cryptocurrency asset symbol (e.g., BTC, ETH, USDT)',
  })
  @IsString()
  @IsNotEmpty()
  asset: string;

  @ApiProperty({  
    example: '10',
    description: 'The amount of the asset to deposit (as a string)',
  })
  @IsNumberString()
  amount: string;

  @ApiProperty({
    example: 'TRC20',
    description: 'The blockchain network for the deposit (e.g., ERC20, BEP20, TRC20)',
  })
  @IsString()
  @IsNotEmpty()
  network: string;
}