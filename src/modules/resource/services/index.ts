/**
 * Resource Services
 * 
 * This module provides all resource-related business logic organized by operation type:
 * - Create: Resource creation operations
 * - Read: Single resource retrieval and counters
 * - Query: List, filter, and search resources
 * - Update: Resource modification operations
 * - Delete: Resource deletion operations (soft and hard)
 */

// Create operations
export { createResource } from "./create.service";

// Read operations
export { getResourceById, getPublicResourceById, incrementDownloadCount } from "./read.service";

// Query operations
export {
  listResources,
  listPublicResources,
  getResourcesByOrganization,
  getResourcesByEvent,
  getResourcesByUser,
} from "./query.service";

// Update operations
export {
  updateResource,
  replaceResourceFile,
  restoreResource,
} from "./update.service";

// Delete operations
export { deleteResource, batchDeleteResources } from "./delete.service";
