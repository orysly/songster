# Songster

Songster is a private, local, one-device party game for Spotify Premium hosts. A host connects Spotify, loads a playlist, and players take turns placing hidden mystery tracks into their own release-year timelines.

The app does not download, cache, modify, re-host, or expose Spotify audio. It uses Spotify playback control and keeps metadata hidden until each reveal.

## Requirements

- Node.js 20+
- Spotify Premium host account
- A Spotify Developer app
- Modern browser; iPhone Safari and installed iOS PWA mode are supported with Spotify/iOS tap-to-play limitations

## Spotify Developer Dashboard Setup

1. Open the Spotify Developer Dashboard.
2. Create an app.
3. Select Web Playback SDK / Web API use.
4. Add a local redirect URI, for example:
   `http://localhost:5173/`
5. Copy the app client ID.
6. Create `.env` from `.env.example` and set:
   `VITE_SPOTIFY_CLIENT_ID`
   `VITE_SPOTIFY_REDIRECT_URI`
7. For production, add the deployed URL as another redirect URI and update `VITE_SPOTIFY_REDIRECT_URI` for that deployment.

Required scopes:

- `streaming`
- `user-read-private`
- `user-read-email`
- `user-read-playback-state`
- `user-modify-playback-state`
- `playlist-read-private`
- `playlist-read-collaborative`

## Local Development

```bash
npm install
npm run dev
```

Open the printed local URL on the host device. For iPhone testing, the redirect URI in Spotify must exactly match the URL being used.

## Build and Test

```bash
npm run test
npm run build
```

## iOS PWA Notes

Open the app in Safari, then use Share → Add to Home Screen. iOS requires an explicit tap before Spotify audio can play, especially after playback transfer. If playback is blocked, tap Play again.

## Spotify Limitations

- Web Playback SDK requires Spotify Premium.
- Mobile browser playback depends on Spotify Connect, browser media support, and user interaction.
- Spotify-generated experiences such as Mixes, Radio, Blend, and some personalized links may open in Spotify but return 404 through the Web API. Use a regular public or private playlist from your library.
- In Spotify Development Mode, playlist item contents are only available for playlists the signed-in user owns or collaborates on. To use a playlist made by someone else, copy its songs into one of your own playlists first.
- Some tracks may be unavailable by market or account and are skipped during playlist import.
- The app shell can load offline, but gameplay requires internet and Spotify.

## Private Use

This project is intended for private personal use only. Do not commercialize it, and do not download, cache, modify, synchronize, broadcast, or re-host Spotify audio.
