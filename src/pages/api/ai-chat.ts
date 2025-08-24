import { NextApiRequest, NextApiResponse } from 'next';

// Try to import serverDatabases, but handle gracefully if it fails
let serverDatabases: any = null;
try {
  const appwriteServer = require('../../lib/appwrite-server');
  serverDatabases = appwriteServer.serverDatabases;
} catch (error) {
  console.warn('Appwrite server not available, knowledge base will be disabled:', (error as Error).message);
}

// Google AI API Integration
const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY || 'AIzaSyAvCCWU4yYQmTSuoIk9mXSyhXxjUUQxh-w';
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// JEHUB-specific system prompt
const SYSTEM_PROMPT = `You are an AI Mentor for JEHUB (Jharkhand Engineer's Hub), a platform focused on helping diploma and engineering students in Jharkhand, India. Your role is to:

**Primary Focus Areas:**
1. **Diploma & Engineering Studies**: Help with polytechnic and engineering subjects like thermodynamics, electrical circuits, mechanical engineering, computer science, electronics, civil engineering, mathematics, and physics.

2. **JEHUB Platform**: Assist users with JEHUB features like downloading notes, uploading content, earning points, using the community features, and understanding the referral system.

3. **Career Guidance**: Provide advice on career paths after diploma, lateral entry to B.Tech, internship opportunities, placement preparation, and industry insights specific to Jharkhand and India.

4. **Academic Support**: Help with study strategies, exam preparation tips, project guidance, and understanding complex engineering concepts.

**Platform Context:**
- JEHUB serves students from colleges across Jharkhand
- Focus on practical, industry-relevant learning
- Community-driven platform with notes sharing
- Points-based reward system
- WhatsApp and Telegram community groups
- Career guidance and placement support

**Communication Style:**
- Friendly and encouraging tone
- Use simple, clear explanations
- Provide practical examples relevant to Indian engineering education
- Be supportive of students' academic and career goals
- Reference JEHUB features when relevant

**Key Guidelines:**
- Always be helpful and educational
- Encourage community participation
- Promote quality education and ethical practices
- Support student success and career development
- Be culturally aware of Indian engineering education system

If you're unsure about JEHUB-specific features, guide users to contact the platform administrators or check the help section.`;

interface ChatMessage {
  message: string;
  context?: string;
}

// Default knowledge base for when Appwrite collection is not available
function getDefaultKnowledgeContext(userMessage: string): string {
  const messageLower = userMessage.toLowerCase();
  
  const defaultKnowledge = [
    {
      keywords: ['jehub', 'platform', 'about', 'what is', 'features'],
      content: 'JEHUB (Jharkhand Engineer\'s Hub) is an educational platform for diploma and engineering students in Jharkhand. Features include note sharing, AI mentoring, points system (+30 for uploads, +50 for referrals), community groups, and career guidance.'
    },
    {
      keywords: ['points', 'rewards', 'earn', 'download'],
      content: 'JEHUB points system: Upload notes (+30 points), refer friends (+50 points), complete profile (+20 points). Use points to download premium content and unlock features.'
    },
    {
      keywords: ['career', 'job', 'placement', 'diploma', 'btech'],
      content: 'Career paths after diploma: Direct industry jobs, lateral entry to B.Tech (2nd year), government jobs (SSC, Railway), entrepreneurship, specialized courses. Jharkhand has opportunities in steel, mining, power, and manufacturing industries.'
    },
    {
      keywords: ['study', 'tips', 'exam', 'preparation', 'learning'],
      content: 'Effective study strategies: Active problem-solving, mind mapping, regular revision, group study, practical application, visual aids, breaking complex topics into parts, seeking help, maintaining study-life balance.'
    },
    {
      keywords: ['thermodynamics', 'heat', 'energy', 'mechanical'],
      content: 'Thermodynamics basics: Deals with heat, work, temperature, energy. Key concepts: Systems, First Law (energy conservation), Second Law (entropy), processes (isothermal, adiabatic, isobaric, isochoric), heat engines, Carnot cycle.'
    }
  ];
  
  const relevant = defaultKnowledge.filter(item => 
    item.keywords.some(keyword => messageLower.includes(keyword))
  );
  
  if (relevant.length === 0) {
    return '';
  }
  
  const contextString = relevant.map((item, index) => 
    `DEFAULT KNOWLEDGE ${index + 1}: ${item.content}`
  ).join('\n\n');
  
  return `\n\n=== RELEVANT PLATFORM KNOWLEDGE ===\n${contextString}\n\n=== INSTRUCTIONS ===\nUse the above information when relevant to the user's question, but feel free to expand with your general knowledge while maintaining your role as a JEHUB AI Mentor.\n`;
}

// Function to retrieve relevant knowledge base entries
async function getRelevantKnowledge(userMessage: string): Promise<string> {
  try {
    // Check if serverDatabases is available and environment variables are set
    if (!serverDatabases || !process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID) {
      console.log('Knowledge base not available - missing Appwrite server configuration');
      return '';
    }

    // Check if AI knowledge collection is configured
    const collectionId = process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID;
    if (!collectionId || collectionId === 'ai_knowledge_collection') {
      console.log('AI Knowledge collection not configured - using default knowledge');
      return getDefaultKnowledgeContext(userMessage);
    }

    console.log('Searching knowledge base for:', userMessage);

    const result = await serverDatabases.listDocuments(
      process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      collectionId,
      [`isActive=true`]
    );

    if (!result.documents || result.documents.length === 0) {
      console.log('No knowledge base entries found');
      return '';
    }

    console.log(`Found ${result.documents.length} active knowledge entries`);

    // Enhanced keyword matching with better scoring
    const messageLower = userMessage.toLowerCase();
    const words = messageLower.split(' ').filter(word => word.length > 2);
    
    const relevantEntries = result.documents
      .map((doc: any) => {
        let score = 0;
        
        // Title matching (highest weight)
        if (doc.title && doc.title.toLowerCase().includes(messageLower)) {
          score += 10;
        }
        
        // Category matching
        if (doc.category && words.some(word => doc.category.toLowerCase().includes(word))) {
          score += 5;
        }
        
        // Content matching
        if (doc.content) {
          const contentLower = doc.content.toLowerCase();
          const matchingWords = words.filter(word => contentLower.includes(word));
          score += matchingWords.length * 2;
        }
        
        // Tags matching
        if (doc.tags && Array.isArray(doc.tags)) {
          const matchingTags = doc.tags.filter((tag: any) => 
            messageLower.includes(tag.toLowerCase()) || 
            words.some((word: string) => tag.toLowerCase().includes(word))
          );
          score += matchingTags.length * 3;
        }
        
        return { ...doc, relevanceScore: score };
      })
      .filter((doc: any) => doc.relevanceScore > 0)
      .sort((a: any, b: any) => b.relevanceScore - a.relevanceScore)
      .slice(0, 3); // Top 3 most relevant

    if (relevantEntries.length === 0) {
      console.log('No relevant knowledge entries found for query');
      return '';
    }

    console.log(`Found ${relevantEntries.length} relevant knowledge entries`);

    // Format knowledge entries for AI context
    const knowledgeContext = relevantEntries.map((entry: any, index: number) => {
      let formattedEntry = `KNOWLEDGE ENTRY ${index + 1}:
TITLE: ${entry.title}
CATEGORY: ${entry.category}
CONTENT: ${entry.content}`;
      
      if (entry.rules) {
        formattedEntry += `
RESPONSE RULES: ${entry.rules}`;
      }
      
      if (entry.tags && entry.tags.length > 0) {
        formattedEntry += `
TAGS: ${entry.tags.join(', ')}`;
      }
      
      formattedEntry += `
RELEVANCE SCORE: ${entry.relevanceScore}`;
      
      return formattedEntry + '\n---';
    }).join('\n\n');

    const contextString = `\n\n=== RELEVANT KNOWLEDGE BASE ENTRIES ===\n${knowledgeContext}\n\n=== INSTRUCTIONS ===\nIf the user's question relates to any of the above knowledge base entries, prioritize using that information in your response. If the knowledge base entries are highly relevant, use them as the primary source. If they are only somewhat relevant, incorporate them as supporting information. If they are not relevant to the user's question, respond based on your general knowledge while maintaining your role as a JEHUB AI Mentor.\n`;

    console.log('Knowledge base context prepared successfully');
    return contextString;
    
  } catch (error) {
    console.error('Error retrieving knowledge base:', error);
    console.error('Error details:', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      serverDatabasesAvailable: !!serverDatabases,
      databaseId: !!process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
      collectionId: !!process.env.NEXT_PUBLIC_APPWRITE_AI_KNOWLEDGE_COLLECTION_ID
    });
    
    // Return empty string on error so AI can still respond with general knowledge
    return '';
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Add CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log('AI Chat API called with:', {
    method: req.method,
    hasBody: !!req.body,
    bodyType: typeof req.body,
    contentType: req.headers['content-type'],
    timestamp: new Date().toISOString()
  });

  try {
    // Validate request body
    if (!req.body) {
      console.error('No request body received');
      return res.status(400).json({ error: 'Request body is required' });
    }

    const { message, context }: ChatMessage = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      console.error('Invalid message received:', { message, type: typeof message });
      return res.status(400).json({ error: 'Valid message is required' });
    }

    console.log('Processing message:', message.substring(0, 100) + (message.length > 100 ? '...' : ''));

    // Validate Google AI API key
    if (!GOOGLE_AI_API_KEY || GOOGLE_AI_API_KEY === 'your-api-key-here') {
      console.error('Google AI API key not configured properly');
      return res.status(500).json({
        error: 'AI service configuration error',
        response: 'Sorry, the AI service is not properly configured. Please contact the administrator.'
      });
    }

    // Get relevant knowledge base entries
    const knowledgeContext = await getRelevantKnowledge(message);

    // Prepare the request payload for Google AI
    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: `${SYSTEM_PROMPT}${knowledgeContext}\n\nUser Question: ${message}\n\n${context ? `Additional Context: ${context}` : ''}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
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
    };

    // Make request to Google AI API
    const response = await fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Google AI API Error:', errorData);
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();

    // Extract the response text
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Return the AI response
    res.status(200).json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    // Return a helpful error message
    res.status(500).json({
      error: 'I apologize, but I\'m experiencing technical difficulties right now. Please try again in a moment, or contact the JEHUB support team if the issue persists.',
      response: 'Sorry, I\'m temporarily unavailable. As your AI Mentor, I\'m here to help with your engineering studies and JEHUB platform questions. Please try asking your question again in a moment!'
    });
  }
}
