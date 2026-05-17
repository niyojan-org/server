import { asyncHandler } from '@core/utils/asyncHandler';
import { AuthenticatedRequest } from '@core/middlewares/auth.middleware';
import { DesignTemplateService } from '../services/design-template.service';
import { objectIdSchema } from '@helpers/zod';

export const createDesignTemplate = asyncHandler<AuthenticatedRequest>(
  async (req, res) => {
    const template = await DesignTemplateService.create(req.body, req);
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
      data: template,
    });
  },
);

export const updateDesignTemplate = asyncHandler<AuthenticatedRequest>(
  async (req, res) => {
    const templateId = objectIdSchema.parse(req.params.id);
    const template = await DesignTemplateService.update(
      templateId,
      req.body,
      req,
    );
    res.status(200).json({
      success: true,
      message: 'Template updated successfully',
      data: template,
    });
  },
);

export const getDesignTemplateById = asyncHandler(async (req, res) => {
  const templateId = objectIdSchema.parse(req.params.id);
  const template = await DesignTemplateService.getById(templateId);
  res.status(200).json({
    success: true,
    data: template,
  });
});

export const listDesignTemplates = asyncHandler(async (req, res) => {
  const templates = await DesignTemplateService.list(req.query);
  res.status(200).json({
    success: true,
    data: templates,
  });
});
