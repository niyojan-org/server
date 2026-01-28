import ApiError from "@core/errors/api.error";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { OrganizationRequest } from "@core/middlewares/organization.middleware";
import { sendOrganizationEmail } from "@infra/mail";
import { OrganizationRepository } from "@modules/organization/persistence/organization.repository";
import { OrganizationCreateSchema, OrganizationUpdateSchema } from "@modules/organization/types";
import writeOrganizationAudit from "../../../../audits/organization.audit";

export const createdOrg = async (req: AuthenticatedRequest) => {
  const validatedData = OrganizationCreateSchema.parse(req.body);
  const existingOrg = await OrganizationRepository.findByOwner(req.user!._id);
  if (existingOrg) {
    throw new ApiError(
      400,
      "You already own an organization.",
      "ORGANIZATION_EXISTS",
      "you are already owning an organization. At present, only one organization per user is allowed.",
    );
  }
  const organization = await OrganizationRepository.create({
    ...validatedData,
    owner: req.user!._id,
  });
  if (req.user) {
    req.user.organization = {
      id: organization._id,
      role: "owner",
      status: "active",
      joinedAt: new Date(),
    };
    await req.user.save();
  }
  writeOrganizationAudit({
    organizationId: organization._id.toString(),
    actorUserId: req.user!._id.toString(),
    actorRole: "owner",
    action: "ORGANIZATION_CREATED",
    severity: "info",
    targetType: "organization",
    targetId: organization._id.toString(),
    metadata: {
      message: `Organization ${organization.name} created by ${req.user!.name}`,
    },
    req,
  });
  await sendOrganizationEmail.organizationCreated(req.user!.email, {
    ownerName: req.user!.name,
    organizationName: organization.name,
    dashboardUrl: `https://admin.orgatick.in`,
  });
  return organization;
};

export const updateOrg = async (req: OrganizationRequest) => {
  const validatedData = OrganizationUpdateSchema.parse(req.body);

  const updatedOrganization = await OrganizationRepository.updateById(
    req.organization._id,
    validatedData,
  );

  if (!updatedOrganization) {
    throw new ApiError(404, "Organization not found.", "ORGANIZATION_NOT_FOUND");
  }

  return updatedOrganization;
};
