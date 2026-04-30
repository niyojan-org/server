import { EventDocument } from '../core/event.types';

export const getEventStartAndEndDates = (event: EventDocument) => {
  if (!event.sessions || event.sessions.length === 0) {
    return null;
  }
  const firstSession = event.sessions.reduce((earliest, current) => {
    return new Date(current.startTime) < new Date(earliest.startTime)
      ? current
      : earliest;
  });
  const lastSession = event.sessions.reduce((latest, current) => {
    return new Date(current.endTime) > new Date(latest.endTime)
      ? current
      : latest;
  });
  return {
    firstSession,
    lastSession,
    startDate: firstSession.startTime,
    endDate: lastSession.endTime,
  };
};
