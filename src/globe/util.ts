/**
 * 计算两个港口之间的大圆航线（Great Circle）
 * @param {Array} start - 起点港口的经纬度 [经度, 纬度]（单位：度）
 * @param {Array} end - 终点港口的经纬度 [经度, 纬度]（单位：度）
 * @param {number} [numPoints=100] - 生成的路径点数（默认100）
 * @returns {Array} 航线点的经纬度数组，格式 [[经度, 纬度], ...]
 * 
 * // 使用示例
const newYork = [-74.006, 40.7128];  // 纽约
const london = [-0.1278, 51.5074];   // 伦敦
const sailingRoute = calculateSailRoute(newYork, london, 50);
 */
export function calculateSailRoute(start: [number, number], end: [number, number], numPoints = 100) {
    // 将角度转换为弧度
    const toRadians = (deg: number) => deg * Math.PI / 180;
    // 将弧度转换为角度
    const toDegrees = (rad: number) => rad * 180 / Math.PI;

    const [lon1, lat1] = start.map(toRadians);
    const [lon2, lat2] = end.map(toRadians);

    // 计算大圆航线的总角度
    const deltaLon = lon2 - lon1;
    const y = Math.sqrt(
        Math.pow(Math.cos(lat2) * Math.sin(deltaLon), 2) +
        Math.pow(Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon), 2)
    );
    const x = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(deltaLon);
    const totalAngle = Math.atan2(y, x);

    // 生成路径点
    const route: Array<[number, number]> = [];
    for (let i = 0; i < numPoints; i++) {
        const fraction = i / (numPoints - 1);
        const A = Math.sin((1 - fraction) * totalAngle) / Math.sin(totalAngle);
        const B = Math.sin(fraction * totalAngle) / Math.sin(totalAngle);

        // 计算中间点的笛卡尔坐标
        const x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
        const y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
        const z = A * Math.sin(lat1) + B * Math.sin(lat2);

        // 转换为经纬度
        const lat = Math.atan2(z, Math.sqrt(x * x + y * y));
        const lon = Math.atan2(y, x);

        route.push([toDegrees(lon), toDegrees(lat)]);
    }

    return route;
}


