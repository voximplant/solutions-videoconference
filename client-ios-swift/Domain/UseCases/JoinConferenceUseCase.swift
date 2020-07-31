/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

final class JoinConferenceUseCase: JoinConference {
    private let authService: AuthService
    private let conferenceService: ConferenceService
    
    init(_ authService: AuthService, _ conferenceService: ConferenceService) {
        self.authService = authService
        self.conferenceService = conferenceService
    }
    
    func callAsFunction(
        withId id: String,
        andName name: String,
        sendVideo video: Bool,
        completion: @escaping (Error?) -> Void
    ) {
        PermissionsHelper.requestRecordPermissions(includingVideo: video) { error in
            if let error = error {
                completion(error)
            } else {
                self.login(with: id, name: name, video: video, completion: completion)
            }
        }
    }
    
    private func login(with id: String, name: String, video: Bool, completion: @escaping (Error?) -> Void) {
        authService.login { [weak self] error in
            if let error = error {
                completion(error)
                return
            }
            do {
                try self?.conferenceService.joinConference(withID: id, name: name, sendVideo: video)
                completion(nil)
            } catch (let error) {
                completion(error)
            }
        }
    }
}
