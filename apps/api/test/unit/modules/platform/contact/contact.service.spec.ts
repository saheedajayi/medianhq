import { ContactService } from '../../../../../src/modules/platform/contact/contact.service';

describe('ContactService', () => {
  const valid = {
    firstName: 'Amara',
    lastName: 'Okafor',
    email: 'Amara@Example.com ',
    subject: 'Becoming a mentor',
    message: 'How long does review take?',
  };

  it('emails the team with the sender as reply-to', async () => {
    const emailService = {
      sendContactMessage: jest.fn().mockResolvedValue(true),
    };
    const service = new ContactService(emailService as never);

    await service.send(valid);

    expect(emailService.sendContactMessage).toHaveBeenCalledWith({
      inbox: 'hello@medianhq.co',
      name: 'Amara Okafor',
      email: 'amara@example.com',
      subject: 'Becoming a mentor',
      message: 'How long does review take?',
    });
  });

  it('rejects an unknown subject and a bad email', async () => {
    const service = new ContactService({
      sendContactMessage: jest.fn(),
    } as never);

    await expect(service.send({ ...valid, subject: 'Spam' })).rejects.toThrow(
      'Choose a subject.',
    );
    await expect(service.send({ ...valid, email: 'nope' })).rejects.toThrow(
      'Enter a valid email address.',
    );
  });

  it('says so when email is not set up', async () => {
    const service = new ContactService({
      sendContactMessage: jest.fn().mockResolvedValue(false),
    } as never);

    await expect(service.send(valid)).rejects.toThrow(
      "We couldn't send your message",
    );
  });
});
