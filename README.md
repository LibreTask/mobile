# LibreTask Mobile

This is the code that powers the LibreTask mobile app. The app is largely considered code-complete. Future improvements will be in the form of documentation and refining existing features.

#### Running android locally

1. Set ANDROID_PATH environment variable
    - If necessary, source ~/.bashrc (eg, /Users/$USER/Library/Android/sdk)
2. Install all packages: `npm install`
3. Run `react-native run-android`


#### Android Troubleshooting
1. `adb reverse tcp:8081 tcp:8081`
2. `react-native start reset-cache`
3. Try to access the dev server with browser
4. Disable the firewall on your local machine

Note, if error " ERROR  Error watching file for changes: EMFILE" and on mac,
consider installing watchman: `brew install --HEAD watchman`

See https://github.com/facebook/react-native/issues/910

#### Running iOS Code
1. Open XCode, and build (you can determine whether to build production or development version)

react-native bundle --platform android --dev false --entry-file index.android.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res

#### Misc

NOTE: for the Android/IOS build process you might need to link new modules (especially "assets" like images, etc) via `react-native link`


#### Building production android app

See docs https://facebook.github.io/react-native/docs/signed-apk-android.html

1. Replace values with your own naming `keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000`
2. Move my-release-key.keystore to android/app directory
3. Edit the file ~/.gradle/gradle.properties and add the following (replace ***** with the correct keystore password, alias and key password),
4. Ensure build.grade correctly uses the above global constants
5. Run `cd android && ./gradlew assembleRelease` which will output the APK
6. Finally, you can test production version with `react-native run-android --variant=release`
    - View production logs with `adb logcat`

#### Building production iOS app

TODO...
