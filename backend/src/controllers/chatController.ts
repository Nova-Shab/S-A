import { Request, Response } from 'express';
import axios from 'axios';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'eu-ai-act';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

// EU AI Act Knowledge Base - System Prompt für Nova
const NOVA_SYSTEM_PROMPT = `Du bist Nova, ein freundlicher Assistent, der Menschen bei Fragen zum EU AI Act hilft.

WICHTIG - SO SPRICHST DU:
- Erkläre alles in einfacher, verständlicher Sprache - wie du es einem Freund erklären würdest
- Vermeide Fachbegriffe oder erkläre sie sofort in einfachen Worten
- Nutze Beispiele aus dem Alltag
- Sei warmherzig und ermutigend - das Thema kann einschüchternd wirken
- Keine Gesetzesverweise oder Artikelnummern - das verwirrt nur
- Kurze Sätze, klare Sprache
- Sprich die Person direkt an ("Sie", "Ihr System")

DEIN WISSEN (vereinfacht erklärt):

RISIKOKLASSEN - Wie gefährlich ist die KI?
1. Verboten: KI die Menschen manipuliert, überwacht oder diskriminiert - das geht gar nicht
2. Hochrisiko: KI die wichtige Entscheidungen über Menschen trifft (Jobs, Kredite, Bildung) - braucht strenge Auflagen
3. Begrenztes Risiko: Chatbots und KI-Bilder - müssen nur sagen, dass sie KI sind
4. Minimales Risiko: Spamfilter, Spiele-KI - keine besonderen Regeln

WANN IST EINE KI "HOCHRISIKO"?
Wenn sie in diesen Bereichen eingesetzt wird:
- Personalauswahl und Bewerbungen
- Kreditvergabe und Versicherungen
- Bildung und Prüfungen
- Gesichtserkennung
- Medizinische Diagnosen
- Rechtsprechung und Polizei

WAS MUSS MAN BEI HOCHRISIKO TUN?
- Die Risiken kennen und kontrollieren
- Dokumentieren wie das System funktioniert
- Menschen sollen immer die letzte Entscheidung haben
- Das System muss zuverlässig und sicher sein

ROLLEN:
- Anbieter = Wer die KI entwickelt hat
- Betreiber = Wer die KI einsetzt und nutzt

Antworte immer freundlich und ermutigend. Wenn du dir nicht sicher bist, empfehle einen Experten.`;

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

// Fallback responses for common questions - in natural, simple language
function getFallbackResponse(message: string): string | null {
  const lowerMessage = message.toLowerCase();

  // Risikoklassen
  if (lowerMessage.includes('risikoklasse') || lowerMessage.includes('risikostufe') || lowerMessage.includes('risiko')) {
    return `Gute Frage! Der EU AI Act teilt KI-Systeme in vier Gruppen ein, je nachdem wie viel Schaden sie anrichten können:

**Verboten** - Das geht gar nicht:
Zum Beispiel KI, die Menschen heimlich manipuliert oder ein "Punktesystem" für Bürger erstellt. Sowas ist komplett verboten.

**Hochrisiko** - Braucht besondere Aufmerksamkeit:
Wenn Ihre KI wichtige Entscheidungen über Menschen trifft - wie bei Bewerbungen, Krediten oder in der Medizin. Hier gibt es strenge Regeln.

**Begrenztes Risiko** - Einfach transparent sein:
Chatbots oder KI-generierte Bilder müssen nur klar sagen: "Hey, ich bin eine KI!" Das war's schon.

**Minimales Risiko** - Keine besonderen Regeln:
Spamfilter, Empfehlungen bei Netflix, Spiele-KI - alles entspannt.

Möchten Sie herausfinden, in welche Gruppe Ihr System fällt? Erzählen Sie mir einfach, was Ihre KI macht!`;
  }

  // Hochrisiko
  if (lowerMessage.includes('hochrisiko') || lowerMessage.includes('high risk')) {
    return `Hochrisiko-KI klingt erstmal beängstigend, aber keine Sorge - ich erkläre es Ihnen!

**Wann ist eine KI "Hochrisiko"?**
Immer dann, wenn sie wichtige Entscheidungen über Menschen trifft. Zum Beispiel:

- Bei Bewerbungen und Personalauswahl
- Bei Kreditanträgen oder Versicherungen
- In Schulen und bei Prüfungen
- Bei Gesichtserkennung
- Bei medizinischen Diagnosen

**Was bedeutet das für Sie?**
Sie müssen ein paar Dinge beachten:
- Wissen, welche Risiken Ihr System hat
- Aufschreiben, wie das System funktioniert
- Sicherstellen, dass ein Mensch immer eingreifen kann
- Das System regelmäßig überprüfen

Das klingt nach viel, aber mit dem richtigen Audit-Prozess ist das machbar. Möchten Sie wissen, ob Ihr System betroffen ist?`;
  }

  // Transparenz
  if (lowerMessage.includes('transparenz') || lowerMessage.includes('kennzeichnung') || lowerMessage.includes('chatbot')) {
    return `Transparenz bedeutet einfach: Ehrlich sein!

**Die goldene Regel:**
Wenn jemand mit einer KI spricht oder KI-Inhalte sieht, muss er das wissen.

**Praktische Beispiele:**

Haben Sie einen Chatbot? Dann sollte am Anfang stehen: "Hallo! Ich bin ein KI-Assistent." Fertig!

Erstellt Ihre KI Bilder oder Videos? Dann sollte irgendwo stehen, dass es KI-generiert ist.

Erkennt Ihre KI Emotionen? Dann müssen Sie die Leute vorher informieren.

**Der Grund dahinter:**
Menschen haben ein Recht zu wissen, ob sie mit einer Maschine reden oder ob ein Bild echt ist. Das ist nur fair, oder?

Haben Sie ein konkretes System, bei dem Sie unsicher sind?`;
  }

  // Anbieter/Betreiber
  if (lowerMessage.includes('anbieter') || lowerMessage.includes('betreiber') || lowerMessage.includes('rolle')) {
    return `Lass uns das einfach halten:

**Anbieter** = Der, der die KI gebaut hat
Wenn Sie die KI selbst entwickelt haben oder unter Ihrem Namen verkaufen, sind Sie der Anbieter. Sie tragen die Hauptverantwortung dafür, dass alles regelkonform ist.

**Betreiber** = Der, der die KI benutzt
Wenn Sie eine fertige KI kaufen oder mieten und einsetzen, sind Sie der Betreiber. Sie müssen sicherstellen, dass Sie sie richtig verwenden.

**Ein einfaches Beispiel:**
Microsoft entwickelt ChatGPT-Plugins → Microsoft ist Anbieter
Ihre Firma nutzt diese Plugins für den Kundenservice → Sie sind Betreiber

**Warum ist das wichtig?**
Je nach Rolle haben Sie unterschiedliche Pflichten. Als Betreiber ist es oft einfacher - Sie müssen hauptsächlich die Nutzungsregeln befolgen.

Welche Rolle haben Sie bei Ihrem KI-System?`;
  }

  // Dokumentation
  if (lowerMessage.includes('dokumentation') || lowerMessage.includes('dokument')) {
    return `Dokumentation klingt langweilig, aber denken Sie daran wie an eine Bedienungsanleitung für Ihr KI-System.

**Was sollten Sie aufschreiben?**

1. **Was macht das System?**
   Einfach erklären, wofür die KI da ist.

2. **Wie funktioniert es?**
   Grob beschreiben, wie das System Entscheidungen trifft.

3. **Welche Daten nutzt es?**
   Woher kommen die Daten? Wie gut sind sie?

4. **Was kann schiefgehen?**
   Welche Risiken gibt es und was tun Sie dagegen?

5. **Wer passt auf?**
   Wie stellen Sie sicher, dass ein Mensch eingreifen kann?

**Mein Tipp:**
Fangen Sie einfach an und ergänzen Sie nach und nach. Perfekt muss es nicht sofort sein - Hauptsache, Sie haben einen Überblick!

Bei welchem Teil kann ich Ihnen helfen?`;
  }

  // Fristen
  if (lowerMessage.includes('frist') || lowerMessage.includes('wann') || lowerMessage.includes('deadline') || lowerMessage.includes('zeit')) {
    return `Gute Frage zur Zeitplanung! Hier sind die wichtigsten Termine:

**Schon jetzt:**
Das Gesetz ist seit August 2024 in Kraft. Die Uhr tickt also!

**Februar 2025:**
Verbotene KI-Systeme müssen abgeschaltet werden. Aber das betrifft nur die wirklich problematischen Sachen.

**August 2025:**
Regeln für große Sprachmodelle wie GPT treten in Kraft.

**August 2026:**
Die meisten Regeln gelten - auch für Hochrisiko-Systeme. Das ist der wichtigste Termin!

**August 2027:**
Alle Regeln sind dann vollständig in Kraft.

**Meine Empfehlung:**
Warten Sie nicht bis zur letzten Minute! Je früher Sie anfangen, desto entspannter wird es. Am besten jetzt schon mal schauen, wo Sie stehen.

Soll ich Ihnen helfen herauszufinden, was Sie als erstes tun sollten?`;
  }

  // Hilfe/Start
  if (lowerMessage.includes('hilfe') || lowerMessage.includes('anfang') || lowerMessage.includes('start') || lowerMessage.includes('was soll')) {
    return `Kein Problem, ich helfe Ihnen beim Einstieg!

**Drei einfache Schritte für den Anfang:**

**1. Was für eine KI haben Sie?**
Überlegen Sie kurz: Was macht Ihre KI? Trifft sie Entscheidungen über Menschen oder ist sie eher ein Helfer im Hintergrund?

**2. In welche Risikoklasse fällt sie?**
Die meisten KI-Systeme sind "minimales Risiko" - also kein Stress. Nur wenn Sie mit sensiblen Bereichen wie Personal, Kredite oder Gesundheit arbeiten, wird es wichtiger.

**3. Was müssen Sie tun?**
Je nach Risiko: von "nichts Besonderes" bis "einiges dokumentieren".

**Mein Vorschlag:**
Erzählen Sie mir einfach, was Ihre KI macht. Dann sage ich Ihnen, was Sie beachten müssen. Ganz ohne Fachchinesisch, versprochen!

Also, was macht Ihr KI-System?`;
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
      response = getFallbackResponse(message) || `Hallo! Ich bin Nova, Ihr freundlicher Helfer für den EU AI Act.

Ich höre zu und bin hier um Ihnen zu helfen! Erzählen Sie mir einfach, was Sie wissen möchten.

Hier ein paar Ideen, worüber wir sprechen können:
- Was ist der EU AI Act und was bedeutet er für mich?
- Wie finde ich heraus, ob meine KI betroffen ist?
- Was muss ich tun, um die Regeln einzuhalten?
- Wann muss ich damit fertig sein?

Fragen Sie einfach drauf los - ich erkläre alles in verständlicher Sprache, versprochen!`;
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

// Get suggested questions - in natural, conversational style
export const getSuggestions = async (_req: Request, res: Response): Promise<void> => {
  const suggestions = [
    'Was ist der EU AI Act eigentlich?',
    'Ist meine KI betroffen?',
    'Wo fange ich am besten an?',
    'Was muss ich bei einem Chatbot beachten?',
    'Wann muss ich fertig sein?',
    'Was ist Hochrisiko-KI?',
    'Wer ist Anbieter, wer Betreiber?',
    'Was muss ich dokumentieren?',
  ];

  res.json({
    success: true,
    suggestions,
  });
};
