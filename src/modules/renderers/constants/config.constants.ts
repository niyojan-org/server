export enum ImageFitType {
  COVER = 'cover',
  CONTAIN = 'contain',
  FILL = 'fill',
}

export enum RenderableAssetType {
  TICKET = 'ticket',
  BADGE = 'badge',
  ID_CARD = 'id-card',
  CERTIFICATE = 'certificate',
  GENERIC = 'generic',
}

export enum TemplateOwnerType {
  PLATFORM = 'platform',
  ORGANIZER = 'organizer',
}

export enum TemplateVisibility {
  PRIVATE = 'private',
  ORGANIZATION = 'organization',
  PUBLIC = 'public',
}

export enum TemplateStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
}

export enum TemplateOutputFormat {
  PNG = 'png',
  PDF = 'pdf',
  APPLE_WALLET = 'apple-wallet',
  GOOGLE_WALLET = 'google-wallet',
}

export enum ElementType {
  TEXT = 'text',
  QR = 'qr',
  IMAGE = 'image',
  BARCODE = 'barcode',
}

export enum AvailableFont {
  SOURCE_SANS_3 = 'SourceSans3',
  INTER = 'Inter',
  CAVEAT = 'Caveat',
  JETBRAINSMONO = 'JetBrainMono',
}

export enum TextAlignment {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
}

export enum QRCodeErrorCorrectionLevel {
  LOW = 'L',
  MEDIUM = 'M',
  QUARTILE = 'Q',
  HIGH = 'H',
}
