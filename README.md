## Running Android Code
1. Set ANDROID_PATH environment variable
    * If necessary, source ~/.bashrc (eg, /Users/$USER/Library/Android/sdk)
2. Run `react-native run-android`

## Running iOS Code
1. Open XCode, and build (you can determine whether to build production or development version)

## Troubleshooting
1. `adb reverse tcp:8081 tcp:8081`
2. `react-native start reset-cache`
3. Try to access the dev server with browser
4. DISABLE THE FIREWALL ON YOUR LOCAL MACHINE!!!!!!!!!!!

if error " ERROR  Error watching file for changes: EMFILE" and on mac,
consider installing watchman: `brew install --HEAD watchman`

https://github.com/facebook/react-native/issues/910

http://localhost:8081/index.android.bundle?platform=android&dev=true&hot=false&minify=false

Algernon, React Native is having trouble connecting.

It seems the IP:PORT, derived from running `ifconfig` is not working.

I implemented port forwarding (with chrome://inspect/devices). Port 8081 is forwarded to localhost:8081, and I set the React Native application to look for localhost:8081.

---

NOTE: for the Android/IOS build process you might need to link new modules (especially "assets" like images, etc) via `react-native link`

---

## Building ANDROID
https://facebook.github.io/react-native/docs/signed-apk-android.html

replace values with your own naming

1. `keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000`

2. move my-release-key.keystore to android/app

3.     Edit the file ~/.gradle/gradle.properties and add the following (replace ***** with the correct keystore password, alias and key password),

MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=123456
MYAPP_RELEASE_KEY_PASSWORD=123456

4. (ensure build.grade correctly uses the above global constants)

5. run `cd android && ./gradlew assembleRelease` which will output the APK

6. `react-native run-android --variant=release`

---

## Building iOS

TODO...


## Production logging

* Android: `adb logcat | grep ReactNativeJS`
