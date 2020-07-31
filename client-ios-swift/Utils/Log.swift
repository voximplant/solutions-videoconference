/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

var loggingEnabled: Bool = true
fileprivate let prefix = "[Conference Demo]"

func log(_ message: String) {
    if loggingEnabled {
        print("\(prefix) - \(message)")
    }
}
