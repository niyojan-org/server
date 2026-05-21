import { EventRepository } from '../persistence/event.repository';

/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns A URL-friendly slug
 */
const slugify = (text: string): string => {
  let slug = text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-');
  // Remove leading hyphen
  while (slug.startsWith('-')) {
    slug = slug.slice(1);
  }
  // Remove trailing hyphen
  while (slug.endsWith('-')) {
    slug = slug.slice(0, -1);
  }
  return slug;
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
