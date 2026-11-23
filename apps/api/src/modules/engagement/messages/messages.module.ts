import { Module } from '@nestjs/common';
import { EmailModule } from '../../platform/email/email.module';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { MessageEmailsRepository } from './message-emails.repository';
import { MessageEmailsService } from './message-emails.service';
import { MessageEmailsSweeperService } from './message-emails-sweeper.service';

@Module({
  imports: [EmailModule],
  controllers: [MessagesController],
  providers: [
    MessagesService,
    MessageEmailsRepository,
    MessageEmailsService,
    MessageEmailsSweeperService,
  ],
  exports: [MessagesService],
})
export class MessagesModule {}
