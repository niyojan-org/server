import { ORGANIZATION_ROLES } from '@modules/user/user.constants';

type OrganizationRole = (typeof ORGANIZATION_ROLES)[number];
type EventLike = Record<string, unknown>;

const OWNER_ADMIN_ROLES: OrganizationRole[] = [
  'owner',
  'admin',
  'taskmaster',
  'system',
];

const MANAGER_ROLES: OrganizationRole[] = ['manager'];

const omitEventFields = (event: EventLike, fields: string[]) => {
  const safeEvent = { ...event };
  for (const field of fields) {
    delete safeEvent[field];
  }
  return safeEvent;
};

const toLimitedEventView = (event: EventLike) => {
  return omitEventFields(event, [
    'coupons',
    'joinCode',
    'governance',
    'createdBy',
    'metrics'
  ]);
};

const toManagerEventView = (event: EventLike) => {
  return omitEventFields(event, ['coupons', 'joinCode']);
};

export const getEventViewByRole = (
  event: EventLike,
  role?: OrganizationRole,
) => {
  if (!role) {
    return toLimitedEventView(event);
  }

  if (OWNER_ADMIN_ROLES.includes(role)) {
    return event;
  }

  if (MANAGER_ROLES.includes(role)) {
    return toManagerEventView(event);
  }

  return toLimitedEventView(event);
};

export const getEventListViewByRole = (
  events: EventLike[],
  role?: OrganizationRole,
) => events.map((event) => getEventViewByRole(event, role));

export type { OrganizationRole };
