import i18next from 'i18next';
import { z } from 'zod';
import { zodI18nMap } from 'zod-i18n-map';

import localeEn from '../locales/en/errors.json';
import localeRu from '../locales/ru/errors.json';
import zodEn from 'zod-i18n-map/locales/en/zod.json';
import zodRu from 'zod-i18n-map/locales/ru/zod.json';

i18next.init({
  lng: 'ru',
  fallbackLng: 'en',
  resources: {
    ru: {
      zod: zodRu,
      common: localeRu,
    },
    en: {
      zod: zodEn,
      common: localeEn,
    },
  },
  ns: ['zod', 'common'],
  defaultNS: 'zod',
});

z.setErrorMap(zodI18nMap);

export { z };
