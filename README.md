# Interactive Personal Website

An interactive personal website that presents professional information through a spatial, point-and-click interface inspired by mystery games. Built entirely with client-side technologies for GitHub Pages compatibility.

## Features

- **Interactive Room Interface**: Explore professional content through clickable objects in a spatial layout
- **Recruiter Mode**: Linear presentation of all content without interactive barriers
- **Client-Side Only**: No server dependencies, fully compatible with GitHub Pages
- **Accessibility First**: Full keyboard navigation and screen reader support
- **Hash-Based Routing**: Static hosting friendly navigation

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Building

Build for production:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deployment

Deploy to GitHub Pages:
```bash
npm run deploy
```

Or use the GitHub Actions workflow for automatic deployment on push to main.

## Project Structure

```
src/
├── components/
│   ├── Room/              # Main room container
│   ├── InteractiveObjects/ # Clickable room objects
│   ├── ContentModals/     # Content display overlays
│   └── RecruiterMode/     # Linear content presentation
├── data/
│   ├── content.json       # All website content
│   └── interactions.json  # Object interaction definitions
├── styles/
│   ├── room.css          # Spatial layout styles
│   └── modals.css        # Content presentation styles
└── utils/
    ├── stateManager.js   # Client-side state handling
    └── accessibility.js  # A11y utilities
```

## Browser Support

- Modern browsers with ES6+ support
- Hash-based routing for static hosting compatibility
- Graceful degradation for accessibility features

## License

MIT License