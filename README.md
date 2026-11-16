# TOQO Battle Royale — Starter Project

## Included
- Three.js 3D training island and third-person player camera.
- Touch joystick, keyboard movement, jump and fire button.
- WebSocket multiplayer position synchronization for players on the same reachable server.
- Vite web app and PWA manifest starter.

## Run locally
1. Install Node.js 20 or newer.
2. In this folder run: `npm install`
3. Terminal 1: `npm run server`
4. Terminal 2: `npm run dev`
5. Open the Vite URL shown in the terminal.

To test multiplayer locally, open the same Vite URL in two browser tabs. For remote players, deploy the web app and WebSocket server to internet-accessible hosting, configure `wsUrl` in `src/main.js` to your secure `wss://` server, and use HTTPS.

## Build web version
`npm run build`

## Important status
This is a development starter, not a finished commercial battle-royale game. It does not yet include authoritative combat, matchmaking, accounts, inventory, anti-cheat, voice chat, persistence, production hosting, or an Android APK. The included multiplayer server synchronizes player positions only. Build and test those systems before public release.


## Android APK build (Capacitor)
This project now includes a Capacitor Android wrapper configuration and a GitHub Actions workflow.
- Push the project to a GitHub repository.
- Open Actions and run **Build TOQO Android APK** (or push to `main`).
- Download the `TOQO-debug-apk` artifact from the completed workflow.
- Install `app-debug.apk` on an Android device (allow installation from that source).

This workflow creates a debug APK for testing, not a signed Play Store release.
The online server must be deployed publicly and the client WebSocket URL in `src/main.js`
must be changed to your secure `wss://` endpoint before remote multiplayer will work.
