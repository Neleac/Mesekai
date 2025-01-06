<h1 align='center'> Mesekai - Webcam Motion Tracking Avatar </h1>
<p align='center'>
    <img width='50%' alt='demo' src="./mesekai.gif" />
</p>

[Mesekai](https://mesekai.vercel.app/) is a real-time, full-body, webcam motion tracking avatar web application. Use your body gestures and facial expressions to animate a virtual persona. Personalize your experience through the built-in avatar creator.

## Tech Stack
- [Ready Player Me](https://readyplayer.me/) - avatar and avatar creator
- [MediaPipe](https://ai.google.dev/edge/mediapipe/) - face, hands, and body pose estimation
- [Three.js](https://threejs.org/) - computations and 3D graphics rendering
- [React](https://react.dev/) - user interface
- [Next.js](https://nextjs.org/) - project framework

## Running Locally
1. Install dependencies
```
npm install
```
2. Run the development server
```
npm run dev
```
3. Navigate to [http://localhost:3000](http://localhost:3000) to see the result

## Roadmap
Mesekai is an evolving project. If you would like to contribute, please create Issues, Pull Requests, or [reach out to me](https://discordapp.com/users/297770280863137802) directly.
- [ ] improve forearm rotation
- [ ] add root bone translation
- [ ] handle extra shoulder bone
- [ ] implement loading UI
- [ ] expose smoothing weight to user
- [ ] allow pose estimation model selection

## Other Versions
- Legacy version: [website](https://mesekai-ygdz-git-legacy-neleacs-projects.vercel.app/), [code](https://github.com/Neleac/Mesekai/tree/legacy)
- Unity version: [itch.io](https://neleac.itch.io/mesekai), [code](https://github.com/Neleac/MesekaiUnity)
