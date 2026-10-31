# Eternal Chronicle

Eternal Chronicle is a browser-based in-memory journaling application designed to run entirely on a single machine without any backend infrastructure requirements.

## Current Implementation

This application provides a complete client-side journaling experience with the following features:

### Core Functionality
- **Journal Entry Management**: Create, view, and organize journal entries
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

To build the application:
```bash
npm run build
```