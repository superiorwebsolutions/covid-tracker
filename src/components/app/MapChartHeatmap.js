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
        "#9a311f",
        "#782618"
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

        // this.props.updateZipCodesAllowed([])

        // const [activeZip, setCount] = useState("");
        // let [zipCodeMap, setData] = useState(new Map());
        // let [finalZipCountByDate, setZipCountData] = useState(new Map());
        // let [dateRangeArray, setDateRange] = useState([]);


        // setData(props.zipCodeMap)
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

        return (
            <>
                <ReactTooltip>{this.state.content}</ReactTooltip>

                <ComposableMap data-tip="" projection="geoAlbersUsa" projectionConfig={{
                    scale: 90000,
                    // center: [-117.155, 32.769248],
                    // rotate: [, 0, 0]

                }}

                               width={600}
                               height={490}
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
                                        // if((associatedPopulationsObj[geoZip] && this.props.stateObj.singleZip.length === 0) || this.props.stateObj.singleZip.includes(geoZip) == true) {
                                        if (associatedPopulationsObj[geoZip]) {


                                            positionCount += 1

                                            let locationObj = null
                                            let caseCount
                                            let caseCountPerCapita100k

                                            let coords = geo.geometry.coordinates

                                            let numDays = this.props.dateRangeArray.length
                                            let zipCodeName = this.props.stateObj.zipCodeNames[geoZip]


                                            caseCount = this.props.zipCodeMap.get(geoZip)

                                            caseCountPerCapita100k = ((caseCount / associatedPopulationsObj[geoZip]) * 100000) / numDays


                                            let tooltipText
                                            if (caseCount != null) {
                                                tooltipText = zipCodeName + " (" + caseCount + " cases)"
                                            } else {
                                                tooltipText = zipCodeName
                                            }

                                            // let halfwayInt = Math.round((coords[0][0].length - 1) / 2)

                                            // if (true) {
                                            //     fetch("https://maps.googleapis.com/maps/api/geocode/json?address="+geoZip+',San Diego&key=AIzaSyCbjGrYMgeklBUA-PIRv87_YI1FeLivEmI')
                                            //         .then(response => response.json())
                                            //         .then(data => {
                                            //             // console.log(data)
                                            //             let lat = data.results[0].geometry.location.lat
                                            //             let lng = data.results[0].geometry.location.lng
                                            //             console.log(geoZip + ": {lat: " + lat + ", long: " + lng + "}")
                                            //             // const latitude = data.results.geometry.location.lat;
                                            //             // const longitude = data.results.geometry.location.lng;
                                            //             // console.log({latitude, longitude})
                                            //         })
                                            //
                                            //     // console.log(geo)
                                            //     // console.log(halfwayInt)
                                            // }

                                            // let latStart = coords[0][0][0][0]
                                            // let latEnd = coords[0][0][halfwayInt][0]
                                            //
                                            // let longStart = coords[0][0][0][1]
                                            // let longEnd = coords[0][0][halfwayInt][1]

                                            if(this.props.stateObj.chulaVistaOnly) {
                                                this.props.stateObj.zipCodeCoordinates[geoZip].x = 0
                                                this.props.stateObj.zipCodeCoordinates[geoZip].y = 0
                                            }

                                            locationObj = {
                                                id: geoZip,
                                                caseCount: Math.round(caseCountPerCapita100k),
                                                cases: caseCount,
                                                zipCodeName: zipCodeName,
                                                tooltip: tooltipText,
                                                centerCoordinate: [this.props.stateObj.zipCodeCoordinates[geoZip].long, this.props.stateObj.zipCodeCoordinates[geoZip].lat],

                                                x: this.props.stateObj.zipCodeCoordinates[geoZip].x,
                                                y: this.props.stateObj.zipCodeCoordinates[geoZip].y

                                            }


                                            let cellStyle = {
                                                fill: colorScale(locationObj.caseCount),
                                                stroke: "#333",
                                                strokeWidth: 1,
                                                outline: 'none'
                                            }

                                            let cellStyleHover = {fill: "#782618", stroke: "#1C446E", outline: 'none'}

                                            // TODO:  do not refresh this render when settooltipcontent is called
                                            return (
                                                <>
                                                    <Geography
                                                        key={locationObj.id}
                                                        geography={geo}
                                                        // fill={colorScale(locationObj ? locationObj.caseCount : "white")}
                                                        fill="black"
                                                        stroke="white"
                                                        onClick={() => {
                                                            this.handleClick(locationObj.id)
                                                        }


                                                        }

                                                        onMouseEnter={() => {
                                                            this.setContent(locationObj.tooltip)
                                                            setTimeout( () => {
                                                                this.setContent("")
                                                            }, 2000);
                                                        }}
                                                        onMouseLeave={() => {
                                                            this.setContent("")
                                                        }}

                                                        style={{
                                                            default: cellStyle,
                                                            hover: cellStyleHover,
                                                            // pressed: cellStyleHover
                                                        }}


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
