/**
 * Resource Service
 * 
 * Main service file that re-exports all resource operations from organized sub-services.
 * This file maintains backward compatibility while the actual implementation is now
 * organized in the ./services folder.
 * 
 * Service Organization:
 * - services/create.service.ts - Resource creation
 * - services/read.service.ts - Single resource retrieval
 * - services/query.service.ts - List, filter, and search operations
 * - services/update.service.ts - Resource updates and modifications
 * - services/delete.service.ts - Deletion operations (soft and hard)
 */

export * from "./services";
