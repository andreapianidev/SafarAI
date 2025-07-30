# SafarAI Development Guide

## 🔑 API Key Setup

### For Development
1. **Copy the environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Add your DeepSeek API key to `.env`:**
   ```bash
   DEEPSEEK_API_KEY=your-api-key-here
   ```

3. **The API key is automatically loaded in development mode**

### For Production
- Users will be prompted to enter their own API key
- Keys are stored securely in the browser's local storage
- No hardcoded keys in production builds

## 🛠️ Development Setup

### Prerequisites
- Xcode 15+
- macOS 13+ (Ventura)
- DeepSeek API account

### Quick Start
1. **Clone and setup:**
   ```bash
   git clone https://github.com/your-repo/SafarAI.git
   cd SafarAI
   
   # Copy environment file
   cp .env.example .env
   # Edit .env with your API key
   ```

2. **Open in Xcode:**
   ```bash
   open SafarAI.xcodeproj
   ```

3. **Build and run** (⌘+R)

4. **Enable extension** in Safari > Preferences > Extensions

## 🔧 Configuration

### Environment Variables (.env)
```bash
# DeepSeek API
DEEPSEEK_API_KEY=sk-your-key-here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

# Development
DEBUG_MODE=true
LOG_LEVEL=info
```

### Build Configurations
- **Debug**: Uses API key from .env, enables logging
- **Release**: Requires user to enter API key, minimal logging

## 🧪 Testing

### Manual Testing Checklist
- [ ] Extension loads in Safari
- [ ] Sidebar opens/closes correctly
- [ ] Content extraction works on various sites
- [ ] API key input and storage functions
- [ ] AI responses are relevant
- [ ] Error handling works properly

### Test Sites
Try these different types of websites:
- News articles (CNN, BBC)
- Technical documentation (MDN, Apple Docs)
- E-commerce sites (Amazon, Apple Store)
- Blog posts (Medium, personal blogs)
- Academic papers (arXiv, research sites)

## 🐛 Debugging

### Console Logs
- **Background script**: Browser DevTools > Extensions > SafarAI > Background page
- **Content script**: Browser DevTools > Console (on any webpage)
- **Sidebar**: Right-click sidebar > Inspect

### Common Issues

#### Extension not appearing
```bash
# Check Safari preferences
Safari > Preferences > Extensions > SafarAI

# Verify extension is built correctly
# Check Xcode build logs for errors
```

#### API calls failing
```bash
# Check API key format
echo $DEEPSEEK_API_KEY | grep "^sk-"

# Test API manually
curl -X POST https://api.deepseek.com/v1/chat/completions \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"deepseek-chat","messages":[{"role":"user","content":"Hello"}]}'
```

#### Content extraction issues
- Check browser console for JavaScript errors
- Verify content script is injected properly
- Test on different website structures

## 📁 Project Structure

```
SafarAI/
├── 📱 SafarAI/                    # Main macOS app
│   ├── AppDelegate.swift          # App lifecycle
│   ├── SafarAIAppView.swift       # SwiftUI main view
│   └── Assets.xcassets/           # Icons and assets
├── 🔌 SafarAI Extension/          # Safari extension
│   ├── SafariWebExtensionHandler.swift  # Native bridge
│   ├── Info.plist                # Extension info
│   └── Resources/                 # Web extension files
│       ├── manifest.json          # Extension manifest
│       ├── sidebar.html           # Sidebar interface
│       ├── sidebar.css            # Styling
│       ├── sidebar.js             # Main logic
│       ├── content.js             # Page content extraction
│       ├── background.js          # Background tasks
│       ├── config.template.js     # Configuration template
│       └── _locales/en/messages.json  # Localization
├── .env                          # Environment variables (ignored)
├── .gitignore                    # Git ignore rules
├── README.md                     # Main documentation
├── DEVELOPMENT.md                # This file
└── BUILD_INSTRUCTIONS.md         # Build and deployment guide
```

## 🚀 Deployment

### Development Build
1. Build in Xcode (⌘+B)
2. Run to install extension (⌘+R)
3. Enable in Safari preferences

### Release Build
1. Archive in Xcode (Product > Archive)
2. Export for distribution
3. Sign with Developer ID or Mac App Store certificate

## 🔒 Security Notes

### API Key Handling
- ✅ **Development**: Key in .env (not committed)
- ✅ **Production**: User enters key (stored in browser storage)
- ❌ **Never**: Hardcode keys in source code

### Content Security
- All API calls use HTTPS
- Content scripts run in isolated contexts
- Extension runs in Safari's sandbox

### Privacy
- No user data is sent to our servers
- Only webpage content and user questions sent to DeepSeek
- API keys stored locally only

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your changes with tests
4. Update documentation
5. Submit a pull request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.