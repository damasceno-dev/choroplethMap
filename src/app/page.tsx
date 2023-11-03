'use client'

import * as d3 from 'd3';
import { ExtendedGeometryCollection, GeoPermissibleObjects, svg } from 'd3';
import { useState, useEffect } from "react";
import * as topojsonClient from 'topojson-client'
// import { useData, useDataAsync } from "./dataFetch"
 import * as TSpecification from 'topojson-specification'
 import * as GeoJSON from "geojson";
interface TopologyOld {
  type: 'Topology';
  bbox: number[];
  arcs: number[][];
  objects: {
    counties: {
      type: string,
      geometries: {
        type: string,
        arcs: number[][]
      }[]
    },
    states: {
      type: string,
      geometries: {
        type: string,
        arcs: number[][]
      }[]
    },
    nation: {
      type: string,
      geometries: {
        type: string,
        arcs: number[][]
      }[]
    }
  };
  transform: {
    scale:number[],
    translate:number[]
  }
}

export default function Home() {

  const topoData = useDataAsync('https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json')
  console.log(topoData)

  if(!topoData) {
    return
  }

  const svgWidth = 1000;

  const objType : d3.GeoSphere = ({type: 'Sphere'})
  // const projection = d3.geoAlbersUsa().fitWidth(svgWidth, objType)
  // const projection = d3.geoAlbersUsa()
  // const pathGenerator = d3.geoPath().projection(projection)
  const pathGenerator = d3.geoPath()

  const nation = topoData.objects.nation;
  console.log(nation)

  // const asGeoPermissibleObjects = (geometry: any): GeoPermissibleObjects => {
  //   return geometry as GeoPermissibleObjects;
  // };

 
  
  const geoJsonData  = topojsonClient.feature(topoData, topoData.objects.counties) as GeoJSON.FeatureCollection<GeoJSON.Polygon>

  console.log('geoJson', geoJsonData)

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1>hello world</h1>
      <svg height={1000} width={svgWidth}>

      {topoData.objects && geoJsonData.features.map((feat, i) => {
          // const d = pathGenerator(asGeoPermissibleObjects(feat.geometry.coordinates));
          const d = pathGenerator(feat.geometry);
          // console.log(feat.geometry.coordinates)
          return d &&(
            <path
            key={feat.id}
            d={d}
            fill='green'
            stroke='white'
          ></path>
           ) 
          
       })}

      </svg>

    </main>
  )
}
//fetch data and understand the object
  //type the object
  //
//join data with promise.all

//implement getStaticProps

export function useDataAsync(url: string) {
  // const defaultTopology : TSpecification.Topology ={
  //   type: 'Topology', bbox: [], arcs: [], objects: {
  //     counties: {type: '',geometries: [{type: '', arcs: []}]},
  //     states: {type: '',geometries: [{type: '', arcs: []}]},
  //     nation: {type: '', geometries: [{type: '', arcs: []}]}
  //   },
  //   transform: {scale:[],translate:[]}
  // }

  // const defaultTopology : TSpecification.Topology ={
  //   type: 'Topology', objects: {}, arcs: []}

  const [data, setData] = useState<TSpecification.Topology>();
  useEffect(() => {
    let ignore = false;

    async function fetchData(url: string) {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json()
      
      if(!ignore) {
        setData(data)
      }
    } 
   
    fetchData(url);

      return () => {
        ignore = true;
      }
    }, [url])
    
    return data;
}

