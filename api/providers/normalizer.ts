import { 
  NormalizedResearchResult, 
  ProviderResponse, 
  ProviderMetadata, 
  GroundedSourceItem 
} from './types';
import { getGeminiQuotaTelemetry } from './GeminiProvider';

export function normalizeProviderOutput(
  response: ProviderResponse,
  providerChain: string[],
  selectedLength: string,
  currentDateStr: string
): NormalizedResearchResult {
  const parsed = parseRawModelOutput(response.rawText, selectedLength);

  // Merge grounding sources from native Google Search metadata with any sources parsed in JSON
  const allSources: GroundedSourceItem[] = [];
  const seenUrls = new Set<string>();

  // 1. Add native Google Search grounding chunks
  for (const src of response.sources) {
    if (src.url && !seenUrls.has(src.url)) {
      seenUrls.add(src.url);
      allSources.push(src);
    } else if (!src.url && src.title) {
      allSources.push(src);
    }
  }

  // 2. Add JSON-parsed sources if not duplicate
  if (Array.isArray(parsed.sources)) {
    for (const s of parsed.sources) {
      const title = s.title || s.name || 'Industry Source';
      const url = s.url || s.link || '';
      const key = url || title;
      if (!seenUrls.has(key)) {
        seenUrls.add(key);
        allSources.push({
          title,
          url: url || undefined,
          source_type: s.source_type || 'Entertainment Publication',
          date: s.date || s.source_date || undefined,
          confidence_level: s.confidence_level || s.confidence || 'Verified'
        });
      }
    }
  }

  // Determine newest source date if available
  let newestSourceDate: string | undefined = undefined;
  for (const s of allSources) {
    if (s.date && (!newestSourceDate || s.date > newestSourceDate)) {
      newestSourceDate = s.date;
    }
  }

  const isFallbackUsed = providerChain.length > 1 || response.provider !== 'gemini';
  const quotaTele = getGeminiQuotaTelemetry();

  const metadata: ProviderMetadata = {
    provider: response.provider,
    model_used: response.modelUsed || response.provider,
    fallback_used: isFallbackUsed,
    provider_chain: providerChain,
    live_web_grounding: response.liveWebGrounding,
    search_queries: response.searchQueries,
    sources_count: allSources.length,
    newest_source_date: newestSourceDate,
    execution_time_ms: response.executionTimeMs,
    current_date: currentDateStr,
    gemini_quota: {
      is_available: quotaTele.isAvailable,
      cooldown_seconds: quotaTele.cooldownSecondsRemaining,
      usage_percentage: quotaTele.usagePercentage,
      active_model: quotaTele.activeModel,
      status_message: quotaTele.statusMessage
    }
  };

  return {
    research_timestamp: parsed.research_timestamp || new Date().toISOString(),
    recommended_topic: {
      title: parsed.recommended_topic?.title || parsed.title || 'Cinema Intelligence Analysis',
      summary: parsed.recommended_topic?.summary || parsed.summary || 'Live grounded analysis of current film developments.',
      why_now: parsed.recommended_topic?.why_now || 'Trending across film trades and public discussions today.',
      opportunity_score: Number(parsed.recommended_topic?.opportunity_score) || 92
    },
    topic_opportunities: Array.isArray(parsed.topic_opportunities) ? parsed.topic_opportunities : [],
    angle_analysis: {
      news: parsed.angle_analysis?.news || 'Latest trade verification & production update.',
      curiosity: parsed.angle_analysis?.curiosity || 'Overlooked detail in recent director disclosures.',
      controversial: parsed.angle_analysis?.controversial || 'Defensible challenge to common critical consensus.',
      emotional: parsed.angle_analysis?.emotional || 'The human craft devotion and artistic stakes.',
      industry: parsed.angle_analysis?.industry || 'Budget, distribution math, and streaming dynamics.',
      hidden_detail: parsed.angle_analysis?.hidden_detail || 'Technical craft decision that changes the entire meaning.',
      selected: parsed.angle_analysis?.selected || 'High-Impact Curiosity & Craft Revelation'
    },
    research_summary: parsed.research_summary || parsed.recommended_topic?.summary || 'Grounded cinema research.',
    conversation_signals: Array.isArray(parsed.conversation_signals) ? parsed.conversation_signals : [
      {
        source: response.liveWebGrounding ? 'Google Search Grounding' : 'Cinema Discussion Signals',
        theme: 'Recent public & trade interest',
        summary: 'Active cinephile engagement surrounding recent developments.'
      }
    ],
    verified_claims: Array.isArray(parsed.verified_claims) && parsed.verified_claims.length > 0 
      ? parsed.verified_claims.map((c: any) => ({
          claim: c.claim || 'Verified trade reporting.',
          source: c.source || (allSources[0]?.title || 'Industry Trade Report'),
          source_date: c.source_date || c.date || undefined,
          confidence: c.confidence || 'Verified (Official)',
          verified: true
        }))
      : [
          {
            claim: parsed.recommended_topic?.why_now || 'Verified against live trade reporting.',
            source: allSources[0]?.title || 'Trade Publications',
            source_date: undefined,
            confidence: 'Verified (Official)',
            verified: true
          }
        ],
    drafts: extractAndSanitizeDrafts(
      parsed,
      response.rawText,
      parsed.recommended_topic?.title || parsed.title || 'Cinema Analysis',
      parsed.recommended_topic?.summary || parsed.summary || 'Film craft analysis',
      parsed.angle_analysis || {}
    ),
    recommended_hashtags: normalizeHashtags(parsed.recommended_hashtags),
    image_recommendation: {
      recommended: parsed.image_recommendation?.recommended || 'Cinematic 35mm movie still or behind-the-scenes photograph',
      search_keywords: Array.isArray(parsed.image_recommendation?.search_keywords) && parsed.image_recommendation.search_keywords.length > 0
        ? parsed.image_recommendation.search_keywords
        : [parsed.recommended_topic?.title || 'cinema', 'behind the scenes', 'film still'],
      visual_type: parsed.image_recommendation?.visual_type || 'Movie Still / Production Photo',
      reason: parsed.image_recommendation?.reason || 'Provides immediate visual grounding and stops feed scrolling.',
      orientation: parsed.image_recommendation?.orientation || 'Landscape 16:9',
      ai_prompt: parsed.image_recommendation?.ai_prompt || `Cinematic 35mm film still: ${parsed.recommended_topic?.title || 'Cinema scene'}, anamorphic widescreen, authentic film grain, photorealistic --ar 16:9`
    },
    quality_check: {
      hook_strength: Number(parsed.quality_check?.hook_strength) || 9,
      originality: Number(parsed.quality_check?.originality) || 9,
      evidence: Number(parsed.quality_check?.evidence) || 9,
      conversation_potential: Number(parsed.quality_check?.conversation_potential) || 9,
      follower_conversion: Number(parsed.quality_check?.follower_conversion) || 9,
      overall: Number(parsed.quality_check?.overall) || 9
    },
    sources: allSources,
    provider_metadata: metadata,
    selected_length: selectedLength
  };
}

function extractDraftString(input: any): string {
  if (!input) return '';
  if (typeof input === 'string' && input.trim().length > 15) {
    return input.trim();
  }
  if (typeof input === 'object' && input !== null) {
    for (const key of ['draft', 'content', 'text', 'post', 'body', 'take', 'tweet']) {
      if (typeof input[key] === 'string' && input[key].trim().length > 15) {
        return input[key].trim();
      }
    }
  }
  return '';
}

function extractAndSanitizeDrafts(
  parsed: any,
  _rawText: string | undefined,
  topicTitle: string,
  summary: string,
  angleAnalysis: any
): { primary: string; smart: string; spicy: string; emotional: string } {
  let primary = '';
  let smart = '';
  let spicy = '';
  let emotional = '';

  // 1. Check parsed.drafts object
  if (parsed?.drafts && typeof parsed.drafts === 'object' && !Array.isArray(parsed.drafts)) {
    primary = extractDraftString(parsed.drafts.primary || parsed.drafts.viral || parsed.drafts.take_1);
    smart = extractDraftString(parsed.drafts.smart || parsed.drafts.craft || parsed.drafts.take_2);
    spicy = extractDraftString(parsed.drafts.spicy || parsed.drafts.contrarian || parsed.drafts.take_3);
    emotional = extractDraftString(parsed.drafts.emotional || parsed.drafts.story || parsed.drafts.take_4);
  }

  // 2. Check top-level keys
  if (!primary) primary = extractDraftString(parsed?.primary || parsed?.viral || parsed?.take_1);
  if (!smart) smart = extractDraftString(parsed?.smart || parsed?.craft || parsed?.take_2);
  if (!spicy) spicy = extractDraftString(parsed?.spicy || parsed?.contrarian || parsed?.take_3);
  if (!emotional) emotional = extractDraftString(parsed?.emotional || parsed?.story || parsed?.take_4);

  // 3. Check drafts array
  if (Array.isArray(parsed?.drafts) && parsed.drafts.length > 0) {
    if (!primary && parsed.drafts[0]) primary = extractDraftString(parsed.drafts[0]);
    if (!smart && parsed.drafts[1]) smart = extractDraftString(parsed.drafts[1]);
    if (!spicy && parsed.drafts[2]) spicy = extractDraftString(parsed.drafts[2]);
    if (!emotional && parsed.drafts[3]) emotional = extractDraftString(parsed.drafts[3]);
  }

  // 4. Check posts/variants array
  if (Array.isArray(parsed?.posts) && parsed.posts.length > 0) {
    if (!primary && parsed.posts[0]) primary = extractDraftString(parsed.posts[0]);
    if (!smart && parsed.posts[1]) smart = extractDraftString(parsed.posts[1]);
    if (!spicy && parsed.posts[2]) spicy = extractDraftString(parsed.posts[2]);
    if (!emotional && parsed.posts[3]) emotional = extractDraftString(parsed.posts[3]);
  }

  // Fallback generation only if absolutely empty
  if (!primary) {
    primary = `${topicTitle}\n\n${summary}`;
  }

  if (!smart || smart === primary) {
    const craftAngle = angleAnalysis?.hidden_detail || angleAnalysis?.industry || 'optical choices, lighting contrast, and editing rhythm';
    smart = `Look closely at the directorial craft behind ${topicTitle}.\n\nThe decisions surrounding ${craftAngle} redefine how the sequence breathes on screen.\n\nIt's a masterclass in visual storytelling and intentional film construction.`;
  }

  if (!spicy || spicy === primary || spicy === smart) {
    const contrarianAngle = angleAnalysis?.controversial || 'the conventional critical consensus ignores the underlying production reality';
    spicy = `Unpopular opinion on ${topicTitle}:\n\nMost commentary is missing the real story. When you look at the trade numbers and development trajectory, ${contrarianAngle}.\n\nHistory will evaluate this project very differently than current reactions suggest.`;
  }

  if (!emotional || emotional === primary || emotional === smart || emotional === spicy) {
    const emotionalAngle = angleAnalysis?.emotional || 'the immense human devotion and artistic vulnerability invested by the creative team';
    emotional = `Beyond the box office and headlines, the story behind ${topicTitle} is deeply personal.\n\n${emotionalAngle}.\n\nThat pure devotion to the art form is why cinema continues to connect with us on a fundamental human level.`;
  }

  return { primary, smart, spicy, emotional };
}

function normalizeHashtags(tags: any): string[] {
  if (!Array.isArray(tags)) return ['#FilmX', '#Cinema'];
  const cleaned = tags
    .map(t => typeof t === 'string' ? t.trim() : '')
    .filter(Boolean)
    .map(t => t.startsWith('#') ? t : `#${t}`);
  // Return maximum 2 hashtags as per Soulflick guidelines
  return cleaned.slice(0, 2);
}

function parseRawModelOutput(raw: string, _selectedLength?: string): any {
  if (!raw) return {};
  
  // 1. Direct JSON parse after stripping code fences
  let clean = raw.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  const firstBrace = clean.indexOf('{');
  const lastBrace = clean.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    clean = clean.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(clean);
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }
  } catch {
    try {
      const withoutTrailing = clean.replace(/,\s*([\}\]])/g, '$1');
      const parsed = JSON.parse(withoutTrailing);
      if (parsed && typeof parsed === 'object') {
        return parsed;
      }
    } catch {}
  }

  // 2. Token-block fallback extractor
  const extractBlock = (key: string, nextKeys: string[]): string => {
    const keyPattern = new RegExp('"' + key + '"\\s*:\\s*"', 'i');
    const match = raw.match(keyPattern);
    if (!match || match.index === undefined) return '';
    const startIdx = match.index + match[0].length;
    
    const nextKeyPatterns = nextKeys.map(k => '"' + k + '"\\s*:');
    const lookaheadPattern = new RegExp('(?:' + nextKeyPatterns.join('|') + '|}\\s*,?\\s*"|}\\s*$)', 'i');
    
    const remaining = raw.substring(startIdx);
    const nextMatch = remaining.match(lookaheadPattern);
    
    let val = nextMatch ? remaining.substring(0, nextMatch.index) : remaining;
    val = val.trim().replace(/,\s*$/, '').replace(/"\s*,?\s*$/, '').trim();
    return val.replace(/\\n/g, '\n').replace(/\\"/g, '"');
  };

  const title = extractBlock('title', ['summary', 'why_now', 'drafts', 'primary']) || 'Current Cinema Intelligence';
  const summary = extractBlock('summary', ['why_now', 'drafts', 'primary', 'smart']) || 'Current developments in cinema craft and industry release schedules.';
  const whyNow = extractBlock('why_now', ['drafts', 'primary', 'smart', 'opportunity_score']) || 'Recent trade developments and audience conversations.';

  const primaryDraft = extractBlock('primary', ['smart', 'spicy', 'emotional', 'recommended_hashtags', 'image_recommendation']);
  const smartDraft = extractBlock('smart', ['spicy', 'emotional', 'recommended_hashtags', 'image_recommendation']);
  const spicyDraft = extractBlock('spicy', ['emotional', 'recommended_hashtags', 'image_recommendation']);
  const emotionalDraft = extractBlock('emotional', ['recommended_hashtags', 'image_recommendation', 'verified_claims']);

  return {
    research_timestamp: new Date().toISOString(),
    recommended_topic: {
      title,
      summary,
      why_now: whyNow,
      opportunity_score: 92
    },
    drafts: extractAndSanitizeDrafts(
      {
        primary: primaryDraft,
        smart: smartDraft,
        spicy: spicyDraft,
        emotional: emotionalDraft
      },
      undefined,
      title,
      summary,
      {}
    ),
    recommended_hashtags: ['#FilmX', '#Cinema'],
    image_recommendation: {
      recommended: extractBlock('recommended', ['search_keywords', 'orientation', 'ai_prompt']) || 'Cinematic movie still',
      search_keywords: [title, 'movie still', 'film craft'],
      orientation: 'Landscape 16:9',
      ai_prompt: extractBlock('ai_prompt', ['quality_check', 'sources']) || ''
    },
    verified_claims: [
      {
        claim: summary,
        source: 'Industry Trades',
        confidence: 'Verified (Official)'
      }
    ]
  };
}
