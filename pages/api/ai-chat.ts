import { NextApiRequest, NextApiResponse } from 'next';
import { serverDatabases } from '../../src/lib/appwrite-server';

// Import the new enhanced search service
interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  rules: string;
  isActive: boolean;
  tags: string[];
  relevanceScore?: number;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface SearchResult {
  source: 'knowledge_base' | 'ai_fallback';
  response: string;
  relevanceScore: number;
  knowledgeEntries?: KnowledgeEntry[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Enhanced AI Search Service Implementation
 * Now uses knowledge base first, then AI fallback approach
 */
class AISearchServiceServer {
  private async searchKnowledgeBase(query: string): Promise<SearchResult> {
    try {
      console.log('🔍 Searching knowledge base for:', query.substring(0, 50) + '...');
      
      const knowledgeResult = await serverDatabases.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID!,
        ['isActive=true']
      );
      
      if (knowledgeResult.documents.length === 0) {
        console.log('📭 No knowledge entries available');
        return {
          source: 'knowledge_base',
          response: '',
          relevanceScore: 0,
          confidence: 'low',
          knowledgeEntries: []
        };
      }

      const knowledgeEntries: KnowledgeEntry[] = knowledgeResult.documents.map(doc => ({
        id: doc.$id,
        title: doc.title,
        content: doc.content,
        category: doc.category,
        rules: doc.rules,
        isActive: doc.isActive,
        tags: doc.tags || []
      }));

      // Find relevant entries
      const relevantEntries = this.findRelevantEntries(query, knowledgeEntries);
      
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
      const response = this.buildKnowledgeResponse(relevantEntries, query);
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

  private findRelevantEntries(query: string, entries: KnowledgeEntry[]): KnowledgeEntry[] {
    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 2);

    return entries
      .filter(entry => entry.isActive)
      .map(entry => {
        let score = 0;
        
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

  private buildKnowledgeResponse(entries: KnowledgeEntry[], query: string): string {
    if (entries.length === 0) return '';

    const intro = entries.length === 1 
      ? "Based on our knowledge base, here's what I found:"
      : "I found several relevant topics in our knowledge base:";

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

  public async enhancedSearch(query: string, conversationHistory: ChatMessage[] = []): Promise<SearchResult> {
    // Step 1: Search knowledge base first
    const knowledgeResult = await this.searchKnowledgeBase(query);
    
    if (knowledgeResult.confidence === 'high') {
      console.log('✅ High confidence knowledge base result found');
      return knowledgeResult;
    }

    // Step 2: If we have medium confidence or some results, try hybrid approach
    if (knowledgeResult.confidence === 'medium' || (knowledgeResult.knowledgeEntries && knowledgeResult.knowledgeEntries.length > 0)) {
      console.log('🔄 Attempting hybrid approach with knowledge + AI');
      const hybridResult = await this.hybridSearch(query, knowledgeResult, conversationHistory);
      if (hybridResult) {
        return hybridResult;
      }
    }

    // Step 3: Fallback to AI with any available knowledge context
    console.log('🤖 Falling back to AI with available context');
    return await this.fallbackToAI(query, knowledgeResult.knowledgeEntries || [], conversationHistory);
  }

  private async hybridSearch(query: string, knowledgeResult: SearchResult, conversationHistory: ChatMessage[]): Promise<SearchResult | null> {
    if (!knowledgeResult.knowledgeEntries || knowledgeResult.knowledgeEntries.length === 0) {
      return null;
    }

    try {
      // Build enhanced prompt with knowledge context
      const knowledgeContext = knowledgeResult.knowledgeEntries
        .map(entry => `Title: ${entry.title}\nContent: ${entry.content}\nRules: ${entry.rules || 'None'}`)
        .join('\n\n---\n\n');

      const hybridPrompt = `You are a helpful AI assistant for engineering students at Jharkhand Engineer's Hub (JEHub). 

Based on the following knowledge base entries, provide a comprehensive answer to the user's question. Use the knowledge base as your primary source, but you may supplement with your general knowledge if needed.

KNOWLEDGE BASE ENTRIES:
${knowledgeContext}

USER QUESTION: ${query}

Provide a helpful, accurate response that primarily uses the knowledge base information. If the knowledge base doesn't fully address the question, you may add relevant general information but clearly distinguish between knowledge base content and general information.`;

      // Call AI with enhanced context
      const aiResponse = await this.callAI(hybridPrompt, conversationHistory);

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

  private async fallbackToAI(query: string, knowledgeEntries: KnowledgeEntry[], conversationHistory: ChatMessage[]): Promise<SearchResult> {
    try {
      // Build context from available knowledge
      let knowledgeContext = '';
      if (knowledgeEntries.length > 0) {
        knowledgeContext = knowledgeEntries
          .slice(0, 5) // Limit to avoid token overflow
          .map(entry => `${entry.title}: ${entry.content}`)
          .join('\n\n');
      }

      const fallbackPrompt = `You are a helpful AI assistant for engineering students at Jharkhand Engineer's Hub (JEHub). Provide helpful guidance for engineering studies, career advice, and academic questions.

${knowledgeContext ? `Available context from our knowledge base:\n${knowledgeContext}\n\n` : ''}User question: ${query}

Please provide a helpful response ${knowledgeContext ? 'that incorporates any relevant context from above while maintaining accuracy' : 'focusing on accuracy and educational value'} for engineering students.`;

      const response = await this.callAI(fallbackPrompt, conversationHistory);

      console.log('🔄 AI fallback completed');

      return {
        source: 'ai_fallback',
        response: response || "I'm here to help with your engineering studies! Could you please rephrase your question or be more specific about what you'd like to know?",
        relevanceScore: 0.6,
        confidence: 'medium'
      };

    } catch (error) {
      console.error('❌ Error in AI fallback:', error);
      return {
        source: 'ai_fallback',
        response: "I apologize, but I'm experiencing some technical difficulties right now. Please try again in a moment, or feel free to browse our notes while I recover.",
        relevanceScore: 0.1,
        confidence: 'low'
      };
    }
  }

  private async callAI(prompt: string, conversationHistory: ChatMessage[]): Promise<string | null> {
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
    
    if (!apiKey) {
      console.error('Google AI API key not found');
      return null;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1000,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      });

      const data = await response.json();
      
      if (response.ok && data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts) {
        const parts = data.candidates[0].content.parts;
        if (parts.length > 0 && parts[0].text) {
          return parts[0].text.trim();
        }
      }
      
      console.warn('AI API responded with unexpected format:', data);
      return null;
    } catch (error) {
      console.error('Error calling AI API:', error);
      return null;
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, conversationHistory } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Initialize the enhanced search service
    const searchService = new AISearchServiceServer();
    
    console.log('🚀 Starting enhanced AI search for query:', message.substring(0, 50) + '...');
    
    // Use the enhanced search approach
    const searchResult = await searchService.enhancedSearch(
      message, 
      conversationHistory || []
    );
    
    // Log the conversation for analytics
    try {
      console.log(`AI Chat - Source: ${searchResult.source} | Confidence: ${searchResult.confidence} | Relevance: ${searchResult.relevanceScore.toFixed(2)} | User: ${message.substring(0, 100)}... | AI: ${searchResult.response.substring(0, 100)}...`);
    } catch (logError) {
      console.warn('Failed to log conversation:', logError);
    }

    return res.status(200).json({
      response: searchResult.response,
      success: true,
      metadata: {
        source: searchResult.source,
        confidence: searchResult.confidence,
        relevanceScore: searchResult.relevanceScore,
        knowledgeEntriesCount: searchResult.knowledgeEntries?.length || 0
      }
    });

  } catch (error: any) {
    console.error('AI Chat API Error:', error);
    
    // Provide a helpful error response
    let errorMessage = 'I apologize, but I\'m currently experiencing technical difficulties. Please try again later.';
    
    if (error.message?.includes('API key')) {
      errorMessage = 'I\'m currently unable to process your request due to a configuration issue. Please contact support.';
    } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
      errorMessage = 'I\'m having trouble connecting to my AI services. Please check your internet connection and try again.';
    }

    return res.status(500).json({ 
      error: 'Internal server error',
      response: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}
