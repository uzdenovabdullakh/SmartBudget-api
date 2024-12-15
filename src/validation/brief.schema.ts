import { BriefQuestions } from 'src/constants/constants';
import { z } from 'zod';

export const AnswerToBriefSchema = z.object(
  Object.fromEntries(
    Object.entries(BriefQuestions).map(([question, defaultValue]) => [
      question,
      Array.isArray(defaultValue) ? z.array(z.string()) : z.string(),
    ]),
  ),
);

export type AnswerToBriefDto = z.infer<typeof AnswerToBriefSchema>;
