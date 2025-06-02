import type { GlobeInstance } from "globe.gl";
import type { RouteInfo } from "../type";

export interface GlobeLabelInfo {
    lat: number;
    lng: number;
    text: string;
    color?: string;
    size: number;
}

const getNumValue = (data: object, prop: keyof Omit<GlobeLabelInfo, 'route'>) => {
    return (data as GlobeLabelInfo)[prop] as number;
}

const getStrValue = (data: object, prop: keyof Omit<GlobeLabelInfo, 'route'>) => {
    return (data as GlobeLabelInfo)[prop] as string;
}

export const setLabels = (globe: GlobeInstance, labels: GlobeLabelInfo[]) => {
    console.log(labels);
    globe.labelsData(labels)
        .labelLat(d => getNumValue(d, 'lat'))
        .labelLng(d => getNumValue(d, 'lng'))
        .labelText(d => getStrValue(d, 'text'))
        // .labelSize(d => Math.sqrt(getNumValue(d, 'size')) * 4e-4)
        .labelSize(0.8)
        // .labelDotRadius(d => Math.sqrt(getNumValue(d, 'size')) * 4e-4)
        .labelDotRadius(0.35)
        .labelColor((d) => getStrValue(d, 'color') || 'rgba(255, 165, 0, 0.75)')
    return globe;
}

export const convertLabels = (routes: RouteInfo[]): GlobeLabelInfo[] => {
    const mark: Record<string, 1> = {}
    return routes.reduce((sum, item) => {
        [item.start, item.end].forEach(port => {
            const text = (port.tags.name || port.tags.portname || port.tags.idc) as string;
            if (!(text in mark)) {
                mark[text] = 1;
                sum.push({
                    lat: port.lat,
                    lng: port.lng,
                    size: item.tags.poCount as number,
                    text
                });
            }
        });
        return sum;
    }, [] as GlobeLabelInfo[])
}