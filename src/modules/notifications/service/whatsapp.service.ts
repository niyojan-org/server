import env from '@config/env';
import axios from 'axios';

class WhatsappService {
  private static readonly whatsappApi = axios.create({
    baseURL: env.WHATSAPP_API_URL,
    headers: {
      'Content-Type': 'application/json',
      'x-internal-token': `${env.WHATSAPP_API_KEY}`,
    },
  });

  static async sendMediaMessage(to: string, media: string, caption?: string) {
    try {
      const payload = { to, media, caption, session: env.WHATSAPP_SESSION };
      await this.whatsappApi.post('/wa/message', payload);
    } catch (error) {
      throw new Error(`Failed to send WhatsApp media message`, { cause: error });
    }
  }
}

export default WhatsappService;
