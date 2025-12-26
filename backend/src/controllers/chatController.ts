import { Request, Response } from 'express';
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'eu-ai-act';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

type Language = 'de' | 'en';

// EU AI Act Knowledge Base - System Prompts for Nova
const NOVA_SYSTEM_PROMPTS: Record<Language, string> = {
  de: `Du bist Nova, ein freundlicher Assistent, der Menschen bei Fragen zum EU AI Act hilft.

WICHTIG - SO SPRICHST DU:
- Erkläre alles in einfacher, verständlicher Sprache - wie du es einem Freund erklären würdest
- Vermeide Fachbegriffe oder erkläre sie sofort in einfachen Worten
- Nutze Beispiele aus dem Alltag
- Sei warmherzig und ermutigend - das Thema kann einschüchternd wirken
- Keine Gesetzesverweise oder Artikelnummern - das verwirrt nur
- Kurze Sätze, klare Sprache
- Sprich die Person direkt an ("Sie", "Ihr System")
- Antworte IMMER auf Deutsch

DEIN WISSEN:
RISIKOKLASSEN:
1. Verboten: KI die Menschen manipuliert, überwacht oder diskriminiert
2. Hochrisiko: KI die wichtige Entscheidungen über Menschen trifft (Jobs, Kredite, Bildung)
3. Begrenztes Risiko: Chatbots und KI-Bilder - müssen nur sagen, dass sie KI sind
4. Minimales Risiko: Spamfilter, Spiele-KI - keine besonderen Regeln

Antworte immer freundlich und ermutigend. Wenn du dir nicht sicher bist, empfehle einen Experten.`,

  en: `You are Nova, a friendly assistant helping people with EU AI Act questions.

IMPORTANT - HOW YOU SPEAK:
- Explain everything in simple, understandable language - like explaining to a friend
- Avoid jargon or explain technical terms immediately in simple words
- Use everyday examples
- Be warm and encouraging - the topic can be intimidating
- No law references or article numbers - that's confusing
- Short sentences, clear language
- Address the person directly ("you", "your system")
- ALWAYS respond in English

YOUR KNOWLEDGE:
RISK CLASSES:
1. Prohibited: AI that manipulates, surveils, or discriminates against people
2. High-Risk: AI making important decisions about people (jobs, credit, education)
3. Limited Risk: Chatbots and AI images - just need to say they're AI
4. Minimal Risk: Spam filters, game AI - no special rules

Always respond in a friendly and encouraging way. If unsure, recommend consulting an expert.`
};

// Chat message interface
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// Check if Ollama is available
async function isOllamaAvailable(): Promise<boolean> {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 3000 });
    return response.status === 200;
  } catch {
    return false;
  }
}

// Chat with Ollama
async function chatWithOllama(messages: ChatMessage[], language: Language): Promise<string> {
  const response = await axios.post(
    `${OLLAMA_URL}/api/chat`,
    {
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: NOVA_SYSTEM_PROMPTS[language] },
        ...messages,
      ],
      stream: false,
      options: {
        temperature: 0.7,
        num_predict: 1000,
      },
    },
    { timeout: 60000 }
  );

  const errorMsg = language === 'de'
    ? 'Entschuldigung, ich konnte keine Antwort generieren.'
    : 'Sorry, I couldn\'t generate a response.';
  return response.data.message?.content || errorMsg;
}

// Chat with OpenAI
async function chatWithOpenAI(messages: ChatMessage[], language: Language): Promise<string> {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: NOVA_SYSTEM_PROMPTS[language] },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  const errorMsg = language === 'de'
    ? 'Entschuldigung, ich konnte keine Antwort generieren.'
    : 'Sorry, I couldn\'t generate a response.';
  return response.data.choices[0]?.message?.content || errorMsg;
}

// Fallback responses for common questions - bilingual
const fallbackResponses: Record<Language, Record<string, { keywords: string[]; response: string }>> = {
  de: {
    risk: {
      keywords: ['risikoklasse', 'risikostufe', 'risiko', 'klasse'],
      response: `Gute Frage! Der EU AI Act teilt KI-Systeme in vier Gruppen ein:

**Verboten** - Das geht gar nicht:
KI, die Menschen heimlich manipuliert oder ein "Punktesystem" für Bürger erstellt.

**Hochrisiko** - Braucht besondere Aufmerksamkeit:
Wenn Ihre KI wichtige Entscheidungen über Menschen trifft - wie bei Bewerbungen, Krediten oder in der Medizin.

**Begrenztes Risiko** - Einfach transparent sein:
Chatbots oder KI-generierte Bilder müssen nur klar sagen: "Hey, ich bin eine KI!"

**Minimales Risiko** - Keine besonderen Regeln:
Spamfilter, Empfehlungen bei Netflix, Spiele-KI - alles entspannt.

Möchten Sie herausfinden, in welche Gruppe Ihr System fällt?`
    },
    highRisk: {
      keywords: ['hochrisiko', 'high risk', 'gefährlich'],
      response: `Hochrisiko-KI klingt erstmal beängstigend, aber keine Sorge!

**Wann ist eine KI "Hochrisiko"?**
Wenn sie wichtige Entscheidungen über Menschen trifft:
- Bei Bewerbungen und Personalauswahl
- Bei Kreditanträgen oder Versicherungen
- In Schulen und bei Prüfungen
- Bei Gesichtserkennung
- Bei medizinischen Diagnosen

**Was müssen Sie tun?**
- Risiken kennen und kontrollieren
- Dokumentieren wie das System funktioniert
- Sicherstellen, dass ein Mensch eingreifen kann

Das klingt nach viel, aber mit dem richtigen Audit-Prozess ist das machbar!`
    },
    transparency: {
      keywords: ['transparenz', 'kennzeichnung', 'chatbot', 'kennzeichnen'],
      response: `Transparenz bedeutet einfach: Ehrlich sein!

**Die goldene Regel:**
Wenn jemand mit einer KI spricht oder KI-Inhalte sieht, muss er das wissen.

**Praktische Beispiele:**
- Chatbot? Am Anfang sagen: "Hallo! Ich bin ein KI-Assistent."
- KI-Bilder oder Videos? Kennzeichnen, dass es KI-generiert ist.
- Emotionserkennung? Leute vorher informieren.

Menschen haben ein Recht zu wissen, ob sie mit einer Maschine reden!`
    },
    roles: {
      keywords: ['anbieter', 'betreiber', 'rolle', 'provider', 'deployer'],
      response: `Lass uns das einfach halten:

**Anbieter** = Der, der die KI gebaut hat
Sie entwickeln die KI oder verkaufen sie unter Ihrem Namen? Dann sind Sie Anbieter mit Hauptverantwortung.

**Betreiber** = Der, der die KI benutzt
Sie kaufen eine fertige KI und setzen sie ein? Dann sind Sie Betreiber und müssen die Nutzungsregeln befolgen.

**Beispiel:**
Microsoft entwickelt KI-Tools → Anbieter
Ihre Firma nutzt diese Tools → Betreiber

Welche Rolle haben Sie?`
    },
    documentation: {
      keywords: ['dokumentation', 'dokument', 'aufschreiben'],
      response: `Dokumentation ist wie eine Bedienungsanleitung für Ihr KI-System.

**Was sollten Sie aufschreiben?**
1. Was macht das System?
2. Wie funktioniert es?
3. Welche Daten nutzt es?
4. Was kann schiefgehen?
5. Wer passt auf?

**Mein Tipp:**
Fangen Sie einfach an und ergänzen Sie nach und nach. Perfekt muss es nicht sofort sein!`
    },
    deadlines: {
      keywords: ['frist', 'wann', 'deadline', 'zeit', 'termin'],
      response: `Hier sind die wichtigsten Termine:

**Schon jetzt:** Das Gesetz ist seit August 2024 in Kraft!

**Februar 2025:** Verbotene KI-Systeme müssen abgeschaltet werden.

**August 2025:** Regeln für große Sprachmodelle wie GPT treten in Kraft.

**August 2026:** Die meisten Regeln gelten - auch für Hochrisiko-Systeme. Das ist der wichtigste Termin!

**August 2027:** Alle Regeln vollständig in Kraft.

Je früher Sie anfangen, desto entspannter wird es!`
    },
    help: {
      keywords: ['hilfe', 'anfang', 'start', 'was soll', 'beginnen'],
      response: `Kein Problem, ich helfe Ihnen beim Einstieg!

**Drei einfache Schritte:**

**1. Was für eine KI haben Sie?**
Was macht Ihre KI? Trifft sie Entscheidungen über Menschen oder ist sie eher ein Helfer?

**2. In welche Risikoklasse fällt sie?**
Die meisten KI-Systeme sind "minimales Risiko" - kein Stress!

**3. Was müssen Sie tun?**
Je nach Risiko: von "nichts Besonderes" bis "einiges dokumentieren".

Erzählen Sie mir einfach, was Ihre KI macht!`
    }
  },
  en: {
    risk: {
      keywords: ['risk class', 'risk level', 'risk', 'category', 'classification'],
      response: `Great question! The EU AI Act divides AI systems into four groups:

**Prohibited** - Absolutely not allowed:
AI that secretly manipulates people or creates a "social scoring" system for citizens.

**High-Risk** - Needs special attention:
When your AI makes important decisions about people - like in job applications, loans, or healthcare.

**Limited Risk** - Just be transparent:
Chatbots or AI-generated images just need to clearly say: "Hey, I'm an AI!"

**Minimal Risk** - No special rules:
Spam filters, Netflix recommendations, game AI - all relaxed.

Would you like to find out which group your system falls into?`
    },
    highRisk: {
      keywords: ['high risk', 'high-risk', 'dangerous', 'critical'],
      response: `High-risk AI sounds scary, but don't worry!

**When is AI "High-Risk"?**
When it makes important decisions about people:
- Job applications and hiring
- Credit applications or insurance
- Schools and exams
- Facial recognition
- Medical diagnoses

**What do you need to do?**
- Know and control the risks
- Document how the system works
- Ensure a human can intervene

It sounds like a lot, but it's manageable with the right audit process!`
    },
    transparency: {
      keywords: ['transparency', 'label', 'chatbot', 'mark', 'disclose'],
      response: `Transparency simply means: Be honest!

**The golden rule:**
If someone talks to an AI or sees AI content, they need to know.

**Practical examples:**
- Chatbot? Say at the start: "Hello! I'm an AI assistant."
- AI images or videos? Mark them as AI-generated.
- Emotion recognition? Inform people beforehand.

People have a right to know if they're talking to a machine!`
    },
    roles: {
      keywords: ['provider', 'deployer', 'role', 'developer', 'user'],
      response: `Let's keep this simple:

**Provider** = The one who built the AI
You develop the AI or sell it under your name? Then you're the provider with main responsibility.

**Deployer** = The one who uses the AI
You buy a ready-made AI and deploy it? Then you're the deployer and need to follow usage rules.

**Example:**
Microsoft develops AI tools → Provider
Your company uses these tools → Deployer

What role do you have?`
    },
    documentation: {
      keywords: ['documentation', 'document', 'write down', 'record'],
      response: `Documentation is like a user manual for your AI system.

**What should you write down?**
1. What does the system do?
2. How does it work?
3. What data does it use?
4. What can go wrong?
5. Who's supervising?

**My tip:**
Just start and add more over time. It doesn't have to be perfect right away!`
    },
    deadlines: {
      keywords: ['deadline', 'when', 'time', 'date', 'schedule'],
      response: `Here are the key dates:

**Already now:** The law has been in force since August 2024!

**February 2025:** Prohibited AI systems must be shut down.

**August 2025:** Rules for large language models like GPT take effect.

**August 2026:** Most rules apply - including for high-risk systems. This is the most important date!

**August 2027:** All rules fully in force.

The sooner you start, the more relaxed it will be!`
    },
    help: {
      keywords: ['help', 'start', 'begin', 'what should', 'how to'],
      response: `No problem, I'll help you get started!

**Three simple steps:**

**1. What kind of AI do you have?**
What does your AI do? Does it make decisions about people or is it more of a helper?

**2. What risk class does it fall into?**
Most AI systems are "minimal risk" - no stress!

**3. What do you need to do?**
Depending on risk: from "nothing special" to "some documentation".

Just tell me what your AI does!`
    }
  }
};

function getFallbackResponse(message: string, language: Language): string | null {
  const lowerMessage = message.toLowerCase();
  const responses = fallbackResponses[language];

  for (const key in responses) {
    const { keywords, response } = responses[key];
    if (keywords.some(kw => lowerMessage.includes(kw))) {
      return response;
    }
  }

  return null;
}

// Default greeting messages
const defaultGreetings: Record<Language, string> = {
  de: `Hallo! Ich bin Nova, Ihr freundlicher Helfer für den EU AI Act.

Ich höre zu und bin hier um Ihnen zu helfen! Erzählen Sie mir einfach, was Sie wissen möchten.

Hier ein paar Ideen, worüber wir sprechen können:
- Was ist der EU AI Act und was bedeutet er für mich?
- Wie finde ich heraus, ob meine KI betroffen ist?
- Was muss ich tun, um die Regeln einzuhalten?
- Wann muss ich damit fertig sein?

Fragen Sie einfach drauf los - ich erkläre alles in verständlicher Sprache, versprochen!`,

  en: `Hello! I'm Nova, your friendly EU AI Act helper.

I'm here to help! Just tell me what you'd like to know.

Here are some ideas of what we can talk about:
- What is the EU AI Act and what does it mean for me?
- How do I find out if my AI is affected?
- What do I need to do to comply with the rules?
- When do I need to be ready?

Just ask away - I'll explain everything in simple language, promise!`
};

// Error messages
const errorMessages: Record<Language, { technical: string; validation: string }> = {
  de: {
    technical: 'Entschuldigung, ich habe gerade technische Schwierigkeiten. Bitte versuchen Sie es später erneut.',
    validation: 'Nachricht ist erforderlich'
  },
  en: {
    technical: 'Sorry, I\'m having technical difficulties. Please try again later.',
    validation: 'Message is required'
  }
};

// Main chat endpoint
export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history = [], language = 'de' } = req.body;
    const lang: Language = language === 'en' ? 'en' : 'de';

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        error: errorMessages[lang].validation,
      });
      return;
    }

    // Build conversation history
    const messages: ChatMessage[] = [
      ...history.slice(-10),
      { role: 'user', content: message },
    ];

    let response: string;

    // Try Ollama first
    if (await isOllamaAvailable()) {
      try {
        response = await chatWithOllama(messages, lang);
      } catch (error) {
        console.error('Ollama chat error:', error);
        response = getFallbackResponse(message, lang) || errorMessages[lang].technical;
      }
    }
    // Try OpenAI if available
    else if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        response = await chatWithOpenAI(messages, lang);
      } catch (error) {
        console.error('OpenAI chat error:', error);
        response = getFallbackResponse(message, lang) || errorMessages[lang].technical;
      }
    }
    // Use fallback responses
    else {
      response = getFallbackResponse(message, lang) || defaultGreetings[lang];
    }

    res.json({
      success: true,
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Error processing request',
    });
  }
};

// Suggestions - bilingual
const suggestions: Record<Language, string[]> = {
  de: [
    'Was ist der EU AI Act eigentlich?',
    'Ist meine KI betroffen?',
    'Wo fange ich am besten an?',
    'Was muss ich bei einem Chatbot beachten?',
    'Wann muss ich fertig sein?',
    'Was ist Hochrisiko-KI?',
    'Wer ist Anbieter, wer Betreiber?',
    'Was muss ich dokumentieren?',
  ],
  en: [
    'What is the EU AI Act?',
    'Is my AI affected?',
    'Where do I start?',
    'What do I need to consider for a chatbot?',
    'When do I need to be compliant?',
    'What is high-risk AI?',
    'Who is provider, who is deployer?',
    'What do I need to document?',
  ]
};

// Get suggested questions
export const getSuggestions = async (req: Request, res: Response): Promise<void> => {
  const lang: Language = req.query.lang === 'en' ? 'en' : 'de';

  res.json({
    success: true,
    suggestions: suggestions[lang],
  });
};
