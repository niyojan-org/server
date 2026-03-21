// data validation helpers for verification

export const checkOrgDataValidity = (org: any): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  // basic fields
  if (!org.name || org.name.length < 3) missing.push("name (min 3 chars)");
  if (!org.email) missing.push("email");
  if (!org.phone || org.phone.length < 10) missing.push("phone (min 10 chars)");
  if (!org.description || org.description.length < 10) missing.push("description (min 10 chars)");
  if (!org.category) missing.push("category");

  // address
  if (!org.address) {
    missing.push("address");
  } else {
    if (!org.address.locality) missing.push("address.locality");
    if (!org.address.city) missing.push("address.city");
    if (!org.address.state) missing.push("address.state");
    if (!org.address.country) missing.push("address.country");
    if (!org.address.zipCode) missing.push("address.zipCode");
  }

  // support contact
  if (!org.supportContact) {
    missing.push("supportContact");
  } else {
    if (!org.supportContact.name) missing.push("supportContact.name");
    if (!org.supportContact.email) missing.push("supportContact.email");
    if (!org.supportContact.phone) missing.push("supportContact.phone");
  }

  // social links
  if (!org.socialLinks || Object.keys(org.socialLinks).length === 0) {
    missing.push("socialLinks (at least one)");
  }

  // documents
  if (!org.documents || org.documents.length === 0) {
    missing.push("documents (at least one)");
  }

  return { valid: missing.length === 0, missing };
};

export const checkBankDataValidity = (bankDetails: any): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];

  if (!bankDetails) return { valid: false, missing: ["bankDetails"] };

  if (!bankDetails.accountHolderName || bankDetails.accountHolderName.length < 3) {
    missing.push("accountHolderName (min 3 chars)");
  }
  if (!bankDetails.bankName || bankDetails.bankName.length < 3) {
    missing.push("bankName (min 3 chars)");
  }
  if (!bankDetails.branchName || bankDetails.branchName.length < 3) {
    missing.push("branchName (min 3 chars)");
  }
  if (!bankDetails.accountNumber || bankDetails.accountNumber.length < 5) {
    missing.push("accountNumber (min 5 chars)");
  }
  if (!bankDetails.ifscCode || bankDetails.ifscCode.length < 4) {
    missing.push("ifscCode (min 4 chars)");
  }

  return { valid: missing.length === 0, missing };
};
