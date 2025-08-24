/**
 * Search Ranking Service
 * Implements advanced ranking algorithms for knowledge base search results
 */

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  rules: string;
  isActive: boolean;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
  relevanceScore?: number;
  qualityScore?: number;
  freshnessScore?: number;
  popularityScore?: number;
}

interface RankingFactors {
  relevance: number;
  quality: number;
  freshness: number;
  popularity: number;
  category: number;
  userPreferences: number;
}

interface SearchContext {
  query: string;
  userCategory?: string;
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  previousSearches?: string[];
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  searchType?: 'quick' | 'detailed' | 'research';
}

class SearchRankingService {
  private readonly RELEVANCE_WEIGHT = 0.4;
  private readonly QUALITY_WEIGHT = 0.2;
  private readonly FRESHNESS_WEIGHT = 0.1;
  private readonly POPULARITY_WEIGHT = 0.1;
  private readonly CATEGORY_WEIGHT = 0.1;
  private readonly USER_PREFERENCES_WEIGHT = 0.1;

  /**
   * Main ranking function that combines multiple ranking factors
   */
  public rankSearchResults(
    entries: KnowledgeEntry[],
    searchContext: SearchContext
  ): KnowledgeEntry[] {
    console.log('🎯 Starting comprehensive ranking for', entries.length, 'entries');

    return entries
      .map(entry => this.calculateComprehensiveScore(entry, searchContext))
      .filter(entry => entry.relevanceScore && entry.relevanceScore > 0.1)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 20); // Return top 20 results
  }

  /**
   * Calculate comprehensive score combining all ranking factors
   */
  private calculateComprehensiveScore(
    entry: KnowledgeEntry,
    context: SearchContext
  ): KnowledgeEntry {
    const factors = this.calculateRankingFactors(entry, context);
    
    const comprehensiveScore = 
      (factors.relevance * this.RELEVANCE_WEIGHT) +
      (factors.quality * this.QUALITY_WEIGHT) +
      (factors.freshness * this.FRESHNESS_WEIGHT) +
      (factors.popularity * this.POPULARITY_WEIGHT) +
      (factors.category * this.CATEGORY_WEIGHT) +
      (factors.userPreferences * this.USER_PREFERENCES_WEIGHT);

    return {
      ...entry,
      relevanceScore: Math.min(comprehensiveScore, 1.0),
      qualityScore: factors.quality,
      freshnessScore: factors.freshness,
      popularityScore: factors.popularity
    };
  }

  /**
   * Calculate individual ranking factors
   */
  private calculateRankingFactors(
    entry: KnowledgeEntry,
    context: SearchContext
  ): RankingFactors {
    return {
      relevance: this.calculateRelevanceScore(entry, context.query),
      quality: this.calculateQualityScore(entry),
      freshness: this.calculateFreshnessScore(entry),
      popularity: this.calculatePopularityScore(entry),
      category: this.calculateCategoryScore(entry, context),
      userPreferences: this.calculateUserPreferenceScore(entry, context)
    };
  }

  /**
   * Calculate relevance score based on query match
   */
  private calculateRelevanceScore(entry: KnowledgeEntry, query: string): number {
    if (!query) return 0;

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);
    let score = 0;

    // Exact matches get highest scores
    if (entry.title.toLowerCase() === queryLower) score += 1.0;
    else if (entry.title.toLowerCase().includes(queryLower)) score += 0.8;

    // Content relevance
    if (entry.content.toLowerCase().includes(queryLower)) score += 0.6;

    // Word-based matching with position weighting
    queryWords.forEach((word, index) => {
      const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
      const positionWeight = 1 - (index * 0.1); // Earlier words are more important
      
      const titleMatches = (entry.title.match(wordRegex) || []).length;
      const contentMatches = (entry.content.match(wordRegex) || []).length;
      const tagMatches = (entry.tags?.join(' ').match(wordRegex) || []).length;
      
      score += (titleMatches * 0.4 * positionWeight);
      score += (contentMatches * 0.2 * positionWeight);
      score += (tagMatches * 0.3 * positionWeight);
    });

    // Semantic similarity (simplified)
    score += this.calculateSemanticSimilarity(entry, queryWords);

    // Normalize and cap score
    return Math.min(score / 3, 1.0);
  }

  /**
   * Calculate semantic similarity score
   */
  private calculateSemanticSimilarity(entry: KnowledgeEntry, queryWords: string[]): number {
    const synonyms = {
      'programming': ['coding', 'development', 'software'],
      'mathematics': ['math', 'calculus', 'algebra'],
      'physics': ['mechanics', 'thermodynamics', 'optics'],
      'engineering': ['technical', 'design', 'construction'],
      'study': ['learning', 'education', 'academic'],
      'exam': ['test', 'evaluation', 'assessment']
    };

    let semanticScore = 0;
    const entryText = `${entry.title} ${entry.content} ${entry.tags?.join(' ')}`.toLowerCase();

    queryWords.forEach(word => {
      const relatedWords = synonyms[word] || [];
      relatedWords.forEach(related => {
        if (entryText.includes(related)) {
          semanticScore += 0.3;
        }
      });
    });

    return Math.min(semanticScore, 0.5);
  }

  /**
   * Calculate quality score based on content characteristics
   */
  private calculateQualityScore(entry: KnowledgeEntry): number {
    let score = 0.5; // Base score

    // Content length (optimal range: 100-1000 characters)
    const contentLength = entry.content.length;
    if (contentLength >= 100 && contentLength <= 1000) score += 0.3;
    else if (contentLength > 1000) score += 0.1;

    // Title quality
    const titleLength = entry.title.length;
    if (titleLength >= 10 && titleLength <= 80) score += 0.2;

    // Has rules defined
    if (entry.rules && entry.rules.trim().length > 0) score += 0.2;

    // Has tags
    if (entry.tags && entry.tags.length > 0) score += 0.1;
    if (entry.tags && entry.tags.length >= 3) score += 0.1;

    // Content structure quality
    if (this.hasGoodStructure(entry.content)) score += 0.2;

    return Math.min(score, 1.0);
  }

  /**
   * Check if content has good structure
   */
  private hasGoodStructure(content: string): boolean {
    const hasHeaders = /^#|^\*\*/.test(content);
    const hasBulletPoints = /^\s*[-*•]/.test(content);
    const hasExamples = /example|for instance|such as/i.test(content);
    
    return hasHeaders || hasBulletPoints || hasExamples;
  }

  /**
   * Calculate freshness score based on creation/update time
   */
  private calculateFreshnessScore(entry: KnowledgeEntry): number {
    if (!entry.updatedAt && !entry.createdAt) return 0.5;

    const dateString = entry.updatedAt || entry.createdAt;
    if (!dateString) return 0.5;

    try {
      const entryDate = new Date(dateString);
      const now = new Date();
      const daysSinceUpdate = (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);

      // Fresher content gets higher scores
      if (daysSinceUpdate <= 7) return 1.0;      // Last week
      if (daysSinceUpdate <= 30) return 0.8;     // Last month
      if (daysSinceUpdate <= 90) return 0.6;     // Last 3 months
      if (daysSinceUpdate <= 365) return 0.4;    // Last year
      return 0.2;                                 // Older than a year

    } catch (error) {
      console.warn('Error calculating freshness score:', error);
      return 0.5;
    }
  }

  /**
   * Calculate popularity score (simplified - could be enhanced with actual usage data)
   */
  private calculatePopularityScore(entry: KnowledgeEntry): number {
    // This is a simplified version. In a real system, you'd track:
    // - View counts, like counts, share counts
    // - User interaction metrics
    // - Feedback ratings
    
    let score = 0.5; // Base score
    
    // Category popularity (some categories might be more popular)
    const popularCategories = ['programming', 'mathematics', 'physics', 'general'];
    if (popularCategories.includes(entry.category.toLowerCase())) {
      score += 0.2;
    }

    // Content engagement indicators
    if (entry.content.length > 200) score += 0.1; // Longer content might be more comprehensive
    if (entry.tags && entry.tags.length >= 3) score += 0.1; // Well-tagged content
    
    return Math.min(score, 1.0);
  }

  /**
   * Calculate category relevance score
   */
  private calculateCategoryScore(entry: KnowledgeEntry, context: SearchContext): number {
    if (!context.userCategory) return 0.5;

    if (entry.category.toLowerCase() === context.userCategory.toLowerCase()) {
      return 1.0;
    }

    // Related categories
    const categoryRelations = {
      'computer science': ['programming', 'software', 'algorithms'],
      'mathematics': ['physics', 'engineering', 'statistics'],
      'physics': ['mathematics', 'engineering', 'mechanics'],
      'mechanical': ['physics', 'engineering', 'design'],
      'electrical': ['electronics', 'physics', 'engineering']
    };

    const userCat = context.userCategory.toLowerCase();
    const entryCat = entry.category.toLowerCase();
    
    if (categoryRelations[userCat]?.includes(entryCat) || 
        categoryRelations[entryCat]?.includes(userCat)) {
      return 0.7;
    }

    return 0.3;
  }

  /**
   * Calculate user preference score based on search context
   */
  private calculateUserPreferenceScore(entry: KnowledgeEntry, context: SearchContext): number {
    let score = 0.5;

    // User level preference
    if (context.userLevel) {
      const contentComplexity = this.assessContentComplexity(entry.content);
      
      if (context.userLevel === 'beginner' && contentComplexity === 'simple') score += 0.3;
      else if (context.userLevel === 'intermediate' && contentComplexity === 'moderate') score += 0.3;
      else if (context.userLevel === 'advanced' && contentComplexity === 'complex') score += 0.3;
    }

    // Time-based preferences
    if (context.timeOfDay) {
      // Morning: prefer structured, educational content
      // Evening: prefer quick, practical content
      if (context.timeOfDay === 'morning' && this.hasGoodStructure(entry.content)) score += 0.1;
      else if (context.timeOfDay === 'evening' && entry.content.length < 500) score += 0.1;
    }

    // Search type preference
    if (context.searchType) {
      if (context.searchType === 'quick' && entry.content.length < 300) score += 0.2;
      else if (context.searchType === 'detailed' && entry.content.length > 500) score += 0.2;
      else if (context.searchType === 'research' && entry.rules.length > 0) score += 0.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Assess content complexity
   */
  private assessContentComplexity(content: string): 'simple' | 'moderate' | 'complex' {
    const complexWords = ['algorithm', 'implementation', 'optimization', 'methodology', 'theoretical'];
    const technicalTerms = content.toLowerCase().split(' ')
      .filter(word => complexWords.some(complex => word.includes(complex))).length;

    if (technicalTerms >= 5) return 'complex';
    if (technicalTerms >= 2) return 'moderate';
    return 'simple';
  }

  /**
   * Get search suggestions based on partial query
   */
  public getSearchSuggestions(
    partialQuery: string,
    availableEntries: KnowledgeEntry[],
    limit: number = 5
  ): string[] {
    const queryLower = partialQuery.toLowerCase();
    const suggestions = new Set<string>();

    // Extract suggestions from titles
    availableEntries.forEach(entry => {
      const words = entry.title.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.startsWith(queryLower) && word.length > queryLower.length) {
          suggestions.add(word);
        }
      });
    });

    // Extract suggestions from tags
    availableEntries.forEach(entry => {
      entry.tags?.forEach(tag => {
        const tagLower = tag.toLowerCase();
        if (tagLower.startsWith(queryLower) && tagLower.length > queryLower.length) {
          suggestions.add(tagLower);
        }
      });
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Analyze search patterns to improve future rankings
   */
  public analyzeSearchPatterns(
    queries: string[],
    clickedResults: KnowledgeEntry[]
  ): void {
    // This would be implemented to:
    // 1. Track which results get clicked for specific queries
    // 2. Learn user preferences over time
    // 3. Adjust ranking weights based on user behavior
    // 4. Identify common search patterns
    
    console.log('📈 Analyzing search patterns for future improvements');
    console.log('Recent queries:', queries.slice(-5));
    console.log('Popular results:', clickedResults.map(r => r.title).slice(-5));
  }
}

// Export singleton instance
export const searchRankingService = new SearchRankingService();
export type { KnowledgeEntry, SearchContext, RankingFactors };
