# Voyager Admin Frontend

Ein vereinfachtes Webfrontend für den OrbitDB Pinning Server "Voyager". Dieses Frontend ermöglicht es, alle indizierten Datenbanken und deren Inhalt anzuzeigen und zu verwalten.

## Funktionen

- **Dashboard**: Übersicht über Systemstatus, Datenbanken und Benutzer
- **Datenbank-Verwaltung**: Anzeigen, Hinzufügen und Entfernen von Datenbanken
- **Benutzer-Verwaltung**: Anzeigen, Hinzufügen und Entfernen von autorisierten Benutzern

## Voraussetzungen

- Node.js (v18 oder höher)
- pnpm
- Ein laufender Voyager-Server mit REST-API

## Installation

1. Abhängigkeiten installieren:

```bash
pnpm install
```

2. Umgebungsvariablen konfigurieren:

Erstellen Sie eine `.env`-Datei im Hauptverzeichnis mit folgendem Inhalt:

```
VOYAGER_API_URL=http://localhost:3006
```

Passen Sie die URL an die Adresse Ihres Voyager-Servers an.

## Entwicklung

Starten Sie den Entwicklungsserver:

```bash
pnpm dev
```

Die Anwendung ist dann unter http://localhost:5173 verfügbar.

## Produktion

Bauen Sie die Anwendung für die Produktion:

```bash
pnpm build
```

Die gebaute Anwendung befindet sich im Verzeichnis `build`.

## REST-API für Voyager

Dieses Frontend kommuniziert mit dem Voyager-Server über eine REST-API. Die API muss auf dem Voyager-Server implementiert werden. Eine Beispielimplementierung finden Sie in der Datei `src/lib/server/voyager/rest-api-simplified.md`.

## Architektur

Das Frontend verwendet folgende Technologien:

- **SvelteKit**: Framework für die Erstellung der Webanwendung
- **TailwindCSS**: CSS-Framework für das Styling
- **REST-API**: Kommunikation mit dem Voyager-Server

Die Hauptkomponenten sind:

- **Dashboard**: Übersicht über den Voyager-Server
- **Datenbank-Liste**: Anzeige aller indizierten Datenbanken
- **Datenbank-Details**: Anzeige der Details einer Datenbank
- **Benutzer-Verwaltung**: Verwaltung der autorisierten Benutzer

## Lizenz

Siehe LICENSE-Datei im Hauptverzeichnis.
