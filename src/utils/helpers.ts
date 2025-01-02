import { ErrorMessages } from 'src/constants/constants';
import { Period } from 'src/constants/enums';
import { ApiException } from 'src/exceptions/api.exception';

export const parseDuration = (duration: string): number => {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw ApiException.serverError(ErrorMessages.INVALID_DURATION);

  const [, value, unit] = match;
  const multiplier = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }[unit];

  return parseInt(value, 10) * multiplier;
};

export const calculatePeriod = (limitResetPeriod: Period): [Date, Date] => {
  const now = new Date();
  let periodStart: Date;
  let periodEnd: Date;

  const periodCalculationMap: Record<Period, () => void> = {
    [Period.NONE]: () => {
      periodStart = null;
      periodEnd = null;
    },
    [Period.DAILY]: () => {
      periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 1);
    },
    [Period.WEEKLY]: () => {
      periodStart = new Date(now);
      periodStart.setDate(periodStart.getDate() - periodStart.getDay());
      periodEnd = new Date(periodStart);
      periodEnd.setDate(periodEnd.getDate() + 7);
    },
    [Period.MONTHLY]: () => {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(
        periodStart.getFullYear(),
        periodStart.getMonth() + 1,
        1,
      );
    },
    [Period.YEARLY]: () => {
      periodStart = new Date(now.getFullYear(), 0, 1);
      periodEnd = new Date(periodStart.getFullYear() + 1, 0, 1);
    },
  };

  periodCalculationMap[limitResetPeriod]();

  return [periodStart, periodEnd];
};
