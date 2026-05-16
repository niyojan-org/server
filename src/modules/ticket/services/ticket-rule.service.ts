/* Group allowed?
Free/Paid?
Min/max members? */

export class TicketAvailabilityService {
  static hasAvailableSeats(capacity: number, sold: number): boolean {
    return sold < capacity;
  }
}
