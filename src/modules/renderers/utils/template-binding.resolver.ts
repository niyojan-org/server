import { EventDocument, Ticket } from '@modules/events/core/event.types';
import { OrganizationDocument } from '@modules/organization/types';
import { ParticipantDocument } from '@modules/participant/models/participant.model';
import { RegistrationDocument } from '@modules/registration/models/registration.model';

type BindingSources = {
  event?: EventDocument;
  participant?: ParticipantDocument;
  registration?: RegistrationDocument;
  ticket?: Ticket;
  organization?: OrganizationDocument;
};
type TemplateElement = { id: string; binding?: string };

export class TemplateBindingResolver {
  static resolveElements(elements: TemplateElement[], sources: BindingSources) {
    const resolvedPayload: Record<string, unknown> = {};
    for (const element of elements) {
      // skip no binding
      if (!element.binding) continue;
      // resolve binding
      const value = this.resolveBinding(element.binding, sources);
      // skip undefined/null
      if (value === undefined || value === null) continue;
      resolvedPayload[element.id] = value;
    }
    return resolvedPayload;
  }
  static resolveBinding(binding: string, sources: BindingSources) {
    // split: participant.name
    const paths = binding.split('.');
    // root source
    const root = paths.shift();
    if (!root || !sources[root as keyof BindingSources]) return undefined;
    // nested traversal
    let current = sources[root as keyof BindingSources];
    for (const path of paths) {
      if (current === undefined || current === null) return undefined;
      if (current instanceof Map) {
        current = current.get(path);
        continue;
      }
      current = (current as Record<string, any>)[path];
    }
    return current;
  }
}
