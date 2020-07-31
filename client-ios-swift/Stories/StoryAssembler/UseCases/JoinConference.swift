/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

protocol JoinConference {
    func callAsFunction(withId id: String, andName name: String,
                        sendVideo video: Bool, completion: @escaping (Error?) -> Void)
}
