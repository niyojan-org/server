import mailQueue from "@queues/mail.queue";
import { AuthType } from "../types";
import { EMAIL_SENDERS, EMAIL_LAYOUTS } from "../mail.constants";

const sendAuthEmail = {
  welcome: async (to: string, context: AuthType.WelcomeType) => {
    await mailQueue.add("template", {
      template: "auth/welcome",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Welcome to Orgatick!",
      data: context,
    });
  },

  verifyEmail: async (to: string, context: AuthType.VerifyEmailType) => {
    await mailQueue.add("template", {
      template: "auth/verify-email",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Verify Your Email Address",
      data: context,
    });
  },

  loginAlert: async (to: string, context: AuthType.LoginType) => {
    await mailQueue.add("template", {
      template: "auth/login-alert",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "New Login Detected",
      data: context,
    });
  },

  newDeviceLogin: async (to: string, context: AuthType.NewDeviceLoginType) => {
    await mailQueue.add("template", {
      template: "auth/new-device-login",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "New Device Login Detected",
      data: context,
    });
  },

  passwordReset: async (to: string, context: AuthType.PasswordResetType) => {
    await mailQueue.add("template", {
      template: "auth/password-reset",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Password Reset Request",
      data: context,
    });
  },

  passwordChanged: async (to: string, context: AuthType.PasswordChangedType) => {
    await mailQueue.add("template", {
      template: "auth/password-changed",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Password Changed Successfully",
      data: context,
    });
  },

  accountLocked: async (to: string, context: AuthType.AccountLockedType) => {
    await mailQueue.add("template", {
      template: "auth/account-locked",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Account Locked - Security Alert",
      data: context,
    });
  },

  accountDeleted: async (to: string, context: AuthType.AccountDeletedType) => {
    await mailQueue.add("template", {
      template: "auth/account-deleted",
      layout: EMAIL_LAYOUTS.BASE,
      from: EMAIL_SENDERS.AUTH,
      to,
      subject: "Account Deletion Confirmation",
      data: context,
    });
  },
};

export default sendAuthEmail;
