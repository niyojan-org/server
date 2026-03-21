import ApiError from "@core/errors/api.error";
import { OrganizationRequest } from "@core/middlewares/organization.middleware";
import { OrganizationRepository } from "@modules/organization/persistence/organization.repository";
import { OrganizationUpdateSchema } from "@modules/organization/types";

const updateAnOrganization = async (req: OrganizationRequest) => {
  const validatedData = OrganizationUpdateSchema.parse(req.body);
  const updateData: Record<string, any> = {};
  if (validatedData.description !== undefined) {
    updateData.description = validatedData.description;
  }
  if (validatedData.logo !== undefined) {
    updateData.logo = validatedData.logo;
  }
  // Handle nested address object with dot notation
  if (validatedData.address) {
    Object.entries(validatedData.address).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[`address.${key}`] = value;
      }
    });
  }

  // Handle nested supportContact object with dot notation
  if (validatedData.supportContact) {
    Object.entries(validatedData.supportContact).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[`supportContact.${key}`] = value;
      }
    });
  }

  // Handle nested socialLinks object with dot notation
  if (validatedData.socialLinks) {
    Object.entries(validatedData.socialLinks).forEach(([key, value]) => {
      if (value !== undefined) {
        updateData[`socialLinks.${key}`] = value;
      }
    });
  }

  const updatedOrganization = await OrganizationRepository.updateById(
    req.organization._id,
    updateData,
  );

  if (!updatedOrganization) {
    throw new ApiError(404, "Organization not found.", "ORGANIZATION_NOT_FOUND");
  }

  return updatedOrganization;
};

export default updateAnOrganization;
