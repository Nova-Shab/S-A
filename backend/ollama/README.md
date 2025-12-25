# EU AI Act Scanner - Ollama Setup

Dieses Verzeichnis enthält alles, um ein spezialisiertes Ollama-Modell für die EU AI Act Compliance-Analyse zu erstellen.

## Schnellstart

```bash
# 1. Ollama installieren (falls nicht vorhanden)
curl -fsSL https://ollama.com/install.sh | sh

# 2. Setup-Skript ausführen
./setup.sh
```

Das war's! Das Modell ist jetzt einsatzbereit.

## Manuelle Installation

Falls das Skript nicht funktioniert:

```bash
# Ollama starten
ollama serve

# Basis-Modell herunterladen
ollama pull llama3.2

# EU AI Act Modell erstellen
ollama create eu-ai-act -f Modelfile

# In .env aktualisieren
# OLLAMA_MODEL=eu-ai-act
```

## Modell testen

```bash
ollama run eu-ai-act
```

Dann eingeben:
```
Analysiere: Ein KI-System zur automatischen Bewertung von Bewerbungen für HR-Abteilungen. Es analysiert Lebensläufe und erstellt Rankings basierend auf Qualifikationen.
```

## Alternative Modelle

Je nach Hardware können Sie verschiedene Basis-Modelle verwenden:

| Modell | Größe | RAM-Bedarf | Empfehlung |
|--------|-------|------------|------------|
| `llama3.2` | 3B | 4 GB | Standard, schnell |
| `llama3.1` | 8B | 8 GB | Bessere Qualität |
| `mistral` | 7B | 8 GB | Sehr gute Balance |
| `llama3.1:70b` | 70B | 48 GB | Beste Qualität |

Um ein anderes Basis-Modell zu verwenden:

```bash
# Bearbeiten Sie die erste Zeile in Modelfile:
# FROM mistral

# Dann neu erstellen:
ollama create eu-ai-act -f Modelfile
```

## Modelfile anpassen

Die `Modelfile` enthält den System-Prompt mit allen EU AI Act Regeln. Sie können diese anpassen:

- **Sprache**: Der Prompt ist auf Deutsch, kann aber angepasst werden
- **Fokus**: Fügen Sie branchenspezifische Regeln hinzu
- **Strenge**: Passen Sie die Klassifizierungslogik an

## Fehlerbehebung

### "Ollama ist nicht erreichbar"
```bash
# Ollama manuell starten
ollama serve
```

### "Modell nicht gefunden"
```bash
# Prüfen Sie installierte Modelle
ollama list

# Neu erstellen
ollama create eu-ai-act -f Modelfile
```

### "Zu langsam"
- Verwenden Sie ein kleineres Modell (llama3.2)
- Erhöhen Sie den RAM
- Nutzen Sie GPU-Beschleunigung (NVIDIA/Apple Silicon)

## Datenschutz

Alle Analysen werden **lokal** auf Ihrem System durchgeführt:
- Keine Daten werden an externe Server gesendet
- Volle Kontrolle über Ihre Systemdaten
- DSGVO-konform by Design
