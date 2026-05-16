import assert from 'node:assert/strict';
import { TicketRuleService } from '../../src/modules/ticket/services/ticket-validation.service';
import { TicketErrorCode } from '../../src/modules/ticket/constants/ticket.constants';
import type { EventTicket } from '../../src/modules/events/types';
import type { GroupSettings } from '../../src/modules/events/core/event.types';

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

const cases: Array<[string, () => void]> = [
  ['returns not found when ticket is missing', () => {
    const result = TicketRuleService.validateTicketForRegistration(null, 1, baseNow);
    assert.equal(result.valid, false);
    assert.equal(result.code, TicketErrorCode.TICKET_NOT_FOUND);
  }],
  ['rejects invalid participant count', () => {
    const result = TicketRuleService.validateTicketForRegistration(baseTicket(), 0, baseNow);
    assert.equal(result.valid, false);
    assert.equal(result.code, TicketErrorCode.INVALID_PARTICIPANT_COUNT);
  }],
  ['rejects inactive tickets', () => {
    const result = TicketRuleService.validateTicketForRegistration(
      baseTicket({ isActive: false }),
      1,
      baseNow,
    );
    assert.equal(result.valid, false);
    assert.equal(result.code, TicketErrorCode.TICKET_INACTIVE);
  }],
  ['rejects sales that have not started', () => {
    const result = TicketRuleService.validateTicketForRegistration(
      baseTicket({ salesStartTime: new Date('2026-05-15T13:00:00.000Z') }),
      1,
      baseNow,
    );
    assert.equal(result.valid, false);
    assert.equal(result.code, TicketErrorCode.SALE_NOT_STARTED);
  }],
  ['rejects sales that have ended', () => {
    const result = TicketRuleService.validateTicketForRegistration(
      baseTicket({ salesEndTime: new Date('2026-05-15T11:00:00.000Z') }),
      1,
      baseNow,
    );
    assert.equal(result.valid, false);
    assert.equal(result.code, TicketErrorCode.SALE_ENDED);
  }],
  ['rejects group tickets without group settings', () => {
    const result = TicketRuleService.validateTicketForRegistration(
      baseTicket({ isGroupTicket: true, groupSettings: undefined }),
      3,
      baseNow,
    );
    assert.equal(result.valid, false);
    assert.equal(result.code, TicketErrorCode.INVALID_GROUP_SETTINGS);
  }],
  ['rejects group sizes outside allowed range', () => {
    const result = TicketRuleService.validateTicketForRegistration(
      baseTicket({ isGroupTicket: true, groupSettings }),
      6,
      baseNow,
    );
    assert.equal(result.valid, false);
    assert.equal(result.code, TicketErrorCode.INVALID_GROUP_SIZE);
  }],
  ['rejects sold out tickets', () => {
    const result = TicketRuleService.validateTicketForRegistration(
      baseTicket({ sold: 100 }),
      1,
      baseNow,
    );
    assert.equal(result.valid, false);
    assert.equal(result.code, TicketErrorCode.TICKET_SOLD_OUT);
  }],
  ['accepts a valid ticket', () => {
    const result = TicketRuleService.validateTicketForRegistration(
      baseTicket({ isGroupTicket: true, groupSettings }),
      3,
      baseNow,
    );
    assert.equal(result.valid, true);
    assert.equal(result.code, undefined);
  }],
];

for (const [name, run] of cases) {
  try {
    run();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`fail - ${name}`);
    throw error;
  }
}

console.log(`\n${cases.length} ticket validation checks passed.`);
