# Eternal Chronicle

Eternal Chronicle is a browser-based in-memory journaling application designed to run entirely on a single machine without any backend infrastructure requirements.

## Current Implementation

This application provides a complete client-side journaling experience with the following features:

### Core Functionality
- **Journal Entry Management**: Create, view, and organize journal entries
- **Automatic Titles**: Entries are named from their content when saved, with a one-tap suggestion button and manual override
- **Data Persistence**: Uses IndexedDB with localStorage fallback for reliable data storage
- **Offline Capability**: Service worker enabled for offline functionality when installed as a PWA
- **Media Attachments**: Support for images and audio attachments in journal entries
- **Search Functionality**: Built-in search capabilities to find entries
- **Export Options**: Basic export functionality for journal entries

### Architecture
- **Single-Machine Operation**: Runs entirely client-side with no backend dependencies
- **In-Memory Operation**: All processing happens in the browser
- **Local Storage**: Data is stored locally in the browser using IndexedDB and localStorage

## Future Development

### Frontend Development
- Enhanced UI/UX design and responsive layout
- Advanced search capabilities with better filtering
- Improved media handling and preview features
- Additional journaling features and organization options
- Better error handling and user feedback mechanisms

### Backend Development
- Potential cloud synchronization capabilities
- User authentication and management
- Advanced data export/import options
- Analytics and visualization features
- Cross-device synchronization

## Getting Started

This application is built with React and Vite, using modern browser APIs for data storage.

To run the application:
```bash
npm install
npm run dev
```

The dev server uses the same GitHub Pages base path, so open:
```text
http://localhost:5173/EternalChronicle/
```

To build the application:
```bash
npm run build
```

## Deployment (GitHub Pages)

The app is configured to publish as a GitHub Pages project site at:
```text
https://commitandquit.github.io/EternalChronicle/
```

Pushing to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes `dist/`. In the repository's **Settings → Pages**, set the source to **GitHub Actions** once.

Vite's base path defaults to `/EternalChronicle/`. The workflow derives it from the repository name so forks work without edits. To build for a different path manually:
```bash
VITE_BASE_PATH=/my-repo/ npm run build
```