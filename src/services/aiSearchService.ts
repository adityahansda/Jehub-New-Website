/**
 * Enhanced AI Search Service
 * Prioritizes knowledge base search before falling back to general AI responses
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
}

interface SearchResult {
  source: 'knowledge_base' | 'ai_fallback';
  response: string;
  relevanceScore: number;
  knowledgeEntries?: KnowledgeEntry[];
  confidence: 'high' | 'medium' | 'low';
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

class AISearchService {
  private knowledgeCache: KnowledgeEntry[] = [];
  private cacheExpiry: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Main search method that prioritizes knowledge base
   */
  async search(
    query: string, 
    conversationHistory: ChatMessage[] = [], 
    language: string = 'english'
  ): Promise<SearchResult> {
    console.log('🔍 Starting enhanced AI search for query:', query.substring(0, 50) + '...');

    try {
      // Step 1: Search knowledge base first
      const knowledgeResult = await this.searchKnowledgeBase(query, language);
      
      if (knowledgeResult.confidence === 'high') {
        console.log('✅ High confidence knowledge base result found');
        return knowledgeResult;
      }

      // Step 2: If knowledge base has medium confidence, try hybrid approach
      if (knowledgeResult.confidence === 'medium') {
        console.log('🔄 Medium confidence KB result, attempting hybrid approach');
        const hybridResult = await this.hybridSearch(query, knowledgeResult, conversationHistory, language);
        if (hybridResult) {
          return hybridResult;
        }
      }

      // Step 3: Fallback to AI with knowledge context
      console.log('🤖 Falling back to AI with knowledge context');
      const aiResult = await this.fallbackToAI(query, this.knowledgeCache, conversationHistory, language);
      
      // If we have any knowledge result, merge it
      if (knowledgeResult.knowledgeEntries && knowledgeResult.knowledgeEntries.length > 0) {
        return {
          ...aiResult,
          source: 'knowledge_base',
          knowledgeEntries: knowledgeResult.knowledgeEntries,
          confidence: 'medium'
        };
      }

      return aiResult;

    } catch (error) {
      console.error('❌ Error in enhanced search:', error);
      
      // Ultimate fallback to basic AI
      return await this.basicAIFallback(query, conversationHistory, language);
    }
  }

  /**
   * Search the knowledge base for relevant entries
   */
  private async searchKnowledgeBase(query: string, language: string): Promise<SearchResult> {
    try {
      // Load knowledge entries if cache is expired
      if (Date.now() > this.cacheExpiry) {
        await this.loadKnowledgeEntries();
      }

      if (this.knowledgeCache.length === 0) {
        console.log('📭 No knowledge entries available');
        return {
          source: 'knowledge_base',
          response: '',
          relevanceScore: 0,
          confidence: 'low',
          knowledgeEntries: []
        };
      }

      // Perform semantic search on knowledge base
      const relevantEntries = this.findRelevantEntries(query, this.knowledgeCache);
      
      if (relevantEntries.length === 0) {
        console.log('🚫 No relevant knowledge entries found');
        return {
          source: 'knowledge_base',
          response: '',
          relevanceScore: 0,
          confidence: 'low',
          knowledgeEntries: []
        };
      }

      // Build response from knowledge entries
      const response = this.buildKnowledgeResponse(relevantEntries, query, language);
      const avgRelevance = relevantEntries.reduce((sum, entry) => sum + (entry.relevanceScore || 0), 0) / relevantEntries.length;
      
      let confidence: 'high' | 'medium' | 'low' = 'low';
      if (avgRelevance > 0.8) confidence = 'high';
      else if (avgRelevance > 0.5) confidence = 'medium';

      console.log(`📊 Knowledge base search: ${relevantEntries.length} entries, avg relevance: ${avgRelevance.toFixed(2)}, confidence: ${confidence}`);

      return {
        source: 'knowledge_base',
        response,
        relevanceScore: avgRelevance,
        confidence,
        knowledgeEntries: relevantEntries
      };

    } catch (error) {
      console.error('❌ Error searching knowledge base:', error);
      return {
        source: 'knowledge_base',
        response: '',
        relevanceScore: 0,
        confidence: 'low',
        knowledgeEntries: []
      };
    }
  }

  /**
   * Hybrid approach: combine knowledge base with AI enhancement
   */
  private async hybridSearch(
    query: string,
    knowledgeResult: SearchResult,
    conversationHistory: ChatMessage[],
    language: string
  ): Promise<SearchResult | null> {
    try {
      if (!knowledgeResult.knowledgeEntries || knowledgeResult.knowledgeEntries.length === 0) {
        return null;
      }

      // Build enhanced prompt with knowledge context
      const knowledgeContext = knowledgeResult.knowledgeEntries
        .map(entry => `Title: ${entry.title}\nContent: ${entry.content}\nRules: ${entry.rules || 'None'}`)
        .join('\n\n---\n\n');

      const enhancedPrompt = this.buildHybridPrompt(query, knowledgeContext, language);

      // Call AI with enhanced context
      const aiResponse = await this.callAI(enhancedPrompt, conversationHistory, language);

      if (aiResponse) {
        console.log('🎯 Hybrid search successful');
        return {
          source: 'knowledge_base',
          response: aiResponse,
          relevanceScore: Math.min(knowledgeResult.relevanceScore + 0.2, 1.0),
          confidence: 'high',
          knowledgeEntries: knowledgeResult.knowledgeEntries
        };
      }

      return null;

    } catch (error) {
      console.error('❌ Error in hybrid search:', error);
      return null;
    }
  }

  /**
   * Fallback to AI with available knowledge context
   */
  private async fallbackToAI(
    query: string,
    knowledgeEntries: KnowledgeEntry[],
    conversationHistory: ChatMessage[],
    language: string
  ): Promise<SearchResult> {
    try {
      // Build context from available knowledge
      let knowledgeContext = '';
      if (knowledgeEntries.length > 0) {
        const relevantEntries = knowledgeEntries
          .filter(entry => entry.isActive)
          .slice(0, 5); // Limit to top 5 to avoid token overflow

        knowledgeContext = relevantEntries
          .map(entry => `${entry.title}: ${entry.content}`)
          .join('\n\n');
      }

      const fallbackPrompt = this.buildFallbackPrompt(query, knowledgeContext, language);
      const response = await this.callAI(fallbackPrompt, conversationHistory, language);

      console.log('🔄 AI fallback completed');

      return {
        source: 'ai_fallback',
        response: response || this.getDefaultResponse(language),
        relevanceScore: 0.6,
        confidence: 'medium'
      };

    } catch (error) {
      console.error('❌ Error in AI fallback:', error);
      return this.getErrorResponse(language);
    }
  }

  /**
   * Basic AI fallback when everything else fails
   */
  private async basicAIFallback(
    query: string,
    conversationHistory: ChatMessage[],
    language: string
  ): Promise<SearchResult> {
    try {
      const basicPrompt = this.buildBasicPrompt(query, language);
      const response = await this.callAI(basicPrompt, conversationHistory, language);

      return {
        source: 'ai_fallback',
        response: response || this.getDefaultResponse(language),
        relevanceScore: 0.4,
        confidence: 'low'
      };

    } catch (error) {
      console.error('❌ Error in basic AI fallback:', error);
      return this.getErrorResponse(language);
    }
  }

  /**
   * Load knowledge entries from API
   */
  private async loadKnowledgeEntries(): Promise<void> {
    try {
      console.log('📥 Loading knowledge entries from API...');
      
      const response = await fetch('/api/ai-knowledge?isActive=true&limit=100');
      const data = await response.json();

      if (response.ok && data.entries) {
        this.knowledgeCache = data.entries;
        this.cacheExpiry = Date.now() + this.CACHE_DURATION;
        console.log(`✅ Loaded ${this.knowledgeCache.length} knowledge entries`);
      } else {
        console.warn('⚠️ Failed to load knowledge entries:', data.error);
        this.knowledgeCache = [];
      }

    } catch (error) {
      console.error('❌ Error loading knowledge entries:', error);
      this.knowledgeCache = [];
    }
  }

  /**
   * Find relevant entries using semantic search
   */
  private findRelevantEntries(query: string, entries: KnowledgeEntry[]): KnowledgeEntry[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

    return entries
      .filter(entry => entry.isActive)
      .map(entry => {
        let score = 0;
        const entryText = `${entry.title} ${entry.content} ${entry.tags?.join(' ') || ''}`.toLowerCase();
        
        // Exact title match gets highest score
        if (entry.title.toLowerCase().includes(queryLower)) {
          score += 0.8;
        }
        
        // Content relevance
        queryWords.forEach(word => {
          const wordRegex = new RegExp(`\\b${word}\\b`, 'gi');
          const titleMatches = (entry.title.match(wordRegex) || []).length;
          const contentMatches = (entry.content.match(wordRegex) || []).length;
          const tagMatches = (entry.tags?.join(' ').match(wordRegex) || []).length;
          
          score += titleMatches * 0.3;
          score += contentMatches * 0.2;
          score += tagMatches * 0.25;
        });

        // Category relevance
        if (entry.category.toLowerCase().includes(queryLower)) {
          score += 0.4;
        }

        // Normalize score
        score = Math.min(score, 1.0);
        
        return { ...entry, relevanceScore: score };
      })
      .filter(entry => (entry.relevanceScore || 0) > 0.1)
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
      .slice(0, 5); // Return top 5 most relevant
  }

  /**
   * Build response from knowledge entries
   */
  private buildKnowledgeResponse(entries: KnowledgeEntry[], query: string, language: string): string {
    if (entries.length === 0) return '';

    const responses = {
      english: {
        intro: "Based on our knowledge base, here's what I found:",
        multipleIntro: "I found several relevant topics in our knowledge base:"
      },
      hindi: {
        intro: "हमारे ज्ञान आधार के अनुसार, यहाँ मुझे जो मिला:",
        multipleIntro: "मुझे हमारे ज्ञान आधार में कई प्रासंगिक विषय मिले:"
      },
      hinglish: {
        intro: "Hamare knowledge base ke according, yahan jo mila:",
        multipleIntro: "Mujhe hamare knowledge base mein kai relevant topics mile:"
      }
    };

    const lang = responses[language as keyof typeof responses] || responses.english;
    const intro = entries.length === 1 ? lang.intro : lang.multipleIntro;

    let response = `${intro}\n\n`;

    entries.forEach((entry, index) => {
      if (entries.length > 1) {
        response += `**${index + 1}. ${entry.title}**\n`;
      } else {
        response += `**${entry.title}**\n`;
      }
      
      response += `${entry.content}\n`;
      
      if (entry.rules && entry.rules.trim()) {
        response += `\n*Important:* ${entry.rules}\n`;
      }
      
      if (index < entries.length - 1) {
        response += '\n---\n\n';
      }
    });

    return response.trim();
  }

  /**
   * Build hybrid prompt combining knowledge and AI
   */
  private buildHybridPrompt(query: string, knowledgeContext: string, language: string): string {
    const prompts = {
      english: `You are a helpful AI assistant for engineering students at Jharkhand Engineer's Hub (JEHub). 

Based on the following knowledge base entries, provide a comprehensive answer to the user's question. Use the knowledge base as your primary source, but you may supplement with your general knowledge if needed.

KNOWLEDGE BASE ENTRIES:
${knowledgeContext}

USER QUESTION: ${query}

Provide a helpful, accurate response that primarily uses the knowledge base information. If the knowledge base doesn't fully address the question, you may add relevant general information but clearly distinguish between knowledge base content and general information.`,

      hindi: `आप झारखंड इंजीनियर हब (JEHub) के इंजीनियरिंग छात्रों के लिए एक सहायक AI असिस्टेंट हैं।

निम्नलिखित ज्ञान आधार प्रविष्टियों के आधार पर, उपयोगकर्ता के प्रश्न का विस्तृत उत्तर दें। ज्ञान आधार को अपने प्राथमिक स्रोत के रूप में उपयोग करें।

ज्ञान आधार प्रविष्टियां:
${knowledgeContext}

उपयोगकर्ता का प्रश्न: ${query}

एक सहायक, सटीक उत्तर दें जो मुख्यतः ज्ञान आधार की जानकारी का उपयोग करे।`,

      hinglish: `Aap Jharkhand Engineer's Hub (JEHub) ke engineering students ke liye ek helpful AI assistant hain.

Niche diye gaye knowledge base entries ke basis par, user ke question ka comprehensive answer dijiye. Knowledge base ko apna primary source use kariye.

KNOWLEDGE BASE ENTRIES:
${knowledgeContext}

USER QUESTION: ${query}

Ek helpful, accurate response dijiye jo mainly knowledge base information use kare.`
    };

    return prompts[language as keyof typeof prompts] || prompts.english;
  }

  /**
   * Build fallback prompt with available context
   */
  private buildFallbackPrompt(query: string, knowledgeContext: string, language: string): string {
    const basePrompt = `You are a helpful AI assistant for engineering students at Jharkhand Engineer's Hub (JEHub). Provide helpful guidance for engineering studies, career advice, and academic questions.`;
    
    if (knowledgeContext) {
      return `${basePrompt}

Available context from our knowledge base:
${knowledgeContext}

User question: ${query}

Please provide a helpful response that incorporates any relevant context from above while maintaining accuracy for engineering students.`;
    }

    return `${basePrompt}

User question: ${query}

Please provide a helpful response for engineering students, focusing on accuracy and educational value.`;
  }

  /**
   * Build basic prompt for ultimate fallback
   */
  private buildBasicPrompt(query: string, language: string): string {
    const prompts = {
      english: `You are a helpful AI assistant for engineering students. Please provide a helpful and educational response to: ${query}`,
      hindi: `आप इंजीनियरिंग छात्रों के लिए एक सहायक AI असिस्टेंट हैं। कृपया इसका सहायक और शैक्षिक उत्तर दें: ${query}`,
      hinglish: `Aap engineering students ke liye ek helpful AI assistant hain. Please is question ka helpful aur educational response dijiye: ${query}`
    };

    return prompts[language as keyof typeof prompts] || prompts.english;
  }

  /**
   * Call AI API
   */
  private async callAI(prompt: string, conversationHistory: ChatMessage[], language: string): Promise<string | null> {
    try {
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: prompt,
          conversationHistory: conversationHistory.slice(-10) // Last 10 messages
        }),
      });

      const data = await response.json();

      if (response.ok && data.response) {
        return data.response;
      }

      console.warn('AI API responded with error:', data.error);
      return null;

    } catch (error) {
      console.error('Error calling AI API:', error);
      return null;
    }
  }

  /**
   * Get default response for different languages
   */
  private getDefaultResponse(language: string): string {
    const responses = {
      english: "I'm here to help with your engineering studies! Could you please rephrase your question or be more specific about what you'd like to know?",
      hindi: "मैं आपकी इंजीनियरिंग की पढ़ाई में मदद करने के लिए यहाँ हूँ! कृपया अपना प्रश्न दोबारा पूछें या अधिक स्पष्ट करें कि आप क्या जानना चाहते हैं?",
      hinglish: "Main aapki engineering studies mein help karne ke liye yahan hun! Kripaya apna question phir se puchiye ya zyada specific bataiye ki aap kya janna chahte hain?"
    };

    return responses[language as keyof typeof responses] || responses.english;
  }

  /**
   * Get error response for different languages
   */
  private getErrorResponse(language: string): SearchResult {
    const responses = {
      english: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to browse our notes while I recover.",
      hindi: "मुझे खेद है, लेकिन अभी मुझे कुछ तकनीकी समस्याओं का सामना है। कृपया एक क्षण में पुनः प्रयास करें, या जब तक मैं ठीक नहीं हो जाता, आप हमारे नोट्स देख सकते हैं।",
      hinglish: "Mujhe maaf kariye, lekin abhi mujhe kuch technical problems aa rahe hain. Please thodi der mein try kariye, ya jab tak main theek nahi ho jata aap hamare notes dekh sakte hain."
    };

    const response = responses[language as keyof typeof responses] || responses.english;

    return {
      source: 'ai_fallback',
      response,
      relevanceScore: 0.1,
      confidence: 'low'
    };
  }

  /**
   * Clear knowledge cache (useful for testing or manual refresh)
   */
  public clearCache(): void {
    this.knowledgeCache = [];
    this.cacheExpiry = 0;
    console.log('🧹 Knowledge cache cleared');
  }

  /**
   * Get cache status for debugging
   */
  public getCacheStatus(): { entries: number; expiresIn: number; isValid: boolean } {
    const expiresIn = Math.max(0, this.cacheExpiry - Date.now());
    return {
      entries: this.knowledgeCache.length,
      expiresIn,
      isValid: expiresIn > 0
    };
  }
}

// Export singleton instance
export const aiSearchService = new AISearchService();
export type { SearchResult, KnowledgeEntry, ChatMessage };
