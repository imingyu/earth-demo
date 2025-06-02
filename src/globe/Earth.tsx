import { useEffect, useRef } from "react"
import type { GlobeInstance } from "globe.gl";
import { initGlobe } from "./settings/init";
import type { RouteInfo } from "./type";
import { setMaterial } from "./settings/material";
import { convertArcs, setArcs } from "./settings/arc";
import { convertLabels, setLabels } from "./settings/label";
import { applyControls } from "./settings/control";

export const GlobeEarth = (props: {
    routes: RouteInfo[];
}) => {
    const refContainer = useRef<HTMLDivElement>(null);
    const refGlobe = useRef<GlobeInstance>(null);

    const setGlobe = () => {
        const globe = refGlobe.current!;
        // setArcs(globe, convertArcs(props.routes))
        setLabels(globe, convertLabels(props.routes));
    }

    useEffect(() => {
        refGlobe.current = initGlobe(refContainer.current!);
        setMaterial(refGlobe.current);
        applyControls(refGlobe.current);
        setGlobe()
    }, []);

    useEffect(() => {
        setGlobe()
    }, [props.routes])

    return <div ref={refContainer} style={{ width: '100%', height: '100%' }}></div>
}