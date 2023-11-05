export function deleted() {}

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
