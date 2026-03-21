import { Types, Document } from "mongoose";
import { RESOURCE_TYPES, RESOURCE_STATUS } from "./resource.constants";

export type ResourceType = (typeof RESOURCE_TYPES)[number];
export type ResourceStatus = (typeof RESOURCE_STATUS)[number];

export interface ResourceMetadata {
  publicId?: string;
  folder?: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  resourceType?: "image" | "video" | "raw";
  [key: string]: any;
}

export interface Resource {
  _id?: Types.ObjectId;
  organizationId?: Types.ObjectId;
  eventId?: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  type: ResourceType;
  url: string;
  link?: string;
  description?: string;
  tags: string[];
  priority: number;
  status: ResourceStatus;
  metadata: ResourceMetadata;
  viewCount?: number;
  downloadCount?: number;
  isPublic: boolean;
  expiresAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ResourceDocument = Resource & Document;

export interface ResourceQueryFilters {
  page?: number;
  limit?: number;
  type?: ResourceType;
  status?: ResourceStatus;
  organizationId?: string;
  eventId?: string;
  userId?: string;
  tags?: string;
  search?: string;
  sort?: string;
  minPriority?: number;
  maxPriority?: number;
  createdFrom?: string;
  createdTo?: string;
  isPublic?: boolean;
}

export interface ResourceListResponse {
  resources: Resource[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
