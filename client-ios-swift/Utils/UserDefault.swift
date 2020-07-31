/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import Foundation

@propertyWrapper
struct UserDefault<T> {
    let key: String
    
    init(_ key: String) {
        self.key = key.appendingAppDomain
    }
    
    var wrappedValue: T? {
        get { userDefaults.object(forKey: key) as? T }
        set { userDefaults.set(newValue, forKey: key) }
    }
}

fileprivate let userDefaults = UserDefaults.standard
fileprivate let userDefaultsDomain = Bundle.main.bundleIdentifier ?? ""
fileprivate extension String {
    var appendingAppDomain: String {
        "\(userDefaultsDomain).\(self)"
    }
}
