import { PostedPostItem, PostMetrics } from '../types';

export interface AggregateStats {
  totalImpressions: number;
  totalLikes: number;
  totalReplies: number;
  totalReposts: number;
  totalFollowersGained: number;
  avgEngagementRate: number;
  avgConversionRate: number;
  topPerformingVariant: string;
  bestHookArchetype: string;
  totalPosts: number;
}

export const analyticsEngine = {
  /**
   * Deterministic calculation of Engagement Rate
   * Weighted formula: (Likes + (Replies * 1.5) + (Reposts * 2) + (Quotes * 2.5)) / Impressions * 100
   */
  calculateEngagementRate(impressions: number, likes: number, replies: number, reposts: number, quotes: number): number {
    if (!impressions || impressions <= 0) return 0;
    const totalWeightedEngagements = likes + (replies * 1.5) + (reposts * 2) + (quotes * 2.5);
    const rate = (totalWeightedEngagements / impressions) * 100;
    return Number(Math.min(rate, 100).toFixed(2));
  },

  /**
   * Deterministic calculation of Follower Conversion Rate
   */
  calculateConversionRate(followersGained: number, profileVisits: number, impressions: number): number {
    if (profileVisits > 0) {
      return Number(((followersGained / profileVisits) * 100).toFixed(2));
    }
    if (impressions > 0) {
      return Number(((followersGained / impressions) * 1000).toFixed(2)); // per 1k impressions
    }
    return 0;
  },

  /**
   * Rule-based Heuristic Diagnostics (Zero AI Cost)
   */
  generateDiagnostics(
    metrics: { impressions: number; likes: number; replies: number; reposts: number; quotes: number; profileVisits: number; followersGained: number },
    content: string,
    topicTitle: string
  ): { why_it_worked_tags: string[]; why_underperformed_tags: string[]; diagnostic_notes: string } {
    const { impressions, likes, replies, reposts, quotes, profileVisits, followersGained } = metrics;
    const er = this.calculateEngagementRate(impressions, likes, replies, reposts, quotes);
    const conv = this.calculateConversionRate(followersGained, profileVisits, impressions);

    const whyWorked: string[] = [];
    const whyUnderperformed: string[] = [];
    const notes: string[] = [];

    // Ratio Analyses
    const replyToLikeRatio = likes > 0 ? (replies / likes) : 0;
    const repostToLikeRatio = likes > 0 ? (reposts / likes) : 0;
    const quoteToRepostRatio = reposts > 0 ? (quotes / reposts) : 0;

    // Content structural characteristics
    const hasNumbers = /\d+/.test(content);
    const hasQuestion = /\?/.test(content);
    const lineCount = content.split('\n').filter(l => l.trim().length > 0).length;
    const charCount = content.length;

    // 1. Evaluate Engagement Rate
    if (er >= 4.0) {
      whyWorked.push('High-Velocity Engagement Tier (>4%)');
      notes.push('Outstanding interaction efficiency relative to reach.');
    } else if (er < 1.2 && impressions > 500) {
      whyUnderperformed.push('Passive Impression Skim (<1.2% ER)');
      notes.push('The post earned impressions but failed to convert passive scrollers into active participants.');
    }

    // 2. Evaluate Discussion & Reply Velocity
    if (replyToLikeRatio > 0.35) {
      whyWorked.push('High Debate Catalyst (High Reply/Like Ratio)');
      notes.push('The angle stimulated genuine disagreements or personal anecdotes in replies.');
    } else if (replyToLikeRatio < 0.05 && likes > 20) {
      whyUnderperformed.push('Echo-Chamber Agreement (Low Reply Volume)');
      notes.push('People agreed quietly with a like but did not feel compelled to add their voice.');
    }

    // 3. Evaluate Virality / Amplification (Reposts & Quotes)
    if (repostToLikeRatio > 0.25) {
      whyWorked.push('High Identity Sharing (Repost Magnet)');
      notes.push('Readers retweeted this as a badge of cinephile taste to their own followers.');
    }

    if (quoteToRepostRatio > 0.3) {
      whyWorked.push('Quote-Tweet Driver (Spicy Take / Strong Reaction)');
      notes.push('High quote ratio indicates readers wanted to add their own commentary to the thesis.');
    }

    // 4. Evaluate Follower Conversion
    if (followersGained >= 5 && profileVisits > 0 && conv > 8.0) {
      whyWorked.push('High Authority Conversion (>8% Profile Follow)');
      notes.push('Demonstrated deep insider craft, convincing viewers you are a high-signal follow.');
    } else if (profileVisits > 30 && followersGained <= 1) {
      whyUnderperformed.push('Bio Disconnect / Low Profile Follow Conversion');
      notes.push('Readers visited your profile but didn\'t hit follow—consider pinning a flagship thread.');
    }

    // 5. Structural & Format Heuristics
    if (hasNumbers && whyWorked.length > 0) {
      whyWorked.push('Tactile Data / Specific Detail Anchoring');
    }

    if (charCount > 250 && lineCount <= 2 && whyUnderperformed.length > 0) {
      whyUnderperformed.push('Dense Wall-of-Text (Needs Line-Breaks)');
      notes.push('Adding white space between the hook, context, and conclusion improves scan-speed.');
    }

    // Default fallbacks if balanced
    if (whyWorked.length === 0 && whyUnderperformed.length === 0) {
      if (impressions > 0) {
        whyWorked.push('Solid Baseline Performance');
        notes.push('Consistent engagement matching typical account baseline.');
      } else {
        notes.push('Awaiting live X analytics input to compute diagnostics.');
      }
    }

    return {
      why_it_worked_tags: whyWorked,
      why_underperformed_tags: whyUnderperformed,
      diagnostic_notes: notes.join(' ')
    };
  },

  /**
   * Aggregate statistics across all posted posts
   */
  getAggregateStats(posts: PostedPostItem[]): AggregateStats {
    if (!posts || posts.length === 0) {
      return {
        totalImpressions: 0,
        totalLikes: 0,
        totalReplies: 0,
        totalReposts: 0,
        totalFollowersGained: 0,
        avgEngagementRate: 0,
        avgConversionRate: 0,
        topPerformingVariant: 'Primary',
        bestHookArchetype: 'Curiosity Gap',
        totalPosts: 0
      };
    }

    let impressions = 0;
    let likes = 0;
    let replies = 0;
    let reposts = 0;
    let followers = 0;
    let totalEr = 0;
    let totalConv = 0;
    let ratedCount = 0;

    const variantScores: Record<string, { totalEr: number; count: number }> = {};

    posts.forEach(p => {
      if (p.metrics) {
        impressions += p.metrics.impressions || 0;
        likes += p.metrics.likes || 0;
        replies += p.metrics.replies || 0;
        reposts += p.metrics.reposts || 0;
        followers += p.metrics.followers_gained || 0;
        totalEr += p.metrics.engagement_rate || 0;
        totalConv += p.metrics.follower_conversion_rate || 0;
        ratedCount++;

        const v = p.variant_type || 'primary';
        if (!variantScores[v]) variantScores[v] = { totalEr: 0, count: 0 };
        variantScores[v].totalEr += p.metrics.engagement_rate || 0;
        variantScores[v].count++;
      }
    });

    let topVariant = 'Primary';
    let maxAvgEr = 0;
    Object.entries(variantScores).forEach(([k, v]) => {
      const avg = v.totalEr / v.count;
      if (avg > maxAvgEr) {
        maxAvgEr = avg;
        topVariant = k.charAt(0).toUpperCase() + k.slice(1);
      }
    });

    return {
      totalImpressions: impressions,
      totalLikes: likes,
      totalReplies: replies,
      totalReposts: reposts,
      totalFollowersGained: followers,
      avgEngagementRate: ratedCount > 0 ? Number((totalEr / ratedCount).toFixed(2)) : 0,
      avgConversionRate: ratedCount > 0 ? Number((totalConv / ratedCount).toFixed(2)) : 0,
      topPerformingVariant: topVariant,
      bestHookArchetype: 'Contrarian Reversal & BTS Mystery',
      totalPosts: posts.length
    };
  }
};
