import path from 'path';
import { createCanvas, loadImage, SKRSContext2D } from '@napi-rs/canvas';
import QRCode from 'qrcode';
import { TemplateConfig, TemplateElement } from '../template-config.schema';

type RenderPayload = Record<string, unknown>;

export class CanvasRenderService {
  // main render function
  static async renderTemplate(template: TemplateConfig, payload: RenderPayload): Promise<Buffer> {
    const { width, height } = template.canvas;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');
    //draw background
    if (template.background?.url) {
      try {
        const background = await loadImage(template.background.url);
        ctx.drawImage(background, 0, 0, width, height);
      } catch {
        // TODO: optional fallback background
      }
    }
    // sort by z-index
    const elements = [...template.elements].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
    // render all elements

    for (const element of elements) {
      const value = payload[element.id];
      // skip empty bindings
      if (value === undefined || value === null) continue;
      switch (element.type) {
        case 'text':
          this.renderText(ctx, element, String(value));
          break;
        case 'qr':
          await this.renderQrCode(ctx, element, String(value));
          break;
        case 'barcode':
          await this.renderBarCode(ctx, element, String(value));
          break;
        case 'image':
          break;
      }
    }
    return canvas.toBuffer('image/png');
  }

  // render text
  private static renderText(
    ctx: SKRSContext2D,
    element: Extract<TemplateElement, { type: 'text' }>,
    text: string,
  ) {
    const style = element.style;
    if (style.uppercase) {
      text = text.toUpperCase();
    }
    if (style.maxLength && text.length > style.maxLength) {
      text = `${text.slice(0, style.maxLength)}...`;
    }
    ctx.font = `
      ${style.fontWeight ?? 'normal'}
      ${style.fontSize ?? 20}px
      ${style.fontFamily ?? 'sans-serif'}
    `;
    ctx.fillStyle = style.color ?? '#000000';
    switch (style.align) {
      case 'center':
        ctx.textAlign = 'center';
        break;
      case 'right':
        ctx.textAlign = 'right';
        break;
      default:
        ctx.textAlign = 'left';
    }

    let drawX = element.x;
    if (style.align === 'center') {
      drawX = element.x + element.width / 2;
    }
    if (style.align === 'right') {
      drawX = element.x + element.width;
    }
    ctx.fillText(text, drawX, element.y + element.height);
  }
  // render qr

  private static async renderQrCode(
    ctx: SKRSContext2D,
    element: Extract<TemplateElement, { type: 'qr' }>,
    value: string,
  ) {
    const qrDataUrl = await QRCode.toDataURL(value, {
      margin: element.style?.margin ?? 0,
      errorCorrectionLevel: element.style?.errorCorrectionLevel ?? 'H',
    });
    const qrImage = await loadImage(qrDataUrl);
    ctx.drawImage(qrImage, element.x, element.y, element.width, element.height);
  }

  private static async renderBarCode(
    ctx: SKRSContext2D,
    element: Extract<TemplateElement, { type: 'barcode' }>,
    value: string,
  ) {
    //TODO add barcode
  }
}
