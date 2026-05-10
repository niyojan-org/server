import ApiError from '@core/errors/api.error';
import { EventMode } from '@modules/events/core/event.enums';
import { EventDocument, Session } from '@modules/events/core/event.types';

export interface SessionValidationError {
  message: string;
  code: string;
  details: string;
}

const collectSessionValidationErrors = (
  event: EventDocument,
  session: Session,
  isNew: boolean,
) => {
  const errors: SessionValidationError[] = [];

  const addError = (
    message: string,
    code: string,
    details: string,
  ) => {
    errors.push({ message, code, details });
  };

  if (isNew && event.sessions.length >= 50) {
    addError(
      'Cannot add more than 50 sessions to an event',
      'SESSION_LIMIT_EXCEEDED',
      'Remove an existing session before adding a new one.',
    );
  }

  if (
    event.allowMultipleSessions === false &&
    isNew &&
    event.sessions.length >= 1
  ) {
    addError(
      'This event does not allow multiple sessions',
      'MULTIPLE_SESSIONS_DISABLED',
      'Enable allowMultipleSessions before adding another session.',
    );
  }

  const duplicateTitle = event.sessions.find(
    (existing) =>
      existing.title.trim().toLowerCase() === session.title.trim().toLowerCase() &&
      existing._id?.toString() !== session._id?.toString(),
  );
  if (duplicateTitle) {
    addError(
      `A session with the title "${session.title}" already exists`,
      'DUPLICATE_SESSION_TITLE',
      'Each session title must be unique within an event.',
    );
  }

  if (
    (event.mode === EventMode.OFFLINE || event.mode === EventMode.HYBRID) &&
    !session.venue
  ) {
    addError(
      'Venue details are required for offline or hybrid sessions',
      'SESSION_VENUE_REQUIRED',
      'Add venue details before saving this session.',
    );
  }

  if (!session.allowCheckIn) {
    return errors;
  }

  if (!session.checkInStartTime || !session.checkInEndTime) {
    addError(
      'Check-in start and end times are required when check-in is enabled',
      'SESSION_CHECKIN_WINDOW_REQUIRED',
      'Provide both check-in times or disable check-in for the session.',
    );
    return errors;
  }

  if (
    session.checkInStartTime < session.startTime ||
    session.checkInEndTime > session.endTime ||
    session.checkInStartTime >= session.checkInEndTime
  ) {
    addError(
      'Session check-in window must stay inside the session duration',
      'INVALID_SESSION_CHECKIN_WINDOW',
      'Adjust the check-in start/end time to fit the session schedule.',
    );
  }

  return errors;
};

const validateSession = (
  event: EventDocument,
  session: Session,
  isNew: boolean,
) => {
  const [firstError] = collectSessionValidationErrors(event, session, isNew);
  if (firstError) {
    throw new ApiError(
      400,
      firstError.message,
      firstError.code,
      firstError.details,
    );
  }
};

export default {
  collectSessionValidationErrors,
  validateSession,
};
