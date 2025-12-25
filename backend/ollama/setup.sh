#!/bin/bash

# EU AI Act Scanner - Ollama Model Setup
# Dieses Skript installiert und konfiguriert das spezialisierte EU AI Act Modell

set -e

echo "═══════════════════════════════════════════════════════════════"
echo "  🇪🇺 EU AI Act Scanner - Ollama Setup"
echo "═══════════════════════════════════════════════════════════════"
echo ""

# Check if Ollama is installed
if ! command -v ollama &> /dev/null; then
    echo "❌ Ollama ist nicht installiert!"
    echo ""
    echo "Installieren Sie Ollama mit:"
    echo "  Linux:   curl -fsSL https://ollama.com/install.sh | sh"
    echo "  macOS:   brew install ollama"
    echo "  Windows: https://ollama.com/download"
    echo ""
    exit 1
fi

echo "✅ Ollama gefunden"

# Check if Ollama is running
if ! curl -s http://localhost:11434/api/tags &> /dev/null; then
    echo "⏳ Starte Ollama..."
    ollama serve &
    sleep 3
fi

echo "✅ Ollama läuft"
echo ""

# Pull base model if not present
echo "📥 Prüfe Basis-Modell (llama3.2)..."
if ! ollama list | grep -q "llama3.2"; then
    echo "   Lade llama3.2 herunter (ca. 2GB)..."
    ollama pull llama3.2
else
    echo "✅ llama3.2 bereits vorhanden"
fi

echo ""

# Create custom EU AI Act model
echo "🔧 Erstelle EU AI Act Spezialmodell..."
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ollama create eu-ai-act -f "$SCRIPT_DIR/Modelfile"

echo ""
echo "✅ Modell 'eu-ai-act' erfolgreich erstellt!"
echo ""

# Update .env
ENV_FILE="$SCRIPT_DIR/../.env"
if [ -f "$ENV_FILE" ]; then
    # Update OLLAMA_MODEL in .env
    if grep -q "OLLAMA_MODEL=" "$ENV_FILE"; then
        sed -i 's/OLLAMA_MODEL=.*/OLLAMA_MODEL=eu-ai-act/' "$ENV_FILE"
        echo "✅ .env aktualisiert: OLLAMA_MODEL=eu-ai-act"
    fi
fi

echo ""
echo "═══════════════════════════════════════════════════════════════"
echo "  ✅ Setup abgeschlossen!"
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "  Das Modell ist jetzt bereit. Starten Sie das Backend:"
echo "    cd backend && npm run dev"
echo ""
echo "  Testen Sie das Modell:"
echo "    ollama run eu-ai-act 'Analysiere: Ein Chatbot für Kundenservice'"
echo ""
echo "═══════════════════════════════════════════════════════════════"
