import React, { useState, useEffect, Component} from "react";

import ServiceApi from "../../services/ServiceApi";

import {Table} from 'react-bootstrap';

import CanvasJSReact from "./canvasjs.react";


import {ComposableMap, Geographies, Geography, ZoomableGroup} from "react-simple-maps";

import ReactTooltip from 'react-tooltip'

import { scaleQuantize } from "d3-scale";
import { csv } from "d3-fetch";

import MapChart from "./MapChart";
import MapChartHeatmap from "./MapChartHeatmap";

const dateFormat = require('dateformat');

let CanvasJSChart = CanvasJSReact.CanvasJSChart;

class ResultsComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            allResults: new Map(),
            dateRangeArray: [],
            finalZipCountByDate: new Map(),
            optionsWeekly: {},
            optionsDaily: {},
            optionsAverage: {},
            zipCodeMap: new Map(),
            content: ""
        }
        this.refreshResults = this.refreshResults.bind(this)
        this.setContent = this.setContent.bind(this)
        this.updateZipCodesAllowed = this.updateZipCodesAllowed.bind(this)
        this.updateSingleZip = this.updateSingleZip.bind(this)

        ServiceApi.getAllResults()
            .then(
                (response) => {

                    let allResultsOrig = response.data.features;

                    let allResults = allResultsOrig.reverse()
                    //let allResults = allResultsOrig.slice(0, 25000)
                    //allResults.reverse()


                    let objCountByDate = new Map();


                    let zipCodesAllowed;

                    // if (this.props.stateObj.filter == true) {
                    //     zipCodesAllowed = [92109]
                    //     this.props.updateState({associatedPopulations: [49744]})
                    //
                    // }
                    // else
                        zipCodesAllowed = this.props.stateObj.zipCodesAllowed


                    let partialResults = []
                    for (let result of allResults) {

                        let data = result.properties

                        let zipCode = data.ziptext

                        let caseCount = data.case_count

                        let updateDate = data.updatedate

                        // Do not include any dates before 2020/05/15
                        if(updateDate == "2020/05/15 08:00:00+00")
                            break

                        if (zipCodesAllowed.includes(parseInt(zipCode))) {

                            // Only show results after cutoff date
                            if (caseCount == null || caseCount == 0) {
                                continue
                            }

                            partialResults.push(data)

                            /*
                            if (objCountByDate.has(dateString)) {
                                objCountByDate.set(dateString, objCountByDate.get(dateString) + caseCount)

                            } else {
                                objCountByDate.set(dateString, caseCount)
                            }

                             */


                        }
                    }

                    // objCountByDate = new Map([...objCountByDate.entries()].sort())

                    this.setState({allResults: partialResults})

                    this.refreshResults()

                }
            )
    }

    updateZipCodesAllowed(zipCodesAllowed){
        this.props.updateState({zipCodesAllowed: zipCodesAllowed})
    }

    updateSingleZip(zipCode){
        this.props.updateState({singleZip: zipCode})

    }




    refreshResults() {

        let startDate1 = this.props.stateObj.startDate

        let objCountByDate = new Map()
        let zipCodeByDate = new Map()

        let zipCodesAllowed = this.props.zipCodesAllowed
        let associatedPopulationsObj = this.props.stateObj.associatedPopulationsObj

        for (let result of this.state.allResults) {

            let data2 = result

            let zipCode = data2.ziptext

            if(this.props.stateObj.singleZip && zipCode != this.props.stateObj.singleZip){
                continue
            }

            let caseCount = data2.case_count

            let caseCountString = caseCount.toString()

            let updateDate = data2.updatedate
            let dateString = updateDate.slice(0, updateDate.indexOf(' '))

            // let date = new Date(updateDate.slice(0, updateDate.indexOf(' ')))
            // let dateString = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate()

            if (associatedPopulationsObj[zipCode] != null) {
                let currentDate
                if (this.props.stateObj.loadMore == true) {
                    currentDate = new Date("June 06, 2020")

                }
                else{
                     currentDate = new Date("August 01, 2020")
                    // currentDate = startDate1
                }


                let currentDateString = dateFormat(currentDate, "yyyy/mm/dd");

                // Only show results after cutoff date
                if (currentDateString >= dateString) {
                    continue
                }

                if (objCountByDate.has(dateString)) {
                    objCountByDate.set(dateString, objCountByDate.get(dateString) + caseCount)

                    zipCodeByDate.get(dateString).set(zipCode, caseCount)

                } else {
                    objCountByDate.set(dateString, caseCount)

                    let newMap = new Map()
                    newMap.set(zipCode, caseCount)

                    zipCodeByDate.set(dateString, newMap)
                }
            }
        }

        objCountByDate = new Map([...objCountByDate.entries()].sort())
        zipCodeByDate = new Map([...zipCodeByDate.entries()].sort())



        let finalCountByDate = new Map()
        let finalZipCountByDate = new Map()
        let finalCountByWeekAverage = new Map()

        // TRAVERSE objCountByDate and compare totals to one day prior
        let prevDayCount = 0
        let prevDayMap = new Map()

        for (let [dateString, singleDayMap] of zipCodeByDate) {
            let totalCount = 0
            let tempMap = new Map()

            for (let [zipCode, singleZipCount] of singleDayMap) {
                let prevDaySingleZipCount = 0
                if(prevDayMap.size != 0){
                    prevDaySingleZipCount = prevDayMap.get(zipCode)
                }
                tempMap.set(zipCode, singleZipCount - prevDaySingleZipCount)

                totalCount += singleZipCount

            }

            finalZipCountByDate.set(dateString, tempMap)

            finalCountByDate.set(dateString, totalCount - prevDayCount)


            // finalZipCodeByDateAverage.get(dateString).get()


            prevDayCount = totalCount
            prevDayMap = singleDayMap


        }

        // Delete first item of finalCountByDate
        finalCountByDate.delete(finalCountByDate.keys().next().value)
        finalZipCountByDate.delete(finalCountByDate.keys().next().value)

        let finalCountByDateAverage = new Map()

        let queue = []
        let finalCountByDateLength = finalCountByDate.size

        // TODO:  Move finalZipCountByDate to average below

        let i = 0
        for (let [dateString, result] of finalCountByDate) {
            i++
            queue.push(result)

            if(i > finalCountByDateLength - 5){
                while(queue.length > 3)
                    queue.shift()
            }
            else{
                if (queue.length > 10)
                    queue.shift()
            }


            let average = 0
            for (let value of queue) {
                average += value
            }
            average /= queue.length


            finalCountByDateAverage.set(dateString, average)




        }




        let startDate = new Date()
        startDate.setDate(startDate.getDate() - 9)
        startDate = dateFormat(startDate, "yyyy/mm/dd")
        let endDate = new Date()
        endDate.setDate(endDate.getDate() - 2)
        endDate = dateFormat(endDate, "yyyy/mm/dd")

        // let startDate = this.props.stateObj.startDate
        // let endDate =  new Date()
        // endDate.setDate(endDate.getDate() - 2)
        // endDate = dateFormat(endDate, "yyyy/mm/dd")

        let zipCodeMap = new Map()

        let getDaysArray = function(start, end) {
            let arr
            let dt
            for(arr=[], dt=new Date(start); dt<=end; dt.setDate(dt.getDate()+1)){
                arr.push(new Date(dt));
            }
            return arr;
        };

        let dateRangeArray = getDaysArray(new Date(startDate), new Date(endDate));

        let dateRangeLength = dateRangeArray.length





        let dataPointsArrayAverage = []
        let dataPointsArray = []
        let dataPointsArrayWeekly= []
        let dataPointsArrayPerCapita = []


        let populationTotal = 0

        if(this.props.stateObj.singleZip){
            populationTotal = this.props.stateObj.associatedPopulationsObj[this.props.stateObj.singleZip]
        }
        else {
            this.props.stateObj.zipCodesAllowed.forEach((zipCode) => {

                populationTotal += this.props.stateObj.associatedPopulationsObj[zipCode]
            })
        }

        let object = {}

        let objectAverage = {}

        let objectWeekly = {}

        let reversedMapAverage = new Map([...finalCountByDateAverage]);

        let count1 = 0
        reversedMapAverage.forEach((value, key) => {
            value = Math.round(value)
            count1++

            var keys = key.split('.'),
                last = keys.pop();
            keys.reduce((r, a) => r[a] = r[a] || {}, objectAverage)[last] = value;

            if(value > 0) {


                dataPointsArrayAverage.push({x: new Date(key), y: value})




            }

        });

        let reversedMap = new Map([...finalCountByDate]);

        reversedMap.forEach((value, key) => {
            var keys = key.split('.'),
                last = keys.pop();
            keys.reduce((r, a) => r[a] = r[a] || {}, object)[last] = value;

            if(value > 0) {
                dataPointsArray.push({x: new Date(key), y: value})

                dataPointsArrayPerCapita.push({x: new Date(key), y: Math.round((value / populationTotal) * 100000)})


            }

        });

        let reversedMapWeekly = new Map([...finalCountByDate].reverse());

        // Delete first week because it is incomplete
        // reversedMapWeekly.delete(reversedMapWeekly.keys().next().value)

        //let finalCountByDateLength = this.props.stateObj.finalCountByDate.length

        let count = 0
        let totalCases = 0
        let prevDateString = ""
        let xCount = 0;
        reversedMapWeekly.forEach((value, key) => {

            if(totalCases == 0){
                prevDateString = key
            }


            count++
            totalCases += value

            if (count % 7 == 0) {
                xCount++
                dataPointsArrayWeekly.push({x: new Date(prevDateString), y: totalCases, indexLabel: totalCases.toString()})

                totalCases = 0
            }



        });

        dataPointsArray.splice(0,10)

        dataPointsArrayAverage.splice(0,10)

        dataPointsArrayPerCapita.splice(0,10)

        // dataPointsArrayWeekly.splice(-1,1)

        let stripLines = [{
            startValue: new Date("2020/06/12"),
            endValue: new Date("2020/07/01"),
            label: "Bars open",
            labelFontSize: 24,
            labelAlign: "far",
            opacity: .8,
            color:"transparent",
            labelFontColor: "#f44336",
            showOnTop: true,
            labelBackgroundColor: "white",
            labelMaxWidth: 500,
        },{
            startValue: new Date("2020/08/20"),
            endValue: new Date("2020/09/08"),
            label: "SDSU begins",
            labelFontSize: 24,
            labelAlign: "far",
            opacity: .6,
            color:"transparent",
            labelFontColor: "#f44336",
            showOnTop: true,
            labelBackgroundColor: "white",
            labelMaxWidth: 1000,

        },{
            startValue: new Date("2020/10/30"),
            endValue: new Date("2020/11/6"),
            label: "Halloween",
            labelFontSize: 24,
            labelAlign: "far",
            opacity: .6,
            color:"transparent",
            labelFontColor: "#f44336",
            showOnTop: true,
            labelBackgroundColor: "white",
            labelMaxWidth: 1000,

        },{
            startValue: new Date("2020/11/25"),
            endValue: new Date("2020/11/30"),
            // label: "Thanksgiving",
            labelFontSize: 24,
            labelAlign: "center",
            opacity: .4,
            color:"transparent",
            labelFontColor: "#f44336",
            showOnTop: true,
            labelBackgroundColor: "white",
            labelMaxWidth: 1000,

        }
        ]






        const options_weekly = {
            animationEnabled: true,

            title:{
                text: "Cases per week",
                fontSize: 22

            },
            axisY2: {
                labelFontSize: 18
            },
            axisX: {
                valueFormatString: "M/D",
                // interval: 1,
                // intervalType: "week",
                stripLines:stripLines,
            },
            data: [{
                markerSize:8,
                color: "#11446d",
                type: "column",
                axisYType: "secondary",
                indexLabelFontColor: "darkSlateGray",
                indexLabelPlacement: "outside",
                yValueFormatString: "#",
                xValueFormatString: "MMM D, YYYY (DDDD)",
                dataPoints: dataPointsArrayWeekly
            }]
        }

        const options_average = {
            animationEnabled: true,
            title:{
                text: "Cases per day (average)",
                fontSize: 22
            },
            axisY2: {
                labelFontSize: 18
            },
            axisX: {
                // interval: 7,
                // intervalType: "day",
                valueFormatString: "M/D",
                stripLines:stripLines,
            },

            data: [{
                axisYType: "secondary",
                // indexLabelFontColor: "darkSlateGray",
                // indexLabelPlacement: "outside",
                yValueFormatString: "#",
                xValueFormatString: "MMM D, YYYY (DDDD)",
                type: "spline",
                dataPoints: dataPointsArrayAverage
                // dataPoints: dataPointsArray
            }]
        }

        const options_daily = {
            animationEnabled: true,
            title:{
                text: "Cases per capita (100k)",
                fontSize: 22
            },
            subtitles: [{
                text: "Purple Tier restrictions (>7 per 100k)"
            }],
            axisY2: {
                labelFontSize: 18
            },
            axisX: {
                valueFormatString: "M/D"
            },
            data: [{
                axisYType: "secondary",
                axisYIndex: 0, //defaults to 0
                yValueFormatString: "#",
                xValueFormatString: "MMM D, YYYY (DDDD)",
                type: "spline",
                dataPoints: dataPointsArrayPerCapita
            },/*{
                axisYIndex: 1, //defaults to 0
                yValueFormatString: "#",
                xValueFormatString: "MMM D, YYYY (DDDD)",
                type: "spline",
                dataPoints: dataPointsArrayPerCapita
            }*/]
        }













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


        this.setState({
            zipCodeMap: zipCodeMap,
            finalZipCountByDate: finalZipCountByDate,
            dateRangeArray: dateRangeArray,
            optionsWeekly: options_weekly,
            optionsDaily: options_daily,
            optionsAverage: options_average

        })


    }


    componentDidMount(){
        this.refreshResults()
    }
    componentDidUpdate(prevProps, prevState){
        if(prevProps.stateObj != this.props.stateObj) {
            this.refreshResults()
        }

    }

    setContent(obj){
        this.setState({content: obj})
    }




    render(){


        return(
            <>


                <br />
                <h3>Current risk per capita (past 7 days)</h3>
                <MapChartHeatmap singleZip={this.props.stateObj.singleZip} associatedPopulationsObj={this.props.stateObj.associatedPopulationsObj} dateRangeArray={this.state.dateRangeArray} zipCodeMap={this.state.zipCodeMap}
                                 finalZipCountByDate={this.state.finalZipCountByDate} zipCodesAllowed={this.props.zipCodesAllowed} setTooltipContent={this.setContent}
                                 updateSingleZip={this.updateSingleZip}

                                 updateZipCodesAllowed={(zipCodesAllowed) => {
                                     this.updateZipCodesAllowed(zipCodesAllowed)

                                 }}



                />


                {/*<h3>Show/hide specific regions</h3>*/}
                {/*<MapChart associatedPopulationsObj={this.props.stateObj.associatedPopulationsObj} dateRangeArray={this.state.dateRangeArray} zipCodeMap={this.state.zipCodeMap}*/}
                {/*          finalZipCountByDate={this.state.finalZipCountByDate} zipCodesAllowed={this.props.zipCodesAllowed} setTooltipContent={this.setContent}*/}
                {/*          updateZipCodesAllowed={(zipCodesAllowed) => {*/}
                {/*              this.updateZipCodesAllowed(zipCodesAllowed)*/}
                {/*              this.refreshResults()*/}
                {/*          }*/}
                {/*          }*/}
                {/*              />*/}



                <ReactTooltip>{this.state.content}</ReactTooltip>

                <div className="contributionChart">
                    <CanvasJSChart options={this.state.optionsWeekly} />
                    <br />
                    <CanvasJSChart options={this.state.optionsAverage} />
                    <br />
                    <CanvasJSChart options={this.state.optionsDaily} />
                </div>

                <br /> <br /> <br />







            </>

        )


    }


}
export default ResultsComponent