import fs from 'fs';
import path from 'path';
import { GlobalFonts } from '@napi-rs/canvas';
import { AvailableFont } from '../constants/config.constants';

export class FontRegistry {
  private static initialized = false;
  private static readonly fonts = [
    { family: AvailableFont.SOURCE_SANS_3, file: 'SourceSans3.ttf' },
    { family: AvailableFont.CAVEAT, file: 'Caveat.ttf' },
    { family: AvailableFont.INTER, file: 'Inter.ttf' },
    { family: AvailableFont.JETBRAINSMONO, file: 'JetBrainsMono.ttf' },
  ];
  static registerFonts() {
    // prevent duplicate registration
    if (this.initialized) {
      return;
    }
    for (const font of this.fonts) {
      const fontPath = path.join(process.cwd(), 'assets/fonts', font.file);
      if (!fs.existsSync(fontPath)) throw Error(`Font file not found: ${font.file} (${fontPath})`);
      const registered = GlobalFonts.registerFromPath(
        path.join(process.cwd(), 'assets/fonts', font.file),
        font.family,
      );
      if (!registered) throw Error(`Failed to register font: ${font.family}`);
    }
    this.initialized = true;
  }
}
