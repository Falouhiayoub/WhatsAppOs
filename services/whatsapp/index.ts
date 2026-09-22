import { WhatsAppProvider } from './provider';
import { MetaWhatsAppProvider } from './metaProvider';
import { MockWhatsAppProvider } from './mockProvider';

export function getWhatsAppProvider(): WhatsAppProvider {
  const providerType = process.env.WHATSAPP_PROVIDER || 'mock';

  if (providerType === 'meta') {
    return new MetaWhatsAppProvider();
  }

  return new MockWhatsAppProvider();
}

export * from './provider';
export * from './metaProvider';
export * from './mockProvider';
export * from './processor';
