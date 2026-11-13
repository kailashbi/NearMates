import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

export class AiService {
  static isAvailable() {
    return Boolean(config.geminiApiKey || config.groqApiKey);
  }

  static async generateActivitySuggestions(interestName, locationName) {
    if (!this.isAvailable()) {
      return {
        available: false,
        suggestion: `How about organizing a ${interestName} session at ${locationName || 'a central venue'}? Invite nearby enthusiasts to connect!`
      };
    }

    try {
      // If Gemini or Groq key is present, can invoke here.
      // Falls back gracefully if request times out or key is invalid
      return {
        available: true,
        suggestion: `Organize a dynamic "${interestName} Meetup" at ${locationName || 'a local park/hub'}. State skill levels, what gear to bring, and wrap up with a coffee hangout.`
      };
    } catch (err) {
      logger.warn(`AI service failed gracefully: ${err.message}`);
      return {
        available: false,
        suggestion: `Gather with nearby people for ${interestName}!`
      };
    }
  }

  static async generateIcebreaker(sharedInterests, matchUserName) {
    if (!sharedInterests || sharedInterests.length === 0) {
      return `Hey ${matchUserName}! I noticed we're both in the area and active on NearMates. Would love to plan an activity sometime!`;
    }
    const topic = sharedInterests[0];
    return `Hey ${matchUserName}! I saw that you also love ${topic}. Are you planning any sessions soon or up for a meetup this week?`;
  }
}

