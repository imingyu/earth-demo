import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { useEffect, useRef } from 'react';
import earth_day_4096 from './planets/earth_day_4096.jpg';
import earth_night_4096 from './planets/earth_night_4096.jpg';
import earth_bump_roughness_clouds_4096 from './planets/earth_bump_roughness_clouds_4096.jpg';
import night_sky from './planets/night-sky.png';


function init() {
    let camera, scene, renderer, controls, globe, clock;
    clock = new THREE.Clock();

    camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(4.5, 2, 3);

    scene = new THREE.Scene();

    // sun
    const sun = new THREE.DirectionalLight('#ffffff', 2);
    sun.position.set(0, 0, 3);
    scene.add(sun);

    // 初始化统一变量
    const uniforms = {
        atmosphereDayColor: { value: new THREE.Color('#4db2ff') },
        atmosphereTwilightColor: { value: new THREE.Color('#bc490b') },
        roughnessLow: { value: 0.25 },
        roughnessHigh: { value: 0.35 },
        sunPosition: { value: sun.position },
        time: { value: 0 }
    };

    // 加载纹理
    const textureLoader = new THREE.TextureLoader();

    const dayTexture = textureLoader.load(earth_day_4096);
    dayTexture.colorSpace = THREE.SRGBColorSpace;
    dayTexture.anisotropy = 8;

    const nightTexture = textureLoader.load(earth_night_4096);
    nightTexture.colorSpace = THREE.SRGBColorSpace;
    nightTexture.anisotropy = 8;

    const bumpRoughnessCloudsTexture = textureLoader.load(earth_bump_roughness_clouds_4096);
    bumpRoughnessCloudsTexture.anisotropy = 8;

    // 地球材质
    const globeMaterial = new THREE.MeshStandardMaterial({
        map: dayTexture,
        roughnessMap: bumpRoughnessCloudsTexture,
        normalMap: bumpRoughnessCloudsTexture,
        metalness: 0.3,
        roughness: 0.35,
        normalScale: new THREE.Vector2(0.3, 0.3)
    });

    // 自定义着色器参数
    globeMaterial.onBeforeCompile = (shader) => {
        shader.uniforms = THREE.UniformsUtils.merge([
            shader.uniforms,
            {
                ...uniforms,
                nightTexture: { value: nightTexture },
                // 移除重复的roughnessMap声明
            }
        ]);
    
        // 顶点着色器修改
        shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            `
            varying vec3 vCustomNormal;
            varying vec3 vCustomViewDirection;
            varying vec2 vCustomUv;
            void main() {
                vCustomNormal = normalize(normalMatrix * normal);
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vCustomViewDirection = normalize(cameraPosition - worldPosition.xyz);
                vCustomUv = uv;
            `
        );
    
        // 片元着色器关键修复
        shader.fragmentShader = shader.fragmentShader
            .replace(
                'void main() {',
                `
                uniform vec3 atmosphereDayColor;
                uniform vec3 atmosphereTwilightColor;
                uniform float roughnessLow;
                uniform float roughnessHigh;
                uniform vec3 sunPosition;
                uniform sampler2D nightTexture;
                
                varying vec3 vCustomNormal;
                varying vec3 vCustomViewDirection;
                varying vec2 vCustomUv;
                
                void main() {
                    vec4 diffuseColor = vec4( diffuse, opacity );
                    
                    // 使用Three.js内置的roughnessMap
                    float cloudsStrength = smoothstep(0.2, 1.0, texture2D(roughnessMap, vCustomUv).b);
                    
                    // 日夜混合
                    vec3 nightColor = texture2D(nightTexture, vCustomUv).rgb;
                    vec3 sunDir = normalize(sunPosition);
                    float sunOrientation = dot(vCustomNormal, sunDir);
                    float dayStrength = smoothstep(-0.25, 0.5, sunOrientation);
                    vec3 finalColor = mix(nightColor, diffuseColor.rgb, dayStrength);
                    
                    // 大气效果
                    float fresnel = pow(1.0 - dot(vCustomNormal, vCustomViewDirection), 2.0);
                    vec3 atmosphereColor = mix(atmosphereTwilightColor, atmosphereDayColor, 
                        smoothstep(-0.25, 0.75, sunOrientation));
                    float atmosphereMix = smoothstep(-0.5, 1.0, sunOrientation) * fresnel;
                    finalColor = mix(finalColor, atmosphereColor, clamp(atmosphereMix, 0.0, 1.0));
                    
                    // 粗糙度处理
                    float baseRoughness = texture2D(roughnessMap, vCustomUv).g;
                    float adjustedRoughness = mix(roughnessLow, roughnessHigh, 
                        max(baseRoughness, step(0.01, cloudsStrength)));
                    
                    // 最终输出
                    diffuseColor.rgb = finalColor;
                    gl_FragColor = diffuseColor;
                    
                    // 通过内置变量传递粗糙度
                    roughnessFactor = adjustedRoughness;
                `
            )
            // 移除原有声明
            .replace(/vec4 diffuseColor = vec4\( diffuse, opacity \);/g, '')
            // 修复内置变量赋值
            .replace('roughnessFactor = roughness;', '');
    };

    // 地球网格
    const sphereGeometry = new THREE.SphereGeometry(1, 64, 64);
    globe = new THREE.Mesh(sphereGeometry, globeMaterial);
    scene.add(globe);

    // 大气层材质
    const atmosphereMaterial = new THREE.MeshPhongMaterial({
        transparent: true,
        side: THREE.BackSide,
        specular: 0x000000
    });

    atmosphereMaterial.onBeforeCompile = (shader) => {
        shader.uniforms = THREE.UniformsUtils.merge([
            shader.uniforms,
            {
                ...uniforms,
                sunPosition: { value: sun.position }
            }
        ]);
    
        shader.fragmentShader = shader.fragmentShader
            .replace(
                'void main() {',
                `
                uniform vec3 atmosphereDayColor;
                uniform vec3 atmosphereTwilightColor;
                uniform vec3 sunPosition;
                
                varying vec3 vCustomNormal;
                varying vec3 vCustomViewDirection;
                
                void main() {
                `
            )
            .replace(
                'vec4 diffuseColor = vec4( diffuse, opacity );',
                `
                    float fresnel = pow(1.0 - dot(vCustomNormal, vCustomViewDirection), 2.0);
                    float alpha = pow(1.0 - smoothstep(0.73, 1.0, fresnel), 3.0);
                    vec3 sunDir = normalize(sunPosition);
                    float sunOrientation = smoothstep(-0.5, 1.0, dot(vCustomNormal, sunDir));
                    vec3 atmosphereColor = mix(atmosphereTwilightColor, atmosphereDayColor, sunOrientation);
                    gl_FragColor = vec4(atmosphereColor, alpha);
                    return;
                `
            );
    };

    const atmosphere = new THREE.Mesh(sphereGeometry, atmosphereMaterial);
    atmosphere.scale.setScalar(1.04);
    scene.add(atmosphere);

    // 调试界面
    const gui = new GUI();
    gui.addColor({ color: '#4db2ff' }, 'color').onChange(value => {
        uniforms.atmosphereDayColor.value.set(value);
    }).name('atmosphereDayColor');

    gui.addColor({ color: '#bc490b' }, 'color').onChange(value => {
        uniforms.atmosphereTwilightColor.value.set(value);
    }).name('atmosphereTwilightColor');

    gui.add(uniforms.roughnessLow, 'value', 0, 1).name('roughnessLow');
    gui.add(uniforms.roughnessHigh, 'value', 0, 1).name('roughnessHigh');

    // 渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.minDistance = 0.1;
    controls.maxDistance = 50;


    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();

        globe.rotation.y += delta * 0.025;
        uniforms.time.value += delta;

        controls.update();
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', onWindowResize);
    animate();
    return {
        renderer
    }
}

export const WebGLEarth = () => {
    const ref = useRef();
    useEffect(() => {
        if (!ref.current) {
            ref.current = init();
            document.body.appendChild(ref.current!.renderer.domElement);
        }
    }, []);

    return (
        <>
        </>
    );
}