import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatResponse {
  message: string
  sources?: string[]
}

/**
 * Send a message to Gemini with context
 */
export async function chatWithGemini(
  messages: ChatMessage[],
  context?: string
): Promise<ChatResponse> {
  try {
    // Build system instruction with context if provided
    let systemInstruction = `You are Nexus, an AI learning assistant for university students. You help students understand their course materials, explain complex concepts simply, and generate practice questions.

Respond in a clear, concise, and helpful manner. Use examples when helpful.`

    if (context) {
      systemInstruction += `\n\nContext from study materials:\n${context}`
    }

    // Convert messages to format expected by SDK
    const history: Array<{ role: string; parts: Array<{ text: string }> }> =
      messages.slice(0, -1).map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      }))

    const lastMessage = messages[messages.length - 1]

    // Use chats API for conversation history
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      history,
      config: {
        systemInstruction,
      },
    })

    const response = await chat.sendMessage({
      message: lastMessage.content,
    })

    return {
      message: response.text || '',
    }
  } catch (error) {
    console.error('Gemini chat error:', error)
    throw new Error('Failed to get response from AI')
  }
}

/**
 * Generate a quiz from materials
 */
export async function generateQuiz(
  topic: string,
  context: string,
  difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
  questionCount: number = 5
): Promise<any> {
  try {
    const prompt = `Generate ${questionCount} multiple choice questions about "${topic}" based on the following material.

Context:
${context}

Requirements:
- Difficulty: ${difficulty}
- Format: JSON array of objects with: question, options (array of 4), correctAnswer, explanation
- Options should be labeled A, B, C, D
- Questions should test understanding, not just recall
Return only the JSON, no additional text.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    const text = response.text || ''

    // Try to parse JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch (e) {
        console.error('Failed to parse quiz JSON:', e)
      }
    }

    throw new Error('Failed to generate quiz')
  } catch (error) {
    console.error('Quiz generation error:', error)
    throw new Error('Failed to generate quiz')
  }
}

/**
 * Generic text generation
 */
export async function generateText(prompt: string): Promise<string> {
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
    })

    // In @google/genai 1.x, the text property is directly available
    return result.text || ''
  } catch (error) {
    console.error('Text generation error:', error)
    throw new Error('Failed to generate text from AI')
  }
}

/**
 * Summarize a document
 */
export async function summarizeDocument(content: string): Promise<string> {
  try {
    const prompt = `Summarize the following content in a clear, concise manner suitable for studying:

${content}

Provide:
1. Key concepts (bulleted list)
2. Main takeaways
3. Important definitions
Keep it under 500 words.`

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    })

    return response.text || ''
  } catch (error) {
    console.error('Summarization error:', error)
    throw new Error('Failed to summarize')
  }
}
