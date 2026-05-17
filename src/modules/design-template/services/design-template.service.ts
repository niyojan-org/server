import ApiError from '@core/errors/api.error';
import { AuthenticatedRequest } from '@core/middlewares/auth.middleware';
import { Types } from 'mongoose';
import {
  CreateDesignTemplateInput,
  DesignTemplateQueryInput,
  UpdateDesignTemplateInput,
} from '../schema/design-template.schema';
import { templateConfigSchema } from '@modules/renderers';
import { DesignTemplateRepository } from '../repository/design-template.repository';
import { DesignTemplate } from '../types/design-template.types';

export class DesignTemplateService {
  private static toObjectId(id: Types.ObjectId | string) {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  static async create(input: CreateDesignTemplateInput, req: AuthenticatedRequest) {
    const config = templateConfigSchema.parse(input.config);
    const payload: DesignTemplate = {
      ...input,
      config,
      createdBy: req.user._id,
      updatedBy: req.user._id,
      version: 1,
    };
    return DesignTemplateRepository.create(payload);
  }

  static async update(
    id: Types.ObjectId | string,
    input: UpdateDesignTemplateInput,
    req: AuthenticatedRequest,
  ) {
    const objectId = this.toObjectId(id);
    const existing = await DesignTemplateRepository.findById(objectId);
    if (!existing) {
      throw new ApiError(
        404,
        'Template not found',
        'TEMPLATE_NOT_FOUND',
        `No design template found with ID ${id.toString()}`,
      );
    }
    const config = input.config ? templateConfigSchema.parse(input.config) : undefined;
    const nextVersion = config ? existing.version + 1 : existing.version;
    const updated = await DesignTemplateRepository.updateById(objectId, {
      ...input,
      config,
      version: nextVersion,
      updatedBy: req.user._id,
    });
    if (!updated) {
      throw new ApiError(
        500,
        'Failed to update template',
        'TEMPLATE_UPDATE_ERROR',
      );
    }
    return updated;
  }

  static async getById(id: Types.ObjectId | string) {
    const objectId = this.toObjectId(id);
    const template = await DesignTemplateRepository.findById(objectId);
    if (!template) {
      throw new ApiError(
        404,
        'Template not found',
        'TEMPLATE_NOT_FOUND',
        `No design template found with ID ${id.toString()}`,
      );
    }
    return template;
  }

  static async list(filters: DesignTemplateQueryInput) {
    return DesignTemplateRepository.list(filters);
  }
}
