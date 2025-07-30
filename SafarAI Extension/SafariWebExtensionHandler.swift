//
//  SafariWebExtensionHandler.swift
//  SafarAI Extension
//
//  Created by Andrea Piani on 30/07/25.
//

import SafariServices
import os.log
import Foundation
import Security

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {
    
    private let logger = OSLog(subsystem: "com.avo.SafarAI.extension", category: "SafariWebExtensionHandler")
    
    func beginRequest(with context: NSExtensionContext) {
        let request = context.inputItems.first as? NSExtensionItem

        let profile: UUID?
        if #available(iOS 17.0, macOS 14.0, *) {
            profile = request?.userInfo?[SFExtensionProfileKey] as? UUID
        } else {
            profile = request?.userInfo?["profile"] as? UUID
        }

        let message: Any?
        if #available(iOS 15.0, macOS 11.0, *) {
            message = request?.userInfo?[SFExtensionMessageKey]
        } else {
            message = request?.userInfo?["message"]
        }

        os_log("Received message from extension: %@", log: logger, type: .info, String(describing: message))
        
        // Handle different message types
        if let messageDict = message as? [String: Any],
           let action = messageDict["action"] as? String {
            
            switch action {
            case "storeApiKey":
                handleStoreApiKey(messageDict, context: context)
                return
                
            case "getApiKey":
                handleGetApiKey(context: context)
                return
                
            case "extractPageContent":
                handleExtractPageContent(messageDict, context: context)
                return
                
            default:
                break
            }
        }

        // Default echo response
        let response = NSExtensionItem()
        if #available(iOS 15.0, macOS 11.0, *) {
            response.userInfo = [ SFExtensionMessageKey: [ "echo": message ] ]
        } else {
            response.userInfo = [ "message": [ "echo": message ] ]
        }

        context.completeRequest(returningItems: [ response ], completionHandler: nil)
    }
    
    private func handleStoreApiKey(_ messageDict: [String: Any], context: NSExtensionContext) {
        guard let apiKey = messageDict["apiKey"] as? String else {
            sendErrorResponse("Missing API key", context: context)
            return
        }
        
        let success = KeychainManager.shared.storeApiKey(apiKey)
        let response = NSExtensionItem()
        
        if #available(iOS 15.0, macOS 11.0, *) {
            response.userInfo = [
                SFExtensionMessageKey: [
                    "success": success,
                    "action": "storeApiKey"
                ]
            ]
        } else {
            response.userInfo = [
                "message": [
                    "success": success,
                    "action": "storeApiKey"
                ]
            ]
        }
        
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
    
    private func handleGetApiKey(context: NSExtensionContext) {
        let apiKey = KeychainManager.shared.getApiKey()
        let response = NSExtensionItem()
        
        if #available(iOS 15.0, macOS 11.0, *) {
            response.userInfo = [
                SFExtensionMessageKey: [
                    "success": apiKey != nil,
                    "action": "getApiKey",
                    "hasApiKey": apiKey != nil
                ]
            ]
        } else {
            response.userInfo = [
                "message": [
                    "success": apiKey != nil,
                    "action": "getApiKey",
                    "hasApiKey": apiKey != nil
                ]
            ]
        }
        
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
    
    private func handleExtractPageContent(_ messageDict: [String: Any], context: NSExtensionContext) {
        // This would typically involve communicating with the active tab
        // For now, we'll return a success response
        let response = NSExtensionItem()
        
        if #available(iOS 15.0, macOS 11.0, *) {
            response.userInfo = [
                SFExtensionMessageKey: [
                    "success": true,
                    "action": "extractPageContent",
                    "message": "Content extraction initiated"
                ]
            ]
        } else {
            response.userInfo = [
                "message": [
                    "success": true,
                    "action": "extractPageContent",
                    "message": "Content extraction initiated"
                ]
            ]
        }
        
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
    
    private func sendErrorResponse(_ error: String, context: NSExtensionContext) {
        let response = NSExtensionItem()
        
        if #available(iOS 15.0, macOS 11.0, *) {
            response.userInfo = [
                SFExtensionMessageKey: [
                    "success": false,
                    "error": error
                ]
            ]
        } else {
            response.userInfo = [
                "message": [
                    "success": false,
                    "error": error
                ]
            ]
        }
        
        context.completeRequest(returningItems: [response], completionHandler: nil)
    }
}

// MARK: - Keychain Manager
class KeychainManager {
    static let shared = KeychainManager()
    private let service = "com.avo.SafarAI"
    private let apiKeyAccount = "deepseek-api-key"
    
    private init() {}
    
    func storeApiKey(_ apiKey: String) -> Bool {
        let data = apiKey.data(using: .utf8)!
        
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: apiKeyAccount,
            kSecValueData as String: data
        ]
        
        // Delete existing item first
        SecItemDelete(query as CFDictionary)
        
        // Add new item
        let status = SecItemAdd(query as CFDictionary, nil)
        return status == errSecSuccess
    }
    
    func getApiKey() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: apiKeyAccount,
            kSecMatchLimit as String: kSecMatchLimitOne,
            kSecReturnData as String: true
        ]
        
        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        
        guard status == errSecSuccess,
              let data = result as? Data,
              let apiKey = String(data: data, encoding: .utf8) else {
            return nil
        }
        
        return apiKey
    }
    
    func deleteApiKey() -> Bool {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: apiKeyAccount
        ]
        
        let status = SecItemDelete(query as CFDictionary)
        return status == errSecSuccess
    }
}
