import { 
  AppSettings, 
  GroundedResearchResult, 
  ResearchRunRecord, 
  DraftItem, 
  SavedPostItem, 
  PostedPostItem, 
  StyleProfile, 
  ReferencePost,
  TopicOpportunity
} from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'soulflick_settings',
  RESEARCH_HISTORY: 'soulflick_research_history',
  DRAFTS: 'soulflick_drafts',
  SAVED_POSTS: 'soulflick_saved_posts',
  POSTED_POSTS: 'soulflick_posted_posts',
  STYLE_PROFILE: 'soulflick_style_profile',
  REFERENCE_POSTS: 'soulflick_reference_posts',
  SAVED_OPPORTUNITIES: 'soulflick_opportunities',
  RESEARCH_CACHE: 'soulflick_research_cache',
};

export const defaultSettings: AppSettings = {
  supabaseUrl: '',
  supabaseAnonKey: '',
  geminiApiKey: '',
  useEdgeFunction: false,
  edgeFunctionUrl: 'https://your-project.supabase.co/functions/v1/research-and-create',
  enableClientCache: true,
  cacheTtlMinutes: 120,
  defaultAudience: 'Hollywood / Global Cinema',
  defaultLanguage: 'English',
  defaultTone: 'Human / Conversational',
  defaultIntensity: 6,
  creatorHandle: 'cinephile_x',
  creatorName: 'Cinema Strategist',
};

export const defaultStyleProfile: StyleProfile = {
  voice_archetype: 'Knowledgeable Insider & Cinephile Analyst',
  responds_to: [
    'Surprising behind-the-scenes facts that challenge public assumptions',
    'Director commentary callbacks & intentional camera movements',
    'Real box office math, budget recoups, and streaming realities',
    'Unpopular but meticulously argued critical re-evaluations',
    'Actor audition stories & alternate casting lore',
    'Subtle visual motifs and deleted scene context'
  ],
  ignores: [
    'Generic promotional trailer hype without original angle',
    'Unverified clickbait rumors without trade attribution',
    'Overused AI clichés ("Let that sink in", "Masterpiece alert", "Game changer")',
    'Toxic fan war bait without film craft context',
    'Lazy "What do you think?" conversation endings'
  ],
  hook_patterns: [
    'Curiosity Gap: "The most fascinating detail about [Film/Director] is..."',
    'Contrarian Reversal: "Everyone thinks [Movie] failed because of X. The real reason is far more interesting:"',
    'Specific Anecdote: "On day 42 of shooting, [Director] threw away the entire script because..."',
    'Craft Detail: "Look closely at the lighting in this scene. It took 3 weeks to engineer because..."'
  ],
  sentence_rhythm: 'Punchy 1-line hook. Breathing room with single line break. 2-3 sentences of verified context. Specific observation. Natural human verdict.',
  taboo_phrases: [
    'Game changer',
    'Masterpiece alert',
    'Let that sink in',
    'Break the internet',
    'What do you think?',
    'Drop your thoughts below',
    'Mind blown'
  ],
  recent_topics_history: [
    'Christopher Nolan Oppenheimer practical effects',
    'Denis Villeneuve Dune Messiah timeline',
    'Martin Scorsese Killers of the Flower Moon pacing'
  ]
};

export const initialReferencePosts: ReferencePost[] = [
  {
    id: 'ref-1',
    title: 'Anatomy of a Behind-the-Scenes Contrast Hook',
    original_author: '@cine_insider',
    raw_text: `Stanley Kubrick spent 4 months perfecting the hallway carpet in The Shining.\n\nNot for aesthetics.\n\nHe noticed that the specific hexagonal pattern created an optical illusion that made the child tricycle appear to move 15% faster on camera.\n\nThat subtle sensory distortion is why the scene induces dread before you even see the twins.`,
    hook_type: 'Contrarian / Behind-the-scenes mystery',
    structure_notes: 'Punchy hook -> Immediate contrast ("Not for X") -> The actual technical mechanism -> The psychological impact on viewer',
    information_density: 'High',
    emotional_arc: 'Curiosity -> Revelation -> Appreciation',
    ending_pattern: 'Sharp psychological insight linking craft to emotion',
    tags: ['craft', 'directing', 'kubrick', 'psychology'],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'ref-2',
    title: 'Industry Economics / Box Office Reality Dissection',
    original_author: '@boxofficetrack',
    raw_text: `Hollywood isn't killing mid-budget films because audiences stopped caring.\n\nThey killed them because of the 2.5x marketing multiple rule.\n\nA $40M adult drama doesn't need $40M to break even. It needs $100M+ once domestic P&A and theater splits are factored in.\n\nWhen streaming paid flat licensing fees upfront, it was a lifeline. Now that streaming has tightened budgets, that entire middle class of cinema has no safety net.`,
    hook_type: 'Debunking common myth / Industry math',
    structure_notes: 'False assumption identified -> Hard economic mechanism stated -> The secondary chain reaction explained',
    information_density: 'Very High',
    emotional_arc: 'Skepticism -> Hard clarity -> Industry empathy',
    ending_pattern: 'Systemic conclusion on the future of cinema',
    tags: ['industry', 'box-office', 'streaming', 'economics'],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const initialOpportunities: TopicOpportunity[] = [
  {
    id: 'opp-1',
    title: 'A24 & Alex Garland\'s Next Project Budget Strategy Shift',
    summary: 'A24 is expanding into larger budget territory after Civil War proved indie studios can sustain $50M+ theatrical scale with global distribution deals.',
    score: 92,
    why_now: 'New distribution reports from European film market show buyers shifting from legacy studios to auteur action packages.',
    saturation: 'low',
    best_angle: 'The business model evolution: how indie auteur cinema is stepping into the void left by risk-averse legacy studios.',
    freshness: 'Last 24 hours',
    discussion_potential: 'very high',
    suggested_content_type: 'Box Office / Industry',
    sources: [
      { title: 'Variety Trade Analysis on Mid-Budget Financing', source_type: 'Entertainment Publication' },
      { title: 'Deadline Studio Report', source_type: 'Entertainment Publication' }
    ]
  },
  {
    id: 'opp-2',
    title: 'The Real Reason Guillermo del Toro Insisted on Physical Sets for Frankenstein',
    summary: 'Del Toro revealed in a recent cinematography roundtable that CGI gothic architecture lacks micro-texture reflections under anamorphic vintage lenses.',
    score: 89,
    why_now: 'Roundtable interview published yesterday featuring practical set builds in Scotland.',
    saturation: 'low',
    best_angle: 'Craft focus: the optical science behind why modern CGI gothic horror feels fake vs practical physical moisture/texture.',
    freshness: 'Last 48 hours',
    discussion_potential: 'high',
    suggested_content_type: 'Smart Film Analysis',
    sources: [
      { title: 'Cinematography World Interview', source_type: 'Interview' },
      { title: 'IndieWire Craft Deep Dive', source_type: 'Entertainment Publication' }
    ]
  },
  {
    id: 'opp-3',
    title: 'Why Audiences are Rediscovering 2000s Practical Stunt Action Films',
    summary: 'Streaming data indicates a massive surge in catalog viewership for mid-2000s in-camera stunt thrillers over recent $200M CGI tentpoles.',
    score: 86,
    why_now: 'Trending retrospective discussions across Letterboxd and X highlighting stunt fatigue.',
    saturation: 'medium',
    best_angle: 'Sensory fatigue: why modern action feels weightless and how tactile risk creates genuine adrenaline.',
    freshness: 'Last 3 days',
    discussion_potential: 'high',
    suggested_content_type: 'Controversial',
    sources: [
      { title: 'Letterboxd Year in Review & Catalog Data', source_type: 'Search-indexed source' }
    ]
  }
];

export const storage = {
  getSettings(): AppSettings {
    const rawEnv = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY || '';
    const envKey = String(rawEnv).trim().replace(/^["']|["']$/g, '');
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return { ...defaultSettings, geminiApiKey: envKey };
    try {
      const parsed = JSON.parse(raw);
      const storedKey = String(parsed.geminiApiKey || '').trim().replace(/^["']|["']$/g, '');
      return { 
        ...defaultSettings, 
        ...parsed, 
        geminiApiKey: storedKey || envKey || '' 
      };
    } catch {
      return { ...defaultSettings, geminiApiKey: envKey };
    }
  },

  saveSettings(settings: AppSettings): void {
    const sanitized = {
      ...settings,
      geminiApiKey: String(settings.geminiApiKey || '').trim().replace(/^["']|["']$/g, '')
    };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(sanitized));
  },

  getStyleProfile(): StyleProfile {
    const raw = localStorage.getItem(STORAGE_KEYS.STYLE_PROFILE);
    if (!raw) return defaultStyleProfile;
    try {
      return { ...defaultStyleProfile, ...JSON.parse(raw) };
    } catch {
      return defaultStyleProfile;
    }
  },

  saveStyleProfile(profile: StyleProfile): void {
    localStorage.setItem(STORAGE_KEYS.STYLE_PROFILE, JSON.stringify(profile));
  },

  getResearchHistory(): ResearchRunRecord[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RESEARCH_HISTORY);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveResearchRun(record: ResearchRunRecord): void {
    const history = this.getResearchHistory();
    const updated = [record, ...history.filter(r => r.id !== record.id)].slice(0, 50); // keep last 50
    localStorage.setItem(STORAGE_KEYS.RESEARCH_HISTORY, JSON.stringify(updated));

    // Update style profile recent topics to enforce topic diversification
    const style = this.getStyleProfile();
    const newTopics = [record.recommended_topic_title, ...style.recent_topics_history.filter(t => t !== record.recommended_topic_title)].slice(0, 10);
    this.saveStyleProfile({ ...style, recent_topics_history: newTopics });
  },

  getDrafts(): DraftItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.DRAFTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveDraft(draft: DraftItem): void {
    const drafts = this.getDrafts();
    const existingIdx = drafts.findIndex(d => d.id === draft.id);
    let updated: DraftItem[];
    if (existingIdx >= 0) {
      updated = [...drafts];
      updated[existingIdx] = { ...draft, updated_at: new Date().toISOString() };
    } else {
      updated = [draft, ...drafts];
    }
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(updated));
  },

  deleteDraft(id: string): void {
    const drafts = this.getDrafts().filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(drafts));
  },

  getSavedPosts(): SavedPostItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_POSTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveSavedPost(post: SavedPostItem): void {
    const saved = this.getSavedPosts();
    const updated = [post, ...saved.filter(p => p.id !== post.id)];
    localStorage.setItem(STORAGE_KEYS.SAVED_POSTS, JSON.stringify(updated));
  },

  deleteSavedPost(id: string): void {
    const saved = this.getSavedPosts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.SAVED_POSTS, JSON.stringify(saved));
  },

  getPostedPosts(): PostedPostItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.POSTED_POSTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  savePostedPost(post: PostedPostItem): void {
    const posted = this.getPostedPosts();
    const updated = [post, ...posted.filter(p => p.id !== post.id)];
    localStorage.setItem(STORAGE_KEYS.POSTED_POSTS, JSON.stringify(updated));
  },

  updatePostMetrics(postId: string, metrics: PostedPostItem['metrics']): void {
    const posted = this.getPostedPosts();
    const post = posted.find(p => p.id === postId);
    if (post) {
      post.metrics = metrics;
      localStorage.setItem(STORAGE_KEYS.POSTED_POSTS, JSON.stringify(posted));
    }
  },

  getReferencePosts(): ReferencePost[] {
    const raw = localStorage.getItem(STORAGE_KEYS.REFERENCE_POSTS);
    if (!raw) return initialReferencePosts;
    try {
      const parsed = JSON.parse(raw);
      return parsed.length > 0 ? parsed : initialReferencePosts;
    } catch {
      return initialReferencePosts;
    }
  },

  saveReferencePost(ref: ReferencePost): void {
    const refs = this.getReferencePosts();
    const updated = [ref, ...refs.filter(r => r.id !== ref.id)];
    localStorage.setItem(STORAGE_KEYS.REFERENCE_POSTS, JSON.stringify(updated));
  },

  deleteReferencePost(id: string): void {
    const refs = this.getReferencePosts().filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REFERENCE_POSTS, JSON.stringify(refs));
  },

  getOpportunities(): TopicOpportunity[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SAVED_OPPORTUNITIES);
    if (!raw) return initialOpportunities;
    try {
      const parsed = JSON.parse(raw);
      return parsed.length > 0 ? parsed : initialOpportunities;
    } catch {
      return initialOpportunities;
    }
  },

  saveOpportunities(opps: TopicOpportunity[]): void {
    localStorage.setItem(STORAGE_KEYS.SAVED_OPPORTUNITIES, JSON.stringify(opps));
  },

  // Cache helper to prevent duplicate API costs
  getCachedResearch(key: string, ttlMinutes: number): GroundedResearchResult | null {
    const raw = localStorage.getItem(`${STORAGE_KEYS.RESEARCH_CACHE}_${key}`);
    if (!raw) return null;
    try {
      const { timestamp, data } = JSON.parse(raw);
      const ageMs = Date.now() - timestamp;
      if (ageMs < ttlMinutes * 60 * 1000) {
        return { ...data, cached: true };
      }
      return null;
    } catch {
      return null;
    }
  },

  setCachedResearch(key: string, data: GroundedResearchResult): void {
    localStorage.setItem(`${STORAGE_KEYS.RESEARCH_CACHE}_${key}`, JSON.stringify({
      timestamp: Date.now(),
      data
    }));
  }
};
