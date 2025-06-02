export interface LocationInfo {
    /** 维度 */
    lat: number;
    /** 经度 */
    lng: number;
    /** {idc:6020, name:'ShangeHai' } */
    tags: Record<string, string | number | boolean>
}
export interface RouteInfo {
    start: LocationInfo;
    end: LocationInfo;
    /** {poCount:123 } */
    tags: Record<string, string | number | boolean>
}