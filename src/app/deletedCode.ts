export function deleted() {}

import * as TopoSpecification from 'topojson-specification'
import { useState, useEffect, useRef } from "react";
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

  interface EducationData {
    fips: number;
    state: string;
    area_name: string;
    bachelorsOrHigher: number;
  }
  
  
  
  interface DataResponse {
    topoData: TopoSpecification.Topology | undefined;
    educationData: EducationData[] | undefined;
  }
  
function useDataAsync(urlTopo: string, urlEducation: string) : DataResponse{
  const [topoData, setTopoData] = useState<TopoSpecification.Topology>();
  const [educationData, setEducationData] = useState<EducationData[]>();

  useEffect(() => {
    let ignore = false;
    async function fetchData(url: string) {
      const response = await fetch(url)
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json()
      return data;
    } 
    
    async function fetchMultipleData(urlTopo:string, urlEducation:string) {
      const [responseUrlTopo, responseUrlEduation] = await Promise.all([fetchData(urlTopo), fetchData(urlEducation)])
      
      if(!ignore) {
        setTopoData(responseUrlTopo);
        setEducationData(responseUrlEduation);
      }
    }

    fetchMultipleData(urlTopo,urlEducation);
   
      return () => {
        ignore = true;
      }
    }, [urlTopo, urlEducation])
    
    return {topoData, educationData};
}

  const objType : d3.GeoSphere = ({type: 'Sphere'})
  // const projection = d3.geoAlbersUsa().fitWidth(svgWidth, objType)
  // const projection = d3.geoAlbersUsa()
  // const pathGenerator = d3.geoPath().projection(projection)

  

  // const asGeoPermissibleObjects = (geometry: any): GeoPermissibleObjects => {
  //   return geometry as GeoPermissibleObjects;
  // };

  
          // const d = pathGenerator(asGeoPermissibleObjects(feat.geometry.coordinates));
                    // console.log(feat.geometry.coordinates)

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
