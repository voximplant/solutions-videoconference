/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

import Foundation

typealias JSON = String
extension JSON {
    init?(with data: Data) {
        self.init(data: data, encoding: .utf8)
    }
    
    var data: Data {
        Data(self.utf8)
    }
}
