import { AuthenticatedRequest } from "@core/middlewares/auth.middleware";
import { OrganizationRequest } from "@core/middlewares/organization.middleware";
import { asyncHandler } from "@core/utils/asyncHandler";
import * as verificationService from "../service/verification";
import * as VSchemas from "../types/verification.schemas";

/* ---------- Owner/Org Controllers ---------- */

// check if org data is ready for verification
export const checkOrgVerificationReadiness = asyncHandler(async (req: OrganizationRequest, res) => {
  const result = verificationService.checkOrgDataValidity(req.organization);
  res.status(200).json({
    success: true,
    data: result,
    message: result.valid
      ? "Organization data is complete for verification"
      : "Some required data is missing",
  });
});

// raise org verification request
export const raiseOrgVerificationRequest = asyncHandler(async (req: OrganizationRequest, res) => {
  await verificationService.raiseOrgVerification(req);
  res.status(200).json({
    success: true,
    message: "Verification request submitted successfully",
  });
});

// raise bank verification request
export const raiseBankVerificationRequest = asyncHandler(async (req: OrganizationRequest, res) => {
  await verificationService.raiseBankVerification(req);
  res.status(200).json({
    success: true,
    message: "Bank verification request submitted successfully",
  });
});

/* ---------- Taskmaster Controllers ---------- */

// verify organization
export const verifyOrganizationRequest = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { orgId } = VSchemas.OrgIdParamSchema.parse(req.params);
  const validatedData = VSchemas.VerifyOrgSchema.parse(req.body);
  await verificationService.verifyOrganization(orgId, req, validatedData);
  res.status(200).json({
    success: true,
    message: "Organization verified successfully",
  });
});

// reject org verification
export const rejectOrganizationRequest = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { orgId } = VSchemas.OrgIdParamSchema.parse(req.params);
  const validatedData = VSchemas.RejectOrgVerificationSchema.parse(req.body);
  await verificationService.rejectOrganizationVerification(orgId, req, validatedData.reason);
  res.status(200).json({
    success: true,
    message: "Organization verification rejected",
  });
});

// verify bank details
export const verifyBankDetailsRequest = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { orgId } = VSchemas.OrgIdParamSchema.parse(req.params);
  const validatedData = VSchemas.VerifyBankDetailsSchema.parse(req.body);
  await verificationService.verifyBankDetails(orgId, req, validatedData);
  res.status(200).json({
    success: true,
    message: "Bank details verified successfully",
  });
});

// reject bank verification
export const rejectBankVerificationRequest = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const { orgId } = VSchemas.OrgIdParamSchema.parse(req.params);
    const validatedData = VSchemas.RejectBankVerificationSchema.parse(req.body);
    await verificationService.rejectBankVerification(orgId, req, validatedData.reason);
    res.status(200).json({
      success: true,
      message: "Bank verification rejected",
    });
  },
);

// verify document
export const verifyDocumentRequest = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { orgId } = VSchemas.OrgIdParamSchema.parse(req.params);
  const validatedData = VSchemas.VerifyDocumentSchema.parse(req.body);
  await verificationService.verifyDocument(orgId, validatedData.documentId, req);
  res.status(200).json({
    success: true,
    message: "Document verified successfully",
  });
});

// reject document
export const rejectDocumentRequest = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { orgId } = VSchemas.OrgIdParamSchema.parse(req.params);
  const validatedData = VSchemas.RejectDocumentSchema.parse(req.body);
  await verificationService.rejectDocument(
    orgId,
    validatedData.documentId,
    validatedData.reason,
    req,
  );
  res.status(200).json({
    success: true,
    message: "Document rejected successfully",
  });
});

// get pending org verifications
export const getPendingOrgVerifications = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const query = VSchemas.PendingVerificationsQuerySchema.parse(req.query);
  const result = await verificationService.getPendingVerifications({
    limit: query.limit,
    page: query.page,
  });
  res.status(200).json({
    success: true,
    data: result,
  });
});

// get pending bank verifications
export const getPendingBankVerifications = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const query = VSchemas.PendingVerificationsQuerySchema.parse(req.query);
  const result = await verificationService.getPendingBankVerifications({
    limit: query.limit,
    page: query.page,
  });
  res.status(200).json({
    success: true,
    data: result,
  });
});

// get pending document verifications
export const getPendingDocumentVerifications = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const query = VSchemas.PendingVerificationsQuerySchema.parse(req.query);
    const result = await verificationService.getPendingDocumentVerifications({
      limit: query.limit,
      page: query.page,
    });
    res.status(200).json({
      success: true,
      data: result,
    });
  },
);

// unverify organization
export const unverifyOrganizationRequest = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { orgId } = VSchemas.OrgIdParamSchema.parse(req.params);
  await verificationService.unverifyOrganization(orgId, req);
  res.status(200).json({
    success: true,
    message: "Organization unverified successfully",
  });
});
