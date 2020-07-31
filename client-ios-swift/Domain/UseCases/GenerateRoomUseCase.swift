/*
*  Copyright (c) 2011-2020, Zingaya, Inc. All rights reserved.
*/

final class GenerateRoomUseCase: GenerateRoom {
    func callAsFunction() -> RoomID {
        Int.random(in: 00000001...99999999)
    }
}
