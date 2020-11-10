import React, {memo, useEffect, useState} from "react";
import {
    ZoomableGroup,
    ComposableMap,
    Geographies,
    Geography
} from "react-simple-maps";
import ReactTooltip from "react-tooltip";

const rounded = num => {
    if (num > 1000000000) {
        return Math.round(num / 100000000) / 10 + "Bn";
    } else if (num > 1000000) {
        return Math.round(num / 100000) / 10 + "M";
    } else {
        return Math.round(num / 100) / 10 + "K";
    }
};

let dateFormat = require('dateformat');

const MapChart = (props) => {

    const finalZipCountByDate = props.finalZipCountByDate
    const setTooltipContent = props.setTooltipContent

    const [activeZip, setCount] = useState("");
    let [zipCodeMap, setData] = useState(new Map());

    const handleClick = geo => () => {
        setCount(geo.rsmKey)
        // setTooltipContent("yes")
        console.log(geo);
    };


    let [dateRangeArray, setDateRange] = useState([]);


    useEffect(() => {

        // let zipCodeByDate = this.state.zipCodeByDate

        let startDate = "2020/10/01"
        let endDate = "2020/11/09"



        let getDaysArray = function(start, end) {
            let arr
            let dt
            for(arr=[], dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
                arr.push(new Date(dt));
            }
            return arr;
        };

        let dateRangeArray = getDaysArray(new Date(startDate), new Date(endDate));

        dateRangeArray.forEach((date) => {
            let dateFormatted = dateFormat(date, "yyyy/mm/dd")




            if(finalZipCountByDate.has(dateFormatted)) {
                let singleDayMap = finalZipCountByDate.get(dateFormatted)

                singleDayMap.forEach((caseCount, zipCode) => {

                    if (zipCodeMap.has(zipCode)) {
                        let prevSingleZipCount = zipCodeMap.get(zipCode)

                        zipCodeMap.set(zipCode, parseInt(caseCount) + parseInt(prevSingleZipCount))
                    } else {
                        zipCodeMap.set(zipCode, parseInt(caseCount))
                    }


                })
            }



        })
        console.log(props)
        console.log(zipCodeMap)
        setDateRange(dateRangeArray)
        setData(zipCodeMap)

        // this.setState({zipCodeMap: zipCodeMap})


        // if(zipCodeByDate.has("2020/11/05")) {
        //
        //     let zipCountArray = zipCodeByDate.get("2020/11/05")
        //
        //     data = zipCountArray
        //
        // }
    }, []);

    return (
        <>
            <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 100000 }}
                           width={980}
                           height={551}
                           style={{
                               width: "100%",
                               height: "auto",
                           }}>
                <ZoomableGroup center={[ -117.192289, 32.769148  ]} disablePanning>

                    <Geographies geography="./zipcodes.geojson">
                        {


                            ({ geographies }) =>


                            geographies.map((geo) => {

                                let geoZip = geo.properties.zip


                                let cur = null
                                if(zipCodeMap.has(geoZip)){
                                    let caseCount = zipCodeMap.get(geoZip)
                                    let numDays = dateRangeArray.length


                                    let caseCountPerCapita100k = ((caseCount / props.associatedPopulationsObj[geoZip.toString()]) * 100000) / numDays

                                    cur = {id: geoZip, caseCount: caseCountPerCapita100k}
                                }


                                if(cur) {
                                    return (
                                        <Geography
                                            key={geo.rsmKey}
                                            geography={geo}
                                            // fill={colorScale(cur ? cur.caseCount : "#EEE")}

                                            // onMouseEnter={() => {
                                            //     const { NAME, POP_EST } = geo.properties;
                                            //     setTooltipContent('hi')
                                            //     // setTooltipContent(`${NAME} — ${rounded(POP_EST)}`);
                                            // }}
                                            // onMouseLeave={() => {
                                            //     setTooltipContent("");
                                            // }}

                                        />
                                    );
                                }
                            })
                        }

                        {/*        let cellStyle = geo.rsmKey == activeZip ? { fill: "#ff0000", stroke: "#ff0000", strokeWidth: 0.5, outline: 'none' } : { fill: "#666", stroke: "#FFF", strokeWidth: 0.5, outline: 'none' };*/}

                        {/*        let cellStyleHover = { fill: "lightgray", stroke: "lightgray", strokeWidth: 0.5, outline: 'none' }*/}

                        {/*        return(*/}
                        {/*            <>*/}
                        {/*                <Geography*/}
                        {/*                    onClick={handleClick(geo)}*/}

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
};

export default memo(MapChart);
