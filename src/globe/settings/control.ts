import type { GlobeInstance } from "globe.gl";

export const applyControls = (globe: GlobeInstance) => {
    const controls = globe.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.1;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
}