// import { getOrCreateUserSecurity } from "@/services/auth/security";

// export async function checkMfa(userId: string) {
//   const security = await getOrCreateUserSecurity(userId);

//   const hasTOTP = security.totp?.enabled === true;
//   const hasPasskeys = security.passkeys?.length > 0;

//   return {
//     required: hasTOTP || hasPasskeys,
//     methods: {
//       totp: hasTOTP,
//       passkey: hasPasskeys,
//     },
//   };
// }
