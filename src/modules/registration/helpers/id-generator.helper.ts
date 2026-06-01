/**
 * Generates human-readable alphanumeric registration and participant IDs
 * Format: YY{EVENT_CODE}{RANDOM_LETTER}-P{NUMBER}
 * Example: 26TECH-P01, 26EV01-P01 (8-9 chars)
 * 
 * Includes event information for better traceability and scalability
 */

export class IdGeneratorHelper {
  /**
   * Generates a base registration ID with year, event code, and random letter
   * Format: YY{EVENT_CODE}X where X is a random letter
   * Examples: 26TECH-A, 26EV01-K
   */
  static generateRegistrationIdBase(eventCode: string): string {
    const year = new Date().getFullYear().toString().slice(-2);
    const normalizedEventCode = eventCode.toUpperCase().substring(0, 4);
    const randomLetter = this.generateRandomLetters(1);
    return `${year}${normalizedEventCode}${randomLetter}`;
  }

  /**
   * Generates a participant ID
   * Format: PXX where XX is the participant number (01-99+)
   * Supports up to P99, P100, P101, etc.
   */
  static generateParticipantId(participantNumber: number): string {
    const paddedNumber = String(participantNumber).padStart(2, '0');
    return `P${paddedNumber}`;
  }

  /**
   * Generates full registration/participant ID
   * Format: YY{EVENT_CODE}X-PXX
   * Examples: 26TECH-P01, 26EV01-P02, 26CONF-P15
   */
  static generateFullId(registrationIdBase: string, participantNumber: number): string {
    const participantId = this.generateParticipantId(participantNumber);
    return `${registrationIdBase}-${participantId}`;
  }

  /**
   * Extracts event code from registration ID base
   * Example: "26TECHY" => "TECH"
   */
  static extractEventCodeFromIdBase(idBase: string): string {
    return idBase.substring(2, idBase.length - 1);
  }

  /**
   * Extracts year from registration ID base
   * Example: "26TECHY" => "26"
   */
  static extractYearFromIdBase(idBase: string): string {
    return idBase.substring(0, 2);
  }

  /**
   * Generates random uppercase letters
   */
  private static generateRandomLetters(length: number): string {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    return result;
  }
}
