import { Types } from 'mongoose';
import { DesignTemplateQueryInput } from '../schema/design-template.schema';
import { DesignTemplate } from '../types/design-template.types';
import { DesignTemplateDocument, DesignTemplateModel } from '../persistence/design-template.model';
import * as configConstants from '@modules/renderers/constants/config.constants';

export class DesignTemplateRepository {
  static async create(payload: DesignTemplate): Promise<DesignTemplate> {
    const doc = new DesignTemplateModel(payload);
    const saved = await doc.save();
    return saved.toObject();
  }

  static async updateById(
    id: Types.ObjectId,
    payload: Partial<DesignTemplate>,
  ): Promise<DesignTemplate | null> {
    return DesignTemplateModel.findByIdAndUpdate(id, payload, {
      new: true,
    }).lean();
  }

  static async findById(id: Types.ObjectId): Promise<DesignTemplateDocument | null> {
    return DesignTemplateModel.findById(id).exec();
  }

  static async list(filters: DesignTemplateQueryInput): Promise<DesignTemplate[]> {
    const query: Record<string, unknown> = {};
    if (filters.renderType) query.renderType = filters.renderType;
    if (filters.visibility) query.visibility = filters.visibility;
    if (filters.status) query.status = filters.status;
    if (filters.ownerType) query.ownerType = filters.ownerType;
    if (filters.organizationId) query.organizationId = filters.organizationId;
    if (filters.eventId) query.eventIds = filters.eventId;
    if (filters.ticketId) query['ticketRefs.ticketId'] = filters.ticketId;
    if (!filters.includeArchived && !filters.status) {
      query.status = configConstants.TemplateStatus.ACTIVE;
    }
    return DesignTemplateModel.find(query).sort({ createdAt: -1 }).lean();
  }

  static async findApplicableTemplate(
    templateId: Types.ObjectId,
    eventId: Types.ObjectId,
    ticketId: Types.ObjectId,
  ): Promise<DesignTemplate | null> {
    return DesignTemplateModel.findOne({
      _id: templateId,
      status: configConstants.TemplateStatus.ACTIVE,
      $or: [
        { eventIds: { $size: 0 }, ticketRefs: { $size: 0 } },
        { eventIds: eventId },
        {
          ticketRefs: {
            $elemMatch: {
              eventId,
              ticketId,
            },
          },
        },
      ],
    }).lean();
  }
}
