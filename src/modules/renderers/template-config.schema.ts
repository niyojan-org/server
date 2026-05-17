import { z } from 'zod';
import * as configConstants from './constants/config.constants';

export const RenderableAssetType = z.enum(configConstants.RenderableAssetType, {
  message: 'Invalid renderable asset type',
});

export const TemplateVisibility = z.enum(configConstants.TemplateVisibility, {
  message: 'Invalid template visibility',
});

export const TemplateOwnerType = z.enum(configConstants.TemplateOwnerType, {
  message: 'Invalid template owner type',
});

export const TemplateStatus = z.enum(configConstants.TemplateStatus, {
  message: 'Invalid template status',
});

export const TemplateOutputFormat = z
  .enum(configConstants.TemplateOutputFormat, {
    message: 'Invalid output format',
  })
  .default(configConstants.TemplateOutputFormat.PNG);

export const ElementType = z.enum(configConstants.ElementType, { message: 'Invalid element type' });

const textStyleSchema = z
  .object({
    fontSize: z
      .number({ message: 'Font size must be a number' })
      .min(8, 'Font size must be at least 8')
      .max(256, 'Font size cannot exceed 256')
      .default(24),

    color: z
      .string({ message: 'Text color is required' })
      .min(7, 'Text color must be a valid hex code (e.g., #111111)')
      .max(7, 'Text color must be a valid hex code (e.g., #111111)')
      .default('#111111'),

    fontFamily: z
      .enum(configConstants.AvailableFont, { message: 'Invalid font family' })
      .default(configConstants.AvailableFont.SOURCE_SANS_3),

    fontWeight: z
      .union([z.string(), z.number()], { message: 'Font weight must be a string or number' })
      .default('normal'),

    align: z
      .enum(configConstants.TextAlignment, { message: 'Invalid text alignment' })
      .default(configConstants.TextAlignment.LEFT),

    uppercase: z.boolean({ message: 'Uppercase must be a boolean value' }).default(false),

    maxLength: z
      .number({ message: 'Max length must be a number' })
      .int('Max length must be an integer')
      .min(1, 'Max length must be at least 1')
      .max(100, 'Max length cannot exceed 100')
      .optional(),

    letterSpacing: z
      .number({ message: 'Letter spacing must be a number' })
      .min(-10, 'Letter spacing cannot be less than -10')
      .max(100, 'Letter spacing cannot exceed 100')
      .default(0),
  })
  .strict();

const qrStyleSchema = z
  .object({
    margin: z
      .number({ message: 'QR margin must be a number' })
      .int('QR margin must be an integer')
      .min(0, 'QR margin cannot be negative')
      .max(20, 'QR margin cannot exceed 20')
      .default(1),

    errorCorrectionLevel: z
      .enum(configConstants.QRCodeErrorCorrectionLevel, {
        message: 'QR error correction level must be LOW, MEDIUM, QUARTILE, or HIGH',
      })
      .default(configConstants.QRCodeErrorCorrectionLevel.MEDIUM),
  })
  .strict();

const imageStyleSchema = z
  .object({
    fit: z
      .enum(configConstants.ImageFitType, { message: 'Image fit must be cover, contain, or fill' })
      .default(configConstants.ImageFitType.COVER),
    borderWidth: z
      .number({ message: 'Border width must be a number' })
      .min(0, 'Border width cannot be negative')
      .max(100, 'Border width cannot exceed 100')
      .default(0),
    borderRadius: z
      .number({ message: 'Border radius must be a number' })
      .min(0, 'Border radius cannot be negative')
      .max(200, 'Border radius cannot exceed 200')
      .default(0),
  })
  .strict();

const barcodeStyleSchema = z
  .object({
    lineColor: z
      .string({ message: 'Barcode line color is required' })
      .min(1, 'Barcode line color cannot be empty')
      .max(32, 'Barcode line color is too long')
      .default('#111111'),
  })
  .strict();

const templateElementBaseSchema = z
  .object({
    id: z
      .string({ message: 'Element ID is required' })
      .min(1, 'Element ID cannot be empty')
      .max(100, 'Element ID cannot exceed 100 characters'),
    type: ElementType,
    x: z
      .number({ message: 'Element X position must be a number' })
      .min(0, 'Element X position cannot be negative'),
    y: z
      .number({ message: 'Element Y position must be a number' })
      .min(0, 'Element Y position cannot be negative'),
    width: z
      .number({ message: 'Element width must be a number' })
      .min(1, 'Element width must be at least 1')
      .max(5000, 'Element width cannot exceed 5000'),
    height: z
      .number({ message: 'Element height must be a number' })
      .min(1, 'Element height must be at least 1')
      .max(5000, 'Element height cannot exceed 5000'),
    zIndex: z
      .number({ message: 'Z-index must be a number' })
      .int('Z-index must be an integer')
      .min(0, 'Z-index cannot be negative')
      .default(0),
    opacity: z
      .number({ message: 'Opacity must be a number' })
      .min(0, 'Opacity cannot be less than 0')
      .max(1, 'Opacity cannot exceed 1')
      .default(1),
    rotation: z
      .number({ message: 'Rotation must be a number' })
      .min(-360, 'Rotation cannot be less than -360')
      .max(360, 'Rotation cannot exceed 360')
      .default(0),
    binding: z
      .string({ message: 'Binding must be a string' })
      .min(1, 'Binding cannot be empty')
      .max(200, 'Binding cannot exceed 200 characters')
      .optional(),
    staticValue: z
      .string({ message: 'Static value must be a string' })
      .max(5000, 'Static value cannot exceed 5000 characters')
      .optional(),
  })
  .strict();

const textElementSchema = templateElementBaseSchema.extend({
  type: z.literal('text'),
  style: textStyleSchema,
});

const qrElementSchema = templateElementBaseSchema.extend({
  type: z.literal('qr'),
  style: qrStyleSchema.optional(),
});

const imageElementSchema = templateElementBaseSchema.extend({
  type: z.literal('image'),
  src: z.url('Image source must be a valid URL').optional(),
  style: imageStyleSchema.optional(),
});

const barcodeElementSchema = templateElementBaseSchema.extend({
  type: z.literal('barcode'),
  style: barcodeStyleSchema.optional(),
});

export const templateElementSchema = z.discriminatedUnion('type', [
  textElementSchema,
  qrElementSchema,
  imageElementSchema,
  barcodeElementSchema,
]);

export const templateConfigSchema = z
  .object(
    {
      canvas: z
        .object({
          width: z
            .number({ message: 'Canvas width is required' })
            .int('Canvas width must be an integer')
            .min(100, 'Canvas width must be at least 100')
            .max(8000, 'Canvas width cannot exceed 8000'),

          height: z
            .number({ message: 'Canvas height is required' })
            .int('Canvas height must be an integer')
            .min(100, 'Canvas height must be at least 100')
            .max(8000, 'Canvas height cannot exceed 8000'),
        })
        .strict(),

      background: z
        .object({
          url: z.url('Background image URL must be a valid URL'),
          fit: z
            .enum(configConstants.ImageFitType, { message: 'Invalid background fit type' })
            .default(configConstants.ImageFitType.COVER),
        })
        .strict(),

      elements: z
        .array(templateElementSchema, { message: 'Elements must be an array' })
        .min(2, 'At least 2 template elements are required')
        .max(100, 'No more than 100 template elements are allowed')
        .default([]),

      output: z
        .object({
          format: TemplateOutputFormat,
          quality: z
            .number({ message: 'Output quality must be a number' })
            .int('Output quality must be an integer')
            .min(1, 'Output quality must be at least 1')
            .max(100, 'Output quality cannot exceed 100')
            .default(92),
        })
        .strict()
        .default({ format: configConstants.TemplateOutputFormat.PNG, quality: 92 }),
    },
    { message: 'Invalid template configuration' },
  )
  .strict();

export type TemplateConfig = z.infer<typeof templateConfigSchema>;
export type TemplateElement = z.infer<typeof templateElementSchema>;
