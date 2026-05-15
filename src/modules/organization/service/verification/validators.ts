// data validation helpers for verification

export const checkOrgDataValidity = (
  org: Record<string, unknown>,
): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  const orgData = org as Record<string, unknown>;
  const address = orgData.address as Record<string, unknown> | undefined;
  const supportContact = orgData.supportContact as
    | Record<string, unknown>
    | undefined;
  const socialLinks = orgData.socialLinks as Record<string, unknown> | undefined;
  const documents = orgData.documents as unknown[] | undefined;

  // basic fields
  if (typeof orgData.name !== "string" || orgData.name.length < 3) {
    missing.push("name (min 3 chars)");
  }
  if (typeof orgData.email !== "string" || orgData.email.length === 0) {
    missing.push("email");
  }
  if (typeof orgData.phone !== "string" || orgData.phone.length < 10) {
    missing.push("phone (min 10 chars)");
  }
  if (typeof orgData.description !== "string" || orgData.description.length < 10) {
    missing.push("description (min 10 chars)");
  }
  if (!orgData.category) missing.push("category");

  // address
  if (!address) {
    missing.push("address");
  } else {
    if (!address.locality) missing.push("address.locality");
    if (!address.city) missing.push("address.city");
    if (!address.state) missing.push("address.state");
    if (!address.country) missing.push("address.country");
    if (!address.zipCode) missing.push("address.zipCode");
  }

  // support contact
  if (!supportContact) {
    missing.push("supportContact");
  } else {
    if (!supportContact.name) missing.push("supportContact.name");
    if (!supportContact.email) missing.push("supportContact.email");
    if (!supportContact.phone) missing.push("supportContact.phone");
  }

  // social links
  if (!socialLinks || Object.keys(socialLinks).length === 0) {
    missing.push("socialLinks (at least one)");
  }

  // documents
  if (!documents || documents.length === 0) {
    missing.push("documents (at least one)");
  }

  return { valid: missing.length === 0, missing };
};

export const checkBankDataValidity = (
  bankDetails: Record<string, unknown> | null | undefined,
): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!bankDetails) return { valid: false, missing: ["bankDetails"] };

  const accountHolderName = bankDetails.accountHolderName as string | undefined;
  const bankName = bankDetails.bankName as string | undefined;
  const branchName = bankDetails.branchName as string | undefined;
  const accountNumber = bankDetails.accountNumber as string | undefined;
  const ifscCode = bankDetails.ifscCode as string | undefined;

  if (!accountHolderName || accountHolderName.length < 3) {
    missing.push("accountHolderName (min 3 chars)");
  }
  if (!bankName || bankName.length < 3) {
    missing.push("bankName (min 3 chars)");
  }
  if (!branchName || branchName.length < 3) {
    missing.push("branchName (min 3 chars)");
  }
  if (!accountNumber || accountNumber.length < 5) {
    missing.push("accountNumber (min 5 chars)");
  }
  if (!ifscCode || ifscCode.length < 4) {
    missing.push("ifscCode (min 4 chars)");
  }

  return { valid: missing.length === 0, missing };
};
