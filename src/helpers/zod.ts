import { Types } from 'mongoose';
import { custom, preprocess, uuid, z } from 'zod';

export const objectIdSchema = preprocess(
  (value) => {
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }

    return value;
  },
  custom<Types.ObjectId>((value) => value instanceof Types.ObjectId, {
    message: 'Invalid ObjectId',
  }),
);

export const uuidSchema = uuid({ message: 'Invalid UUID format' });

export const toObjectId = (value?: ObjectId | string) => (value ? objectIdSchema.parse(value) : undefined);

export type ObjectId = z.infer<typeof objectIdSchema>;

export const isObjectId = (value: string | ObjectId): boolean => {
  return Types.ObjectId.isValid(value);
};
