declare module "world-atlas/countries-110m.json" {
    import type { Topology, Objects, GeometryCollection } from "topojson-specification";

    type CountriesObject = Objects<{ countries: GeometryCollection }>;
    const worldData: Topology<CountriesObject>;
    export default worldData;
}
