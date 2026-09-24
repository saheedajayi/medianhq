import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthUser } from '../auth/dto/auth.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) { }

  @UseGuards(AuthGuard)
  @Get('token')
  getLiveKitToken(@CurrentUser() user: AuthUser) {
    return this.messagesService.getLiveKitToken(user);
  }

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

  @UseGuards(AuthGuard)
  @Patch('message/:messageId')
  editMessage(
    @CurrentUser() user: AuthUser,
    @Param('messageId') messageId: string,
    @Body() dto: { content: string },
  ) {
    return this.messagesService.editMessage(user, messageId, dto);
  }

  @UseGuards(AuthGuard)
  @Delete('message/:messageId')
  deleteMessage(@CurrentUser() user: AuthUser, @Param('messageId') messageId: string) {
    return this.messagesService.deleteMessage(user, messageId);
  }

  @UseGuards(AuthGuard)
  @Post(':conversationId/read')
  markConversationRead(@CurrentUser() user: AuthUser, @Param('conversationId') conversationId: string) {
    return this.messagesService.markConversationRead(user, conversationId);
  }

  @UseGuards(AuthGuard)
  @Post('report')
  reportMessage(
    @CurrentUser() user: AuthUser,
    @Body() dto: { messageId: string; reason: string; note?: string },
  ) {
    return this.messagesService.reportMessage(user, dto);
  }
}

