import { EventRepository } from '../persistence/event.repository';

/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns A URL-friendly slug
 */
const slugify = (text: string): string => {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Remove all non-word chars (except hyphens)
      .replace(/[^\w-]+/g, '')
      // Replace multiple hyphens with single hyphen
      .replace(/--+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  );
};

export const generateUniqueSlug = async (title: string): Promise<string> => {
  const baseSlug = slugify(title);
  let slug = baseSlug;
  let counter = 1;

  // Check if slug already exists and increment counter if needed
  while (await EventRepository.findBySlug(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
