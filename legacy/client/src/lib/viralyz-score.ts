export interface ScoreFactor {
  name: string;
  score: number;
  maxScore: number;
  explanation: string;
  recommendation?: string;
  icon: 'title' | 'description' | 'format' | 'timing' | 'engagement' | 'platform';
}

export interface ViralyzScore {
  overall: number;
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F';
  factors: ScoreFactor[];
  summary: string;
}

interface ContentInput {
  title: string;
  description: string;
  type: 'clip' | 'film' | 'still' | 'flash';
  hasMedia: boolean;
  platforms?: string[];
}

const POWER_WORDS = [
  'ultimate', 'secret', 'exclusive', 'breaking', 'shocking', 'amazing',
  'incredible', 'unbelievable', 'mind-blowing', 'epic', 'insane', 'crazy',
  'game-changing', 'revolutionary', 'viral', 'trending', 'must-see', 'finally',
  'revealed', 'exposed', 'proven', 'guaranteed', 'instant', 'fast', 'easy',
  'simple', 'free', 'new', 'best', 'top', 'first', 'last', 'only'
];

const HOOK_PATTERNS = [
  /^(how|why|what|when|where|who)/i,
  /\?$/,
  /^\d+\s/,
  /(you won't believe|here's why|this is how|wait until|watch what)/i,
  /(beginner|expert|pro|master|guide|tutorial|tips|tricks|hacks)/i,
];

const EMOJI_PATTERN = /[\uD83C-\uDBFF\uDC00-\uDFFF]+|[\u2600-\u26FF\u2700-\u27BF]/g;

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function hasPowerWords(text: string): { count: number; words: string[] } {
  const lower = text.toLowerCase();
  const found = POWER_WORDS.filter(word => lower.includes(word));
  return { count: found.length, words: found };
}

function hasHookPattern(text: string): boolean {
  return HOOK_PATTERNS.some(pattern => pattern.test(text));
}

function countEmojis(text: string): number {
  const matches = text.match(EMOJI_PATTERN);
  return matches ? matches.length : 0;
}

function hasHashtags(text: string): { count: number; tags: string[] } {
  const tags = text.match(/#\w+/g) || [];
  return { count: tags.length, tags };
}

export function calculateViralyzScore(input: ContentInput): ViralyzScore {
  const factors: ScoreFactor[] = [];

  const titleScore = scoreTitleQuality(input.title, input.type);
  factors.push(titleScore);

  const descriptionScore = scoreDescriptionQuality(input.description);
  factors.push(descriptionScore);

  const formatScore = scoreFormatOptimization(input.type, input.hasMedia);
  factors.push(formatScore);

  const engagementScore = scoreEngagementPotential(input.title, input.description);
  factors.push(engagementScore);

  const platformScore = scorePlatformReadiness(input.type, input.platforms || []);
  factors.push(platformScore);

  const totalMax = factors.reduce((sum, f) => sum + f.maxScore, 0);
  const totalScore = factors.reduce((sum, f) => sum + f.score, 0);
  const overall = Math.round((totalScore / totalMax) * 100);

  const grade = getGrade(overall);
  const summary = generateSummary(overall, factors);

  return { overall, grade, factors, summary };
}

function scoreTitleQuality(title: string, type: string): ScoreFactor {
  let score = 0;
  const maxScore = 25;
  const issues: string[] = [];
  const wins: string[] = [];

  const wordCount = countWords(title);
  const { count: powerWordCount, words: powerWords } = hasPowerWords(title);
  const hasHook = hasHookPattern(title);
  const emojiCount = countEmojis(title);

  if (wordCount >= 4 && wordCount <= 10) {
    score += 6;
    wins.push('Title length is optimal (4-10 words)');
  } else if (wordCount < 4) {
    score += 2;
    issues.push('Title is too short - add more context');
  } else {
    score += 3;
    issues.push('Title is too long - aim for 10 words or less');
  }

  if (powerWordCount >= 2) {
    score += 7;
    wins.push(`Strong power words: ${powerWords.slice(0, 3).join(', ')}`);
  } else if (powerWordCount === 1) {
    score += 4;
    wins.push(`Has power word: ${powerWords[0]}`);
  } else {
    issues.push('Add attention-grabbing words like "ultimate", "secret", or "epic"');
  }

  if (hasHook) {
    score += 6;
    wins.push('Title uses a proven hook pattern');
  } else {
    issues.push('Try starting with a question, number, or curiosity hook');
  }

  if (type === 'clip' || type === 'flash') {
    if (emojiCount >= 1 && emojiCount <= 3) {
      score += 4;
      wins.push('Good emoji usage for short-form content');
    } else if (emojiCount === 0) {
      score += 1;
      issues.push('Add 1-2 emojis to boost visibility');
    } else {
      score += 2;
      issues.push('Too many emojis - stick to 1-3');
    }
  } else {
    if (emojiCount === 0) {
      score += 4;
      wins.push('Clean, professional title for long-form');
    } else if (emojiCount <= 2) {
      score += 3;
    } else {
      score += 1;
      issues.push('Reduce emojis for long-form content');
    }
  }

  if (title.length > 0 && title[0] === title[0].toUpperCase()) {
    score += 2;
  }

  const explanation = wins.length > 0 
    ? wins.join('. ') + '.'
    : 'Your title needs work to maximize click-through rate.';

  const recommendation = issues.length > 0 
    ? issues[0]
    : undefined;

  return {
    name: 'Title Quality',
    score: Math.min(score, maxScore),
    maxScore,
    explanation,
    recommendation,
    icon: 'title'
  };
}

function scoreDescriptionQuality(description: string): ScoreFactor {
  let score = 0;
  const maxScore = 20;
  const issues: string[] = [];
  const wins: string[] = [];

  const wordCount = countWords(description);
  const { count: hashtagCount, tags } = hasHashtags(description);
  const emojiCount = countEmojis(description);
  const hasCTA = /(follow|subscribe|like|share|comment|click|link|check out)/i.test(description);

  if (wordCount >= 20 && wordCount <= 150) {
    score += 5;
    wins.push('Good description length');
  } else if (wordCount < 20) {
    score += 2;
    issues.push('Add more detail to your description');
  } else {
    score += 3;
    issues.push('Consider shortening - first 125 chars matter most');
  }

  if (hashtagCount >= 3 && hashtagCount <= 8) {
    score += 5;
    wins.push(`Using ${hashtagCount} hashtags for discoverability`);
  } else if (hashtagCount > 0 && hashtagCount < 3) {
    score += 3;
    issues.push('Add more hashtags (aim for 5-8)');
  } else if (hashtagCount > 8) {
    score += 3;
    issues.push('Too many hashtags may look spammy');
  } else {
    issues.push('Add relevant hashtags for discovery');
  }

  if (hasCTA) {
    score += 5;
    wins.push('Includes call-to-action');
  } else {
    issues.push('Add a call-to-action like "Follow for more"');
  }

  if (emojiCount >= 1 && emojiCount <= 5) {
    score += 3;
    wins.push('Good emoji usage');
  } else if (emojiCount === 0) {
    score += 1;
    issues.push('Emojis help break up text and boost engagement');
  } else {
    score += 1;
    issues.push('Reduce emoji count for readability');
  }

  if (description.includes('\n') || description.includes('•') || description.includes('-')) {
    score += 2;
    wins.push('Good formatting with line breaks');
  }

  const explanation = wins.length > 0 
    ? wins.join('. ') + '.'
    : 'Your description could be improved for better engagement.';

  return {
    name: 'Description',
    score: Math.min(score, maxScore),
    maxScore,
    explanation,
    recommendation: issues[0],
    icon: 'description'
  };
}

function scoreFormatOptimization(type: string, hasMedia: boolean): ScoreFactor {
  let score = 0;
  const maxScore = 20;
  const wins: string[] = [];
  const issues: string[] = [];

  if (hasMedia) {
    score += 15;
    wins.push('Media file attached');
  } else {
    issues.push('Upload your media file to complete');
  }

  const formatAdvice: Record<string, string> = {
    clip: 'Short-form clips perform best with strong hooks in first 3 seconds',
    film: 'Long-form content should have chapters or timestamps for retention',
    still: 'High-res images with good lighting get 2x more engagement',
    flash: 'Stories work best with interactive elements and polls'
  };

  score += 5;
  wins.push(formatAdvice[type] || 'Good format choice');

  return {
    name: 'Format',
    score: Math.min(score, maxScore),
    maxScore,
    explanation: wins.join('. ') + '.',
    recommendation: issues[0],
    icon: 'format'
  };
}

function scoreEngagementPotential(title: string, description: string): ScoreFactor {
  let score = 0;
  const maxScore = 20;
  const wins: string[] = [];
  const issues: string[] = [];

  const combined = title + ' ' + description;
  
  const hasQuestion = /\?/.test(combined);
  const hasNumbers = /\d/.test(title);
  const hasContrast = /(vs|versus|or|better|best|worst)/i.test(combined);
  const hasUrgency = /(now|today|finally|just|breaking|new)/i.test(combined);
  const hasSocialProof = /(million|thousand|k|viral|trending|everyone)/i.test(combined);

  if (hasQuestion) {
    score += 4;
    wins.push('Questions drive comments');
  } else {
    issues.push('Try ending with a question to boost comments');
  }

  if (hasNumbers) {
    score += 4;
    wins.push('Numbers increase click-through rate');
  }

  if (hasContrast) {
    score += 4;
    wins.push('Comparison content gets more watch time');
  }

  if (hasUrgency) {
    score += 4;
    wins.push('Urgency words boost immediate clicks');
  }

  if (hasSocialProof) {
    score += 4;
    wins.push('Social proof increases trust');
  }

  if (score === 0) {
    score = 4;
    issues.push('Add engagement triggers: questions, numbers, or urgency');
  }

  return {
    name: 'Engagement Potential',
    score: Math.min(score, maxScore),
    maxScore,
    explanation: wins.length > 0 ? wins.join('. ') + '.' : 'Basic engagement elements.',
    recommendation: issues[0],
    icon: 'engagement'
  };
}

function scorePlatformReadiness(type: string, platforms: string[]): ScoreFactor {
  let score = 0;
  const maxScore = 15;
  const wins: string[] = [];
  const issues: string[] = [];

  const platformCount = platforms.filter(p => p !== 'viralyz').length;

  if (platformCount >= 3) {
    score += 10;
    wins.push(`Cross-posting to ${platformCount + 1} platforms maximizes reach`);
  } else if (platformCount >= 1) {
    score += 6;
    wins.push(`Publishing to ${platformCount + 1} platforms`);
    issues.push('Add more platforms to increase reach');
  } else {
    score += 3;
    issues.push('Select additional platforms for wider distribution');
  }

  const platformFormats: Record<string, string[]> = {
    clip: ['tiktok', 'instagram', 'youtube'],
    film: ['youtube', 'twitch'],
    still: ['instagram', 'twitter'],
    flash: ['instagram', 'tiktok']
  };

  const optimalPlatforms = platformFormats[type] || [];
  const matchCount = platforms.filter(p => optimalPlatforms.includes(p)).length;

  if (matchCount >= 2) {
    score += 5;
    wins.push('Targeting optimal platforms for this format');
  } else if (matchCount === 1) {
    score += 3;
  }

  return {
    name: 'Platform Reach',
    score: Math.min(score, maxScore),
    maxScore,
    explanation: wins.length > 0 ? wins.join('. ') + '.' : 'Good platform selection.',
    recommendation: issues[0],
    icon: 'platform'
  };
}

function getGrade(score: number): 'S' | 'A' | 'B' | 'C' | 'D' | 'F' {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

function generateSummary(overall: number, factors: ScoreFactor[]): string {
  const weakest = factors.reduce((min, f) => 
    (f.score / f.maxScore) < (min.score / min.maxScore) ? f : min
  );

  if (overall >= 80) {
    return `Excellent content! Your ${factors[0].name.toLowerCase()} is strong. Ready to go viral.`;
  } else if (overall >= 60) {
    return `Good foundation. Focus on improving your ${weakest.name.toLowerCase()} for better results.`;
  } else {
    return `Needs work. Start by improving your ${weakest.name.toLowerCase()} - this will have the biggest impact.`;
  }
}
