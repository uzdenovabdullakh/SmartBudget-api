import { ApiException } from 'src/exceptions/api.exception';

export const parseDuration = (duration: string): number => {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw ApiException.serverError('Invalid duration format');

  const [, value, unit] = match;
  const multiplier = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }[unit];

  return parseInt(value, 10) * multiplier;
};
