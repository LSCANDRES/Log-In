import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email verification token' })
  @IsNotEmpty()
  token: string;
}

export class ResendVerificationDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
