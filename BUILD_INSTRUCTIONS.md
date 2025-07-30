# SafarAI Build Instructions

## Prerequisites
- Xcode 15+ 
- macOS 13+ (Ventura) or later
- Apple Developer Account (for code signing)
- Safari Developer Certificate

## Project Configuration

### Target Settings
Make sure the following settings are configured in Xcode:

#### Main App Target (SafarAI)
- **Deployment Target**: macOS 13.0
- **Architectures**: Universal (arm64, x86_64)
- **Bundle Identifier**: com.avo.SafarAI
- **Team**: Select your development team
- **Code Signing**: Developer ID Application or Mac App Store

#### Extension Target (SafarAI Extension)  
- **Deployment Target**: macOS 13.0
- **Architectures**: Universal (arm64, x86_64)
- **Bundle Identifier**: com.avo.SafarAI.Extension
- **Team**: Select your development team
- **Code Signing**: Developer ID Application or Mac App Store

### Required Capabilities
- **App Sandbox**: YES
- **Outgoing Connections (Client)**: YES (for DeepSeek API calls)

### Info.plist Updates
The extension Info.plist should include:
- Safari Web Extension point identifier
- Proper principal class reference

## Build Steps

1. **Open the project** in Xcode 15+
2. **Select your development team** for both targets
3. **Update bundle identifiers** to match your developer account
4. **Build the project** (Cmd+B)
5. **Archive for distribution** (Product → Archive)
6. **Export for Mac App Store** or **Developer ID** distribution

## File Structure
```
SafarAI/
├── SafarAI/                        # Main app (SwiftUI host)
│   ├── AppDelegate.swift           # Main app delegate
│   ├── SafarAIAppView.swift        # SwiftUI interface
│   └── Assets.xcassets/            # App icons and assets
├── SafarAI Extension/              # Safari extension
│   ├── SafariWebExtensionHandler.swift  # Native message handler
│   ├── Info.plist                 # Extension configuration
│   └── Resources/                  # Web extension files
│       ├── manifest.json           # Extension manifest
│       ├── sidebar.html            # Sidebar UI
│       ├── sidebar.css             # Sidebar styling
│       ├── sidebar.js              # Sidebar logic
│       ├── content.js              # Content script
│       ├── background.js           # Background script
│       └── _locales/en/messages.json  # Localization
└── BUILD_INSTRUCTIONS.md          # This file
```

## Key Features Implemented

### 1. Sidebar Interface
- HTML/CSS/JavaScript based sidebar panel
- SwiftUI-like minimal design
- Responsive layout with proper spacing

### 2. Content Extraction
- Intelligent webpage content extraction
- Removes ads, navigation, and irrelevant content  
- Focuses on main article/content areas
- Handles various page layouts automatically

### 3. DeepSeek API Integration
- Secure API key storage in macOS Keychain
- Async HTTP requests to DeepSeek Chat API
- Error handling and retry logic
- Proper request/response formatting

### 4. Message Passing
- Background script manages page content caching
- Content scripts extract page data automatically
- Safari extension handler provides native integration
- Secure communication between components

### 5. Security Features
- API keys stored securely in Keychain
- Sandboxed execution environment
- HTTPS-only API communications
- Content script isolation

## Testing
1. Build and run the app
2. Enable the extension in Safari preferences
3. Visit any webpage
4. Click the SafarAI toolbar icon to open sidebar
5. Enter your DeepSeek API key when prompted
6. Start asking questions about the page content

## Troubleshooting

### Extension not appearing in Safari
- Check that both app and extension targets build successfully
- Verify bundle identifiers are unique and properly formatted
- Ensure code signing is configured correctly
- Check Safari > Preferences > Extensions

### API calls failing
- Verify DeepSeek API key is valid
- Check network connectivity
- Review console logs for detailed error messages
- Ensure app has outgoing network permissions

### Content extraction issues
- Check browser console for JavaScript errors
- Verify content script is loading properly
- Test on different types of websites
- Review background script logs

## Distribution
For Mac App Store or direct distribution, ensure:
- Proper code signing certificates
- App sandboxing enabled
- Required capabilities declared
- Privacy policy and app description prepared