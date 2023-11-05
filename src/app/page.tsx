'use client'

import * as d3 from 'd3';
import { useState, useEffect, useRef } from "react";
import * as topojsonClient from 'topojson-client'
// import { useData, useDataAsync } from "./dataFetch"
 import * as TopoSpecification from 'topojson-specification'
 import * as GeoJSON from "geojson";
// import { useDataAsync } from './dataFetch';


interface EducationData {
  fips: number;
  state: string;
  area_name: string;
  bachelorsOrHigher: number;
}


export default function Home() {

  const urlTopo = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
  const urlEducation = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

  const [isHovered, setIsHovered] = useState(false);

    const {topoData, educationData} = useDataAsync(urlTopo, urlEducation) ;
    // const [topoData, setTopoData] = useState<TopoSpecification.Topology>();
    // const [educationData, setEducationData] = useState<EducationData[]>();
    // const ignoreFetch = useRef(false)

    // useEffect(() => {
    //   async function fetchData(url: string) {
    //     const response = await fetch(url)
        
    //     if (!response.ok) {
    //       throw new Error(`HTTP error! Status: ${response.status}`);
    //     }
    //     const data = await response.json()
    //     return data;
    //   } 
      
    //   async function fetchMultipleData(urlTopo:string, urlEducation:string) {
    //     const [responseUrlTopo, responseUrlEduation] = await Promise.all([fetchData(urlTopo), fetchData(urlEducation)])
        
        
    //       setTopoData(responseUrlTopo);
    //       setEducationData(responseUrlEduation);
    //       ignoreFetch.current = true;
    //   }
    //   if(!ignoreFetch.current) {
    //     fetchMultipleData(urlTopo,urlEducation);
    //   }
    //     // return () => {
    //     //   ignoreFetch.current = true;
    //     // }
    //   }, [urlTopo, urlEducation])

  // console.log(educationData)
  //importar os outros dados, fazer a escala de cor, mostrá-la no mapa
  //escala de cor: roxo claro a roxo escuro
  // console.log(topoData)
  
  if(!topoData || !educationData) {
    return
  }
  
  const [minEducation, maxEducation] = d3.extent(educationData.map(x => x.bachelorsOrHigher)) as [number, number];
  // console.log(minEducation, maxEducation)
  const colorScale = d3.scaleLinear([minEducation, maxEducation], ['#a989e1', '#4B0082']);

  const svgWidth = 1200;
  const svgHeight = 800;
  const pathGenerator = d3.geoPath()
 
  const geoJsonDataCounties  = topojsonClient.feature(topoData, topoData.objects.counties) as GeoJSON.FeatureCollection<GeoJSON.Polygon>
  const statesMesh = topoData.objects.states as TopoSpecification.GeometryObject<{}>;
  const geoJsonDataStates= topojsonClient.mesh(topoData, statesMesh, (a,b) => a !== b)
  const geoJsonDataNation= topojsonClient.feature(topoData, topoData.objects.nation)


  // console.log(pathGenerator.bounds(geoJsonDataCounties))

  const statesPath = pathGenerator(geoJsonDataStates)
  const nationPath = pathGenerator(geoJsonDataNation);
  // console.log(nationPath)
  // console.log('geoJson', geoJsonDataCounties)
  // console.log('geoJsonStates', geoJsonDataStates)
  return (
    <main className={'flex min-h-screen flex-col items-center justify-between p-24 bg-gray-900'}>
      <h1>hello world</h1>
      {/* <svg height={svgHeight} width={svgWidth}> */}
      <svg viewBox="-150 0 1275 910" stroke='white'>

        <g className='counties'>
      {topoData.objects && geoJsonDataCounties.features.map((feat, i) => {
          const d = pathGenerator(feat.geometry);
          // console.log(feat)
          const education = educationData.find(e => e.fips === feat.id);
          // console.log(education)
          return d && education && (
            <path
              key={feat.id}
              d={d}
              fill={colorScale(education.bachelorsOrHigher)}
              stroke='white'
              strokeWidth={0.3}
            ></path>
           ) 
          
       })}
        </g>
       {typeof statesPath === 'string'  && 
        (
          <path
            fill='none'
            className='stroke-gray-900'
            strokeWidth={1.5}
            d={statesPath}
          ></path>
        )
       }
             {typeof nationPath === 'string'  && 
        (
          <path
            fill='none'
            className='stroke-gray-700'
            d={nationPath}
            strokeWidth={isHovered ? 5 : 1}
            onMouseEnter={() => {setIsHovered(true); console.log('entrei')}}
            onMouseLeave={() => {setIsHovered(false); console.log('saí')}}
          ></path>
        )
       }

       <Legend
        minEducation={minEducation}
        maxEducation={maxEducation}
        colorScale={colorScale}
       ></Legend>

      </svg>

    </main>
  )
}

interface LegendProperties {
  minEducation: number;
  maxEducation: number;
  colorScale: d3.ScaleLinear<string, string, never>;
}

function Legend({ minEducation, maxEducation, colorScale } : LegendProperties) {

  const numSteps = 7;
  const stepSize = (maxEducation - minEducation) / numSteps;
  const rectWidth = 30;
  const rectHeight = 15;

  const legendItems = [];
  for (let i = 0; i < numSteps; i++) {
    const value = minEducation + i * stepSize;
    const color = colorScale(value);

    legendItems.push(
      <>
        <rect x={650 + i * rectWidth} y={10 } width={rectWidth} height={rectHeight} fill={color} />
        <line x1={650 + i * rectWidth} x2={650 + i * rectWidth} y1={10 + rectHeight} y2={15 + rectHeight} stroke="currentColor" />
        <text x={615 + rectWidth + i * rectWidth} y={35} style={{color:'aliceblue', fontSize: "9px", fontStyle:'normal' , transform: "translateY(10px)"}}>
          {value.toFixed(0)}%
        </text>
      </>
    );
  }

  legendItems.push(
    <>
      <line x1={650 + numSteps * rectWidth} x2={650 + numSteps * rectWidth} y1={10 + rectHeight} y2={15 + rectHeight} stroke="currentColor" />
      <text x={615 + rectWidth + numSteps * rectWidth} y={35} style={{fontSize: "9px", fontStyle:'normal' , transform: "translateY(10px)"}}>
        {maxEducation.toFixed(0)}%
      </text>
    </>
  )

  const svgWidth = window.innerWidth * 0.1; // Adjust the scale based on your needs
  const svgHeight = window.innerHeight * 0.2; // Adjust the scale based on your needs

  return (
    <g>
      {legendItems}
    </g>
  );
}


//implement getStaticProps
interface DataResponse {
  topoData: TopoSpecification.Topology | undefined;
  educationData: EducationData[] | undefined;
}

export function useDataAsync(urlTopo: string, urlEducation: string) : DataResponse{
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




