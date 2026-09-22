import { AIProvider, AICompletionOptions } from './provider';

export class MockAIProvider implements AIProvider {
  async generateCompletion(prompt: string, options?: AICompletionOptions): Promise<string> {
    if (prompt.includes('PRICE_INQUIRY') || prompt.includes('Caftan') || prompt.includes('prix')) {
      return 'Bonjour! Nos tarifs pour les caftans artisanaux varient entre 2 500 MAD et 4 500 MAD selon les finitions et tissus. La livraison est disponible partout au Maroc.';
    }
    return 'Bonjour 👋 Merci pour votre message. Nous sommes ravis de vous assister pour toute question concernant nos produits et services.';
  }

  async generateStructuredOutput<T>(
    prompt: string,
    schemaDescription: string,
    options?: AICompletionOptions
  ): Promise<T> {
    const p = prompt.toLowerCase();

    // 1. Skill: Understand Message
    if (schemaDescription.includes('intent') && schemaDescription.includes('urgency')) {
      let intent = 'GENERAL';
      let urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'MEDIUM';
      let sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE' | 'URGENT' = 'NEUTRAL';
      let language = 'French';

      if (p.includes('prix') || p.includes('combien') || p.includes('thaman') || p.includes('ch\'hal')) {
        intent = 'PRICE_INQUIRY';
      } else if (p.includes('demain') || p.includes('livraison') || p.includes('urgent')) {
        intent = 'DELIVERY';
        urgency = 'HIGH';
      } else if (p.includes('rendez-vous') || p.includes('rdv') || p.includes('consultation')) {
        intent = 'APPOINTMENT';
      }

      if (p.includes('salam') || p.includes('kidayr') || p.includes('bghit')) {
        language = 'Darija';
      }

      return {
        intent,
        language,
        sentiment,
        urgency,
        confidence: 0.92,
      } as unknown as T;
    }

    // 2. Skill: Generate Reply
    if (schemaDescription.includes('optionA') && schemaDescription.includes('optionB')) {
      return {
        optionA: 'Bonjour. Merci pour votre intérêt. Nos tarifs débutent à 2 500 MAD avec livraison express sous 24h à Rabat.',
        optionB: 'Salam 👋 Oui absolument! Nous livrons à Rabat dès demain si vous validez votre commande aujourd\'hui. Souhaitez-vous recevoir les détails?',
        optionC: 'Profitez de notre offre spéciale ce mois-ci! Commandez votre Caftan Royal dès maintenant et bénéficiez de la livraison gratuite sur Rabat.',
        confidence: 0.95,
        reasoning: 'Généré sur la base de la fiche entreprise (Dar Al Kaftan) et des conditions de livraison 24h.',
      } as unknown as T;
    }

    // 3. Skill: Qualify Lead
    if (schemaDescription.includes('buyingIntent') || schemaDescription.includes('budget')) {
      return {
        need: 'Achat Caftan traditionnel pour événement',
        product: 'Caftan Royal Vert',
        budget: '2 800 MAD',
        timeline: '24h / Ce weekend',
        location: 'Rabat',
        buyingIntent: 'HIGH',
      } as unknown as T;
    }

    // 4. Skill: Summarize Conversation
    if (schemaDescription.includes('summary')) {
      return {
        summary: 'Le client s\'informe du prix et de la disponibilité de livraison sur Rabat d\'ici demain.',
      } as unknown as T;
    }

    // 5. Skill: Detect Language
    if (schemaDescription.includes('detectedLanguage')) {
      return {
        detectedLanguage: p.includes('salam') ? 'Darija' : 'French',
        confidence: 0.98,
      } as unknown as T;
    }

    // 6. Skill: Detect Sentiment
    if (schemaDescription.includes('needsHuman')) {
      return {
        sentiment: 'NEUTRAL',
        needsHuman: false,
        flagReason: null,
      } as unknown as T;
    }

    // Fallback default mock object
    return {
      success: true,
      message: 'AI Mock Structured Output Generated',
    } as unknown as T;
  }
}
