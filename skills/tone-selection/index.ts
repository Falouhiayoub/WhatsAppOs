import { z } from 'zod';

export const ToneSelectionInputSchema = z.object({
  preferredTone: z.enum(['PROFESSIONAL', 'FRIENDLY', 'SHORT', 'SALES', 'FORMAL']),
});

export const ToneSelectionOutputSchema = z.object({
  selectedTone: z.string(),
  toneGuide: z.string(),
});

export type ToneSelectionInput = z.infer<typeof ToneSelectionInputSchema>;
export type ToneSelectionOutput = z.infer<typeof ToneSelectionOutputSchema>;

export const ToneSelectionSkill = {
  metadata: {
    key: 'tone-selection',
    name: 'Tone Selection Skill',
    description: 'Configures tone guidelines for AI reply generation.',
    version: '1.0.0',
  },

  async execute(input: ToneSelectionInput): Promise<ToneSelectionOutput> {
    ToneSelectionInputSchema.parse(input);

    const guides: Record<string, string> = {
      PROFESSIONAL: 'Utiliser un ton poli, structuré, professionnel et formel sans être froid.',
      FRIENDLY: 'Utiliser un ton chaleureux, convivial, accueillant avec des emojis pertinents.',
      SHORT: 'Rédiger des réponses concises, directes et courtes (maximum 2 phrases).',
      SALES: 'Mettre en valeur l\'offre, proposer un appel à l\'action clair et encourager la conversion.',
      FORMAL: 'Utiliser le vouvoiement rigoureux et des formules de politesse classiques.',
    };

    return {
      selectedTone: input.preferredTone,
      toneGuide: guides[input.preferredTone] || guides.PROFESSIONAL,
    };
  },
};
