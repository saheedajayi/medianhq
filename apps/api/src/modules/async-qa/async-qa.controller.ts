import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AsyncQaService } from './async-qa.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('async-qa')
export class AsyncQaController {
  constructor(private readonly asyncQaService: AsyncQaService) {}

  @UseGuards(AuthGuard)
  @Get('questions')
  listQuestions(@CurrentUser() user: AuthUser) {
    return this.asyncQaService.listQuestions(user);
  }

  @UseGuards(AuthGuard)
  @Post('questions')
  askQuestion(
    @CurrentUser() user: AuthUser,
    @Body() dto: { mentorId: string; title: string; content: string },
  ) {
    return this.asyncQaService.askQuestion(user, dto);
  }

  @UseGuards(AuthGuard)
  @Post('questions/:id/answers')
  answerQuestion(
    @CurrentUser() user: AuthUser,
    @Param('id') questionId: string,
    @Body('content') content: string,
  ) {
    return this.asyncQaService.answerQuestion(user, questionId, content);
  }
}
