import React, {Component, memo, useEffect, useState} from "react";
import {
    ZoomableGroup,
    ComposableMap,
    Geographies,
    Geography, Annotation
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";
import {scaleQuantize} from "d3-scale";





const rounded = num => {
    if (num > 1000000000) {
        return Math.round(num / 100000000) / 10 + "Bn";
    } else if (num > 1000000) {
        return Math.round(num / 100000) / 10 + "M";
    } else {
        return Math.round(num / 100) / 10 + "K";
    }
};

const colorScale = scaleQuantize()
    .domain([2, 20])
    .range([
        "#ffedea",
        "#ffcec5",
        "#ffad9f",
        "#ff8a75",
        "#ff5533",
        "#e2492d",
        "#be3d26",
        "#8c2817",
        "#6b0f00"
    ]);

class MapChartHeatmap extends Component {



    constructor(props) {
        super(props);

        this.state = {
            // activeZipCodes: [],
            // zipCodeMap: new Map(),
            finalZipCountByDate: new Map(),
            dateRangeArray: new Map(),
            content: "",
            coordinates: 32.769248
        }

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


        // if(this.props.singleZip.length != 0)
        //     this.props.updateSingleZip([])
        // else{
        //
        // }
            this.props.updateSingleZip(zipCodeArray)

        this.forceUpdate();

    };





    componentDidMount() {

        // console.log(this.state)

    }

    render() {
        // Do not render heatmap until zipCodeMap data is populated
        if(this.props.zipCodeMap.size == 0)
            return (<></>)

        console.log("render MapChartHeatmap")

        // console.log(this.props.zipCodeMap)
        let count = 0
        let associatedPopulationsObj
        if(this.props.stateObj.chulaVistaOnly)
            associatedPopulationsObj = this.props.chulaVistaPopulations
        else
            associatedPopulationsObj = this.props.associatedPopulationsObj

        let positionCount = -60

        let numDays = this.props.finalZipCountByDate.size

        return (
            <>
                {/*<ReactTooltip>{this.state.content}</ReactTooltip>*/}

                <ComposableMap data-tip="" projection="geoAlbersUsa" projectionConfig={{
                    scale: 90000,
                    // center: [-117.155, 32.769248],
                    // rotate: [, 0, 0]

                }}

                               width={600}
                               height={400}
                               style={{
                                   width: "100%",
                                   height: "auto",
                               }}>
                    <ZoomableGroup center={[-117.155, this.state.coordinates]} zoom={1} maxZoom={1} disablePanning disableZooming onMoveStart={(position) => {

                        this.setState({coordinates: this.state.coordinates + 0.00001})

                    }}>

                        <Geographies geography="./zipcodes.geojson" disableOptimization={false}>
                            {

                                ({geographies}) =>

                                    geographies.map((geo) => {

                                        let geoZip = geo.properties.zip
                                        if (associatedPopulationsObj[geoZip]) {

                                            positionCount += 1

                                            let locationObj = null
                                            let caseCount
                                            let caseCountPerCapita100k

                                            let zipCodeName = this.props.stateObj.zipCodeNames[geoZip]

                                            caseCount = this.props.zipCodeMap.get(geoZip)

                                            caseCountPerCapita100k = ((caseCount / associatedPopulationsObj[geoZip]) * 100000) / numDays

                                            let tooltipText
                                            if (caseCount != null) {
                                                tooltipText = zipCodeName + " (" + caseCount + " cases)"
                                            } else {
                                                tooltipText = zipCodeName
                                            }

                                            let x
                                            let y
                                            let centerCoordinate

                                            if (this.props.stateObj.chulaVistaOnly) {
                                                x = 0
                                                y = 0
                                                centerCoordinate = null
                                            } else {
                                                x = this.props.stateObj.zipCodeCoordinates[geoZip].x
                                                y = this.props.stateObj.zipCodeCoordinates[geoZip].y
                                                centerCoordinate = [this.props.stateObj.zipCodeCoordinates[geoZip].long, this.props.stateObj.zipCodeCoordinates[geoZip].lat]
                                            }

                                            locationObj = {
                                                id: geoZip,
                                                caseCount: Math.round(caseCountPerCapita100k),
                                                cases: caseCount,
                                                zipCodeName: zipCodeName,
                                                tooltip: tooltipText,
                                                centerCoordinate: centerCoordinate,

                                                x: x,
                                                y: y

                                            }

                                            console.log(locationObj.caseCount)

                                            let cellStyle = {
                                                fill: colorScale(locationObj.caseCount) ? colorScale(locationObj.caseCount) : "whitesmoke",
                                                stroke: "#333",
                                                strokeWidth: 1,
                                                outline: 'none'
                                            }

                                            let isSingleZip = false
                                            if (this.props.singleZip.length > 0) {
                                                if (this.props.singleZip.includes(locationObj.id)) {
                                                    isSingleZip = true
                                                }
                                            }
                                            let cellStyleHover = {
                                                fill: isSingleZip ? colorScale(locationObj.caseCount) : "transparent",
                                                stroke: "#1C446E",
                                                outline: 'none'
                                            }

                                            // TODO:  do not refresh this render when settooltipcontent is called
                                            return (
                                                <>
                                                    <Geography
                                                        style={{
                                                            default: cellStyle,
                                                            hover: cellStyleHover,
                                                            // pressed: cellStyleHover
                                                        }}


                                                        key={locationObj.id}
                                                        geography={geo}
                                                        // fill={}
                                                        // fill="black"
                                                        onClick={() => {

                                                            // this.setContent(locationObj.tooltip)
                                                            // setTimeout( () => {
                                                            //     this.setContent("")
                                                            // }, 2000);

                                                            this.handleClick(locationObj.id)


                                                        }


                                                        }

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

                                                    {locationObj.x && !this.props.stateObj.chulaVistaOnly &&
                                                    <Annotation
                                                        subject={locationObj.centerCoordinate}
                                                        dx={locationObj.x}
                                                        dy={locationObj.y}
                                                        connectorProps={{
                                                            stroke: "gray",
                                                            strokeWidth: 1,
                                                            strokeLinecap: "round"
                                                        }}
                                                    >
                                                        <text className="zip-area-label" x="0"
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
                                                </>
                                            );
                                        }
                                    })
                            }



                            {/*let cellStyle = geo.rsmKey == activeZip ? { fill: "#ff0000", stroke: "#ff0000", strokeWidth: 0.5, outline: 'none' } : { fill: "#666", stroke: "#FFF", strokeWidth: 0.5, outline: 'none' };*/}

                            {/*let cellStyleHover = { fill: "lightgray", stroke: "lightgray", strokeWidth: 0.5, outline: 'none' }*/}

                            {/*        return(*/}
                            {/*            <>*/}
                            {/*                <Geography*/}
                            {/*                    onClick={this.handleClick(geo)}*/}

                            {/*                    key={geo.rsmKey}*/}
                            {/*                    geography={geo}*/}
                            {/*                    onMouseEnter={() => {*/}
                            {/*                        const {NAME, POP_EST} = geo.properties;*/}
                            {/*                        setTooltipContent(`${NAME} — ${rounded(POP_EST)}`);*/}
                            {/*                    }}*/}
                            {/*                    onMouseLeave={() => {*/}
                            {/*                        setTooltipContent("");*/}
                            {/*                    }}*/}


                            {/*                    style={{*/}
                            {/*                        default: cellStyle,*/}
                            {/*                        hover: cellStyleHover,*/}
                            {/*                        pressed: cellStyle*/}
                            {/*                    }}*/}
                            {/*                />*/}

                            {/*            </>*/}

                            {/*        )*/}
                            {/*    })*/}
                            {/*}*/}

                        </Geographies>

                </ZoomableGroup>

                </ComposableMap>

            </>
        );

    }
};

export default MapChartHeatmap
