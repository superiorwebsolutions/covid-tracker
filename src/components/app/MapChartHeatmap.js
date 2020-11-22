import React, {Component} from "react";
import {
    ZoomableGroup,
    ComposableMap,
    Geographies,
    Geography, Annotation
} from "react-simple-maps";

import {scaleQuantize} from "d3-scale";

import {associatedPopulationsObj, zipCodeNames, zipCodeCoordinates, chulaVistaPopulations} from "../../Constants";





class MapChartHeatmap extends Component {
    
    constructor(props) {
        super(props);

        this.state = {
            content: "",
            coordinates: props.chulaVistaOnly ? 32.579248 : 32.779248
        }

        this.colorScale = scaleQuantize()
            .domain([1, 45])
            .range([
                "#ffedea",

                "#f8c3a0",

                "#e5974f",
                "#d27d32",

                "#d25d30",
                "#ab3a1e",

                "#ac2b16",

                "#6b0f00",
                "#6b0f00",

                "#5b0e01",

                "#350701",
                "#350701",

                // "#ffedea",
                // "#ffcec5",
                // "#ffad9f",
                // "#ff8a75",
                // "#ff5533",
                // // "#e2492d",
                // // "#be3d26",
                // "#8c2817",
                // "#6b0f00",
                // "#350701",
            ]);


    }

    setContent(obj){
        this.setState({content: obj})
    }


    handleClick(zipCode){
        let zipCodeArray = this.props.singleZip
        if(zipCodeArray.includes(zipCode) === true) {
            for (let i = 0; i < zipCodeArray.length; i++) {
                if (zipCodeArray[i] == zipCode) {
                    zipCodeArray.splice(i, 1)
                    break

                }
            }
        }
        else{
            zipCodeArray.push(zipCode)
        }

        this.props.updateParentState({singleZip: zipCodeArray})

        this.forceUpdate();

    };



    componentDidMount() {

    }

    getGeography(geo){

        let associatedPopulations

        if(this.props.chulaVistaOnly)
            associatedPopulations = chulaVistaPopulations
        else
            associatedPopulations = associatedPopulationsObj

        let numDays = this.props.finalZipCountByDate.size

        let geoZip = geo.properties.zip

        if (associatedPopulations[geoZip]) {

            let locationObj = null
            let caseCount
            let caseCountPerCapita100k

            let zipCodeName = zipCodeNames[geoZip]

            caseCount = this.props.zipCodeMap.get(geoZip)
            if(caseCount != null)
                caseCountPerCapita100k = ((caseCount / associatedPopulations[geoZip]) * 100000) / numDays

            console.log(caseCountPerCapita100k)

            /*
            let tooltipText
            if (caseCount != null) {
                tooltipText = zipCodeName + " (" + caseCount + " cases)"
            } else {
                tooltipText = zipCodeName
            }
            */

            let x
            let y
            let centerCoordinate

            if (this.props.chulaVistaOnly) {
                x = 0
                y = 0
                centerCoordinate = null
            } else {
                x = zipCodeCoordinates[geoZip].x
                y = zipCodeCoordinates[geoZip].y
                centerCoordinate = [zipCodeCoordinates[geoZip].long, zipCodeCoordinates[geoZip].lat]
            }

            locationObj = {
                id: geoZip,
                caseCount: Math.round(caseCountPerCapita100k),
                cases: caseCount,
                zipCodeName: zipCodeName,
                // tooltip: tooltipText,
                centerCoordinate: centerCoordinate,
                x: x,
                y: y
            }

            let cellStyle = {
                fill: this.colorScale(locationObj.caseCount) ? this.colorScale(locationObj.caseCount) : "whitesmoke",
                stroke: "#222",
                strokeWidth: 1.5,
                outline: 'none'
            }

            let cellStyleHover = {
                fill: this.colorScale(locationObj.caseCount),
                stroke: "#222",
                strokeWidth: 1.5,
                outline: 'none'
            }

            return (
                <React.Fragment key={geo.rsmKey}>
                    <Geography
                        style={{
                            default: cellStyle,
                            hover: cellStyleHover,
                            // pressed: cellStyleHover
                        }}

                        key={locationObj.id}
                        geography={geo}

                        fill="whitesmoke"

                        onClick={() => {

                            // this.setContent(locationObj.tooltip)
                            // setTimeout( () => {
                            //     this.setContent("")
                            // }, 2000);

                            this.handleClick(locationObj.id)
                        }}

                        // onMouseEnter={() => {
                        //     this.setContent(locationObj.tooltip)
                        //     setTimeout( () => {
                        //         this.setContent("")
                        //     }, 2000);
                        // }}
                        // onMouseLeave={() => {
                        //     this.setContent("")
                        // }}

                    />


                    {locationObj.x && !this.props.chulaVistaOnly &&
                    <Annotation
                        key={locationObj.id + '-annotation'}
                        subject={locationObj.centerCoordinate}
                        dx={locationObj.x}
                        dy={locationObj.y}
                        connectorProps={{
                            stroke: "gray",
                            strokeWidth: 1,
                            strokeLinecap: "round"
                        }}
                    >
                        <text className="zip-area-label"
                              y={locationObj.y < 0 ? -4 : 8}
                              x={locationObj.x < 0 ? -4 : 4}
                              textAnchor=
                                  {(() => {

                                      if (locationObj.x > 0 && Math.abs(locationObj.y) < 30)
                                          return "start"
                                      else if (locationObj.x < 0 && Math.abs(locationObj.y) < 30)
                                          return "end"
                                      else
                                          return "middle"

                                  })()}
                              alignmentBaseline="middle" fontSize="12"
                              fill="gray">
                            {locationObj.zipCodeName}
                        </text>
                    </Annotation>
                    }
                </React.Fragment>
            );
        }
    }

    render() {
        // Do not render heatmap until zipCodeMap data is populated

        if(this.props.finalZipCountByDate.size == 0)
            return (<></>)

        // console.log("render MapChartHeatmap")

        // console.log(this.props.zipCodeMap)


        {/*<ReactTooltip>{this.state.content}</ReactTooltip>*/}

        return (

                <ComposableMap data-tip="" projection="geoAlbersUsa" projectionConfig={{
                    scale: 90000,
                    // center: [-117.155, 32.769248],
                    // rotate: [, 0, 0]

                }}
                   width={500}
                   height={420}
                   style={{
                       width: "100%",
                       height: "auto",
                   }}
                >

                    <ZoomableGroup center={[-117.145, this.state.coordinates]} zoom={1} maxZoom={1} disablePanning disableZooming onMoveStart={(position) => {

                        this.setState({coordinates: this.state.coordinates + 0.00001})

                    }}>

                        <Geographies geography="./zipcodes.geojson" disableOptimization={false}>
                            {

                                ({geographies}) =>

                                    geographies.map((geo) => {

                                        return(this.getGeography(geo))

                                    })
                            }

                        </Geographies>

                </ZoomableGroup>

                </ComposableMap>


        );

    }
}

export default MapChartHeatmap
