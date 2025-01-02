import { BriefQuiz } from 'src/constants/constants';
import { z } from 'zod';

export const AnswerToBriefSchema = z.object(
  Object.fromEntries(
    Object.entries(BriefQuiz).map(([question]) => [
      question,
      z.array(z.string()),
    ]),
  ),
);

export type AnswerToBriefDto = z.infer<typeof AnswerToBriefSchema>;
