import OrganizationModel from "../../persistence/organization.model";

// get pending org verifications
export const getPendingVerifications = async (options: { limit: number; page: number }) => {
  const { limit, page } = options;
  const skip = (page - 1) * limit;
  return OrganizationModel.find({ reqForVerification: true, verified: false })
    .populate("owner")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// get pending bank verifications
export const getPendingBankVerifications = async (options: { limit: number; page: number }) => {
  const { limit, page } = options;
  const skip = (page - 1) * limit;
  return await OrganizationModel.find({
    "bankDetails.reqForVerification": true,
    "bankDetails.verified": false,
  })
    .populate("owner", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};

// get orgs with unverified documents
export const getPendingDocumentVerifications = async (options: { limit: number; page: number }) => {
  const { limit, page } = options;
  const skip = (page - 1) * limit;
  return OrganizationModel.find({
    documents: { $elemMatch: { verified: false, rejected: false } },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
};
