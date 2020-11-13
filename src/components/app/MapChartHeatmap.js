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
            content: ""
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

                <ComposableMap data-tip="" projection="geoAlbersUsa" projectionConfig={{scale: 100000}}
                               width={980}
                               height={551}
                               style={{
                                   width: "100%",
                                   height: "auto",
                               }}>
                    <ZoomableGroup center={[-117.192289, 32.769148]} zoom={1} minZoom={1} maxZoom={1} disablePanning>

                        <Geographies geography="./zipcodes.geojson">
                            {


                                ({geographies}) =>


                                    geographies.map((geo) => {



                                        let geoZip = geo.properties.zip
                                        // if((associatedPopulationsObj[geoZip] && this.props.stateObj.singleZip.length === 0) || this.props.stateObj.singleZip.includes(geoZip) == true) {
                                        if(associatedPopulationsObj[geoZip]) {

                                            positionCount += 1

                                            let locationObj = null
                                            let caseCount
                                            let caseCountPerCapita100k

                                            let coords = geo.geometry.coordinates

                                            let numDays = this.props.dateRangeArray.length
                                            let zipCodeName = this.props.stateObj.zipCodeNames[geoZip]

                                            if (zipCodeName == "La Jolla"){
                                                console.log(geo)
                                        }

                                            caseCount = this.props.zipCodeMap.get(geoZip)
                                            caseCountPerCapita100k = ((caseCount / associatedPopulationsObj[geoZip]) * 100000) / numDays



                                            let tooltipText
                                            if(caseCount != null){
                                                tooltipText = zipCodeName + " (" + caseCount + " cases)"
                                            }
                                            else{
                                                tooltipText = zipCodeName
                                            }
                                            let halfwayInt = Math.round((coords[0][0].length - 1) / 2)
                                            let latStart = coords[0][0][0][0]
                                            let latEnd = coords[0][0][halfwayInt][0]

                                            let longStart = coords[0][0][0][1]
                                            let longEnd = coords[0][0][halfwayInt][1]

                                            locationObj = {
                                                id: geoZip,
                                                caseCount: Math.round(caseCountPerCapita100k),
                                                cases: caseCount,
                                                zipCodeName: zipCodeName,
                                                tooltip: tooltipText,
                                                centerCoordinate: [(latStart + latEnd) / 2, (longStart + longEnd) / 2]
                                            }





                                            let cellStyle = { fill: colorScale(locationObj.caseCount), stroke: "#333", strokeWidth: 1, outline: 'none' }

                                            let cellStyleHover = { fill: "#1C446E", stroke: "#1C446E", outline: 'none' }


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
                                                            if(this.props.stateObj.chulaVistaOnly != true){
                                                                this.props.updateParentState({clearSelection: false})}
                                                                this.handleClick(locationObj.id)
                                                            }


                                                        }

                                                        onMouseEnter={() => {
                                                            this.setContent(locationObj.tooltip)
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

                                                    <Annotation
                                                        subject={locationObj.centerCoordinate}
                                                        dx={0}
                                                        dy={0}
                                                        connectorProps={{
                                                            stroke: "black",
                                                            strokeWidth: 2,
                                                            strokeLinecap: "round"
                                                        }}
                                                    >
                                                        <text x="0" textAnchor="end" alignmentBaseline="middle" fill="black">
                                                            {locationObj.zipCodeName}
                                                        </text>
                                                    </Annotation>
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
