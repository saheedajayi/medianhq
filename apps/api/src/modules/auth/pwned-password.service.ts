import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'crypto';

const PWNED_PASSWORDS_RANGE_URL = 'https://api.pwnedpasswords.com/range';
const REQUEST_TIMEOUT_MS = 3_000;

@Injectable()
export class PwnedPasswordService {
  async isCompromised(password: string): Promise<boolean> {
    const passwordHash = createHash('sha1')
      .update(password, 'utf8')
      .digest('hex')
      .toUpperCase();
    const prefix = passwordHash.slice(0, 5);
    const suffix = passwordHash.slice(5);

    let range: string;
    try {
      const response = await fetch(`${PWNED_PASSWORDS_RANGE_URL}/${prefix}`, {
        headers: {
          'Add-Padding': 'true',
          'User-Agent': 'Median password security check',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (!response.ok) {
        throw new Error(`Pwned Passwords returned ${response.status}`);
      }

      range = await response.text();
    } catch {
      throw new ServiceUnavailableException(
        'Password security checks are temporarily unavailable. Please try again.',
      );
    }

    return range.split(/\r?\n/).some((entry) => {
      const [candidateSuffix] = entry.split(':');
      return candidateSuffix === suffix;
    });
  }
}
