import ApiError from "@core/errors/api.error";
import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { sendOrganizationEmail } from "@infra/mail";
import { OrganizationRepository } from "@modules/organization/persistence/organization.repository";
import { OrganizationCreateSchema } from "@modules/organization/types";
import writeOrganizationAudit from "../../../../audits/organization.audit";

const createAnOrganization = async (req: AuthenticatedRequest) => {
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

export default createAnOrganization;
