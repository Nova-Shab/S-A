import { Request, Response } from 'express';
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'eu-ai-act';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// EU AI Act Knowledge Base - System Prompt für Nova
const NOVA_SYSTEM_PROMPT = `Du bist Nova, der EU AI Act Compliance-Assistent von VAMO. Du hilfst Nutzern bei:

1. **Fragen zum EU AI Act** (Verordnung 2024/1689)
2. **Ausfüllen von Audit-Formularen**
3. **Verständnis der Risikoklassifizierung**
4. **Compliance-Anforderungen**

## DEIN WISSEN

### Risikoklassen (Art. 6)
- **VERBOTEN (Art. 5)**: Social Scoring, unterschwellige Manipulation, Ausnutzung Schutzbedürftiger, Echtzeit-Biometrie in öffentlichen Räumen
- **HOCHRISIKO (Anhang III)**: Biometrie, kritische Infrastruktur, Bildung, Beschäftigung, Kreditwürdigkeit, Strafverfolgung, Migration
- **BEGRENZTES RISIKO (Art. 50)**: Chatbots, Deepfakes, KI-generierte Inhalte → Transparenzpflichten
- **MINIMALES RISIKO**: Alle anderen → freiwillige Verhaltenskodizes

### Wichtige Artikel
- **Art. 5**: Verbotene Praktiken
- **Art. 6 & Anhang III**: Hochrisiko-Klassifizierung
- **Art. 9-15**: Anforderungen an Hochrisiko-Systeme
- **Art. 50**: Transparenzpflichten
- **Art. 95**: Freiwillige Verhaltenskodizes

### Hochrisiko-Anforderungen (Art. 9-15)
1. Risikomanagement-System (Art. 9)
2. Daten-Governance (Art. 10)
3. Technische Dokumentation (Art. 11)
4. Aufzeichnungspflichten (Art. 12)
5. Transparenz & Information (Art. 13)
6. Menschliche Aufsicht (Art. 14)
7. Genauigkeit, Robustheit, Cybersicherheit (Art. 15)

### Rollen nach EU AI Act
- **Anbieter (Provider)**: Entwickelt oder in Verkehr bringt → Hauptverantwortung
- **Betreiber (Deployer)**: Nutzt unter eigener Verantwortung → Anwendungspflichten
- **Importeur**: Bringt aus Drittstaat in EU → Konformitätsprüfung
- **Händler**: Vertreibt → Kennzeichnungsprüfung

## DEIN VERHALTEN
- Antworte präzise und hilfreich auf Deutsch
- Verweise auf relevante Artikel
- Bei Unsicherheit: Empfehle rechtliche Beratung
- Hilf beim Ausfüllen der Formulare mit konkreten Beispielen
- Sei freundlich und professionell
- Halte Antworten kompakt (max. 300 Wörter)`;

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
async function chatWithOllama(messages: ChatMessage[]): Promise<string> {
  const response = await axios.post(
    `${OLLAMA_URL}/api/chat`,
    {
      model: OLLAMA_MODEL,
      messages: [
        { role: 'system', content: NOVA_SYSTEM_PROMPT },
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

  return response.data.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
}

// Chat with OpenAI
async function chatWithOpenAI(messages: ChatMessage[]): Promise<string> {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: NOVA_SYSTEM_PROMPT },
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

  return response.data.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
}

// Fallback responses for common questions
function getFallbackResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  // Risikoklassen
  if (lowerMessage.includes('risikoklasse') || lowerMessage.includes('risikostufe')) {
    return `**Risikoklassen nach EU AI Act:**

1. **Verboten (Art. 5)**: Social Scoring, unterschwellige Manipulation, Ausnutzung Schutzbedürftiger, bestimmte biometrische Systeme

2. **Hochrisiko (Anhang III)**: Biometrie, kritische Infrastruktur, Bildung, Beschäftigung, Kreditwürdigkeit, Strafverfolgung, Migration

3. **Begrenztes Risiko (Art. 50)**: Chatbots, Deepfakes → Transparenzpflichten

4. **Minimales Risiko**: Alle anderen Systeme

Welche Risikoklasse für Ihr System gilt, hängt vom Einsatzbereich ab. Kann ich bei der Einordnung helfen?`;
  }

  // Hochrisiko
  if (lowerMessage.includes('hochrisiko') || lowerMessage.includes('high risk')) {
    return `**Hochrisiko-KI-Systeme (Anhang III):**

Ein System ist hochriskant wenn es in diesen Bereichen eingesetzt wird:
- Biometrische Identifikation
- Kritische Infrastruktur
- Bildung und Berufsausbildung
- Beschäftigung und Personalverwaltung
- Zugang zu wesentlichen Dienstleistungen
- Strafverfolgung
- Migration und Grenzkontrolle
- Rechtspflege

**Anforderungen (Art. 9-15):**
- Risikomanagement-System
- Daten-Governance
- Technische Dokumentation
- Transparenz
- Menschliche Aufsicht

Möchten Sie wissen, ob Ihr System als Hochrisiko einzustufen ist?`;
  }

  // Transparenz
  if (lowerMessage.includes('transparenz') || lowerMessage.includes('kennzeichnung')) {
    return `**Transparenzpflichten (Art. 50):**

Bei KI-Systemen mit **begrenztem Risiko** müssen Sie:

1. **Chatbots**: Nutzer informieren, dass sie mit KI interagieren
2. **Emotionserkennung**: Betroffene Personen informieren
3. **Deepfakes/Synthetische Inhalte**: Als KI-generiert kennzeichnen

**Umsetzung:**
- Deutlicher Hinweis am Anfang der Interaktion
- Maschinenlesbare Kennzeichnung für KI-Inhalte
- Möglichkeit zur Kontaktaufnahme mit Menschen

Haben Sie ein System, das diese Pflichten betrifft?`;
  }

  // Anbieter/Betreiber
  if (lowerMessage.includes('anbieter') || lowerMessage.includes('betreiber') || lowerMessage.includes('rolle')) {
    return `**Rollen nach EU AI Act:**

**Anbieter (Provider):**
- Entwickelt KI-System oder bringt es in Verkehr
- Hauptverantwortung für Compliance
- Muss Konformitätsbewertung durchführen

**Betreiber (Deployer):**
- Nutzt KI-System unter eigener Verantwortung
- Muss Nutzungsvorgaben einhalten
- Transparenzpflichten gegenüber Betroffenen

**Wichtig:** Die Rolle bestimmt Ihre Pflichten. In welcher Rolle setzen Sie Ihr KI-System ein?`;
  }

  // Dokumentation
  if (lowerMessage.includes('dokumentation') || lowerMessage.includes('dokument')) {
    return `**Technische Dokumentation (Art. 11):**

Für Hochrisiko-Systeme benötigen Sie:

1. **Allgemeine Beschreibung**: Zweck, Funktionsweise
2. **Design-Spezifikationen**: Architektur, Algorithmen
3. **Entwicklungsprozess**: Methoden, Validierung
4. **Risikobewertung**: Identifizierte Risiken, Maßnahmen
5. **Datenmanagement**: Trainingsdaten, Qualitätskriterien
6. **Menschliche Aufsicht**: Kontrollmechanismen
7. **Leistungsmetriken**: Genauigkeit, Robustheit

Brauchen Sie Hilfe bei einem bestimmten Dokumentationsteil?`;
  }

  // Fristen
  if (lowerMessage.includes('frist') || lowerMessage.includes('wann') || lowerMessage.includes('deadline')) {
    return `**EU AI Act Fristen:**

- **1. August 2024**: Inkrafttreten
- **2. Februar 2025**: Verbote gelten
- **2. August 2025**: GPAI-Regeln gelten
- **2. August 2026**: Meiste Vorschriften gelten
- **2. August 2027**: Alle Vorschriften in Kraft

**Empfehlung:** Beginnen Sie jetzt mit der Vorbereitung, insbesondere für Hochrisiko-Systeme!`;
  }

  return null;
}

// Main chat endpoint
export const chat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, history = [] } = req.body;

    if (!message || typeof message !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Nachricht ist erforderlich',
      });
      return;
    }

    // Build conversation history
    const messages: ChatMessage[] = [
      ...history.slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message },
    ];

    let response: string;

    // Try Ollama first
    if (await isOllamaAvailable()) {
      try {
        response = await chatWithOllama(messages);
      } catch (error) {
        console.error('Ollama chat error:', error);
        // Try fallback
        response = getFallbackResponse(message) || 'Entschuldigung, ich habe gerade technische Schwierigkeiten. Bitte versuchen Sie es später erneut.';
      }
    }
    // Try OpenAI if available
    else if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
      try {
        response = await chatWithOpenAI(messages);
      } catch (error) {
        console.error('OpenAI chat error:', error);
        response = getFallbackResponse(message) || 'Entschuldigung, ich habe gerade technische Schwierigkeiten. Bitte versuchen Sie es später erneut.';
      }
    }
    // Use fallback responses
    else {
      response = getFallbackResponse(message) || `Ich bin Nova, Ihr EU AI Act Assistent! 🤖

Leider ist gerade kein KI-Modell verfügbar. Ich kann trotzdem mit vordefinierten Antworten helfen.

**Fragen Sie mich zu:**
- Risikoklassen (verboten, hochrisiko, begrenzt, minimal)
- Transparenzpflichten
- Anbieter vs. Betreiber Rollen
- Dokumentationsanforderungen
- Fristen und Deadlines

Oder starten Sie Ollama für vollständige KI-Unterstützung.`;
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
      error: 'Fehler bei der Verarbeitung der Anfrage',
    });
  }
};

// Get suggested questions
export const getSuggestions = async (_req: Request, res: Response): Promise<void> => {
  const suggestions = [
    'Wie bestimme ich die Risikoklasse meines KI-Systems?',
    'Was sind die Anforderungen für Hochrisiko-Systeme?',
    'Welche Transparenzpflichten gelten für Chatbots?',
    'Was ist der Unterschied zwischen Anbieter und Betreiber?',
    'Welche Dokumentation brauche ich?',
    'Bis wann muss ich compliant sein?',
    'Ist mein HR-Screening-Tool hochriskant?',
    'Wie kennzeichne ich KI-generierte Inhalte?',
  ];

  res.json({
    success: true,
    suggestions,
  });
};
