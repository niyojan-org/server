import ApiError from '@core/errors/api.error';
import EventSessionsHelper from '@modules/events/(management)/sessions/event.sessions.helper';
import EventTicketsHelper from '@modules/events/(management)/tickets/events.tickets.helper';
import { EventStatus } from '@modules/events/core/event.enums';
import { EventDocument } from '@modules/events/core/event.types';
import { EventModel } from '@modules/events/persistence/event.model';
import { EventRepository } from '@modules/events/persistence/event.repository';
import { OrganizationRepository } from '@modules/organization/persistence/organization.repository';
import { Organization } from '@modules/organization/types';
import { Types } from 'mongoose';
import writeOrganizationAudit from '../../../audits/organization.audit';

export interface PublishValidationError {
  message: string;
  code: string;
  details: string;
  sourceType?: 'organization' | 'event' | 'session' | 'ticket';
  sourceId?: string;
  sourceLabel?: string;
  field?: string;
}

export interface EventPublishReadiness {
  canPublish: boolean;
  errors: PublishValidationError[];
}

type PublishErrorSource = Omit<
  PublishValidationError,
  'message' | 'code' | 'details'
>;

const addError = (
  errors: PublishValidationError[],
  message: string,
  code: string,
  details: string,
  source: PublishErrorSource = {},
) => {
  errors.push({ message, code, details, ...source });
};

const toSourceHeading = (source: PublishErrorSource) => {
  if (!source.sourceType) return null;
  const label = source.sourceLabel?.trim();
  const heading = source.sourceType.charAt(0).toUpperCase() + source.sourceType.slice(1);
  return label ? `${heading} "${label}"` : heading;
};

const addScopedValidationErrors = (
  errors: PublishValidationError[],
  scopedErrors: Array<{ message: string; code: string; details: string }>,
  source: PublishErrorSource,
) => {
  const heading = toSourceHeading(source);
  for (const error of scopedErrors) {
    errors.push({
      message: heading ? `${heading}: ${error.message}` : error.message,
      code: error.code,
      details: heading ? `${heading}: ${error.details}` : error.details,
      ...source,
    });
  }
};

const getOrganizationSource = (organization: Organization): PublishErrorSource => ({
  sourceType: 'organization',
  sourceId: organization._id?.toString(),
  sourceLabel: organization.name,
});

const getEventSource = (
  event: Pick<EventDocument, '_id' | 'title'>,
  field?: string,
): PublishErrorSource => ({
  sourceType: 'event',
  sourceId: event._id?.toString(),
  sourceLabel: event.title,
  field,
});

const getSessionSource = (
  session: EventDocument['sessions'][number],
  field?: string,
): PublishErrorSource => ({
  sourceType: 'session',
  sourceId: session._id?.toString(),
  sourceLabel: session.title,
  field,
});

const getTicketSource = (
  ticket: EventDocument['tickets'][number],
  field?: string,
): PublishErrorSource => ({
  sourceType: 'ticket',
  sourceId: ticket._id?.toString(),
  sourceLabel: ticket.type,
  field,
});

const collectOrganizationPublishErrors = (
  organization: Organization,
  errors: PublishValidationError[],
) => {
  const source = getOrganizationSource(organization);
  if (!organization.active) {
    addError(
      errors,
      'Organization is inactive and cannot publish events',
      'ORGANIZATION_INACTIVE',
      'Activate the organization before publishing this event.',
      source,
    );
  }

  if (!organization.verified) {
    addError(
      errors,
      'Organization is not verified and cannot publish events',
      'ORGANIZATION_UNVERIFIED',
      'Complete organization verification before publishing this event.',
      source,
    );
  }

  if (organization.isBlocked) {
    addError(
      errors,
      'Organization is blocked and cannot publish events',
      'ORGANIZATION_BLOCKED',
      'Resolve the organization block before publishing this event.',
      source,
    );
  }

  if (!organization.allowsEventCreation) {
    addError(
      errors,
      'Event publishing is disabled for this organization',
      'EVENT_CREATION_DISABLED',
      'Ask an admin to re-enable event creation for this organization.',
      source,
    );
  }
};

const collectEventStateErrors = (
  event: EventDocument,
  errors: PublishValidationError[],
) => {
  const source = getEventSource(event, 'status');
  if (event.isBlocked) {
    addError(
      errors,
      'Blocked events cannot be published',
      'EVENT_BLOCKED',
      'Resolve the event block before publishing.',
      source,
    );
  }

  if (event.status !== EventStatus.DRAFT) {
    addError(
      errors,
      'Only draft events can be published',
      'INVALID_EVENT_STATUS_FOR_PUBLISH',
      `Move this event back to draft before publishing. Current status: ${event.status}.`,
      source,
    );
  }
};

const collectRegistrationWindowErrors = (
  event: EventDocument,
  errors: PublishValidationError[],
) => {
  if (event.registrationEnd <= event.registrationStart) {
    addError(
      errors,
      'Registration end date must be after start date',
      'INVALID_REGISTRATION_WINDOW',
      'Adjust the event registration window before publishing.',
      getEventSource(event, 'registrationEnd'),
    );
  }
};

const collectSessionPublishErrors = (
  event: EventDocument,
  errors: PublishValidationError[],
) => {
  if (event.sessions.length === 0) {
    addError(
      errors,
      'At least one session is required to publish the event',
      'PUBLISH_SESSION_REQUIRED',
      'Create at least one session before publishing this event.',
      getEventSource(event, 'sessions'),
    );
    return;
  }

  for (const session of event.sessions) {
    if (session.startTime >= session.endTime) {
      addError(
        errors,
        `Session ${session.title} start time must be before end time`,
        'INVALID_SESSION_TIME_RANGE',
        'Adjust the session schedule before publishing this event.',
        getSessionSource(session, 'endTime'),
      );
    }

    const sessionErrors = EventSessionsHelper.collectSessionValidationErrors(
      event,
      session,
      false,
    );
    addScopedValidationErrors(
      errors,
      sessionErrors,
      getSessionSource(session),
    );
  }
};

const collectTicketPublishErrors = (
  event: EventDocument,
  organization: Organization,
  errors: PublishValidationError[],
) => {
  if (event.tickets.length === 0) {
    addError(
      errors,
      'At least one ticket is required to publish the event',
      'PUBLISH_TICKET_REQUIRED',
      'Create at least one ticket before publishing this event.',
      getEventSource(event, 'tickets'),
    );
    return;
  }

  if (!event.tickets.some((ticket) => ticket.isActive)) {
    addError(
      errors,
      'At least one active ticket is required to publish the event',
      'PUBLISH_ACTIVE_TICKET_REQUIRED',
      'Activate at least one ticket before publishing this event.',
      getEventSource(event, 'tickets'),
    );
  }

  for (const ticket of event.tickets) {
    const ticketErrors = EventTicketsHelper.validateTicket(
      event,
      ticket,
      false,
      organization,
    );
    addScopedValidationErrors(
      errors,
      ticketErrors,
      getTicketSource(ticket),
    );
  }
};

export const getEventPublishValidationErrors = (
  event: EventDocument,
  organization: Organization,
) => {
  const errors: PublishValidationError[] = [];
  collectOrganizationPublishErrors(organization, errors);
  collectEventStateErrors(event, errors);
  collectRegistrationWindowErrors(event, errors);
  collectSessionPublishErrors(event, errors);
  collectTicketPublishErrors(event, organization, errors);
  return errors;
};

export const getEventPublishReadiness = (
  event: EventDocument,
  organization: Organization,
): EventPublishReadiness => {
  const errors = getEventPublishValidationErrors(event, organization);
  return {
    canPublish: errors.length === 0,
    errors,
  };
};

export const assertEventCanPublish = (
  event: EventDocument,
  organization: Organization,
) => {
  const result = getEventPublishReadiness(event, organization);
  if (!result.canPublish) {
    throw new ApiError(
      400,
      'Event is not ready to publish',
      'EVENT_NOT_READY_FOR_PUBLISH',
      result.errors,
    );
  }
  return result;
};

export const getEventPublishReadinessById = async (
  eventId: string | Types.ObjectId,
) => {
  const event = await EventRepository.find(eventId);
  if (!event) {
    throw new ApiError(
      404,
      'Event not found',
      'EVENT_NOT_FOUND',
      `No event found with identifier ${eventId.toString()}.`,
    );
  }

  const organization = await OrganizationRepository.findById(
    event.organizationId,
  );
  if (!organization) {
    throw new ApiError(
      404,
      'Organization not found',
      'ORGANIZATION_NOT_FOUND',
      'The organization linked to this event could not be found.',
    );
  }

  return {
    event,
    organization,
    ...getEventPublishReadiness(event, organization),
  };
};

export const assertEventCanPublishById = async (
  eventId: string | Types.ObjectId,
) => {
  const result = await getEventPublishReadinessById(eventId);
  if (!result.canPublish) {
    throw new ApiError(
      400,
      'Event is not ready to publish',
      'EVENT_NOT_READY_FOR_PUBLISH',
      result.errors,
    );
  }
  return result;
};

const shouldOpenRegistrationOnPublish = (
  event: Pick<EventDocument, 'isBlocked' | 'registrationStart' | 'registrationEnd'>,
) => {
  if (event.isBlocked) return false;
  const now = new Date();
  if (event.registrationStart && now < event.registrationStart) return false;
  if (event.registrationEnd && now > event.registrationEnd) return false;
  return true;
};

const findOrganizationEventOrThrow = async (
  organizationId: string | Types.ObjectId,
  eventId: string,
) => {
  const orgObjectId =
    organizationId instanceof Types.ObjectId
      ? organizationId
      : new Types.ObjectId(organizationId);

  const matchByIdOrSlug: Array<Record<string, unknown>> = [{ slug: eventId }];
  if (Types.ObjectId.isValid(eventId)) {
    matchByIdOrSlug.push({ _id: new Types.ObjectId(eventId) });
  }

  const event = await EventModel.findOne({
    organizationId: orgObjectId,
    $or: matchByIdOrSlug,
  }).lean();

  if (!event) {
    throw new ApiError(
      404,
      'Event not found',
      'EVENT_NOT_FOUND',
      'No event found with the provided ID or slug for this organization.',
    );
  }

  return event;
};

export const publishOrganizationEvent = async (params: {
  eventId: string;
  organizationId: string | Types.ObjectId;
  actorUserId: string;
  actorRole: string;
  req?: { ip?: string; userAgent?: string };
}) => {
  const event = await findOrganizationEventOrThrow(
    params.organizationId,
    params.eventId,
  );
  const organization = await OrganizationRepository.findById(event.organizationId);
  if (!organization) {
    throw new ApiError(
      404,
      'Organization not found',
      'ORGANIZATION_NOT_FOUND',
      'The organization linked to this event could not be found.',
    );
  }

  assertEventCanPublish(event, organization);

  const publishedAt = new Date();

  const updatedEvent = await EventRepository.updateStatus(
    event._id,
    EventStatus.PUBLISHED,
    {
      isPublished: true,
      isRegistrationOpen: shouldOpenRegistrationOnPublish(event),
      publishedAt,
      unpublishedAt: undefined,
      unpublishedReason: undefined,
    },
  );

  if (!updatedEvent) {
    throw new ApiError(
      500,
      'Failed to publish event',
      'EVENT_PUBLISH_FAILED',
      'The event status could not be updated. Please try again.',
    );
  }

  await writeOrganizationAudit({
    organizationId: organization._id?.toString() ?? event.organizationId.toString(),
    actorUserId: params.actorUserId,
    actorRole: params.actorRole as
      | 'owner'
      | 'admin'
      | 'manager'
      | 'member'
      | 'volunteer'
      | 'system',
    action: 'EVENT_PUBLISHED',
    severity: 'info',
    targetType: 'event',
    targetId: updatedEvent._id.toString(),
    metadata: {
      title: updatedEvent.title,
      slug: updatedEvent.slug,
      publishedAt,
      isRegistrationOpen: updatedEvent.isRegistrationOpen,
    },
    req: params.req,
  });

  return updatedEvent;
};

export const testOrganizationEventPublish = async (params: {
  eventId: string;
  organizationId: string | Types.ObjectId;
}) => {
  const event = await findOrganizationEventOrThrow(
    params.organizationId,
    params.eventId,
  );
  const organization = await OrganizationRepository.findById(event.organizationId);
  if (!organization) {
    throw new ApiError(
      404,
      'Organization not found',
      'ORGANIZATION_NOT_FOUND',
      'The organization linked to this event could not be found.',
    );
  }

  return {
    event,
    organization,
    ...getEventPublishReadiness(event, organization),
  };
};
