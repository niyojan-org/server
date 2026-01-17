export const EMAIL_SENDERS = {
  DEFAULT: '"Orgatick" <no-reply@orgatick.in>',
  AUTH: '"Orgatick Security" <no-reply@orgatick.in>',
  EVENTS: '"Orgatick Events" <events@orgatick.in>',
  BILLING: '"Orgatick Billing" <billing@orgatick.in>',
  SUPPORT: '"Orgatick Support" <support@orgatick.in>',
} as const;

export const EMAIL_LAYOUTS = {
  BASE: "base",
  MINIMAL: "minimal",
  TRANSACTIONAL: "transactional",
} as const;

export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 5,
  BACKOFF_TYPE: "exponential",
  INITIAL_DELAY: 5000,
} as const;
