## Running Code
1. Set ANDROID_PATH environment variable
    * If necessary, source ~/.bashrc
2. Run `react-native run-android`

## Troubleshooting
1. `adb reverse tcp:8081 tcp:8081`
2. `react-native start reset-cache`
3. Try to access the dev server with browser
4. DISABLE THE FIREWALL ON YOUR LOCAL MACHINE!!!!!!!!!!!

Algernon, React Native is having trouble connecting.

It seems the IP:PORT, derived from running `ifconfig` is not working.

I implemented port forwarding (with chrome://inspect/devices). Port 8081 is forwarded to localhost:8081, and I set the React Native application to look for localhost:8081.
