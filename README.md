# AutoAI kostenlos

Deutschsprachige Auto-Diagnose-KI mit Cloudflare Workers AI und optionaler Web-/Forensuche über Tavily.

## Enthalten
- Fahrzeugprofil
- Gesprächskontext
- Diagnose-Notizen
- Web-/Forenrecherche
- Quellenlinks und [1]-Zitate
- responsive Handy-Oberfläche
- lokale Speicherung im Browser

## Keine OpenAI-API nötig
Das Projekt nutzt Cloudflare Workers AI. Für die Websuche wird ein kostenloser Tavily-Key als Secret `TAVILY_API_KEY` verwendet.

## Cloudflare
`wrangler.jsonc` enthält bereits die Workers-AI-Bindung `AI` und statische Assets.

Modell: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`

## Tavily
Erstelle einen kostenlosen Tavily-Key und speichere ihn bei Cloudflare als Secret `TAVILY_API_KEY`. Der Key gehört niemals in den `public`-Ordner.

## Lokal
```bash
npm install
npm run dev
```

## Deployment
```bash
npm run deploy
```

Oder das GitHub-Repository über das Cloudflare-Dashboard mit Workers verbinden.

## Hinweis
Kostenlos bedeutet Nutzung innerhalb der kostenlosen Kontingente der jeweiligen Dienste. Bei ausgeschöpften Kontingenten kann die jeweilige Funktion bis zum Reset aussetzen.
