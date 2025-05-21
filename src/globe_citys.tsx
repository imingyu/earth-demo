/* eslint-disable react-hooks/rules-of-hooks */
import Globe from 'globe.gl';
import places from './geo/ne_110m_populated_places_simple';
import { useEffect, useRef } from 'react';
import earth_day_4096 from './planets/earth_day_4096.jpg';
import earth_night_4096 from './planets/earth_night_4096.jpg';
import earth_bump_roughness_clouds_4096 from './planets/earth_bump_roughness_clouds_4096.jpg';
import night_sky from './planets/night-sky.png';
import * as THREE from 'three';
import * as THREEGpu from 'three/webgpu';
import { step, normalWorld, output, texture, vec3, vec4, normalize, positionWorld, bumpMap, cameraPosition, color, uniform, mix, uv, max } from 'three/tsl';

const getGlobeMaterial = () => {
    const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(4.5, 2, 3);

    // const scene = new THREE.Scene();

    // sun

    const sun = new THREE.DirectionalLight('#ffffff', 2);
    sun.position.set(0, 0, 3);
    // scene.add(sun);

    // uniforms

    const atmosphereDayColor = uniform(color('#4db2ff'));
    const atmosphereTwilightColor = uniform(color('#bc490b'));
    const roughnessLow = uniform(0.25);
    const roughnessHigh = uniform(0.35);

    // textures

    const textureLoader = new THREE.TextureLoader();

    const dayTexture = textureLoader.load(earth_day_4096);
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    dayTexture.anisotropy = 8;

    const nightTexture = textureLoader.load(earth_night_4096);
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.anisotropy = 8;

    const bumpRoughnessCloudsTexture = textureLoader.load(earth_bump_roughness_clouds_4096);
    bumpRoughnessCloudsTexture.anisotropy = 8;

    // const night_sky_texture = textureLoader.load(night_sky);
    // night_sky_texture.colorSpace = THREE.SRGBColorSpace;
    // scene.background = night_sky_texture;

    // fresnel

    const viewDirection = positionWorld.sub(cameraPosition).normalize();
    const fresnel = viewDirection.dot(normalWorld).abs().oneMinus().toVar();

    // sun orientation

    const sunOrientation = normalWorld.dot(normalize(sun.position)).toVar();

    // atmosphere color

    const atmosphereColor = mix(atmosphereTwilightColor, atmosphereDayColor, sunOrientation.smoothstep(- 0.25, 0.75));

    // globe

    const globeMaterial = new THREEGpu.MeshStandardNodeMaterial();

    const cloudsStrength = texture(bumpRoughnessCloudsTexture, uv()).b.smoothstep(0.2, 1);

    globeMaterial.colorNode = mix(texture(dayTexture), vec3(1), cloudsStrength.mul(2));

    const roughness = max(
        texture(bumpRoughnessCloudsTexture).g,
        step(0.01, cloudsStrength)
    );
    globeMaterial.roughnessNode = roughness.remap(0, 1, roughnessLow, roughnessHigh);

    const night = texture(nightTexture);
    const dayStrength = sunOrientation.smoothstep(- 0.25, 0.5);

    const atmosphereDayStrength = sunOrientation.smoothstep(- 0.5, 1);
    const atmosphereMix = atmosphereDayStrength.mul(fresnel.pow(2)).clamp(0, 1);

    let finalOutput = mix(night.rgb, output.rgb, dayStrength);
    finalOutput = mix(finalOutput, atmosphereColor, atmosphereMix);

    globeMaterial.outputNode = vec4(finalOutput, output.a);

    const bumpElevation = max(
        texture(bumpRoughnessCloudsTexture).r,
        cloudsStrength
    );
    globeMaterial.normalNode = bumpMap(bumpElevation);
    return globeMaterial;

    // const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    // const globe = new THREE.Mesh(sphereGeometry, globeMaterial);
    // scene.add(globe);

    // // atmosphere

    // const atmosphereMaterial = new THREE.MeshBasicNodeMaterial({ side: THREE.BackSide, transparent: true });
    // const alpha = fresnel.remap(0.73, 1, 1, 0).pow(3).mul(sunOrientation.smoothstep(- 0.5, 1));
    // atmosphereMaterial.outputNode = vec4(atmosphereColor, alpha);

    // const atmosphere = new THREE.Mesh(sphereGeometry, atmosphereMaterial);
    // atmosphere.scale.setScalar(1.04);
    // scene.add(atmosphere);
}

export const GlobeCitys = () => {
    const refDiv = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const globe = new Globe(refDiv.current!);
        globe.backgroundImageUrl(night_sky);
        
        // debugger;
        globe.globeMaterial(getGlobeMaterial());
        // globe.globeImageUrl(earth_day_4096).bumpImageUrl(earth_bump_roughness_clouds_4096)
        // const dayTexture = new TextureLoader().load(earth_day_4096);
        // const nightTexture = new TextureLoader().load(earth_night_4096);
        // const material = new ShaderMaterial({
        //     bumpMap: new TextureLoader().load(earth_bump_roughness_clouds_4096),
        //     uniforms: {
        //         dayTexture: { value: dayTexture },
        //         nightTexture: { value: nightTexture },
        //         // sunPosition: { value: new Vector2() },
        //         // globeRotation: { value: new Vector2() }
        //     },
        //     // vertexShader: dayNightShader.vertexShader,
        //     // fragmentShader: dayNightShader.fragmentShader
        // });

        globe.labelsData(places.features)
        .labelLat(d => d.properties.latitude)
        .labelLng(d => d.properties.longitude)
        .labelText(d => d.properties.name)
        .labelSize(d => Math.sqrt(d.properties.pop_max) * 4e-4)
        .labelDotRadius(d => Math.sqrt(d.properties.pop_max) * 4e-4)
        .labelColor(() => 'rgba(255, 165, 0, 0.75)')
        .labelResolution(2);

        // const globeMaterial = globe.globeMaterial();

        // globeMaterial.bumpScale = 10;

        // globe.bumpImageUrl(earth_bump_roughness_clouds_4096)

        // new Globe(refDiv.current!)
        //     .globeImageUrl(earth_day_4096)
        //     .bumpImageUrl(earth_bump_roughness_clouds_4096)
        //     .backgroundImageUrl(night_sky)


    }, []);
    return <div ref={refDiv}></div>
}