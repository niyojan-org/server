import { TicketErrorCode } from '../constants/ticket.constants';

export interface TicketValidationResult {
  valid: boolean;
  code?: TicketErrorCode;
  message?: string;
}
