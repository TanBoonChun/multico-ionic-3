# OneSignal Notification Service Extension (iOS)

`platforms/` is gitignored and is wiped by `cordova platform rm ios && cordova platform add ios`.
This folder is the tracked copy of the NSE, plus the manual Xcode/Podfile steps needed to
recreate it. Everything here targets **OneSignal iOS SDK 2.16.1**, which is what
`onesignal-cordova-plugin@2.11.2` installs.

## Why the extension exists

Enables notification images/attachments, action buttons, confirmed deliveries, and badge
count sharing with the app (via the App Group `group.com.softoya.multico.onesignal`, which
`src/app/app.component.ts` writes `ManualBadgeCount` into).

Basic push works without it — it is purely an enhancement.

## Do NOT follow OneSignal's current iOS SDK Setup docs verbatim

Those pages document **SDK 5.x**, which uses `import OneSignalExtension` and passes a
completion handler. Neither exists in 2.16.1. In 2.16.1 the module is `OneSignal` and the
two extension helpers return the content, so the extension calls `contentHandler` itself.
See `NotificationService.swift`.

## Steps to recreate after regenerating platforms/ios

1. In Xcode: File > New > Target > Notification Service Extension.
   - Product Name: `OneSignalNotificationServiceExtension`
   - Language: Swift
   - Bundle id MUST be `com.softoya.multico.OneSignalNotificationServiceExtension`
     (SDK 2.x derives the App Group name from the parent bundle id).
   - Deployment target: match the app (15.6). Do NOT activate its scheme.
2. Copy `NotificationService.swift`, `Info.plist`, and
   `OneSignalNotificationServiceExtension.entitlements` from this folder over the
   generated ones in `platforms/ios/OneSignalNotificationServiceExtension/`.
3. Set `CODE_SIGN_ENTITLEMENTS` on the extension target (Debug + Release) to
   `OneSignalNotificationServiceExtension/OneSignalNotificationServiceExtension.entitlements`.
   (Equivalent to adding the App Groups capability in Signing & Capabilities and ticking
   `group.com.softoya.multico.onesignal`.)
4. Append this to `platforms/ios/Podfile` — Cordova regenerates that file, so it has to be
   re-added every time:

   ```ruby
   target 'OneSignalNotificationServiceExtension' do
   	project 'Multico TOTG.xcodeproj'
   	pod 'OneSignal', '2.16.1'
   end
   ```

   The version MUST match the app target's pod. Mixing SDK 2.x in the app with
   `OneSignalXCFramework` 5.x in the extension is not supported by OneSignal.
5. `cd platforms/ios && LANG=en_US.UTF-8 pod install`
   (CocoaPods on the system Ruby 2.6 aborts without a UTF-8 locale.)

## Known gotcha: CocoaPods vs. Xcode's project format

Adding a target through the Xcode 26 UI rewrites `project.pbxproj` with
`objectVersion = 70`, which xcodeproj 1.27.0 (CocoaPods 1.16.2) cannot read:

    [Xcodeproj] Unable to find compatibility version string for object version `70`.

Fix: set `objectVersion = 77;` at the top of
`platforms/ios/Multico TOTG.xcodeproj/project.pbxproj`. 77 is the Xcode 16 format,
which both Xcode 26 and this CocoaPods understand. Re-apply if Xcode bumps it back.

## Known gotcha: no arm64 simulator slice

OneSignal 2.16.1 ships a pre-XCFramework fat binary with device arm64 and simulator
x86_64/i386 only — no arm64 simulator slice. On Apple Silicon the extension links only for
a real device (or a Rosetta simulator). `ld: building for 'iOS-simulator', but linking in
object file ... built for 'iOS'` means you targeted an arm64 simulator.
