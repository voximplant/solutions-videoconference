/*
 *  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
 */

import Foundation

enum PermissionError: Error {
    case audioPermissionDenied
    case videoPermissionDenied
    
    var localizedDescription: String {
        switch self {
        case .audioPermissionDenied:
           return "Record audio permission needed for call to work"
        case .videoPermissionDenied:
           return "Record video permission needed for video call to work"
        }
    }
}
