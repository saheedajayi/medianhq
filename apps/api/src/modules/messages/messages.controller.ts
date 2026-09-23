import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @UseGuards(AuthGuard)
  @Get('conversations')
  listConversations(@CurrentUser() user: AuthUser) {
    return this.messagesService.listConversations(user);
  }

  @UseGuards(AuthGuard)
  @Get(':conversationId')
  getMessages(@CurrentUser() user: AuthUser, @Param('conversationId') conversationId: string) {
    return this.messagesService.getMessages(user, conversationId);
  }

  @UseGuards(AuthGuard)
  @Post()
  sendMessage(@CurrentUser() user: AuthUser, @Body() dto: { recipientId: string; content: string }) {
    return this.messagesService.sendMessage(user, dto);
  }
}
