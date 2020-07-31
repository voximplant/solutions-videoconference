/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import UIKit

final class Device {
    @UserDefault<String>("deviceUUID")
    private static var storedUUIDString: String?
    
    static var uuid: UUID {
        if let storedUUID = storedUUIDString, let uuid = UUID(uuidString: storedUUID) {
            return uuid
        } else {
            return makeAndStore()
        }
    }
    
    static var type: DeviceType {
        UIDevice.current.userInterfaceIdiom == .pad ? .iPad : .iPhone
    }
    
    private static func makeAndStore() -> UUID {
        let uuid = UUID()
        storedUUIDString = uuid.uuidString
        return uuid
    }
    
    enum DeviceType {
        case iPhone
        case iPad
    }
}
