import { describe, it, expect } from 'vitest';
import TicketRuleService from '../../src/modules/ticket/services/ticket-validation.service';
import { TicketErrorCode } from '../../src/modules/ticket/constants/ticket.constants';
import type { EventTicket } from '../../src/modules/events/types';
import type { GroupSettings } from '../../src/modules/events/core/event.types';

describe('Ticket Module - Ticket Validation Service', () => {
  const baseNow = new Date('2026-05-15T12:00:00.000Z');

  const baseTicket = (overrides: Partial<EventTicket> = {}): EventTicket =>
    ({
      isActive: true,
      salesStartTime: new Date('2026-05-15T10:00:00.000Z'),
      salesEndTime: new Date('2026-05-15T14:00:00.000Z'),
      capacity: 100,
      sold: 0,
      isGroupTicket: false,
      groupSettings: undefined,
      ...overrides,
    }) as EventTicket;

  const groupSettings: GroupSettings = {
    minParticipants: 2,
    maxParticipants: 5,
    groupLeaderRequired: true,
  };

  describe('Ticket Validation Rules', () => {
    it('returns not found when ticket is missing', () => {
      const result = TicketRuleService.validateTicketForRegistration(null, 1, baseNow);
      expect(result.valid).toBe(false);
      expect(result.code).toBe(TicketErrorCode.TICKET_NOT_FOUND);
    });

    it('rejects invalid participant count', () => {
      const result = TicketRuleService.validateTicketForRegistration(baseTicket(), 0, baseNow);
      expect(result.valid).toBe(false);
      expect(result.code).toBe(TicketErrorCode.INVALID_PARTICIPANT_COUNT);
    });

    it('rejects inactive tickets', () => {
      const result = TicketRuleService.validateTicketForRegistration(
        baseTicket({ isActive: false }),
        1,
        baseNow,
      );
      expect(result.valid).toBe(false);
      expect(result.code).toBe(TicketErrorCode.TICKET_INACTIVE);
    });

    it('rejects sales that have not started', () => {
      const result = TicketRuleService.validateTicketForRegistration(
        baseTicket({ salesStartTime: new Date('2026-05-15T13:00:00.000Z') }),
        1,
        baseNow,
      );
      expect(result.valid).toBe(false);
      expect(result.code).toBe(TicketErrorCode.SALE_NOT_STARTED);
    });

    it('rejects sales that have ended', () => {
      const result = TicketRuleService.validateTicketForRegistration(
        baseTicket({ salesEndTime: new Date('2026-05-15T11:00:00.000Z') }),
        1,
        baseNow,
      );
      expect(result.valid).toBe(false);
      expect(result.code).toBe(TicketErrorCode.SALE_ENDED);
    });

    it('rejects group tickets without group settings', () => {
      const result = TicketRuleService.validateTicketForRegistration(
        baseTicket({ isGroupTicket: true, groupSettings: undefined }),
        3,
        baseNow,
      );
      expect(result.valid).toBe(false);
      expect(result.code).toBe(TicketErrorCode.INVALID_GROUP_SETTINGS);
    });

    it('rejects group sizes outside allowed range', () => {
      const result = TicketRuleService.validateTicketForRegistration(
        baseTicket({ isGroupTicket: true, groupSettings }),
        6,
        baseNow,
      );
      expect(result.valid).toBe(false);
      expect(result.code).toBe(TicketErrorCode.INVALID_GROUP_SIZE);
    });

    it('rejects sold out tickets', () => {
      const result = TicketRuleService.validateTicketForRegistration(
        baseTicket({ sold: 100 }),
        1,
        baseNow,
      );
      expect(result.valid).toBe(false);
      expect(result.code).toBe(TicketErrorCode.TICKET_SOLD_OUT);
    });

    it('accepts a valid ticket', () => {
      const result = TicketRuleService.validateTicketForRegistration(
        baseTicket({ isGroupTicket: true, groupSettings }),
        3,
        baseNow,
      );
      expect(result.valid).toBe(true);
      expect(result.code).toBeUndefined();
    });
  });

  describe('Sale Active Checks', () => {
    it('should validate sale is active', () => {
      const ticket = baseTicket();
      const isActive = TicketRuleService.isSaleActive(ticket, baseNow);
      expect(isActive).toBe(true);
    });

    it('should reject sale before start time', () => {
      const ticket = baseTicket({ salesStartTime: new Date('2026-05-15T13:00:00.000Z') });
      const isActive = TicketRuleService.isSaleActive(ticket, baseNow);
      expect(isActive).toBe(false);
    });

    it('should reject sale after end time', () => {
      const ticket = baseTicket({ salesEndTime: new Date('2026-05-15T11:00:00.000Z') });
      const isActive = TicketRuleService.isSaleActive(ticket, baseNow);
      expect(isActive).toBe(false);
    });
  });

  describe('Group Size Validation', () => {
    it('should accept valid group size', () => {
      const isValid = TicketRuleService.validateGroupSize(groupSettings, 3);
      expect(isValid).toBe(true);
    });

    it('should reject group size below minimum', () => {
      const isValid = TicketRuleService.validateGroupSize(groupSettings, 1);
      expect(isValid).toBe(false);
    });

    it('should reject group size above maximum', () => {
      const isValid = TicketRuleService.validateGroupSize(groupSettings, 6);
      expect(isValid).toBe(false);
    });
  });

  describe('Ticket Availability', () => {
    it('should indicate ticket is available', () => {
      const isAvailable = TicketRuleService.isTicketAvailable(100, 50);
      expect(isAvailable).toBe(true);
    });

    it('should indicate ticket is sold out', () => {
      const isAvailable = TicketRuleService.isTicketAvailable(100, 100);
      expect(isAvailable).toBe(false);
    });

    it('should handle tickets with no capacity', () => {
      const isAvailable = TicketRuleService.isTicketAvailable(0, 0);
      expect(isAvailable).toBe(false);
    });
  });
});
