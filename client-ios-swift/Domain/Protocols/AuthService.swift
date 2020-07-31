/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

typealias LoginHandler = (Error?) -> Void
typealias LogoutHandler = () -> Void

protocol AuthService {
    func login(completion: @escaping LoginHandler)
}
