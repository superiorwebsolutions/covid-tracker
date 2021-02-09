import React, {Component} from "react";

import ServiceApi from "../../services/ServiceApi";

import CanvasJSReact from "../../assets/canvasjs.react";

import {stripLines, associatedPopulationsObj, chulaVistaPopulations, optionsWeeklyTemp, optionsAverageTemp, optionsDailyTemp} from "../../Constants";

import MapChartHeatmap from "./MapChartHeatmap";
import SortedRiskByZipCode from "./SortedRiskByZipCode";
import CountyResultsComponent from "./CountyResultsComponent";

const dateFormat = require('dateformat');

let CanvasJSChart = CanvasJSReact.CanvasJSChart;

class ResultsComponent extends Component {

    constructor(props) {
        super(props);

        this.state = {
            finalZipCountByDate: new Map(),
            optionsWeekly: {},
            optionsDaily: {},
            optionsAverage: {},
            zipCodeMap: new Map(),
            riskLevel: 1,
        }

        this.allResults = new Map()
        this.allResultsStats = new Map()
        this.latestDate = null

        this.updateParentState = this.updateParentState.bind(this)


    }

    getNumDays(){
        let date1 = new Date(this.props.startDate)

        let date2 = new Date(this.latestDate)
        let diffTime = Math.abs(date2 - date1)
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 12;
    }

    updateParentState(newState){
        this.props.updateState(newState)
    }

    componentDidMount(){

        // Gets the raw API data from the SanGIS database
        ServiceApi.getAllResults().then((response) => {


                let latestDate = null

                let allResultsOrig = response.data.features;

                let allResults = allResultsOrig.reverse()

                let partialResults = []
                for (let result of allResults) {

                    let data = result.properties



                    let zipCode = data.ziptext

                    if(zipCode == null)
                        continue

                    // Strip the timestamp off the end of the date string
                    let updateDate = data.updatedate.slice(0, data.updatedate.indexOf('T'))
                    updateDate = dateFormat(updateDate, "yyyy/mm/dd")

                    data.updatedate = updateDate

                    // Do not include any dates before 2020/05/15
                    if(updateDate == "2020/05/15")
                        break

                    if (zipCode in associatedPopulationsObj || zipCode in chulaVistaPopulations) {
                        // Do not include days with no cases
                        if (data.case_count == null)
                            data.case_count = 0

                        partialResults.push(data)

                        if(latestDate == null)
                            latestDate = dateFormat(updateDate, "yyyy/mm/dd");

                    }
                }

                this.allResults = partialResults
                this.latestDate = latestDate

                // Calculations and populate the map
                this.refreshResults()

            }
        ).catch(function (error) {
            alert("San Diego county is updating its database, please check back in an hour.");
        });
    }

    componentDidUpdate = (prevProps, prevState) => {

        // Refresh results each time the query parameters change
        if(prevProps != this.props) {
             this.refreshResults()
        }
    };

    refreshResults() {

        let startDate = this.props.startDate
        startDate = dateFormat(startDate, "yyyy/mm/dd")

        let zipCodeByDate = new Map()

        let associatedPopulations

        if(this.props.chulaVistaOnly === true)
            associatedPopulations = chulaVistaPopulations
        else
            associatedPopulations = associatedPopulationsObj


        let latestDate = null
        for (let result of this.allResults) {

            let data2 = result

            let zipCode = data2.ziptext

            if(this.props.singleZip.length > 0){
                if(this.props.singleZip.includes(zipCode) === false)
                    continue
            }

            let caseCount = data2.case_count

            let updateDate = data2.updatedate

            let dateString = updateDate

            if (associatedPopulations[zipCode] != null) {

                let currentDate = startDate

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

                if(prevDayMap.size !== 0)
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

            // Skip the first 10, because those are only needed for the averaging
            if(index > 10) {

                // Populate finalZipCountByDate
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

            finalCountByDateAverage.set(dateString, average)



            prevDayCount = totalCount
            prevDayMap = singleDayMap
        })

        // Delete first item of finalCountByDate (because of bad data).  No longer needed
        finalCountByDate.delete(finalCountByDate.keys().next().value)
        // finalZipCountByDate.delete(finalZipCountByDate.keys().next().value)

        let dataPointsArrayAverage = []
        let dataPointsArray = []
        let dataPointsArrayWeekly= []
        let dataPointsArrayPerCapita = []

        let populationTotal = 0

        if(this.props.singleZip.length > 0){
            this.props.singleZip.forEach((zipCode) => {
                populationTotal += associatedPopulationsObj[zipCode]
            })
        }
        else {
            Object.keys(associatedPopulationsObj).forEach(( zipCode) => {
                // If chula vista zip codes should not be included, do not include in population total
                populationTotal += associatedPopulationsObj[zipCode]
            })
        }

        finalCountByDateAverage.forEach((value, key) => {

            if(value == null)
                value = 0
            else
                value = Math.round(value)

            dataPointsArrayAverage.push({x: new Date(key), y: value})

        });

        finalCountByDateAverage.forEach((value, key) => {

            if(value == null)
                value = 0

            dataPointsArray.push({x: new Date(key), y: value})

            let perCapita = Math.round((value / populationTotal) * 100000)

            dataPointsArrayPerCapita.push({x: new Date(key), y: perCapita})

        });

        let count = 0
        let totalCases = 0
        let prevDateString = ""
        let indexLabel = ""
        let toggleLabel

        if(finalCountByDate.size > 120)
            toggleLabel = true
        else
            toggleLabel = false

        // Reverse finalCountByDate in order to correctly count weekly amounts
        let reversedMapWeekly = new Map([...finalCountByDate].reverse());
        reversedMapWeekly.forEach((value, key) => {

            if(totalCases == 0)
                prevDateString = key

            count++
            totalCases += value

            if (count % 7 == 0) {
                // Toggle indexLabel between off and on

                if(toggleLabel)
                    if(indexLabel == "")
                        indexLabel = totalCases.toString()
                    else
                        indexLabel = ""
                else
                    indexLabel = totalCases.toString()


                dataPointsArrayWeekly.push({x: new Date(prevDateString), y: totalCases, indexLabel: indexLabel})

                totalCases = 0
            }
        });


        // Calculate risk level (total cases in past 10 days)
        // let latestWeekCount = dataPointsArrayWeekly[0].y + (dataPointsArrayWeekly[1].y * 0.71)
        // Using 1 week instead of 10 days (the comment above)
        let latestWeekCount = dataPointsArrayWeekly[0].y

        // Multiply by 3, since we're only catching about 1/3rd of cases
        let perCapita = ((latestWeekCount / populationTotal) ) * 3
        let riskLevel = Math.round((perCapita + Number.EPSILON) * 10000) / 10000

        riskLevel = Math.round(1 / riskLevel)

        dataPointsArray.splice(0,10)

        dataPointsArrayAverage.splice(0,10)

        dataPointsArrayPerCapita.splice(0,10)

        // dataPointsArrayWeekly.splice(-1,1)

        // optionsWeeklyTemp.data[0].dataPoints = dataPointsArrayWeekly
        // optionsAverageTemp.data[0].dataPoints = dataPointsArrayAverage
        // optionsDailyTemp.data[0].dataPoints = dataPointsArrayPerCapita

        // Used in ResultsComponent
        let optionsWeeklyTemp = {
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

        let optionsAverageTemp = {
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

        let optionsDailyTemp = {
            animationEnabled: true,
            axisY2: {
                labelFontSize: 18,
                minimum: 0,
                stripLines:[
                    {
                        startValue:19.9,
                        endValue:200,
                        color:"#fdd4d4",
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
            optionsWeekly: optionsWeeklyTemp,
            optionsDaily: optionsDailyTemp,
            optionsAverage: optionsAverageTemp,
            riskLevel: riskLevel,
        })
    }


    render(){

        if(this.state.finalZipCountByDate.size == 0)
            return (<></>)


        return(
            <>

                <h5 className="riskLevel">1 of every {this.state.riskLevel} people infected <span>(past 7 days)</span></h5>

                <div className="map-wrapper">
                    <MapChartHeatmap {...this.props} {...this.state} updateParentState={this.updateParentState} />

                    <h5><em>(Select regions above to filter results)</em></h5>
                </div>

                <div className="spacing"></div>


                <div className="contributionChart">

                    {this.getNumDays() > 20 &&
                    <>
                        <h5>Cases per week{this.props.singleZip.length > 0 && <small><br />(selected regions only)</small>}</h5>
                        <CanvasJSChart options={this.state.optionsWeekly} />
                        <br />
                    </>
                    }

                    <h5>Daily Cases (averaged){this.props.singleZip.length > 0 && <small><br />(selected regions only)</small>}</h5>
                    <CanvasJSChart options={this.state.optionsAverage} />

                    <br />
                    <h5>Cases per capita (100k){this.props.singleZip.length > 0 && <small><br />(selected regions only)</small>}</h5>
                    <small className="stay-home">Stay home if >20 per capita </small>
                    <CanvasJSChart options={this.state.optionsDaily} />

                </div>

                <br />

                <div className="spacing"></div>

                <SortedRiskByZipCode finalZipCountByDate={this.state.finalZipCountByDate} zipCodeMap={this.state.zipCodeMap}></SortedRiskByZipCode>

                <div className="spacing"></div>


                <hr />

                <div className="spacing"></div>

                <CountyResultsComponent></CountyResultsComponent>

            </>

        )


    }


}
export default ResultsComponent