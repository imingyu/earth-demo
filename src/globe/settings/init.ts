import Globe from "globe.gl"

export const initGlobe = (el: HTMLElement) => {
    // 上海为起点
    return new Globe(el, {}).pointOfView({ "lat": 31.2304, "lng": 121.4737, altitude: 1.4 })
}