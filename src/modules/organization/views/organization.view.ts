import { Organization, OrganizationDocument, organizationSchema } from "../types";
import { ORGANIZATION_ROLES } from "@modules/user/user.constants";

const OwnerOrganizationViewSchema = organizationSchema;
const AdminOrganizationViewSchema = organizationSchema;
const ManagerOrganizationViewSchema = organizationSchema.omit({
  bankDetails: true,
  documents: true,
});
const MemberOrganizationViewSchema = organizationSchema.pick({
  name: true,
  slug: true,
  category: true,
  subCategory: true,
  description: true,
  verified: true,
  supportContact: true,
  logo: true,
  socialLinks: true,
  trustScore: true,
  active: true,
  allowsPaidEvents: true,
  createdAt: true,
});

const getOrganizationView = (
  organization: Organization,
  role: (typeof ORGANIZATION_ROLES)[number],
) => {
  switch (role) {
    case "owner":
      return OwnerOrganizationViewSchema.parse(organization);
    case "admin":
      return AdminOrganizationViewSchema.parse(organization);
    case "manager":
      return ManagerOrganizationViewSchema.parse(organization);
    case "member":
    case "volunteer":
      return MemberOrganizationViewSchema.parse(organization);
    default:
      return MemberOrganizationViewSchema.parse(organization);
  }
};

export default getOrganizationView;