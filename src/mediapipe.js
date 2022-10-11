import { Camera } from "@mediapipe/camera_utils";
import { Holistic } from "@mediapipe/holistic";

import { setPose, setFingers, setMorphs } from "./avatar";

// device constants
const WIDTH = 1920;
const HEIGHT = 1080;

export function PoseDetector(preload, videoInput) {
    const holistic = new Holistic({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
    }});

    holistic.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    holistic.onResults((results) => {
        preload.hidden = true;

        let poseLandmarks = results.poseLandmarks;
        let poseWorldLandmarks = results.ea;
        if (poseWorldLandmarks) {
            setPose(poseLandmarks, poseWorldLandmarks);
        }
    
        let leftHandLandmarks = results.leftHandLandmarks;
        if (leftHandLandmarks) {
            setFingers(leftHandLandmarks, false);
        }
    
        let rightHandLandmarks = results.rightHandLandmarks;
        if (rightHandLandmarks) {
            setFingers(rightHandLandmarks, true);
        }
    
        let faceLandmarks = results.faceLandmarks;
        if (faceLandmarks) {
            setMorphs(faceLandmarks);
        }
    });

    const camera = new Camera(videoInput, {
        onFrame: async () => {
            await holistic.send({image: videoInput});
        },
        width: WIDTH,
        height: HEIGHT
    });

    return [holistic, camera];
}