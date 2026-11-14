import {
  applicationAcceptedLetter,
  applicationDeclinedLetter,
} from '../../platform/email/letters/mentor-application.letters';
import {
  SENDER_NAMES,
  type Letter,
} from '../../platform/email/letters/letter.types';

/** The decision emails, in one place so the admin preview shows exactly what is sent */
export const approvalEmail = (firstName: string) =>
  applicationAcceptedLetter(firstName);

export const rejectionEmail = (firstName: string, feedback?: string) =>
  applicationDeclinedLetter(firstName, feedback);

/** What the admin preview needs: the letter plus who it comes from */
export const toEmailPreview = (letter: Letter) => ({
  subject: letter.subject,
  from: SENDER_NAMES[letter.sender],
  blocks: letter.blocks,
  signature: letter.signature,
  attachments: (letter.attachments ?? []).map(
    (attachment) => attachment.filename,
  ),
});
