# Voximplant Conference Demo (iOS)
This demo demonstrates video conference functionality of the Voximplant iOS SDK.
The application supports video conferences between this iOS app and other apps that use any Voximplant SDK.

#### Features
This application is able to:
- log in to the Voximplant Cloud
- Join a conference with or without video
- Create a conference
- Change an audio device (speaker, receiver, wired headset, bluetooth headset) in a conference
- Mute audio in a conference
- Switch camera (back/front) in a conference
- Render up to 25 video streams in a conference
- Turn on/off sending video in a conference

## Installing
1. Clone this repo
2. Run `$ pod install` in the repo folder
3. Open the `Swift.xcworkspace` workspace
4. Target Conference and build the project using Xcode

## Usage
### Join an existing conference (or create one if no conference with the given ID exists)
1. Enter conference ID
2. Enter name (will be showed to other conference members)
3. Press ‘Join With Video’/ 'Join Without Video'

## Useful links
1. [Quickstart](https://voximplant.com/docs/references/articles/quickstart)
2. [Voximplant iOS SDK reference](https://voximplant.com/docs/references/iossdk)
3. [Using Voximplant iOS SDK](https://voximplant.com/docs/references/iossdk/using-ios-sdk)
4. [HowTo’s](https://voximplant.com/blog/howto)
