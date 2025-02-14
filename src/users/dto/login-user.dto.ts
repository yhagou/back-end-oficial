import { IsEmail } from 'class-validator';
import { IsString } from 'class-validator';
import { LoginUser } from '../entities/login.entity';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto implements LoginUser {
  @ApiProperty({
    description: 'Email do usuário',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: '123456',
  })
  @IsString()
  password: string;
}
