import { ServiceUnavailableException } from '@nestjs/common';
import { PwnedPasswordService } from '../../../../src/modules/auth/pwned-password.service';

describe('PwnedPasswordService', () => {
  const service = new PwnedPasswordService();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('detects a compromised password using a k-anonymous hash range', async () => {
    const fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response('1E4C9B93F3F0682250B6CF8331B7EE68FD8:46658894\r\n'),
      );

    await expect(service.isCompromised('password')).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.pwnedpasswords.com/range/5BAA6',
      expect.objectContaining({
        headers: expect.objectContaining({ 'Add-Padding': 'true' }),
      }),
    );
  });

  it('allows a password whose hash suffix is absent from the range', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        new Response('00000000000000000000000000000000000:1\r\n'),
      );

    await expect(service.isCompromised('password')).resolves.toBe(false);
  });

  it('fails closed when the password-security provider is unavailable', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

    await expect(service.isCompromised('password')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });

  it('fails closed when the password-security lookup times out', async () => {
    jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('Request timed out'));

    await expect(service.isCompromised('password')).rejects.toThrow(
      ServiceUnavailableException,
    );
  });
});
