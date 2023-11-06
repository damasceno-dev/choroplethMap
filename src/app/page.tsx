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

  const [selectedCounty, setSelectedCounty] = useState<EducationData>()
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipAttrs, setToolTipAttrs] = useState('opacity-0 transition-all duration-200');

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


  function handleMouseEnter(e: React.MouseEvent<SVGPathElement, MouseEvent>, education: EducationData) {
    setSelectedCounty(education);
    setIsHovered(true)
    const clientX = e.pageX;
    const clientY = e.pageY;
    const toolTipPadding = -100;

    setTooltipPosition({
      top: clientY + toolTipPadding, 
      left: clientX-60,
    });
    setToolTipAttrs('opacity-80');
  }

  function handleMouseLeave() {
    setIsHovered(false)
    setToolTipAttrs('opacity-0')
  }

  return (
    <main className={'flex min-h-screen flex-col items-center justify-between p-24 bg-gray-900'}>
      <h1>United States Educational Attainment</h1>
      <h3>Percentage of adults age 25 and older with a bachelor&apos;s degree or higher (2010-2014)</h3>

      <div id='tooltip' 
        className={'flex flex-col justify-center items-center bg-slate-600 font-bold text-base text-white p-2 absolute rounded select-none pointer-events-none transition-opacity duration-500 ' + tooltipAttrs}
        style={{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }}
      >
      {selectedCounty && (
        <>
          <p>{selectedCounty.area_name}, {selectedCounty.state}: {selectedCounty.bachelorsOrHigher}%</p>
        </>
      )}   
      </div>

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
              onMouseEnter={(event) => {handleMouseEnter(event, education)}}
              onMouseLeave={handleMouseLeave}
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
            stroke={isHovered ? 'white' : 'black'}
            strokeWidth={isHovered ? 2 : 1}
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

  const xInitialLocation = 640
  const yInitialLocation = 25

  const legendItems = [];
  for (let i = 0; i < numSteps; i++) {
    const value = minEducation + i * stepSize;
    const color = colorScale(value);

    legendItems.push(
      <>
        <rect x={xInitialLocation + i * rectWidth} y={yInitialLocation } width={rectWidth} height={rectHeight} fill={color} />
        <line x1={xInitialLocation + i * rectWidth} x2={xInitialLocation + i * rectWidth} y1={yInitialLocation + rectHeight} y2={(yInitialLocation + 5) + rectHeight} stroke="currentColor" />
        <text x={(xInitialLocation - 35) + rectWidth + i * rectWidth} y={yInitialLocation + 25} style={{color:'aliceblue', fontSize: "9px", fontStyle:'normal' , transform: "translateY(10px)"}}>
          {value.toFixed(0)}%
        </text>
      </>
    );
  }

  legendItems.push(
    <>
      <line x1={xInitialLocation + numSteps * rectWidth} x2={xInitialLocation + numSteps * rectWidth} y1={yInitialLocation + rectHeight} y2={(yInitialLocation + 5) + rectHeight} stroke="currentColor" />
      <text x={(xInitialLocation - 35) + rectWidth + numSteps * rectWidth} y={yInitialLocation + 25} style={{fontSize: "9px", fontStyle:'normal' , transform: "translateY(10px)"}}>
        {maxEducation.toFixed(0)}%
      </text>
    </>
  )

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




