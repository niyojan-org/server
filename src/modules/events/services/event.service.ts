import { Event } from "../core/event.types";
import { generateUniqueSlug } from "../helper/slug";
import { EventRepository } from "../persistence/event.repository";

export const createNewEvent = async (event: Event) => {
  const slug = await generateUniqueSlug(event.title);
  event.slug = slug;
  const newEvent = await EventRepository.create(event);
  return newEvent;
};
