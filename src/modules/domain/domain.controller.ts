import { asyncHandler } from "@core/utils/asyncHandler";
import * as domainService from "./domain.service";
import { CreateDomain } from "./domain.schema";

export const createDomain = asyncHandler(async (req, res) => {
  const domain = await domainService.createDomain(req.body);
  res.status(201).json({
    success: true,
    message: "Domain created successfully",
    data: domain,
  });
});

//GET DOMAINS
export const getDomains = asyncHandler(async (req, res) => {
  const domains = await domainService.getDomains();
  res.status(200).json({
    success: true,
    message: "Domains fetched successfully",
    data: domains,
  });
});

export const getDomainById = asyncHandler(async (req, res) => {
  const domain = await domainService.getDomainById(req.params.id);
  res.status(200).json({
    success: true,
    message: "Domain fetched successfully",
    data: domain,
  });
});

export const getDomainByEnv = asyncHandler(async (req, res) => {

  const domains = await domainService.getDomainByEnv(req.params.env);
  res.status(200).json({
    success: true,
    message: "Domains fetched successfully",
    data: domains,
  });
});

export const getDomainByPurposeAndEnv = asyncHandler(async (req, res) => {
  const { purpose, env } = req.params;
  const domains = await domainService.getDomainByPurposeAndEnv(
    purpose as keyof CreateDomain["purposes"],
    env as string
  );
  res.status(200).json({
    success: true,
    message: "Domains fetched successfully",
    data: domains,
  });
});

export const validateDomainPurpose = asyncHandler(async (req, res) => {
  const { domain, environment, purpose } = req.query;
  const isValid = await domainService.validateDomainPurpose(
    domain as string,
    environment as string,
    purpose as keyof CreateDomain["purposes"]
  );
  res.status(200).json({
    success: true,
    message: "Domain validation completed successfully",
    data: { isValid },
  });
});

//UPDATE DOMAIN
export const updateDomain = asyncHandler(async (req, res) => {
  const domain = await domainService.updateDomain(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: "Domain updated successfully",
    data: domain,
  });
});

//DELETE DOMAIN
export const deleteDomain = asyncHandler(async (req, res) => {
  await domainService.deleteDomain(req.params.id);
  res.status(200).json({
    success: true,
    message: "Domain deleted successfully",
  });
});
