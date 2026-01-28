import { Types } from "mongoose";
import OrganizationModel, { OrganizationDocument } from "./organization.model";
import ApiError from "@core/errors/api.error";

export class OrganizationRepository {
  static async create(data: Partial<OrganizationDocument>) {
    const organization = await OrganizationModel.create(data);
    return organization;
  }

  static async find(input: string | Types.ObjectId) {
    let organization;
    if (input instanceof Types.ObjectId || Types.ObjectId.isValid(input)) {
      organization = await OrganizationModel.findById(input);
    } else {
      organization = await OrganizationModel.findOne({ slug: input });
    }
    if (!organization) {
      throw new ApiError(
        404,
        "Organization not found.",
        "ORGANIZATION_NOT_FOUND",
        "The organization you are trying to access does not exist.",
      );
    }
    return organization;
  }

  static async findById(id: string | Types.ObjectId) {
    return OrganizationModel.findById(id);
  }

  static async findBySlug(slug: string) {
    return OrganizationModel.findOne({ slug, active: true }).lean();
  }

  static async findByOwner(ownerId: string | Types.ObjectId) {
    return OrganizationModel.findOne({
      owner: ownerId,
      active: true,
    }).lean();
  }

  static async existsByEmail(email: string) {
    return OrganizationModel.exists({ email: email.toLowerCase() });
  }
  static async getOwnerName(organization: OrganizationDocument): Promise<string> {
    const populatedOrg = await organization.populate<{ owner: { name: string } }>("owner", "name");
    return populatedOrg.owner?.name || "";
  }

  static async existsBySlug(slug: string) {
    return OrganizationModel.exists({ slug });
  }

  static async updateById(id: string | Types.ObjectId, update: Partial<OrganizationDocument>) {
    return OrganizationModel.findByIdAndUpdate(id, { $set: update }, { new: true, lean: true });
  }

  static async deactivate(id: string | Types.ObjectId) {
    return OrganizationModel.findByIdAndUpdate(
      id,
      { $set: { active: false } },
      { new: true, lean: true },
    );
  }

  static async listForAdmin({
    verified,
    active,
    limit = 20,
    page = 1,
  }: {
    verified?: boolean;
    active?: boolean;
    limit?: number;
    page?: number;
  }) {
    const query: any = {};

    if (verified !== undefined) query.verified = verified;
    if (active !== undefined) query.active = active;

    return OrganizationModel.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
  }
}
