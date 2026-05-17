import { authenticate } from '@core/middlewares/auth.middleware';
import { validate } from '@core/middlewares/validate.middleware';
import { Router } from 'express';
import {
  createDesignTemplate,
  getDesignTemplateById,
  listDesignTemplates,
  updateDesignTemplate,
} from '../controllers/design-template.controller';
import {
  createDesignTemplateSchema,
  designTemplateParamsSchema,
  designTemplateQuerySchema,
  updateDesignTemplateSchema,
} from '../schema/design-template.schema';

const designTemplateRoutes = Router();

designTemplateRoutes.use(authenticate);

designTemplateRoutes.post(
  '/',
  validate({ body: createDesignTemplateSchema }),
  createDesignTemplate,
);
designTemplateRoutes.get('/', validate({ query: designTemplateQuerySchema }), listDesignTemplates);
designTemplateRoutes.get(
  '/:id',
  validate({ params: designTemplateParamsSchema }),
  getDesignTemplateById,
);
designTemplateRoutes.patch(
  '/:id',
  validate({
    params: designTemplateParamsSchema,
    body: updateDesignTemplateSchema,
  }),
  updateDesignTemplate,
);

export default designTemplateRoutes;
