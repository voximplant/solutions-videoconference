/*
 *  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
 */

import AVFoundation

final class PermissionsHelper {
    static func requestRecordPermissions(
        includingVideo video: Bool,
        completion: @escaping (Error?) -> Void
    ) {
        requestPermissions(for: .audio) { granted in
            if granted {
                if video {
                    requestPermissions(for: .video) { granted in
                        completion(granted ? nil : PermissionError.videoPermissionDenied)
                    }
                    return
                }
                completion(nil)
            } else {
                completion(PermissionError.audioPermissionDenied)
            }
        }
    }
    
    static func requestPermissions(for mediaType: AVMediaType, completion: @escaping (Bool) -> Void) {
        switch AVCaptureDevice.authorizationStatus(for: mediaType) {
        case .authorized: completion(true)
        case .notDetermined: AVCaptureDevice.requestAccess(for: mediaType, completionHandler: completion)
        case .denied: completion(false)
        case .restricted: completion(false)
        @unknown default: completion(false)
        }
    }
}

