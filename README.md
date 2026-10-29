# 🗺️ Maps Search - Professional Heatmap Visualization

A modern, interactive web application that combines Google Maps with powerful heatmap visualization to help users discover and analyze location-based data patterns.

![Maps Search App](https://img.shields.io/badge/Maps_Search-v1.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black.svg)
![React](https://img.shields.io/badge/React-19-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.1.9-blue.svg)

## 🌟 Features

### 🗺️ **Interactive Map Experience**
- **Real-time Google Maps integration** with satellite and street views
- **Custom map styling** with clean, professional appearance
- **Responsive design** that works on all devices
- **Smooth map controls** with gesture support

### 🔍 **Advanced Search Functionality**
- **Multi-category search** (Universities, Shopping, Restaurants, Hospitals, etc.)
- **Autocomplete predictions** with real-time suggestions
- **Keyboard navigation** (Arrow keys + Enter)
- **Search history** with clear functionality
- **Location-based search** with "Use my location" feature

### 🔥 **Heatmap Visualization**
- **Real Google Places API data** (not mock data)
- **Dynamic heatmap generation** based on location
- **Interactive controls** for:
  - Toggle heatmap visibility
  - Adjust radius (10-60px)
  - Real-time opacity control
- **Color-coded intensity** from blue (low) to red (high)

### 🎨 **Modern UI/UX**
- **Dark/Light theme toggle** with system preference detection
- **Clean, minimalist design** with Geist Sans font
- **Responsive layout** with mobile-first approach
- **Loading states** and error handling
- **Accessibility features** with proper ARIA labels

### 📊 **Data Insights**
- **Nearby places display** with ratings and types
- **Place details overlay** with photos and reviews
- **Business information** including price levels
- **Real-time data updates** as you move around

## 🛠️ Tech Stack

### Frontend Framework
- **Next.js 15.2.4** - React framework with App Router
- **React 19** - Latest React with concurrent features
- **TypeScript 5** - Type-safe development

### UI & Styling
- **TailwindCSS 4.1.9** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Geist Sans** - Modern typography from Vercel
- **Lucide React** - Beautiful icons

### Maps & Visualization
- **Google Maps JavaScript API** - Core mapping functionality
- **Google Places API** - Location search and details
- **Google Visualization API** - Heatmap layer support

### State Management
- **React Hooks** - useState, useEffect, useRef
- **Context API** - Theme management

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+**
- **pnpm** (recommended) or npm
- **Google Maps API Key** with required APIs enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd maps-search-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_google_maps_api_key_here
   ```

4. **Enable Google Maps APIs**

   Go to [Google Cloud Console](https://console.cloud.google.com/) and enable:
   - **Maps JavaScript API**
   - **Places API**
   - **Geocoding API** (optional)

5. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
maps-search-app/
├── app/                          # Next.js App Router
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with theme provider
│   ├── page.tsx                 # Main application page
│   └── loading.tsx              # Loading component
├── components/                   # Reusable components
│   ├── map-component.tsx        # Main map with heatmap
│   ├── search-box.tsx           # Search functionality
│   ├── theme-provider.tsx       # Theme context
│   ├── theme-toggle.tsx         # Theme switcher
│   └── ui/                      # UI components (Radix)
├── hooks/                       # Custom React hooks
├── lib/                         # Utility functions
├── public/                      # Static assets
├── styles/                      # Additional styles
└── README.md                    # This file
```

## 🎮 Usage

### Basic Usage

1. **Search for locations** using the search bar
2. **Select categories** (Universities, Restaurants, etc.)
3. **View heatmap** showing business density
4. **Adjust heatmap settings** using the controls panel
5. **Explore nearby places** in the details panel

### Advanced Features

#### Heatmap Controls
- **Toggle**: Show/hide the heatmap overlay
- **Radius**: Adjust the spread of heatmap points (10-60px)
- **Real-time updates**: Changes apply immediately

#### Search Features
- **Category filtering**: Search within specific business types
- **Keyboard shortcuts**: Use arrow keys to navigate suggestions
- **Location access**: Use "Use my location" for current position
- **Clear search**: One-click to reset search

#### Theme Support
- **Auto theme**: Follows system preference
- **Manual toggle**: Click sun/moon icon in header
- **Persistent**: Remembers your choice

## 🔧 Configuration

### Environment Variables

```env
# Required
NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_api_key_here

# Optional
NODE_ENV=development
```

### API Key Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable the following APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. Create credentials (API Key)
5. Add your domain to restrictions (for production)

## 🏗️ Development

### Available Scripts

```bash
# Development
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint

# Type checking
pnpm type-check   # Run TypeScript compiler
```

### Code Quality

- **ESLint**: Code linting and formatting
- **TypeScript**: Type checking
- **Prettier**: Code formatting (via ESLint)

## 🌐 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy automatically

### Other Platforms

The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Render
- DigitalOcean App Platform

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests and linting**
   ```bash
   pnpm lint
   ```
5. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
6. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
7. **Open a Pull Request**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Maps Platform** - For providing excellent mapping APIs
- **Vercel** - For the beautiful Geist font
- **Radix UI** - For accessible component primitives
- **TailwindCSS** - For amazing utility-first styling
- **Next.js Team** - For the incredible framework

## 🐛 Troubleshooting

### Common Issues

1. **"Google Maps API key not found"**
   - Check your `.env.local` file
   - Ensure the API key has the correct permissions

2. **Heatmap not showing**
   - Verify Visualization API is enabled in Google Cloud Console
   - Check browser console for errors

3. **Search not working**
   - Ensure Places API is enabled
   - Check API key restrictions

### Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify your API key configuration
3. Ensure all required APIs are enabled
4. Check the [Google Maps Platform documentation](https://developers.google.com/maps)

## 📞 Contact

For questions or support, please open an issue on GitHub or reach out to the maintainers.

---

**Made with ❤️ using Next.js, Google Maps, and modern web technologies**
