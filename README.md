# Saga3D - Tell your system's saga in 3D

Saga3D is a powerful, modern Progressive Web App (PWA) for creating stunning isometric system architecture diagrams. Built with React, TypeScript, and the Isoflow library, it runs entirely in your browser with offline support.

![Screenshot_20250630_160954](https://github.com/user-attachments/assets/e7f254ad-625f-4b8a-8efc-5293b5be9d55)

**🎯 Perfect for:** System architects, developers, and anyone building distributed systems, microservices, or technical documentation.

## 🚀 Features

- 🏗️ **System Architecture Focused** - Purpose-built for system design and distributed architectures
- 🎨 **Isometric 3D Diagrams** - Create stunning, modern technical diagrams
- 💾 **Smart Auto-Save** - Your work is automatically saved every 5 seconds
- 📱 **PWA Support** - Install as a native app on desktop and mobile
- 🔒 **Privacy-First** - All data stored locally in your browser
- 📤 **Import/Export** - Share diagrams as JSON files
- 🎯 **Session Storage** - Quick save without dialogs
- 🌐 **Offline Support** - Work without internet connection
- ⌨️ **Keyboard Shortcuts** - Streamlined workflow for power users

## Quick Start

```bash
# Clone the repository
git clone https://github.com/your-username/saga3d
cd saga3d

# Make sure you have npm installed

# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

### Creating Diagrams

1. **Add Items**: Drag and drop components from the library onto the canvas
2. **Connect Items**: Use connectors to show relationships between components
3. **Customize**: Change colors, labels, and properties of items
4. **Navigate**: Pan and zoom to work on different areas

### Saving Your Work

- **Auto-Save**: Diagrams are automatically saved to browser storage every 5 seconds
- **Quick Save**: Click "Quick Save (Session)" for instant saves without popups
- **Save As**: Use "Save New" to create a copy with a different name

### Managing Diagrams

- **Load**: Click "Load" to see all your saved diagrams
- **Import**: Load diagrams from JSON files shared by others
- **Export**: Download your diagrams as JSON files to share or backup
- **Storage**: Use "Storage Manager" to manage browser storage space

### Keyboard Shortcuts

- `Delete` - Remove selected items
- Mouse wheel - Zoom in/out
- Click and drag - Pan around canvas

## Building for Production

```bash
# Create optimized production build
npm run build

# Serve the production build locally
npx serve -s build
```

The build folder contains all files needed for deployment.

## Deployment

### Static Hosting

Deploy the `build` folder to any static hosting service:

- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any web server

### Important Notes

1. **HTTPS Required**: PWA features require HTTPS (except localhost)
2. **Browser Storage**: Diagrams are saved in browser localStorage (~5-10MB limit)
3. **Backup**: Regularly export important diagrams as JSON files

## Browser Support

- Chrome/Edge (Recommended) ✅
- Firefox ✅
- Safari ✅
- Mobile browsers with PWA support ✅

## Troubleshooting

### Storage Full

- Use Storage Manager to free space
- Export and delete old diagrams
- Clear browser data (last resort - will delete all diagrams)

### Can't Install PWA

- Ensure using HTTPS
- Try Chrome or Edge browsers
- Check if already installed

### Lost Diagrams

- Check browser's localStorage
- Look for auto-saved versions
- Always export important work

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Isoflow** - Isometric diagram engine
- **PWA** - Offline-first web app

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

Isoflow is released under the MIT license.

## Acknowledgments

Built with the [Isoflow](https://github.com/markmanx/isoflow) library.

x0z.co
