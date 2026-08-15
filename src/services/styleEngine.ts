import { StyleProfile } from '../types';

const FRANCHISE_PATTERNS = [
  { name: 'Marvel / MCU / Avengers', regex: /(marvel|mcu|avengers|spider-man|captain america|iron man|thor|deadpool|wolverine|loki)/i },
  { name: 'DC / Batman / Superman', regex: /(dc|dcu|batman|superman|joker|gotham|justice league|wonder woman)/i },
  { name: 'Star Wars', regex: /(star wars|jedi|sith|mandalorian|skywalker|lucasfilm)/i },
  { name: 'Fast & Furious', regex: /(fast & furious|dom toretto|fast x)/i }
];

export const styleEngine = {
  /**
   * Evaluates recent history to warn if a single franchise is being overused
   */
  checkFranchiseFatigue(recentTopics: string[]): { isFatigued: boolean; franchiseName?: string; count: number; recommendation: string } {
    if (!recentTopics || recentTopics.length < 3) {
      return { isFatigued: false, count: 0, recommendation: 'Topic balance is healthy.' };
    }

    const last5 = recentTopics.slice(0, 5);

    for (const franchise of FRANCHISE_PATTERNS) {
      const matchCount = last5.filter(t => franchise.regex.test(t)).length;
      if (matchCount >= 2) {
        return {
          isFatigued: true,
          franchiseName: franchise.name,
          count: matchCount,
          recommendation: `High recent saturation on ${franchise.name} (${matchCount} of last ${last5.length} posts). We strongly recommend pivoting to: Original Auteurs (Scorsese, PTA, Nolan), A24 Indie packages, International Cinema, or Box Office deep dives.`
        };
      }
    }

    return { isFatigued: false, count: 0, recommendation: 'Good topical diversity across cinema genres.' };
  },

  /**
   * Generates a compact summary string for the single Gemini request prompt
   */
  formatCompactStylePrompt(profile: StyleProfile): string {
    const lines = [
      `VOICE: ${profile.voice_archetype}`,
      `RHYTHM: ${profile.sentence_rhythm}`,
      `AUDIENCE RESPONDS TO: ${profile.responds_to.slice(0, 4).join(' | ')}`,
      `AUDIENCE IGNORES: ${profile.ignores.slice(0, 3).join(' | ')}`,
      `TABOO BUZZWORDS TO NEVER USE: ${profile.taboo_phrases.join(', ')}`
    ];
    return lines.join('\n');
  },

  /**
   * Checks post draft locally for taboo words or AI clichés
   */
  scanForClichés(content: string, tabooList: string[]): string[] {
    const found: string[] = [];
    tabooList.forEach(word => {
      const regex = new RegExp(`\\b${word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(content)) {
        found.push(word);
      }
    });
    return found;
  }
};
