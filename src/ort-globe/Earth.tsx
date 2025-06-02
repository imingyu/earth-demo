import { GlobeEarth } from "../globe/Earth";
import fromPortLocations from './from.json';
import toPortLocations from './to.json';
import poRoutes from './fromToPOCountCost.json'
import type { LocationInfo, RouteInfo } from "../globe/type";
import { omit, pick } from 'lodash'
import { useEffect, useState } from "react";

const toLocationMap = (source: Array<{ /** 维度 */
    lat: number;
    /** 经度 */
    lng: number;
    name?: string;
    portname?: string;
    idc?: number;
}>) => {
    return source.reduce((sum, item) => {
        sum[item.idc || item.name || item.portname!] = {
            lat: item.lat,
            lng: item.lng,
            tags: omit(item, 'lat', 'lng')
        }
        return sum;
    }, {} as Record<string, LocationInfo>)
}

const getRoutes = () => {
    return new Promise<RouteInfo[]>((resolve) => {
        const fromMap = toLocationMap(fromPortLocations);
        const toMap = toLocationMap(toPortLocations);
        resolve(poRoutes.reduce((sum, item) => {
            const from = fromMap[item.fromPort];
            const to = toMap[item.toPort];
            if (from && to) {
                sum.push({
                    start: from,
                    end: to,
                    tags: pick(item, 'cost', 'poCount')
                })
            }
            return sum;
        }, [] as RouteInfo[]))
    })
}

export const ORTEarth = () => {
    const [routes, setRoutes] = useState<RouteInfo[]>();
    useEffect(() => {
        getRoutes().then(res => {
            console.log(res);
            setRoutes(res);
        })
    }, []);
    if (!routes) {
        return <></>
    }
    return <GlobeEarth routes={routes} />
}