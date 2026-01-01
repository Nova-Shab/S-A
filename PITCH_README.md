# 📊 Pitch-Materialien - Verwendungsanleitung

## Übersicht der Dateien

Dieses Verzeichnis enthält alle notwendigen Materialien für Investorengespräche und Fördermittelanträge:

### 📄 Pitch-Dokumente

1. **INVESTOR_PITCH_WORD.md** - Vollständige Investorenpräsentation (30+ Seiten)
2. **PITCH_DECK.md** - Strukturierter Pitch (12 Abschnitte)
3. **EXECUTIVE_SUMMARY.md** - 1-Seiten-Zusammenfassung
4. **ONE_PAGER_INVESTOR.md** - Quick-Pitch für spontane Gespräche
5. **FOERDERANTRAG_HORIZON_EUROPE.md** - EU-Förderantrag

### 💰 Finanzmodell

6. **FINANCIAL_MODEL.csv** - 3-Jahres-Finanzprojektion mit allen Kennzahlen

---

## 🖥️ Wie Sie die Dateien verwenden

### Word-Dokumente erstellen

**Markdown zu Word konvertieren:**

#### Option 1: Mit Microsoft Word (einfachste Methode)
1. Öffnen Sie Microsoft Word
2. Datei → Öffnen → wählen Sie `INVESTOR_PITCH_WORD.md`
3. Word öffnet die Markdown-Datei automatisch
4. Datei → Speichern unter → Format: "Word-Dokument (.docx)"

#### Option 2: Mit Pandoc (professionellste Methode)
```bash
# Pandoc installieren (einmalig)
# Windows: choco install pandoc
# Mac: brew install pandoc
# Linux: sudo apt-get install pandoc

# Konvertierung durchführen
pandoc INVESTOR_PITCH_WORD.md -o Investorenpitch.docx

# Mit Referenzdokument für Formatierung
pandoc INVESTOR_PITCH_WORD.md --reference-doc=template.docx -o Investorenpitch.docx
```

#### Option 3: Online-Tools (keine Installation nötig)
- https://pandoc.org/try/ (Pandoc Online)
- https://www.markdowntoword.com/
- https://dillinger.io/ (Export zu Word)

**Schritte:**
1. Öffnen Sie die Website
2. Kopieren Sie den Inhalt von `INVESTOR_PITCH_WORD.md`
3. Fügen Sie ihn ein
4. Exportieren Sie als .docx

### Excel-Finanzmodell öffnen

**CSV in Excel importieren:**

#### Methode 1: Direkt öffnen
1. Rechtsklick auf `FINANCIAL_MODEL.csv`
2. "Öffnen mit" → Microsoft Excel
3. Excel erkennt das CSV-Format automatisch

#### Methode 2: Import-Wizard (für bessere Formatierung)
1. Öffnen Sie Microsoft Excel (leere Arbeitsmappe)
2. Daten → Daten abrufen → Aus Datei → Aus Text/CSV
3. Wählen Sie `FINANCIAL_MODEL.csv`
4. Trennzeichen: Komma
5. Laden

#### Methode 3: Google Sheets (Cloud-basiert)
1. Öffnen Sie Google Sheets
2. Datei → Importieren
3. Hochladen → `FINANCIAL_MODEL.csv`
4. Importieren

**Dann:**
- Formatieren Sie Zahlen als Währung (€)
- Erstellen Sie Charts (Empfehlungen unten)
- Speichern Sie als `.xlsx`

---

## 📊 Empfohlene Excel-Charts

### Chart 1: Revenue Growth (Liniendiagramm)
- X-Achse: Monate (1-36)
- Y-Achse: MRR (€)
- Zeigt exponentielles Wachstum

### Chart 2: Revenue Streams (Gestapeltes Säulendiagramm)
- X-Achse: Jahr 1, 2, 3
- Y-Achse: Umsatz (€)
- Segmente: SaaS, Services, White-Label, API, Andere

### Chart 3: Customer Growth (Balkendiagramm)
- X-Achse: Jahr 1, 2, 3
- Y-Achse: Anzahl Kunden
- Zeigt 50 → 300 → 1.000 Progression

### Chart 4: P&L Summary (Wasserfall-Diagramm)
- Revenue → COGS → OpEx → EBITDA → Net Income
- Für Jahr 3

### Chart 5: LTV:CAC Ratio (Liniendiagramm)
- X-Achse: Jahr 1, 2, 3
- Y-Achse: Ratio
- Benchmark-Linie bei 3:1

---

## 🎨 Design-Tipps für PowerPoint/Word

### Farbschema (Brand-Konsistenz)

**Primärfarben:**
- Dunkelblau: #1E3A8A (Vertrauen, Stabilität)
- Hellblau: #3B82F6 (Innovation, Tech)
- Grau: #6B7280 (Professionalität)

**Akzentfarben:**
- Grün: #10B981 (Erfolg, Wachstum)
- Rot: #EF4444 (Dringlichkeit, Warnung)
- Orange: #F59E0B (Optimismus, Energie)

### Schriftarten

**Headlines:**
- Arial Bold oder Helvetica Bold
- Größe: 24-32pt

**Body-Text:**
- Arial oder Calibri
- Größe: 11-14pt

**Zahlen:**
- Monospace (Courier New) für Alignment
- Oder: Tabular Figures in Arial/Helvetica

### Layout-Empfehlungen

**Titelfolie:**
- Logo (oben links)
- Titel (zentriert, groß)
- Subtitle: "Seed-Finanzierung: €500.000"
- Datum, Vertraulichkeit (unten)

**Content-Folien:**
- Maximal 5 Bullet Points pro Folie
- 1 Headline + 1 Visuals (Chart/Icon)
- Weißraum ist Ihr Freund!

**Zahlen-Folien:**
- Große Zahlen (60pt+)
- Labels darunter (klein)
- Farbe für Kontext (grün = positiv)

---

## 📧 E-Mail-Vorlagen

### Erstkontakt an Investor

**Betreff:** Seed-Investment: EU AI Act Calmpliance Platform (€500k)

Sehr geehrte/r [Name],

ich kontaktiere Sie bezüglich einer Seed-Investment-Möglichkeit in unsere EU AI Act Calmpliance Audit Platform.

**Das Investment auf einen Blick:**
- Finanzierung: €500k für 20% Equity
- Markt: €4,5 Mrd. (AI Compliance Software bis 2028)
- Traction: Functional MVP, 15 LOIs von Pilotkunden
- Exit-Potential: €100M+ in 5-7 Jahren (30-60x ROI)

**Das Problem:**
10.000+ EU-Unternehmen müssen ab 2026 KI-Systeme auditieren (Bußgelder bis €35M). Aktuelle Lösungen sind teuer (€150k) und langsam (6 Monate).

**Unsere Lösung:**
SaaS-Platform für systematische AI Act Audits. 80% günstiger, 90% schneller.

Ich habe Ihnen im Anhang ein 1-seitiges Executive Summary beigefügt. Für eine 30-minütige Live-Demo würde ich mich sehr freuen.

Sind Sie verfügbar für ein Gespräch diese oder nächste Woche?

Beste Grüße,
[Ihr Name]

**Anhänge:**
- EXECUTIVE_SUMMARY.pdf (1 Seite)
- ONE_PAGER_INVESTOR.pdf (1 Seite)

---

### Follow-Up nach Demo

**Betreff:** Follow-Up: EU AI Act Platform Demo + Nächste Schritte

Sehr geehrte/r [Name],

vielen Dank für das gestrige Gespräch und Ihr Interesse an unserer Platform!

Wie besprochen, sende ich Ihnen:
- Vollständiges Pitch Deck (PDF, 30 Seiten)
- Finanzmodell (Excel, 3-Jahres-Projektion)
- Tech-Dokumentation

**Nächste Schritte (wie besprochen):**
1. Due Diligence (2 Wochen): [Ihre Punkte]
2. Follow-Up-Call am [Datum] um [Uhrzeit]
3. Term Sheet-Diskussion (Ende nächster Woche)

Lassen Sie mich wissen, falls Sie weitere Informationen benötigen.

Beste Grüße,
[Ihr Name]

**Anhänge:**
- Investorenpitch.pdf (vollständig)
- Financial_Model.xlsx
- Tech_Documentation.pdf

---

## 🗂️ Dateiorganisation

```
EU-AI-ACT/
│
├── Pitch-Materialien (Markdown, roh)
│   ├── INVESTOR_PITCH_WORD.md
│   ├── PITCH_DECK.md
│   ├── EXECUTIVE_SUMMARY.md
│   ├── ONE_PAGER_INVESTOR.md
│   └── FOERDERANTRAG_HORIZON_EUROPE.md
│
├── Finanzmodell
│   └── FINANCIAL_MODEL.csv
│
├── Export (für Versand)
│   ├── Investorenpitch.docx (Word-Export)
│   ├── Investorenpitch.pdf (PDF-Export)
│   ├── Executive_Summary.pdf
│   ├── One_Pager.pdf
│   ├── Financial_Model.xlsx (mit Charts)
│   └── Pitch_Deck_Slides.pptx (PowerPoint)
│
└── Assets (optional)
    ├── Logo.png
    ├── Screenshots/
    └── Charts/
```

---

## ✅ Checkliste vor dem Versand

### Dokumente überprüfen

- [ ] Alle Platzhalter ersetzt ([Ihr Name], [E-Mail], etc.)
- [ ] Zahlen sind aktuell und konsistent
- [ ] Rechtschreibung geprüft (Grammarly, LanguageTool)
- [ ] Formatierung einheitlich (Schriftart, Größe, Farben)
- [ ] Seitenzahlen korrekt
- [ ] Inhaltsverzeichnis aktualisiert (falls vorhanden)

### Finanzmodell überprüfen

- [ ] Alle Formeln korrekt (keine #REF, #DIV/0 Fehler)
- [ ] Charts sind aussagekräftig und lesbar
- [ ] Zahlen runden sinnvoll (nicht €882.353,47 sondern €882k)
- [ ] Währungssymbole konsistent (€ überall)
- [ ] Legende für Charts vorhanden

### Vertraulichkeit

- [ ] "Vertraulich"-Wasserzeichen auf jeder Seite (optional)
- [ ] NDA unterschrieben mit Empfänger (empfohlen)
- [ ] Empfänger-spezifische Version (Name im Footer)
- [ ] Versionsnummer und Datum aktuell

### Anhänge

- [ ] Alle versprochenen Anhänge vorhanden
- [ ] Dateigrößen akzeptabel (<10 MB pro Datei)
- [ ] PDFs sind durchsuchbar (nicht gescannt)
- [ ] Links funktionieren (falls vorhanden)

---

## 🎯 Best Practices

### Dos

✅ **Kurz und prägnant:** Investoren haben wenig Zeit
✅ **Visuals first:** Charts > Text
✅ **Storytelling:** Problem → Lösung → Opportunity
✅ **Zahlen untermauern:** Jede Aussage mit Daten belegen
✅ **Realistisch bleiben:** Konservative Projektionen sind glaubwürdiger
✅ **Follow-Up:** Innerhalb 24h nach Meeting

### Don'ts

❌ **Übertreiben:** "Wir werden der nächste Unicorn" - zu früh
❌ **Jargon:** Fachjargon sparsam einsetzen, erklären
❌ **Zu viel Text:** Max. 50 Wörter pro Folie
❌ **Veraltete Daten:** Immer aktuellste Version verwenden
❌ **Rechtschreibfehler:** Unprofessionell, zeigt mangelnde Sorgfalt
❌ **Zu optimistisch:** "Best Case" als "Base Case" verkaufen

---

## 🔄 Versions-Management

**Versionsnummer-Schema:** [Major].[Minor].[Patch]

**Beispiel:**
- v1.0 - Initiale Version (Dezember 2024)
- v1.1 - Minor Updates (geänderte Zahlen, neue Charts)
- v2.0 - Major Updates (neues Geschäftsmodell, neue Strategie)

**Wo die Version angeben:**
- Footer jeder Seite: "Version 1.2 | Stand: 15.12.2024"
- Dateiname: `Investorenpitch_v1.2_2024-12-15.pdf`

**Änderungsprotokoll führen:**
```
v1.0 (10.12.2024) - Initiale Version
v1.1 (12.12.2024) - Finanzmodell aktualisiert (neue CAC-Annahmen)
v1.2 (15.12.2024) - Wettbewerbsanalyse erweitert
```

---

## 📞 Support und Fragen

Falls Sie Hilfe bei der Konvertierung oder Formatierung benötigen:

**Markdown-zu-Word:**
- https://pandoc.org/MANUAL.html

**CSV-zu-Excel:**
- https://support.microsoft.com/en-us/office/import-or-export-text-txt-or-csv-files

**Design-Vorlagen:**
- Canva (für Grafiken): https://www.canva.com/
- Slidesgo (PowerPoint-Templates): https://slidesgo.com/
- Freepik (Icons, Illustrationen): https://www.freepik.com/

---

**Viel Erfolg bei Ihren Investorengesprächen! 🚀**

Wenn Sie Feedback haben oder Anpassungen benötigen, lassen Sie es mich wissen!
