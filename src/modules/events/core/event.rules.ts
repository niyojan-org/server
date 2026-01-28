import ApiError from "@core/errors/api.error";
import { EventDocument } from "./event.types";
import { EventStatus } from "./event.enums";

const assert = (condition: boolean, message: string) => {
  if (!condition)
    throw new ApiError(
      400,
      message,
      "EVENT_RULE_VIOLATION",
      "Violation of event rules: - " + message,
    );
};

export class EventRules {
  static canEdit(event: EventDocument) {
    assert(!event.isBlocked, "Blocked events cannot be edited");
    assert(
      event.status !== "PUBLISHED",
      "Published events cannot be edited. Please unpublish the event first.",
    );
  }
  static canModifySessions(event: EventDocument) {
    assert(!event.isBlocked, "Blocked events cannot be modified");
    // assert()
  }
  static validateSessions(sessions: EventDocument["sessions"]) {
    assert(sessions.length > 0, "At least one session is required");
    for (const s of sessions) {
      assert(s.startTime < s.endTime, `Session ${s.title} start time must be before end time`);
    }
  }
  static canModifyTickets(event: EventDocument) {
    assert(!event.isBlocked, "Blocked events cannot be modified");
  }
  static validateTickets(tickets: EventDocument["tickets"]) {
    assert(tickets.length > 0, "At least one ticket is required");
    for (const t of tickets) {
      assert(t.price >= 0, `Ticket ${t.type} price cannot be negative`);
      assert(t.sold <= t.capacity, `Ticket ${t.type} sold count cannot exceed capacity`);
      assert(t.capacity > 0, `Ticket ${t.type} capacity must be at least 1`);
      if (t.salesStartTime && t.salesEndTime) {
        assert(
          t.salesStartTime < t.salesEndTime,
          `Ticket ${t.type} sales start time must be before end time`,
        );
      }
      if (t.isGroupTicket) {
        assert(
          !!t.groupSettings,
          `Ticket ${t.type} group settings must be provided for group tickets`,
        );
        assert(
          t.groupSettings!.minParticipants >= 1,
          `Ticket ${t.type} minimum participants must be at least 1`,
        );
        assert(
          t.groupSettings!.maxParticipants >= t.groupSettings!.minParticipants,
          `Ticket ${t.type} maximum participants must be greater than or equal to minimum participants`,
        );
      }
    }
  }
  static validateRegistrationWindow(event: EventDocument) {
    if (event.registrationStart && event.registrationEnd) {
      assert(
        event.registrationStart < event.registrationEnd,
        "Event registration start time must be before end time",
      );
    }
  }
  static canPublish(event: EventDocument) {
    assert(!event.isBlocked, "Blocked events cannot be published");
    assert(event.status !== "PUBLISHED", "Event is already published");
    assert(event.sessions.length > 0, "At least one session is required to publish the event");
    assert(event.tickets.length > 0, "At least one ticket is required to publish the event");
    this.validateSessions(event.sessions);
    this.validateTickets(event.tickets);
    this.validateRegistrationWindow(event);
  }
  static canCancel(event: EventDocument) {
    assert(!event.isBlocked, "Blocked events cannot be cancelled");
    assert(event.status === "PUBLISHED", "Only published events can be cancelled");
    assert(event.status !== EventStatus.COMPLETED, "Completed events cannot be cancelled");
  }
  static isRegistrationOpen(event: EventDocument) {
    if (event.isBlocked || event.status !== EventStatus.PUBLISHED) return false;
    const now = new Date();
    if (event.registrationStart && now < event.registrationStart) return false;
    if (event.registrationEnd && now > event.registrationEnd) return false;
    return true;
  }
}
