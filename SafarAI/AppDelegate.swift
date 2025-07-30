//
//  AppDelegate.swift
//  SafarAI
//
//  Created by Andrea Piani on 30/07/25.
//

import Cocoa
import SwiftUI

@main
class AppDelegate: NSObject, NSApplicationDelegate {

    var window: NSWindow!

    func applicationDidFinishLaunching(_ notification: Notification) {
        // Create the SwiftUI view that provides the window contents.
        let contentView = SafarAIAppView()

        // Create the window and set the content view.
        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 800, height: 600),
            styleMask: [.titled, .closable, .miniaturizable, .resizable, .fullSizeContentView],
            backing: .buffered, defer: false)
        window.center()
        window.setFrameAutosaveName("Main Window")
        window.contentView = NSHostingView(rootView: contentView)
        window.makeKeyAndOrderFront(nil)
        window.title = "SafarAI Extension Manager"
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
        return true
    }

}
