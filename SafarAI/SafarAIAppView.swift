//
//  SafarAIAppView.swift
//  SafarAI
//
//  Created by Andrea Piani on 30/07/25.
//

import SwiftUI
import SafariServices

struct SafarAIAppView: View {
    @State private var extensionEnabled = false
    @State private var canPromptForPermission = false
    @State private var isLoading = true
    
    var body: some View {
        VStack(spacing: 30) {
            // Header
            VStack(spacing: 10) {
                Image(systemName: "brain.head.profile")
                    .font(.system(size: 80))
                    .foregroundColor(.blue)
                
                Text("SafarAI")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                Text("AI-Powered Web Assistant for Safari")
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
            .padding(.top, 40)
            
            Spacer()
            
            // Extension Status
            VStack(spacing: 15) {
                HStack {
                    Image(systemName: extensionEnabled ? "checkmark.circle.fill" : "xmark.circle.fill")
                        .foregroundColor(extensionEnabled ? .green : .red)
                        .font(.title2)
                    
                    Text(extensionEnabled ? "Extension Enabled" : "Extension Disabled")
                        .font(.headline)
                        .foregroundColor(extensionEnabled ? .green : .red)
                }
                
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle())
                } else if !extensionEnabled {
                    VStack(spacing: 10) {
                        Text("To use SafarAI, please enable the extension in Safari preferences.")
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                        
                        if canPromptForPermission {
                            Button("Open Safari Preferences") {
                                openSafariPreferences()
                            }
                            .buttonStyle(.borderedProminent)
                        } else {
                            Text("Please manually enable the extension in Safari > Preferences > Extensions")
                                .font(.caption)
                                .foregroundColor(.secondary)
                                .multilineTextAlignment(.center)
                        }
                    }
                } else {
                    VStack(spacing: 10) {
                        Text("✅ SafarAI is ready to use!")
                            .font(.headline)
                            .foregroundColor(.green)
                        
                        Text("Click the SafarAI icon in Safari's toolbar to start chatting with AI about any webpage.")
                            .multilineTextAlignment(.center)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .padding()
            .background(Color(NSColor.controlBackgroundColor))
            .cornerRadius(12)
            
            Spacer()
            
            // Features
            VStack(alignment: .leading, spacing: 15) {
                Text("Features")
                    .font(.headline)
                
                FeatureRow(icon: "message.fill", title: "Smart Conversations", description: "Ask questions about any webpage content")
                FeatureRow(icon: "doc.text.fill", title: "Content Analysis", description: "Automatically extracts and understands page content")
                FeatureRow(icon: "lock.fill", title: "Secure API Storage", description: "Your API keys are securely stored in Keychain")
                FeatureRow(icon: "brain.fill", title: "DeepSeek Integration", description: "Powered by advanced AI technology")
            }
            .padding()
            .background(Color(NSColor.controlBackgroundColor))
            .cornerRadius(12)
            
            Spacer()
            
            // Footer
            Text("Made with ❤️ by Avo Agency")
                .font(.caption)
                .foregroundColor(.secondary)
                .padding(.bottom, 20)
        }
        .padding(40)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(NSColor.windowBackgroundColor))
        .onAppear {
            checkExtensionState()
        }
    }
    
    private func checkExtensionState() {
        isLoading = true
        
        SFSafariExtensionManager.getStateOfSafariExtension(withIdentifier: SafarAIConstants.extensionBundleIdentifier) { (state, error) in
            DispatchQueue.main.async {
                self.isLoading = false
                
                guard let state = state, error == nil else {
                    print("Error getting extension state: \(error?.localizedDescription ?? "Unknown error")")
                    return
                }
                
                self.extensionEnabled = state.isEnabled
                
                if #available(macOS 13, *) {
                    self.canPromptForPermission = true
                } else {
                    self.canPromptForPermission = false
                }
            }
        }
    }
    
    private func openSafariPreferences() {
        SFSafariApplication.showPreferencesForExtension(withIdentifier: SafarAIConstants.extensionBundleIdentifier) { error in
            if let error = error {
                print("Error opening Safari preferences: \(error.localizedDescription)")
            }
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundColor(.blue)
                .frame(width: 24)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline)
                    .fontWeight(.medium)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

#Preview {
    SafarAIAppView()
        .frame(width: 800, height: 600)
}