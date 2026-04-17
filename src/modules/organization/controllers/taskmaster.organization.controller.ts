import { AuthenticatedRequest } from '@core/middlewares/auth.middleware';
import { asyncHandler } from '@core/utils/asyncHandler';
import ApiError from '@core/errors/api.error';
import OrganizationQuery from '../service/organization.query.service';
import { ListOrganizationsQuerySchema } from '../types/taskmaster.schemas';

const listOrganizations = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const query = ListOrganizationsQuerySchema.parse(req.query);
    const result = await OrganizationQuery.getOrganizations(query);
    res.status(200).json({
      success: true,
      message: 'Organizations fetched successfully.',
      data: result.organizations.docs,
      pagination: result.pagination,
    });
  },
);

const getOrganizationsSummary = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const summary = await OrganizationQuery.getSummary();
    res.status(200).json({
      success: true,
      message: 'Summary fetched successfully.',
      summary,
    });
  },
);

const getOrganizationById = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const organization = await OrganizationQuery.getOrganizationById(req);
    res.status(200).json({
      success: true,
      message: 'Organization fetched successfully.',
      data: organization,
    });
  },
);

const updateOrganization = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const organization = await OrganizationQuery.getOrganizationById(req);
    if (!organization) {
      throw new ApiError(
        404,
        'Organization not found.',
        'ORGANIZATION_NOT_FOUND',
      );
    }
    const updatedOrganization = await OrganizationQuery.updateOrganization(
      organization,
      req.body,
    );
    res.status(200).json({
      success: true,
      message: 'Organization updated successfully.',
      data: updatedOrganization,
    });
  },
);

export {
  listOrganizations,
  getOrganizationsSummary,
  getOrganizationById,
  updateOrganization,
};
