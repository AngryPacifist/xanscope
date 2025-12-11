"use client";

import { useMemo } from "react";
import { geoNaturalEarth1, geoPath, geoGraticule } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, Objects, GeometryCollection } from "topojson-specification";
import worldData from "world-atlas/countries-110m.json";
import { PNode } from "@/lib/types";
import { StatusPill } from "@/components/ui/status-pill";
import type { FeatureCollection } from "geojson";

type NetworkMapProps = {
  nodes: PNode[];
};

const WIDTH = 900;
const HEIGHT = 420;

type CountriesObject = Objects<{ countries: GeometryCollection }>;

const worldTopo = worldData as Topology<CountriesObject>;
const worldFeatures = feature(
  worldTopo,
  worldTopo.objects.countries
) as FeatureCollection;

export function NetworkMap({ nodes }: NetworkMapProps) {
  const projection = useMemo(
    () => geoNaturalEarth1().scale(180).translate([WIDTH / 2, HEIGHT / 2]),
    []
  );
  const pathGenerator = useMemo(() => geoPath(projection), [projection]);
  const graticule = useMemo(() => geoGraticule(), []);

  const countryPaths = useMemo(() => {
    return worldFeatures.features
      .map((feature) => pathGenerator(feature))
      .filter(Boolean) as string[];
  }, [pathGenerator]);

  const graticulePath = useMemo(
    () => pathGenerator(graticule()),
    [pathGenerator, graticule]
  );

  const points = useMemo(() => {
    return nodes
      .map((node) => {
        if (node.latitude === undefined || node.longitude === undefined) {
          return null;
        }
        const coords = projection([node.longitude, node.latitude]);
        if (!coords) return null;
        return {
          id: node.id,
          label: node.label,
          coords,
          status: node.status,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      label: string;
      coords: [number, number];
      status: PNode["status"];
    }>;
  }, [nodes, projection]);

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#050b2a] via-[#0b0f3b] to-[#130a25] p-0">
      <div className="flex items-center justify-between px-6 pb-4 pt-6">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-cyan-300">
            Atlas map
          </p>
          <h3 className="text-xl font-semibold text-white">
            Global pNode distribution
          </h3>
        </div>
        <StatusPill label="Live" variant="online" />
      </div>
      <div className="relative min-h-[420px] overflow-hidden rounded-b-3xl bg-[#060d2c] p-4">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-full w-full"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <radialGradient id="nodePulse" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#2ed3f3" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2ed3f3" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="mapBackground"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#06123b" />
              <stop offset="100%" stopColor="#130a25" />
            </linearGradient>
          </defs>
          <rect
            x="0"
            y="0"
            width={WIDTH}
            height={HEIGHT}
            fill="url(#mapBackground)"
          />
          {graticulePath && (
            <path
              d={graticulePath}
              fill="none"
              stroke="rgba(148,163,184,0.15)"
              strokeWidth={0.5}
            />
          )}
          {countryPaths.map((path, idx) => (
            <path
              key={idx}
              d={path}
              fill="rgba(255,255,255,0.05)"
              stroke="rgba(148,163,184,0.2)"
              strokeWidth={0.5}
            />
          ))}
          {points.map((point) => (
            <g key={point.id}>
              <circle
                className="animate-ping-slow"
                cx={point.coords[0]}
                cy={point.coords[1]}
                r="18"
                fill="url(#nodePulse)"
                opacity="0.6"
              />
              <circle
                cx={point.coords[0]}
                cy={point.coords[1]}
                r="6"
                fill={
                  point.status === "online"
                    ? "#2ed3f3"
                    : point.status === "syncing"
                    ? "#fbbf24"
                    : "#fb7185"
                }
                stroke="#081029"
                strokeWidth={1}
              />
            </g>
          ))}
        </svg>
        <div className="absolute inset-4 pointer-events-none">
          {points.map((point) => (
            <div
              key={`${point.id}-label`}
              className="absolute text-xs font-semibold text-white/80"
              style={{
                left: point.coords[0],
                top: point.coords[1] - 24,
                transform: "translate(-50%, -100%)",
              }}
            >
              {point.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
