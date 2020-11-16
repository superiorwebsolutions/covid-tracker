import React, { useState, useEffect, Component} from "react";

import ServiceApi from "../../services/ServiceApi";

import CanvasJSReact from "./canvasjs.react";

import {stripLines} from "../../Constants";

import MapChartHeatmap from "./MapChartHeatmap";

const dateFormat = require('dateformat');

let CanvasJSChart = CanvasJSReact.CanvasJSChart;

class ResultsComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            // dateRangeArray: [],
            finalZipCountByDate: new Map(),
            optionsWeekly: {},
            optionsDaily: {},
            optionsAverage: {},
            zipCodeMap: new Map(),

        }

        this.allResults = new Map()
        this.latestDate = null



        this.refreshResults = this.refreshResults.bind(this)
        this.updateSingleZip = this.updateSingleZip.bind(this)
        this.updateParentState = this.updateParentState.bind(this)

        ServiceApi.getAllResults()
            .then(
                (response) => {

                    let latestDate = null

                    let allResultsOrig = response.data.features;

                    let allResults = allResultsOrig.reverse()

                    let partialResults = []
                    for (let result of allResults) {

                        let data = result.properties

                        let zipCode = data.ziptext

                        let caseCount = data.case_count

                        let updateDate = data.updatedate

                        // Do not include any dates before 2020/05/15
                        if(updateDate == "2020/05/15 08:00:00+00")
                            break

                        if (zipCode in this.props.associatedPopulationsObj || zipCode in this.props.chulaVistaPopulations) {

                            // Do not include days with no cases
                            if (caseCount == null) {
                                data.case_count = 0
                            }

                            partialResults.push(data)

                            if(latestDate == null)
                                this.latestDate = dateFormat(updateDate, "yyyy/mm/dd");

                        }
                    }


                    this.allResults = partialResults

                    // this.setState({
                    //     allResults: partialResults,
                    //     latestDate: latestDate
                    // })

                     this.refreshResults()

                }
            )
    }

    getNumDays(){
        let date1 = new Date(this.props.startDate)

        let date2 = new Date(this.latestDate)
        let diffTime = Math.abs(date2 - date1)
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 12;
    }

    updateSingleZip(zipCodeArray){
        this.props.updateState({singleZip: zipCodeArray})

    }
    updateParentState(newState){
        this.props.updateState(newState)
    }




    refreshResults() {

        let startDate = this.props.startDate
        startDate = dateFormat(startDate, "yyyy/mm/dd")

        let zipCodeByDate = new Map()

        let associatedPopulationsObj

        if(this.props.chulaVistaOnly === true)
            associatedPopulationsObj = this.props.chulaVistaPopulations
        else
            associatedPopulationsObj = this.props.associatedPopulationsObj


        let latestDate = null
        for (let result of this.allResults) {

            let data2 = result

            let zipCode = data2.ziptext

            if(this.props.singleZip.length != 0){
                if(this.props.singleZip.includes(zipCode) == false)
                    continue
            }

            let caseCount = data2.case_count

            let updateDate = data2.updatedate
            let dateString = updateDate.slice(0, updateDate.indexOf(' '))




            if (associatedPopulationsObj[zipCode] != null) {

                let currentDate
                if (this.props.loadMore == true) {
                    currentDate = new Date("June 06, 2020")
                }
                else{
                    currentDate = startDate
                }

                // Only show results more recent than cutoff date
                if (currentDate >= dateString)
                    continue

                if (zipCodeByDate.has(dateString)) {

                    zipCodeByDate.get(dateString).set(zipCode, caseCount)

                } else {

                    let newMap = new Map()

                    newMap.set(zipCode, caseCount)

                    zipCodeByDate.set(dateString, newMap)
                }
            }

            if(latestDate == null)
                latestDate = dateString


        }

        this.latestDate = latestDate

        zipCodeByDate = new Map([...zipCodeByDate.entries()].sort())

        let finalCountByDate = new Map()
        let finalZipCountByDate = new Map()
        let finalCountByWeekAverage = new Map()

        let zipCodeMap = new Map()

        // Traverse zipCodeByDate and compare total counts to one day prior
        let prevDayCount = 0
        let prevDayMap = new Map()
        let finalCountByDateAverage = new Map()
        let queue = []
        let finalCountByDateLength = zipCodeByDate.size
        let runningAverageNumDays = false

        // Allows for exact accuracy if report is only showing 7 days or less
        if(this.getNumDays() < 8)
            runningAverageNumDays = 1

        let index = 0
        zipCodeByDate.forEach(( singleDayMap, dateString) => {
            index++

            let totalCount = 0
            let tempMap = new Map()

            // Traverse each individual day in zipCodeByDate, in order to calculate totalCount per day
            for (let [zipCode, singleZipCount] of singleDayMap) {
                let prevDaySingleZipCount = 0

                if(prevDayMap.size != 0)
                    prevDaySingleZipCount = prevDayMap.get(zipCode)

                let currentDayCountZipCode = singleZipCount - prevDaySingleZipCount

                // Some data is corrupt, set those as zero
                if(currentDayCountZipCode < 0)
                    currentDayCountZipCode = 0

                tempMap.set(zipCode, currentDayCountZipCode)

                totalCount += singleZipCount

            }

            let currentDayCount = totalCount - prevDayCount

            // Some data is corrupt, set those as zero
            if(currentDayCount < 0)
                currentDayCount = 0

            finalCountByDate.set(dateString, currentDayCount)

            if(index > 10) {

                finalZipCountByDate.set(dateString, tempMap)

                // Populate zipCodeMap
                let singleDayMap = finalZipCountByDate.get(dateString)

                singleDayMap.forEach((caseCount, zipCode) => {

                    if (zipCodeMap.has(zipCode)) {
                        let prevSingleZipCount = zipCodeMap.get(zipCode)
                        if (!prevSingleZipCount)
                            prevSingleZipCount = 0

                        zipCodeMap.set(zipCode, (caseCount) + (prevSingleZipCount))
                    } else {
                        zipCodeMap.set(zipCode, (caseCount))
                    }
                })
            }


            // Populate finalCountByDateAverage


            queue.push(currentDayCount)

            // If index is within 5 most recent dates, change to 3-day average (from 10-day average)
            if(index > finalCountByDateLength - 5){
                while(queue.length > (runningAverageNumDays ? runningAverageNumDays : 3))
                    queue.shift()
            }
            else{
                if (queue.length > (runningAverageNumDays ? runningAverageNumDays : 10))
                    queue.shift()
            }

            let average = 0
            for (let value of queue) {
                average += value
            }
            average /= queue.length

            // if(index >= 11)
                finalCountByDateAverage.set(dateString, average)




            prevDayCount = totalCount
            prevDayMap = singleDayMap
        })

        console.log(finalZipCountByDate)

        // Delete first item of finalCountByDate (because of bad data).  No longer needed
        // finalCountByDate.delete(finalCountByDate.keys().next().value)
        // finalZipCountByDate.delete(finalZipCountByDate.keys().next().value)

        let dataPointsArrayAverage = []
        let dataPointsArray = []
        let dataPointsArrayWeekly= []
        let dataPointsArrayPerCapita = []

        let populationTotal = 0

        if(this.props.singleZip.length != 0){
            this.props.singleZip.forEach((zipCode) => {
                populationTotal += this.props.associatedPopulationsObj[zipCode]
            })
        }
        else {
            Object.keys(this.props.associatedPopulationsObj).forEach(( zipCode) => {
                // If chula vista zip codes should not be included, do not include in population total
                populationTotal += this.props.associatedPopulationsObj[zipCode]
            })
        }

        let reversedMapAverage = new Map([...finalCountByDateAverage]);
        reversedMapAverage.forEach((value, key) => {

            if(value == null)
                value = 0
            else
                value = Math.round(value)

            dataPointsArrayAverage.push({x: new Date(key), y: value})

        });

        let reversedMap = new Map([...finalCountByDateAverage]);
        reversedMap.forEach((value, key) => {

            if(value == null)
                value = 0

            dataPointsArray.push({x: new Date(key), y: value})

            let perCapita = Math.round((value / populationTotal) * 100000)

            dataPointsArrayPerCapita.push({x: new Date(key), y: perCapita})

        });


        let reversedMapWeekly = new Map([...finalCountByDate].reverse());

        // Delete first week because it is incomplete
        // reversedMapWeekly.delete(reversedMapWeekly.keys().next().value)

        //let finalCountByDateLength = this.props.finalCountByDate.length

        let count = 0
        let totalCases = 0
        let prevDateString = ""
        let xCount = 0;
        reversedMapWeekly.forEach((value, key) => {

            if(totalCases == 0)
                prevDateString = key

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


        let options_weekly = {
            animationEnabled: true,
            axisY2: {
                labelFontSize: 18,
                minimum: 0,
                // maximum: 1250
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
                xValueFormatString: "MMM D (DDDD)",
                dataPoints: dataPointsArrayWeekly
            }]
        }

        let options_average = {
            animationEnabled: true,
            axisY2: {
                labelFontSize: 18,
                minimum: 0
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
                xValueFormatString: "MMM D (DDDD)",
                type: "spline",
                dataPoints: dataPointsArrayAverage
                // dataPoints: dataPointsArray
            }]
        }

        let options_daily = {
            animationEnabled: true,
            axisY2: {
                labelFontSize: 18,
                minimum: 0,
                stripLines:[
                    {
                        startValue:7.9,
                        endValue:8.1,
                        color:"#b34b4b",
                        // labelBackgroundColor: "transparent",
                    }
                ]
            },
            axisX: {
                valueFormatString: "M/D"
            },
            data: [{
                axisYType: "secondary",
                axisYIndex: 0, //defaults to 0
                yValueFormatString: "#",
                xValueFormatString: "MMM D (DDDD)",
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

        this.setState({
            zipCodeMap: zipCodeMap,
            finalZipCountByDate: finalZipCountByDate,
            // dateRangeArray: dateRangeArray,
            optionsWeekly: options_weekly,
            optionsDaily: options_daily,
            optionsAverage: options_average

        })


    }


    componentDidMount(){
        // this.refreshResults()
    }

    componentDidUpdate = (prevProps, prevState) => {

        // Refresh results each time the query parameters change
        if(prevProps != this.props) {
            this.refreshResults()
        }

    };






    render(){

        if(this.state.finalZipCountByDate.size == 0)
            return (<></>)

        console.log("render ResultsComponent")
        console.log(this.state)


        // TODO:  Delete the validation below this

        const CHECK_VALIDATION = false

        if(CHECK_VALIDATION) {
            let obj = Object.fromEntries(this.state.zipCodeMap);

            function arrayEquals(a, b) {
                return !(Array.isArray(a) &&
                    Array.isArray(b) &&
                    a.length === b.length &&
                    a.every((val, index) => val === b[index]));
            }

            let validateObj = {"92037":389,"92101":1292,"92102":1038,"92103":480,"92104":674,"92105":1565,"92106":208,"92107":274,"92108":346,"92109":930,"92110":381,"92111":634,"92113":1757,"92115":1902,"92116":362,"92117":547,"92120":366,"92121":26,"92122":243,"92123":336,"92124":239,"92136":102,"92140":53,"92182":17}

            validateObj = Object.values(validateObj);
            obj = Object.values(obj)

            // console.log(obj)
            // console.log(validateObj)
            if (arrayEquals(obj, validateObj)) {
                console.log("CODE IS BROKEN, zipCodeMap is broken")
            }
        }

        // TODO:  Delete the validation ABOVE this



        return(
            <>


                <div className="map-wrapper">
                    {/*<h4>Current Risk <small>(showing past {this.getNumDays()} days)</small></h4>*/}

                        <MapChartHeatmap stateObj={this.props} singleZip={this.props.singleZip} chulaVistaPopulations={this.props.chulaVistaPopulations}
                        associatedPopulationsObj={this.props.associatedPopulationsObj} zipCodeMap={this.state.zipCodeMap}
                        finalZipCountByDate={this.state.finalZipCountByDate}
                        updateSingleZip={this.updateSingleZip}
                        updateParentState={this.updateParentState}


                        />



                    <h5><em>(Select regions above to filter results)</em></h5>
                </div>

                {/*<hr />*/}
                {/*<br />*/}

                {/*<h5 className="graphs-below">Graphs below represent all cases in the selected regions</h5>*/}

                <div className="contributionChart">
                    {this.getNumDays() > 20 &&
                    <>
                        <h5>Cases Per Week {this.props.singleZip.length > 0 &&  <small>(selected regions only)</small>}</h5>
                        <CanvasJSChart options={this.state.optionsWeekly} />
                        <br />
                    </>
                    }

                    <h5>Cases Per Day (averaged) {this.props.singleZip.length > 0 &&  <small>(selected regions only)</small>}</h5>
                    <CanvasJSChart options={this.state.optionsAverage} />

                    <br />
                    <h5>Cases Per Capita (100k) {this.props.singleZip.length > 0 &&  <small>(selected regions only)</small>}</h5>
                    <small>Purple Tier restrictions (>7 per 100k)</small>
                    <CanvasJSChart options={this.state.optionsDaily} />

                </div>

                <br /> <br /> <br />







            </>

        )


    }


}
export default ResultsComponent