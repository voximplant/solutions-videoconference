/*
 *  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
 */

import UIKit
import VoxImplantSDK

fileprivate let client = VIClient(delegateQueue: DispatchQueue.main)
fileprivate let voximplantService = VoximplantService(client: client)
fileprivate let storyAssembler = StoryAssembler(
    voximplantService,
    voximplantService,
    voximplantService
)

@UIApplicationMain
final class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    
    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        UIApplication.shared.isIdleTimerDisabled = true
        
        window = UIWindow(frame: UIScreen.main.bounds)
        window?.rootViewController = storyAssembler.login
        window?.makeKeyAndVisible()
        
        return true
    }
}
