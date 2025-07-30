# SafarAI 🧠

> AI-powered web assistant for Safari that helps you understand and interact with any webpage content using advanced AI technology.

<div align="center">

![Safari Extension](https://img.shields.io/badge/Safari-Extension-blue?style=for-the-badge&logo=safari)
![macOS](https://img.shields.io/badge/macOS-13%2B-brightgreen?style=for-the-badge&logo=apple)
![Swift](https://img.shields.io/badge/Swift-5.10-orange?style=for-the-badge&logo=swift)
![SwiftUI](https://img.shields.io/badge/SwiftUI-UI-purple?style=for-the-badge&logo=swift)

[Features](#features) • [Installation](#installation) • [Usage](#usage) • [Development](#development) • [Contributing](#contributing)

</div>

## ✨ Features

### 🎯 Core Functionality
- **Smart Sidebar Panel** - Copilot-like interface that opens alongside any webpage
- **Intelligent Content Extraction** - Automatically analyzes and extracts main content from web pages
- **AI-Powered Conversations** - Ask questions about any webpage using DeepSeek AI
- **Universal Compatibility** - Works on both Intel and Apple Silicon Macs
- **Secure API Storage** - API keys stored safely in macOS Keychain

### 🛡️ Security & Privacy
- **Sandboxed Execution** - Runs in Safari's secure extension environment  
- **Keychain Integration** - No API keys stored in plain text
- **HTTPS Only** - All API communications encrypted
- **Content Isolation** - Scripts run in isolated contexts

### 🎨 Modern Interface
- **SwiftUI Host App** - Native macOS app for extension management
- **Responsive Design** - Clean, minimal interface that adapts to content
- **Markdown Support** - Rich text formatting in AI responses
- **Dark/Light Mode** - Follows system appearance preferences

## 📱 Screenshots

| Main App | Extension Setup | Sidebar in Action |
|----------|----------------|-------------------|
| ![Main App](https://via.placeholder.com/250x180/f0f0f0/333?text=SafarAI+App) | ![Setup](https://via.placeholder.com/250x180/e3f2fd/1976d2?text=Extension+Setup) | ![Sidebar](https://via.placeholder.com/250x180/f3e5f5/7b1fa2?text=AI+Sidebar) |

## 🚀 Installation

### Prerequisites
- macOS 13.0 (Ventura) or later
- Safari 16.0 or later
- Xcode 15+ (for building from source)
- DeepSeek API account

### Option 1: Download Release (Recommended)
1. Download the latest `.dmg` from [Releases](../../releases)
2. Open the downloaded file and drag SafarAI to Applications
3. Launch SafarAI and follow the setup instructions

### Option 2: Build from Source
```bash
# Clone the repository
git clone https://github.com/your-username/SafarAI.git
cd SafarAI

# Open in Xcode
open SafarAI.xcodeproj

# Build and run (⌘+R)
```

### Safari Extension Setup
1. **Enable Extension**: Safari → Preferences → Extensions → SafarAI ✅
2. **Grant Permissions**: Allow access to all websites
3. **API Key Setup**: Click SafarAI toolbar icon → Enter DeepSeek API key

## 🎯 Usage

### Quick Start
1. **Open any webpage** in Safari
2. **Click the SafarAI icon** in the toolbar (🧠)
3. **Enter your API key** when prompted (stored securely)
4. **Start asking questions** about the page content!

### Example Conversations
```
👤 "What is this article about?"
🤖 "This article discusses the latest developments in AI technology, focusing on..."

👤 "Summarize the key points"
🤖 "Here are the main takeaways: 1. AI adoption is accelerating..."

👤 "What are the technical requirements mentioned?"
🤖 "The article mentions these technical requirements: Python 3.8+..."
```

### Supported Content Types
- 📰 News articles and blog posts
- 📚 Documentation and technical guides  
- 🛒 Product pages and reviews
- 📊 Research papers and reports
- 💼 Business and marketing content

## 🛠️ Development

### Architecture
```
SafarAI/
├── 📱 SafarAI/                    # SwiftUI host application
│   ├── AppDelegate.swift          # App lifecycle
│   ├── SafarAIAppView.swift       # Main UI
│   └── Assets.xcassets/           # App icons & assets
├── 🔌 SafarAI Extension/          # Safari extension bundle  
│   ├── SafariWebExtensionHandler.swift  # Native bridge
│   └── Resources/                 # Web extension files
│       ├── manifest.json          # Extension config
│       ├── sidebar.html           # Sidebar UI
│       ├── sidebar.js             # Main logic
│       ├── content.js             # Content extraction  
│       └── background.js          # Background tasks
└── 📋 BUILD_INSTRUCTIONS.md       # Detailed build guide
```

### Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Swift 5.10, SwiftUI
- **API**: DeepSeek Chat Completions
- **Storage**: macOS Keychain Services
- **Platform**: Safari App Extensions API

### Key Components

#### Content Extraction Engine
```javascript
// Intelligent content parsing
function extractPageContent() {
    // Remove ads, navigation, and clutter
    // Focus on main content areas
    // Clean and optimize text
}
```

#### AI Integration
```swift
// Secure API communication
class KeychainManager {
    func storeApiKey(_ apiKey: String) -> Bool
    func getApiKey() -> String?
}
```

#### Message Passing
```javascript
// Extension ↔ Native App communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // Handle content extraction, API calls, etc.
});
```

### Building & Testing

#### Development Build
```bash
# Open project in Xcode
open SafarAI.xcodeproj

# Select SafarAI scheme
# Build for development (⌘+B)
# Run to install extension (⌘+R)
```

#### Release Build  
```bash
# Archive for distribution
# Product → Archive in Xcode
# Export for Mac App Store or Developer ID
```

#### Testing Checklist
- [ ] Extension appears in Safari preferences
- [ ] Sidebar opens and closes correctly
- [ ] Content extraction works on various sites
- [ ] API key storage and retrieval functions
- [ ] AI responses are relevant and helpful
- [ ] Error handling works properly

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Setup
1. **Fork** the repository
2. **Clone** your fork locally
3. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
4. **Make** your changes and test thoroughly
5. **Commit** with clear messages (`git commit -m 'Add amazing feature'`)
6. **Push** to your fork (`git push origin feature/amazing-feature`)
7. **Open** a Pull Request

### Contribution Guidelines
- 🧪 **Add tests** for new functionality
- 📝 **Update documentation** as needed
- 🎨 **Follow existing code style** and conventions
- 🔍 **Test on different websites** and scenarios
- 📱 **Ensure compatibility** with supported macOS versions

### Areas for Contribution
- 🌐 **Multi-language support** and localization
- 🎨 **UI/UX improvements** and themes
- 🚀 **Performance optimizations**
- 🧠 **Additional AI provider integrations**
- 🐛 **Bug fixes** and stability improvements
- 📚 **Documentation** and examples

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Apple** - Safari Extensions API and development tools
- **DeepSeek** - Advanced AI language model integration
- **Contributors** - Everyone who helps improve SafarAI
- **Community** - Users who provide feedback and support

## 📞 Support & Contact

- 🐛 **Bug Reports**: [Open an issue](../../issues/new?template=bug_report.md)
- 💡 **Feature Requests**: [Request a feature](../../issues/new?template=feature_request.md)
- 💬 **Discussions**: [GitHub Discussions](../../discussions)
- 📧 **Email**: support@avoagency.com
- 🌐 **Website**: [avoagency.com](https://avoagency.com)

---

<div align="center">

**Made with ❤️ by [Avo Agency](https://avoagency.com)**

[⭐ Star this repo](../../stargazers) • [🍴 Fork it](../../fork) • [📝 Report issues](../../issues)

</div>
