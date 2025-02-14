import { Prompt } from '../entities/prompt.entity';
import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PromptDto implements Prompt {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The prompt to be sent to the OpenAI API',
    example: 'What is the capital of France?',
  })
  prompt: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'The user ID',
    example: 1,
  })
  userId: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'The chat ID',
    example: '1',
  })
  chatId?: string;
}
