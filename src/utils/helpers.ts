import { Period } from 'src/constants/enums';
import { ApiException } from 'src/exceptions/api.exception';
import { TranslationService } from 'src/services/translation.service';

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

const excelDateToJSDate = (serial: number) => {
  const utcDays = Math.floor(serial - 25569);
  const date = new Date(utcDays * 86400 * 1000);
  return date.toISOString();
};

export const parseXLSXToTransactions = (rawData: object[]) =>
  rawData.map((row) => {
    // Находим ключ для даты (например, "Дата проведения операции" или "Дата")
    const dateKey = Object.keys(row).find((key) =>
      key.toLowerCase().includes('дата'),
    );
    const date = dateKey
      ? excelDateToJSDate(row[dateKey])
      : new Date().toISOString();

    // Находим ключ для поступления (например, "Поступление" или "Приход")
    const inflowKey = Object.keys(row).find(
      (key) =>
        key.toLowerCase().includes('поступление') ||
        key.toLowerCase().includes('приход'),
    );
    const inflow = inflowKey ? parseFloat(row[inflowKey]) || 0 : 0;

    // Находим ключ для расхода (например, "Расход" или "Списание")
    const outflowKey = Object.keys(row).find(
      (key) =>
        key.toLowerCase().includes('расход') ||
        key.toLowerCase().includes('списание'),
    );
    const outflow = outflowKey ? parseFloat(row[outflowKey]) || 0 : 0;

    // Находим ключ для описания (например, "Описание" или "Комментарий")
    const descriptionKey = Object.keys(row).find(
      (key) =>
        key.toLowerCase().includes('описание') ||
        key.toLowerCase().includes('комментарий'),
    );
    const description = descriptionKey ? row[descriptionKey] : null;

    const categoryKey = Object.keys(row).find(
      (key) =>
        key.toLowerCase().includes('тип операции') ||
        key.toLowerCase().includes('категория'),
    );
    const category = categoryKey ? row[categoryKey] : null;

    return {
      date,
      inflow: inflow > 0 ? inflow : null,
      outflow: outflow < 0 ? Math.abs(outflow) : null,
      description,
      category,
    };
  });

export const parseCSVToTransactions = (
  data: string[][],
  t: TranslationService,
) => {
  const transactions = [];

  for (const row of data) {
    if (row.length < 4) {
      throw ApiException.conflictError(
        t.tException(
          'Transaction headers were not found. The xlsx or csv format may be incorrect, or the values may be garbage',
        ),
      );
    }
    if (
      row.some(
        (cell) => cell.trim() === '' || cell === null || cell === undefined,
      )
    ) {
      throw ApiException.conflictError(
        t.tException(
          'Transaction headers were not found. The xlsx or csv format may be incorrect, or the values may be garbage',
        ),
      );
    }

    const date = row[0].replace(/"/g, '').trim();
    const description = row[2].replace(/"/g, '').trim();
    let inflow = parseFloat(row[3].replace(/"/g, '').trim());
    const outflow = inflow < 0 ? -inflow : null;
    inflow = inflow > 0 ? inflow : null;
    const category = row[6].replace(/"/g, '').trim();

    // Проверка на "мусор"
    if (!date || !description || (isNaN(inflow) && isNaN(outflow))) {
      throw ApiException.conflictError(
        t.tException(
          'Transaction headers were not found. The xlsx or csv format may be incorrect, or the values may be garbage',
        ),
      );
    }

    transactions.push({
      date: new Date(date).toISOString(),
      description,
      inflow,
      outflow,
      category,
    });
  }

  return transactions;
};
