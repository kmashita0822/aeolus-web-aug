# Aeolus - Disaster Alerts

A modern React TypeScript application for real-time disaster alerts and monitoring.

## Features

- **Real-time Disaster Alerts**: Interactive modal with live disaster data from GDACS API
- **Live API Integration**: Fetches real disaster events from Global Disaster Alert and Coordination System
- **Responsive Design**: Optimized for all screen sizes and touch devices
- **Modern Tech Stack**: React 19, TypeScript, Vite
- **Performance Optimized**: Fast loading with video backgrounds and retry logic
- **Accessibility**: WCAG compliant with proper ARIA labels and keyboard navigation
- **Error Handling**: Robust error handling with retry mechanisms and fallback states

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **CSS3** - Modern styling with custom properties
- **GDACS API** - Real-time disaster data
- **Vercel** - Deployment platform

## API Integration

The application integrates with the GDACS (Global Disaster Alert and Coordination System) API to provide real-time disaster alerts:

- **API Endpoint**: `https://www.gdacs.org/gdacsapi/api/events/geteventlist/homepagetable`
- **Data Types**: Tropical Cyclones, Floods, Wildfires, Droughts
- **Alert Levels**: Green (Informational), Orange (Moderate), Red (High Alert)
- **Retry Logic**: Automatic retry with exponential backoff
- **Error Handling**: Graceful fallback to empty state on API failures

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd aeolus-web-aug
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to Vercel

## Project Structure

```
├── public/                 # Static assets
│   ├── assets/            # Images, videos, SVGs
│   ├── styles.css         # Global styles
│   └── script.js          # Legacy JavaScript (if needed)
├── src/                   # React source code
│   ├── components/        # React components
│   │   ├── HeroSection.tsx
│   │   ├── ContentSection.tsx
│   │   └── DetailModal.tsx
│   ├── hooks/            # Custom React hooks
│   ├── App.tsx           # Main App component
│   └── main.tsx          # React entry point
├── index.html             # Main HTML file
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Dependencies and scripts
```

## Development

### Adding New Components

1. Create a new component in `src/components/`
2. Export as default with proper TypeScript types
3. Import and use in `App.tsx`

Example:
```tsx
import React from 'react'

interface MyComponentProps {
  title: string
}

const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return <div>{title}</div>
}

export default MyComponent
```

### Styling

- Global styles are in `public/styles.css`
- Component-specific styles can be added as CSS modules
- Uses CSS custom properties for theming

### TypeScript

- Strict mode enabled
- All components properly typed
- Path aliases configured (`@/` points to `src/`)

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Vercel will automatically detect the React setup
3. Deploy with: `npm run deploy`

### Manual Build

1. Build the project:
```bash
npm run build
```

2. The built files will be in the `dist/` directory
3. Deploy the `dist/` directory to your hosting provider

## Performance

- Video backgrounds optimized for web
- Lazy loading for modal content
- CSS optimizations for smooth animations
- TypeScript compilation optimized for production

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive
- Progressive enhancement

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details 