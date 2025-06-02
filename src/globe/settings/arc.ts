/**
 * 地球两点连线圆弧设置
 */

import type { GlobeInstance } from "globe.gl";
import type { RouteInfo } from "../type";
import { calculateSailRoute } from "../util";

export interface GlobeArcInfo {
    srcLat: number;
    srcLng: number;
    dstLat: number;
    dstLng: number;
    route: RouteInfo;
}

const getArcDataValue = (arcData: object, prop: keyof Omit<GlobeArcInfo, 'route'>) => {
    return (arcData as GlobeArcInfo)[prop];
}

export const setArcs = (globe: GlobeInstance, arcsData: GlobeArcInfo[]) => {
    console.log(arcsData);
    const arcCorlor: string[] = ['#4dd0e1', '#4dd0e1'];
    const arcActiveCorlor: string[] = ["#FFA500", "#FFA500"];

    globe.arcsData(arcsData)
        .arcStartLat((d) => getArcDataValue(d, 'srcLat'))
        .arcStartLng((d) => getArcDataValue(d, 'srcLng'))
        .arcEndLat((d) => getArcDataValue(d, 'dstLat'))
        .arcEndLng((d) => getArcDataValue(d, 'dstLng'))
        .onArcHover((arc) => {
            globe.arcColor((d: unknown) => {
                return d === arc ? arcActiveCorlor : arcCorlor
            });
        })
        .arcColor(arcCorlor)
        .arcAltitude(0)
        // 圆弧线的直径
        .arcStroke(0.8)
    return globe
}

export const convertArcs = (routes: RouteInfo[]): GlobeArcInfo[] => {
    return routes.reduce((sum, route) => {
        sum.push({
            srcLng: route.start.lng,
            srcLat: route.start.lat,
            dstLng: route.end.lng,
            dstLat: route.end.lat,
            route
        })
        // calculateSailRoute([route.start.lng, route.start.lat], [route.end.lng, route.end.lat],10).forEach((item, i, arr) => {
        //     if (i === arr.length - 1) {
        //         return
        //     }
        //     sum.push({
        //         srcLng: item[0],
        //         srcLat: item[1],
        //         dstLng: arr[i + 1][0],
        //         dstLat: arr[i + 1][1],
        //         route
        //     })
        // })

        return sum;
    }, [] as GlobeArcInfo[])
}