import { TemplateConfig } from '../template-config.schema';

export interface RenderContext {
  participant: Record<string, unknown>;
  event: Record<string, unknown>;
  ticket: Record<string, unknown>;
  registration: Record<string, unknown>;
  dynamicFields: Record<string, unknown>;
}

export interface RenderResult {
  buffer: Buffer;
  mimeType: string;
  width: number;
  height: number;
}

export interface AssetRenderer {
  format: string;
  render(config: TemplateConfig, context: RenderContext): Promise<RenderResult>;
}
