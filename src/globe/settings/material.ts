import type { GlobeInstance } from "globe.gl";
import { ShaderMaterial, TextureLoader, Vector2 } from "three";
import earth_day from '../assets/2k_earth_day.jpg';
import earth_night from '../assets/2k_earth_night.jpg';
import Gaia_EDR3_darkened from '../assets/Gaia_EDR3_darkened.png';
import marble from '../assets/earth-blue-marble.jpg';
import * as solar from 'solar-calculator';


const VELOCITY = 1; // minutes per frame
// Custom shader:  Blends night and day images to simulate day/night cycle
const dayNightShader = {
    vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
    fragmentShader: `
        #define PI 3.141592653589793
        uniform sampler2D dayTexture;
        uniform sampler2D nightTexture;
        uniform vec2 sunPosition;
        uniform vec2 globeRotation;
        varying vec3 vNormal;
        varying vec2 vUv;

        float toRad(in float a) {
          return a * PI / 180.0;
        }

        vec3 Polar2Cartesian(in vec2 c) { // [lng, lat]
          float theta = toRad(90.0 - c.x);
          float phi = toRad(90.0 - c.y);
          return vec3( // x,y,z
            sin(phi) * cos(theta),
            cos(phi),
            sin(phi) * sin(theta)
          );
        }

        void main() {
          float invLon = toRad(globeRotation.x);
          float invLat = -toRad(globeRotation.y);
          mat3 rotX = mat3(
            1, 0, 0,
            0, cos(invLat), -sin(invLat),
            0, sin(invLat), cos(invLat)
          );
          mat3 rotY = mat3(
            cos(invLon), 0, sin(invLon),
            0, 1, 0,
            -sin(invLon), 0, cos(invLon)
          );
          vec3 rotatedSunDirection = rotX * rotY * Polar2Cartesian(sunPosition);
          float intensity = dot(normalize(vNormal), normalize(rotatedSunDirection));
          vec4 dayColor = texture2D(dayTexture, vUv);
          vec4 nightColor = texture2D(nightTexture, vUv);
          float blendFactor = smoothstep(-0.1, 0.1, intensity);
          gl_FragColor = mix(nightColor, dayColor, blendFactor);
        }
      `
};

const sunPosAt = (dt: number) => {
    const day = new Date(+dt).setUTCHours(0, 0, 0, 0);
    const t = solar.century(new Date(dt));
    const longitude = (day - (+dt)) / 864e5 * 360 - 180;
    return [longitude - solar.equationOfTime(t) / 4, solar.declination(t)];
};


export const setMaterial = (globe: GlobeInstance) => {
    const loader = new TextureLoader();
    globe.backgroundImageUrl(Gaia_EDR3_darkened);

    let dt = +new Date();
    const dayTexture = loader.load(marble);
    const nightTexture = loader.load(earth_night);
    const material = new ShaderMaterial({
        uniforms: {
            dayTexture: { value: dayTexture },
            nightTexture: { value: nightTexture },
            sunPosition: { value: new Vector2() },
            globeRotation: { value: new Vector2() }
        },
        vertexShader: dayNightShader.vertexShader,
        fragmentShader: dayNightShader.fragmentShader
    });

    globe.globeMaterial(material).onZoom(({ lng, lat }) => material.uniforms.globeRotation.value.set(lng, lat));

    requestAnimationFrame(() =>
        (function animate() {
            // animate time of day
            dt += VELOCITY * 60 * 1000;
            material.uniforms.sunPosition.value.set(...sunPosAt(dt));
            requestAnimationFrame(animate);
        })()
    );

    return globe;
}