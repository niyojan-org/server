import z from "zod";

export const OrganizationUpdateSchema = z
  .object({
    description: z
      .string({ message: "Description must be a string" })
      .min(10, { message: "Description must be at least 10 characters long" })
      .max(1000, { message: "Description must be at most 1000 characters long" })
      .optional(),
    logo: z.url({ message: "Please provide a valid logo URL" }).optional(),
    address: z
      .object({
        locality: z.string({ message: "Locality is required" }).min(3).optional(),
        city: z.string({ message: "City is required" }).min(2).optional(),
        state: z.string({ message: "State is required" }).min(2).optional(),
        country: z.string({ message: "Country is required" }).min(2).optional(),
        zipCode: z.string({ message: "Zip code is required" }).min(4).optional(),
      })
      .optional(),
    supportContact: z
      .object({
        name: z.string({ message: "Support contact name is required" }).min(2).optional(),
        email: z.email("Please provide a valid support contact email address").optional(),
        phone: z
          .string({ message: "Support contact phone number is required" })
          .min(10, { message: "Support contact phone number must be at least 10 characters long" })
          .max(15, { message: "Support contact phone number must be at most 15 characters long" })
          .optional(),
      })
      .optional(),
    socialLinks: z
      .object({
        facebook: z.url("Please provide a valid Facebook URL").optional(),
        instagram: z.url("Please provide a valid Instagram URL").optional(),
        linkedin: z.url("Please provide a valid LinkedIn URL").optional(),
        twitter: z.url("Please provide a valid Twitter URL").optional(),
        youtube: z.url("Please provide a valid YouTube URL").optional(),
        blog: z.url("Please provide a valid Blog URL").optional(),
        website: z.url("Please provide a valid Website URL").optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      // Ensure at least one field is being updated
      return Object.keys(data).length > 0;
    },
    {
      message: "At least one field must be provided for update",
    },
  );

export type OrganizationUpdateInput = z.infer<typeof OrganizationUpdateSchema>;
