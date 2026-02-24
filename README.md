# woha-lomat Baden-Württemberg
[woha-lomat-testapp](https://ipfs.io/ipfs/bafkreigig626yx47pa3j5ajsarzonaucki35vrltcoahop6lhtpsvlf7om/)

Diese Webanwendung hilft Wählern, ihre politischen Positionen mit denen der Parteien zur Landtagswahl in Baden-Württemberg zu vergleichen.

## Installation & Start

1.  Installiere die Abhängigkeiten:
    ```bash
    npm install
    ```

2.  Starte den Entwicklungsserver:
    ```bash
    npm run dev
    ```

3.  Öffne `http://localhost:5173` in deinem Browser.

## Veröffentlichen (für andere zugänglich machen)

Die App ist eine statische Webseite. So kannst du sie anderen zugänglich machen:

### 1. Build erzeugen

```bash
npm run build
```

Das erzeugt den fertigen Ordner `dist/` mit allen Dateien. Diesen Ordner musst du auf einen Webserver oder einen Hoster hochladen.

### 2. Lokal testen vor dem Hochladen

```bash
npm run preview
```

Öffne die angezeigte Adresse (z.B. `http://localhost:4173`) – so sieht die gebaute Version aus.

**Single-File-Build (eine HTML-Datei):** Wenn du alles in einer einzigen `index.html` haben möchtest (z.B. für E-Mail oder einfaches Hosting), führe aus:

```bash
npm run build:mdist
```

Dann liegt unter `mdist/index.html` eine einzige Datei mit derselben Funktionalität (CSS und JS sind eingebettet). Du kannst nur diese eine Datei hochladen.

### 3. Wo hosten?

| Option | Aufwand | Kosten | Kurzbeschreibung |
|--------|---------|--------|------------------|
| **Netlify** | Gering | Kostenlos (mit Limits) | `dist/` per Drag & Drop oder per Git verbinden, automatische Builds. |
| **Vercel** | Gering | Kostenlos | Wie Netlify, sehr gut für Vite/React. Mit Git: Repo verbinden, Build-Befehl `npm run build`, Output `dist`. |
| **Cloudflare Pages** | Gering | Kostenlos | Repo verbinden oder `dist/` hochladen. |
| **GitHub Pages** | Mittel | Kostenlos | Repo → Settings → Pages → Source „GitHub Actions“ oder Branch mit `dist/`-Inhalt. Bei Unterordner-Pfad (z.B. `/wohalomat/`) in `vite.config.ts` `base: '/wohalomat/'` setzen. |
| **Eigener Server / VPS** | Mittel | Je nach Anbieter | Ordner `dist/` per FTP/SSH hochladen und mit Nginx/Apache als statische Dateien ausliefern. |

**Schnellstart mit Netlify oder Vercel (ohne Git):**

1. Auf [netlify.com](https://www.netlify.com) oder [vercel.com](https://vercel.com) gehen und Account anlegen.
2. `npm run build` lokal ausführen.
3. Den Ordner `dist/` per Drag & Drop in das Deployment-Fenster ziehen (Netlify: „Deploy manually“ / „Sites“ → „Add new site“ → „Deploy manually“).
4. Du bekommst eine URL wie `https://dein-projekt.netlify.app` – diese kannst du teilen.

**Mit Git (z.B. GitHub):**

1. Projekt auf GitHub pushen.
2. Bei Netlify/Vercel/Cloudflare Pages ein neues Projekt anlegen und das Repo verbinden.
3. Build-Befehl: `npm run build`, Ausgabe-Ordner: `dist`.
4. Jeder Push kann automatisch eine neue Version deployen.

### 4. Eigene Domain (optional)

Bei Netlify/Vercel/Cloudflare kannst du unter den Projekteinstellungen eine eigene Domain hinzufügen und ggf. SSL wird automatisch eingerichtet.

## Rechtliche Pflichtangaben (Deutschland)

Wenn du die Seite in Deutschland betreibst (nicht rein privat), gelten u. a.:

- **Impressum** (§ 5 TMG / Digitale-Dienste-Gesetz): Name, ladungsfähige Anschrift, Kontakt (E-Mail + mind. ein weiteres Mittel wie Telefon oder Kontaktformular); bei Unternehmen zusätzlich Rechtsform, Vertretung, ggf. Registergericht und -nummer. Das Impressum muss mit einem Klick von der Startseite erreichbar sein.
- **Datenschutzerklärung** (DSGVO): Erforderlich, sobald personenbezogene Daten verarbeitet werden – z. B. durch den Hoster (Zugriffs-/Protokolldaten). Muss getrennt vom Impressum und gut erreichbar sein.
- **Cookie-Banner**: Nur nötig, wenn du Cookies (z. B. Analyse/Tracking) einsetzt. Die aktuelle App setzt keine Cookies.

In der App sind **Impressum** und **Datenschutz** im Footer verlinkt und öffnen Platzhalter-Texte. **Wichtig:** Ersetze die Platzhalter in `src/legalContent.ts` durch deine echten Angaben. Für eine rechtssichere Datenschutzerklärung kannst du z. B. [e-recht24.de](https://www.e-recht24.de) oder [datenschutz-generator.de](https://datenschutz-generator.de) nutzen.

## Daten anpassen

Die Fragen und Parteipositionen befinden sich in `src/data.ts`.

### Neue Fragen hinzufügen

Füge ein neues Objekt zum `questions` Array hinzu:

```typescript
{
  id: 'q9',
  text: 'Der Text der neuen Frage...',
  category: 'Kategorie',
  explanation: 'Optionale Erklärung...'
}
```

### Neue Parteien hinzufügen

Füge ein neues Objekt zum `parties` Array hinzu:

```typescript
{
  id: 'partei_xyz',
  name: 'XYZ',
  longName: 'Partei Name Lang',
  color: '#ff00ff',
  positions: {
    q1: 'agree',
    q2: 'disagree',
    // ... Positionen für alle Fragen
  }
}
```

## Analyse der Wahlprogramme

Um die Wahlprogramme automatisch zu analysieren, wird ein Backend-Service oder ein Skript benötigt, das:
1.  Die PDF-Dateien der Wahlprogramme einliest.
2.  Den Text extrahiert.
3.  Mit Hilfe eines LLMs (z.B. GPT-4) die Positionen zu den definierten Thesen extrahiert.

Da dies eine rein client-seitige Anwendung ist, sind die Daten aktuell statisch in `src/data.ts` hinterlegt.
