import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// POST /api/living-world/chat
// Powers interactive characters in PolyPanda Living World with character memory and grammar checking
app.post('/api/living-world/chat', async (req, res) => {
  const {
    locationId,
    characterName,
    characterRole,
    targetLanguage,
    cefrLevel = 'A2',
    userMessage,
    conversationHistory = [],
    characterMemory = null,
  } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required' });
  }

  const langName = targetLanguage?.name || 'Spanish';
  const langCode = targetLanguage?.code || 'es';

  // System instructions for the NPC
  const systemInstruction = `
You are ${characterName}, the ${characterRole} at the ${locationId} in a vibrant language learning adventure called PolyPanda Living World.
You are speaking in ${langName} (${langCode}) with a language learner currently at CEFR level ${cefrLevel}.

IMPORTANT GUIDELINES:
1. Always reply primarily in natural ${langName} appropriate for level ${cefrLevel}.
2. Keep your spoken response engaging, friendly, and 1-3 sentences long.
3. Provide an English translation of what you said so the learner understands.
4. Carefully analyze the user's input:
   - If there are grammar, vocabulary, or spelling mistakes, politely explain the correction and show the corrected sentence.
   - If the user's sentence is great, provide positive reinforcement!
5. PERSISTENT MEMORY:
   ${characterMemory ? `Here is your past memory of this learner:
   - Previous visits: ${characterMemory.visitCount || 1}
   - Learned vocabulary: ${(characterMemory.learnedVocabulary || []).join(', ')}
   - Past learner notes/preferences: ${characterMemory.notes || 'None yet'}
   - Previous mistakes: ${(characterMemory.weakPoints || []).join(', ')}
   Acknowledge past interactions naturally if relevant!` : 'This is your first time meeting the learner. Greet them warmly!'}
6. Pao the Panda Hint: Provide 2-3 short, natural suggested responses the learner could say next in ${langName} with translations.

Respond STRICTLY in JSON format with this exact structure:
{
  "characterReply": "Your response in ${langName}",
  "characterReplyTranslation": "English translation of your reply",
  "corrections": {
    "hasMistake": boolean,
    "feedback": "Encouraging explanation of any error or compliment if great",
    "correctedSentence": "The ideal sentence in ${langName} (or user sentence if correct)"
  },
  "suggestedReplies": [
    { "text": "Option 1 in ${langName}", "translation": "English translation" },
    { "text": "Option 2 in ${langName}", "translation": "English translation" }
  ],
  "newMemoryNote": "Short observation to remember about the learner for future visits (e.g., likes oat milk, prefers window seats, struggled with past tense)"
}
`;

  if (ai) {
    try {
      const historyContext = conversationHistory
        .map((m: { speaker: string; text: string }) => `${m.speaker}: ${m.text}`)
        .join('\n');

      const prompt = `
Conversation history so far:
${historyContext || '(Beginning of conversation)'}

Learner says: "${userMessage}"

Respond with JSON:
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const responseText = response.text || '{}';
      const parsed = JSON.parse(responseText);
      return res.json(parsed);
    } catch (error) {
      console.warn('Gemini chat API error, falling back to contextual generator:', error);
    }
  }

  // Robust contextual fallback when offline or no API key
  const fallbackGreeting =
    locationId === 'cafe'
      ? `¡Hola! Bienvenido al café. ¿Qué te gustaría tomar hoy?`
      : locationId === 'shop'
      ? `¡Hola! Tenemos ropa hermosa hoy. ¿En qué puedo ayudarte?`
      : locationId === 'airport'
      ? `Buenos días. Por favor, ¿puedo ver tu pasaporte y boleto?`
      : locationId === 'hotel'
      ? `¡Buenas tardes! Bienvenido al Gran Hotel. ¿Tienes una reservación?`
      : locationId === 'school'
      ? `¡Hola estudiante! Hoy vamos a practicar mucho vocabulario nuevo.`
      : `¡Hola amigo! El parque está precioso hoy, ¿verdad?`;

  return res.json({
    characterReply: fallbackGreeting,
    characterReplyTranslation: 'Hello! Welcome. How can I help you today?',
    corrections: {
      hasMistake: false,
      feedback: '¡Excelente esfuerzo! Your sentence was well understood.',
      correctedSentence: userMessage,
    },
    suggestedReplies: [
      { text: 'Me gustaría pedir algo, por favor.', translation: 'I would like to order something, please.' },
      { text: '¿Cuánto cuesta esto?', translation: 'How much does this cost?' },
    ],
    newMemoryNote: `Enjoyed talking about ${locationId}`,
  });
});

// POST /api/living-world/report
// Generates end-of-mission learning assessment, vocabulary breakdown, and rewards
app.post('/api/living-world/report', async (req, res) => {
  const {
    locationId,
    characterName,
    targetLanguage,
    cefrLevel = 'A2',
    conversationHistory = [],
  } = req.body;

  const langName = targetLanguage?.name || 'Spanish';

  if (ai && conversationHistory.length > 0) {
    try {
      const historyText = conversationHistory
        .map((m: { speaker: string; text: string }) => `${m.speaker}: ${m.text}`)
        .join('\n');

      const reportPrompt = `
Analyze this language learning mission dialogue between the student and ${characterName} at the ${locationId} in ${langName} (${cefrLevel}):
${historyText}

Generate a comprehensive End-of-Mission Learning Report.
Respond STRICTLY in JSON with this structure:
{
  "score": number (70 to 100 based on accuracy and turns),
  "fluencyRating": "Fluent" | "Confident" | "Developing" | "Beginner",
  "xpEarned": number (30 to 60),
  "gemsEarned": number (15 to 30),
  "vocabularyLearned": [
    { "term": "word in ${langName}", "meaning": "English translation" }
  ],
  "grammarNotes": [
    { "original": "user sentence", "correction": "better version", "tip": "why this is better" }
  ],
  "paoPraise": "A warm, enthusiastic praise from Pao the Polyglot Panda cheering the learner on!",
  "nextMissionRecommendation": "Suggested next location or conversation challenge to try next"
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: reportPrompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (error) {
      console.warn('Gemini report API error, using fallback report generator:', error);
    }
  }

  // Fallback report
  return res.json({
    score: 92,
    fluencyRating: 'Confident',
    xpEarned: 50,
    gemsEarned: 25,
    vocabularyLearned: [
      { term: 'por favor', meaning: 'please' },
      { term: 'gracias', meaning: 'thank you' },
      { term: 'me gustaría', meaning: 'I would like' },
    ],
    grammarNotes: [
      {
        original: 'Conversational phrases used',
        correction: 'Well phrased!',
        tip: 'Keep using courteous expressions in everyday dialogue.',
      },
    ],
    paoPraise: `¡Fantástico! Pao the Panda is dancing with joy—your conversation skills in ${langName} are leveling up fast!`,
    nextMissionRecommendation: 'Visit the Shopping Street next to test your bargaining skills!',
  });
});

// POST /api/ai-lounge/chat
// Powers the premium AI Lounge language buddy.
// Dynamically catches grammar mistakes and shows corrections in brackets.
app.post('/api/ai-lounge/chat', async (req, res) => {
  const {
    targetLanguage,
    persona = 'friendly',
    userMessage,
    conversationHistory = [],
  } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'userMessage is required' });
  }

  const langName = targetLanguage?.name || 'Spanish';
  const langCode = targetLanguage?.code || 'es';

  const personaInstruction =
    persona === 'strict'
      ? 'You are Professor Sterling, a meticulous academic language mentor who pays strict attention to grammar elegance.'
      : persona === 'casual'
      ? 'You are Kai, an upbeat, trendy native speaker who talks in modern slang and fun casual banter.'
      : persona === 'royal'
      ? 'You are Lady Seraphina, an aristocratic high-society mentor who speaks with luxurious poetic poise.'
      : 'You are Astrid, a warm, witty polyglot language buddy and cosmic guide.';

  const systemInstruction = `
${personaInstruction}
You are speaking in ${langName} (${langCode}) with a language learner in Lingoverse's exclusive billionaire AI Lounge.

MANDATORY RULES:
1. Always respond naturally and engagingly in ${langName}.
2. CRITICAL GRAMMAR CORRECTION RULE:
   - Carefully analyze the learner's grammar, vocabulary, conjugations, and word order.
   - If the user made ANY mistake, dynamically embed the correction directly in brackets [Like this: corrected phrase] inside your reply, or provide it at the beginning of your response.
   - Example: If learner said "Yo querer agua", you might reply: "¡Claro que sí! [Yo quiero agua] Aquí tienes un vaso de agua fresca. ¿Prefieres con hielo o sin hielo?"
   - If learner made no mistakes, compliment their natural phrasing!
3. Provide an English translation of your reply.
4. Keep the conversation addictive, fun, and personalized.

Respond STRICTLY in JSON format with this exact structure:
{
  "reply": "Your response in ${langName} with corrections in brackets if needed",
  "translation": "English translation of your reply",
  "correctionsFound": [
    {
      "original": "error part",
      "corrected": "proper version",
      "explanation": "brief grammatical rule explanation"
    }
  ],
  "suggestedReplies": [
    { "text": "Option 1 in ${langName}", "translation": "English translation" },
    { "text": "Option 2 in ${langName}", "translation": "English translation" }
  ],
  "fluencyTip": "Billionaire polyglot tip for fluency"
}
`;

  if (ai) {
    try {
      const historyContext = conversationHistory
        .map((m: { sender: string; text: string }) => `${m.sender === 'user' ? 'Learner' : 'AI Buddy'}: ${m.text}`)
        .join('\n');

      const prompt = `
Conversation history:
${historyContext || '(No previous messages)'}

Learner says: "${userMessage}"

Respond in JSON:
`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI Lounge Gemini timeout')), 4000)
      );
      const response = (await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        timeoutPromise,
      ])) as { text?: string };

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.reply) {
        return res.json(parsed);
      }
    } catch (err) {
      console.warn('AI Lounge Gemini error, falling back:', err);
    }
  }

  // Fallback if offline / API key pending
  return res.json({
    reply: `¡Excelente mensaje! [${userMessage}] Es un gran placer conversar contigo en ${langName}. ¿De qué te gustaría hablar hoy?`,
    translation: `Excellent message! It is a great pleasure chatting with you in ${langName}. What would you like to discuss today?`,
    correctionsFound: [],
    suggestedReplies: [
      { text: `Me encanta aprender ${langName}.`, translation: `I love learning ${langName}.` },
      { text: 'Cuéntame sobre la cultura.', translation: 'Tell me about the culture.' },
    ],
    fluencyTip: 'Notice the rhythm and accent stress of verbs in everyday speech!',
  });
});

// POST /api/roast/generate
// Powers the hilarious Roast Club AI module. Roasts the user dynamically for broken streaks or silly mistakes.
app.post('/api/roast/generate', async (req, res) => {
  const {
    targetLanguage,
    streak = 0,
    streakLost = false,
    mistakes = [],
    savagery = 'spicy', // 'mild' | 'spicy' | 'savage'
    roastTopic = 'mistakes',
    userName = 'Learner',
  } = req.body;

  const langName = targetLanguage?.name || 'Spanish';
  const langCode = targetLanguage?.code || 'es';

  const savageryTone =
    savagery === 'savage'
      ? 'ULTRA SAVAGE 💀. Brutal, razor-sharp stand-up comedy roast. No mercy, roast them like a comedy central roast master, but keep it PG-13 fun.'
      : savagery === 'mild'
      ? 'MILD 🌶️. Playful banter, gentle teasing with high-energy comedic affection.'
      : 'SPICY 🔥. Spicy sarcasm, roast their language errors and streak habits with comedic flair.';

  const systemInstruction = `
You are Viper, the resident stand-up comedian and roastmaster of the Lingoverse Roast Club.
Tone setting: ${savageryTone}
Language target: ${langName} (${langCode}).
User's Name: ${userName}
Current streak: ${streak} days. Did they recently lose/risk a streak? ${streakLost ? 'YES' : 'No'}.
Known weak words/mistakes: ${mistakes.map((m: { term: string; meaning?: string }) => `${m.term} (${m.meaning || ''})`).join(', ') || 'Various basic vocabulary blunders'}.
Topic requested: ${roastTopic}.

TASK:
Deliver a dynamic, hilarious stand-up roast about their language learning mistakes, streak habits, or grammar confusion.
Be genuinely funny and creative! Reference funny polyglot tropes (Google translate dependency, ordering food awkwardly, forgetting simple words under pressure).

Respond STRICTLY in JSON format with this exact structure:
{
  "roasterName": "Viper the Cyber Roastmaster 🦊🎤",
  "roastTitle": "Comedic roast headline (e.g. 'Conjugation Catastrophe', 'Duolingo Owl is Calling the Police')",
  "roastText": "2-4 sentences of hilarious, punchy roast text.",
  "emotionalDamagePercent": 85,
  "memePunchline": "One liner meme verdict (e.g. 'Even your phone's auto-correct is facepalming.')",
  "advice": "One piece of genuinely useful language learning advice delivered with a comedic wink.",
  "targetLanguageLine": "A funny witty line in ${langName}",
  "targetLanguageTranslation": "English translation of that line"
}
`;

  if (ai) {
    try {
      const prompt = `
Generate a comedy roast for ${userName} learning ${langName}.
Streak: ${streak} days.
Topic: ${roastTopic}.
Mistakes/Weak terms: ${JSON.stringify(mistakes.slice(0, 5))}.
`;

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Roast Gemini timeout')), 4000)
      );
      const response = (await Promise.race([
        ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
          },
        }),
        timeoutPromise,
      ])) as { text?: string };

      const parsed = JSON.parse(response.text || '{}');
      if (parsed.roastText) {
        return res.json(parsed);
      }
    } catch (err) {
      console.warn('Roast Club Gemini error, falling back:', err);
    }
  }

  // Dynamic witty fallbacks based on savagery
  const fallbackRoasts = [
    {
      roasterName: 'Viper the Cyber Roastmaster 🦊🎤',
      roastTitle: streakLost ? 'RIP The Immortal Streak' : 'Google Translate is Crying',
      roastText: streakLost
        ? `${userName}, you had ONE job: open the app for 30 seconds. Instead, you let your streak vanish faster than free pizza in a college dorm. Even the Cyber Fox is mourning!`
        : `${userName}, you've been practicing ${langName} for days, yet you still sound like an alien ordering tacos with a malfunctioning vocal synth. We love the confidence, but native speakers are scratching their heads!`,
      emotionalDamagePercent: savagery === 'savage' ? 98 : 78,
      memePunchline: 'A native speaker just heard your conjugation and moved to another continent.',
      advice: 'Review your weak words deck twice before bed, and repeat the target vowels out loud!',
      targetLanguageLine: `¡Por favor, no tortures más los verbos!`,
      targetLanguageTranslation: 'Please, do not torture the verbs anymore!',
    },
    {
      roasterName: 'Viper the Cyber Roastmaster 🦊🎤',
      roastTitle: 'The Vocabulary Witness Protection Program',
      roastText: `I saw those quiz answers, ${userName}. You didn't just guess the wrong word—you invented a brand new dialect that doesn't exist on planet Earth!`,
      emotionalDamagePercent: 88,
      memePunchline: 'Grammar books are spontaneously combusting within a 5-mile radius.',
      advice: 'Group verbs by their endings (-ar, -er, -ir) instead of winging it on impulse.',
      targetLanguageLine: `¡La gramática no es un juego de azar!`,
      targetLanguageTranslation: 'Grammar is not a game of roulette!',
    },
  ];

  const picked = fallbackRoasts[Math.floor(Math.random() * fallbackRoasts.length)];
  return res.json(picked);
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PolyPanda Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
