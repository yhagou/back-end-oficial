import { ApiProperty } from '@nestjs/swagger';
import { User } from '../entities/user.entity';
import { IsBoolean, IsEmail, IsString } from 'class-validator';

export class CreateUserDto implements User {
  @ApiProperty({
    description: 'Nome do usuário',
    example: 'John Doe',
  })
  @IsString()
  name: string;

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

  @ApiProperty({
    description: 'Se o usuário é um professor',
    example: false,
  })
  @IsBoolean()
  isTeacher: boolean;
}
