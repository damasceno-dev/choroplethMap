'use client'

import * as d3 from 'd3';
import { useState, useEffect, useRef } from "react";
import * as topojsonClient from 'topojson-client'
import * as TopoSpecification from 'topojson-specification'
import * as GeoJSON from "geojson";


interface EducationData {
  fips: number;
  state: string;
  area_name: string;
  bachelorsOrHigher: number;
}

export default function Home() {

  const urlTopo = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json';
  const urlEducation = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json';

  const [selectedCounty, setSelectedCounty] = useState<EducationData>();
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipAttrs, setToolTipAttrs] = useState('opacity-0 transition-all duration-200');

  const [ topoData, educationData ] = useDataAsyncGeneric<TopoSpecification.Topology, EducationData[]>(urlTopo,urlEducation);

  if(!topoData || !educationData) {
    return (
      <main className={'flex min-h-screen flex-col items-center p-10 bg-gray-900 text-white'}>
        <h1>Loading data...</h1>
      </main>
    )
  }
  
  const [minEducation, maxEducation] = d3.extent(educationData.map(x => x.bachelorsOrHigher)) as [number, number];
  const colorScale = d3.scaleLinear([minEducation, maxEducation], ['#a989e1', '#4B0082']);

  const pathGenerator = d3.geoPath();
 
  const geoJsonDataCounties  = topojsonClient.feature(topoData, topoData.objects.counties) as GeoJSON.FeatureCollection<GeoJSON.Polygon>;
  const statesMesh = topoData.objects.states as TopoSpecification.GeometryObject<{}>;
  const geoJsonDataStates= topojsonClient.mesh(topoData, statesMesh, (a,b) => a !== b);
  const geoJsonDataNation= topojsonClient.feature(topoData, topoData.objects.nation);
  const statesPath = pathGenerator(geoJsonDataStates);
  const nationPath = pathGenerator(geoJsonDataNation);

  function handleMouseEnter(e: React.MouseEvent<SVGPathElement, MouseEvent>, education: EducationData) {
    setSelectedCounty(education);
    const clientX = e.pageX;
    const clientY = e.pageY;
    const toolTipPadding = -50;

    setTooltipPosition({
      top: clientY + toolTipPadding, 
      left: clientX-60,
    });
    setToolTipAttrs('opacity-80');
  }

  function handleMouseLeave() {
    setToolTipAttrs('opacity-0');
  }

  return (
    <main className={'flex min-h-screen flex-col items-center p-10 bg-gray-900 text-white'}>
      <h1 id='title' className='mt-0 text-3xl'>United States Educational Attainment</h1>
      <h3 id='description' className='mt-1'>Percentage of adults age 25 and older with a bachelor&apos;s degree or higher (2010-2014)</h3>
      { selectedCounty &&      
        (<ToolTip
          selectedCounty={selectedCounty}
          tooltipPosition={tooltipPosition}
          tooltipAttrs={tooltipAttrs}
        ></ToolTip>)
      }
      <svg viewBox="-150 0 1275 910" stroke='white'>

        <g className='counties'>
      {topoData.objects && geoJsonDataCounties.features.map((feat, i) => {
          const d = pathGenerator(feat.geometry);
          const education = educationData.find(e => e.fips === feat.id);
          return d && education && (
            <path
              className='county'
              data-fips={education.fips}
              data-education={education.bachelorsOrHigher}
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
            d={nationPath}
            className='stroke-emerald-100'
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
    <g id='legend'>
      {legendItems}
    </g>
  );
}

function ToolTip({tooltipPosition, selectedCounty, tooltipAttrs}: {selectedCounty: EducationData, tooltipPosition: {top:number, left:number}, tooltipAttrs: string}) {

  return (
    <div id='tooltip' 
    className={'flex flex-col justify-center items-center bg-emerald-600 font-bold text-base text-white p-2 absolute rounded select-none pointer-events-none transition-opacity duration-500 ' + tooltipAttrs}
    style={{ top: tooltipPosition.top + 'px', left: tooltipPosition.left + 'px' }}
    data-education={selectedCounty.bachelorsOrHigher}
  >
    {selectedCounty && (
      <>
        <p>{selectedCounty.area_name}, {selectedCounty.state}: {selectedCounty.bachelorsOrHigher}%</p>
      </>
    )}   
  </div>
  )
}

function useDataAsyncGeneric<T, U>(urlOne: string, urlTwo: string) : [T | undefined, U | undefined]  {
  const [firstData, setFirstData] = useState<T>();
  const [secondData, setSecondData] = useState<U>();

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
    
    async function fetchMultipleData(urlOne:string, urlTwo:string) {
      const [responseOne, responseTwo] = await Promise.all([fetchData(urlOne), fetchData(urlTwo)])
      
      if(!ignore) {
        setFirstData(responseOne);
        setSecondData(responseTwo);
      }
    }

    fetchMultipleData(urlOne,urlTwo);
   
      return () => {
        ignore = true;
      }
    }, [urlOne, urlTwo])
    return [firstData, secondData];
}




