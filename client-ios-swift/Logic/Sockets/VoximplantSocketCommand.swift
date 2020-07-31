/*
 *  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
 */

enum VoximplantSocketCommand: Codable {
    case hello (content: HelloContent)
    case isMuted (muted: Bool, endpointId: String? = nil)
    case isSharingScreen (sharing: Bool, endpointId: String? = nil)
    case isSendingVideo (sending: Bool, endpointId: String? = nil)
    case changeVideo (allowed: Bool)
    case changeAudio (allowed: Bool)
    case changeSharing (allowed: Bool)
    case changeLevel (level: Double)
    case owner (id: String)
    
    enum CodingError: Error {
        case unknownCommand (String)
        case commandNotSupported (VoximplantSocketCommand)
        
        var localizedDescription: String {
            switch self {
            case .unknownCommand(let command):
                return "Coding error: unknown command \(command)"
            case .commandNotSupported(let command):
                return "Coding error: The command \(command) is not supported for encoding"
            }
        }
    }
    
    struct HelloContent: Codable {
        let conference: String
        let sessionID: String
        let deviceUUID: String
        let isMuted: Bool
        let isSharingScreen: Bool
        let isSendingVideo: Bool
        
        private enum CodingKeys: String, CodingKey {
            case conference = "userId"
            case sessionID = "sessionId"
            case deviceUUID = "uuid"
            case isMuted = "mute"
            case isSharingScreen = "sharing"
            case isSendingVideo = "video"
        }
    }
    
    // MARK: - Codable -
    private enum CodingKeys: String, CodingKey {
        case cmd
        case content
        case from
    }
    
    init(from decoder: Decoder) throws {
        let values = try decoder.container(keyedBy: CodingKeys.self)
        let command = try values.decode(String.self, forKey: .cmd)
        switch command {
        case SocketContentKey.mute:
            self = .isMuted(
                muted: try values.decode(Bool.self, forKey: .content),
                endpointId: try? values.decode(String.self, forKey: .from)
            )
        case SocketContentKey.sharing:
            self = .isSharingScreen(
                sharing: try values.decode(Bool.self, forKey: .content),
                endpointId: try? values.decode(String.self, forKey: .from)
            )
        case SocketContentKey.video:
            self = .isSendingVideo(
                sending: try values.decode(Bool.self, forKey: .content),
                endpointId: try? values.decode(String.self, forKey: .from)
            )
        case SocketContentKey.changeVideo:
            self = .changeVideo(allowed: try values.decode(Bool.self, forKey: .content))
        case SocketContentKey.changeAudio:
            self = .changeAudio(allowed: try values.decode(Bool.self, forKey: .content))
        case SocketContentKey.changeSharing:
            self = .changeSharing(allowed: try values.decode(Bool.self, forKey: .content))
        case SocketContentKey.changeLevel:
            self = .changeLevel(level: try values.decode(Double.self, forKey: .content))
        case SocketContentKey.owner:
            self = .owner(id: try values.decode(String.self, forKey: .content))
        default:
            throw CodingError.unknownCommand(command)
        }
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case .hello(let content):
            try container.encode(SocketContentKey.hello, forKey: .cmd)
            try container.encode(content, forKey: .content)
        case .isMuted(let muted, _):
            try container.encode(SocketContentKey.mute, forKey: .cmd)
            try container.encode(muted, forKey: .content)
        case .isSharingScreen(let sharing, _):
            try container.encode(SocketContentKey.sharing, forKey: .cmd)
            try container.encode(sharing, forKey: .content)
        case .isSendingVideo(let sending, _):
            try container.encode(SocketContentKey.video, forKey: .cmd)
            try container.encode(sending, forKey: .content)
        default:
            throw CodingError.commandNotSupported(self)
        }
    }
}
