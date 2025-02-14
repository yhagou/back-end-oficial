import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { comparePassword, encodePassword } from 'src/utils/bcrypt';
import { UserResponse } from './types/user-responses.types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponse> {
    try {
      const existingUser = await this.prismaService.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email já está em uso');
      }

      const user = await this.prismaService.user.create({
        data: {
          name: createUserDto.name,
          email: createUserDto.email,
          password: await encodePassword(createUserDto.password),
          isTeacher: createUserDto.isTeacher,
        },
      });

      return {
        message: 'Usuário criado com sucesso',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          isTeacher: user.isTeacher,
        },
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (error instanceof PrismaClientKnownRequestError) {
        throw new InternalServerErrorException(
          'Erro ao criar usuário no banco de dados',
        );
      }

      throw new InternalServerErrorException('Erro interno do servidor');
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<UserResponse> {
    const user = await this.prismaService.user.findUnique({
      where: { email: loginUserDto.email },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const isPasswordValid = await comparePassword(
      loginUserDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Senha inválida');
    }

    return {
      message: 'Login realizado com sucesso',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        isTeacher: user.isTeacher,
      },
    };
  }
}
