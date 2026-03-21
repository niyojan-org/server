import { asyncHandler } from "@core/utils/asyncHandler";
import { OrganizationRepository } from "../persistence/organization.repository";
import { OrganizationBankInputSchema } from "../types";

export const addBankDetails = asyncHandler(async (req, res) => {
  const data = OrganizationBankInputSchema.parse(req.body);
  const updatedOrganization = await OrganizationRepository.updateById(req.organization._id, { bankDetails: data });
  res.status(200).json({
    message: "Bank details updated successfully",
    bankDetails: updatedOrganization?.bankDetails,
  });
});
