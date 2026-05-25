import type { Request } from 'express';
import UserModel from '@modules/user/user.model';
import { LoginInput } from '../schemas/login.schema';
import ApiError from '@core/errors/api.error';
import { verifyPassword } from './password.service';
import { createSession, markMfaPending } from './session.service';
import { generateTokens } from './token.service';
import { setRefreshToken } from '../helper/cookies.helper';
import { sendVerificationEmail } from './verification.service';
import { UserDocument } from '@modules/user/user.types';
import { checkMfa } from '../mfa/mfa.service';

export const login = async (input: LoginInput, req: Request) => {
  const user = await UserModel.findOne({ email: input.email }).select('+password');
  if (!user) {
    throw new ApiError(
      401,
      'Invalid email or password',
      'AUTH_SERVICE',
      'The email or password you entered is incorrect. Please try again.',
    );
  }
  if (!user.password) {
    //TODO: try sending email to set password and then throw error
    throw new ApiError(
      401,
      'Invalid email or password',
      'AUTH_SERVICE',
      'The email or password you entered is incorrect. Please try again.',
    );
  }
  await verifyPassword(input.password, user.password);
  if (!user.isVerified) {
    try {
      await sendVerificationEmail({ name: user.name, email: user.email });
      throw new ApiError(
        403,
        'Account not verified',
        'ACCOUNT_NOT_VERIFIED',
        'User account is not verified. A new verification email has been sent.',
      );
    } catch (error) {
      if (error instanceof ApiError && error.code === 'RATE_LIMIT_EXCEEDED') {
        throw new ApiError(
          403,
          'Account not verified',
          'ACCOUNT_NOT_VERIFIED',
          `User account is not verified. ${error.details}`,
        );
      }
      throw error;
    }
  }
  const mfa = await checkMfa(user.email);
  if (mfa.required) {
    await markMfaPending(user._id.toString());
    return {
      requiresTOTP: mfa.methods.totp,
      requiresPasskey: mfa.methods.passkey,
      userId: user._id,
    };
  }

  const sessionId = await createSession(user._id.toString());
  const { accessToken, refreshToken } = await generateTokens({
    userId: user._id.toString(),
    sessionId,
  });
  setRefreshToken(req.res!, refreshToken);
  const { ...userWithoutPassword } = user.toJSON();
  return { token: accessToken, ...userWithoutPassword };
};

export const completeOAuthLogin = async (user: UserDocument, req: Request) => {
  //MFA CHECK TO BE ADDED HERE LATER
  const sessionId = await createSession(user._id.toString());
  const { accessToken, refreshToken } = await generateTokens({
    userId: user._id.toString(),
    sessionId,
  });
  setRefreshToken(req.res!, refreshToken);
  const { ...userWithoutPassword } = user.toJSON();
  return { token: accessToken, ...userWithoutPassword };
};
