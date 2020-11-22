import React, {Component} from "react";

import ServiceApi from "../../services/ServiceApi";

import CanvasJSReact from "../../assets/canvasjs.react";

import {stripLines, associatedPopulationsObj, chulaVistaPopulations} from "../../Constants";

import MapChartHeatmap from "./MapChartHeatmap";
import SortedRiskByZipCode from "./SortedRiskByZipCode";

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

        }

        this.allResults = new Map()
        this.allResultsStats = new Map()
        this.latestDate = null

        this.updateParentState = this.updateParentState.bind(this)





        ServiceApi.getAllResults()
            .then((response) => {

                let latestDate = null

                let allResultsOrig = response.data.features;

                let allResults = allResultsOrig.reverse()

                let partialResults = []
                for (let result of allResults) {

                    let data = result.properties

                    let zipCode = data.ziptext

                    // Strip the timestamp off the end of the date string
                    let updateDate = data.updatedate.slice(0, data.updatedate.indexOf(' '))

                    data.updatedate = updateDate

                    // Do not include any dates before 2020/05/15
                    if(updateDate == "2020/05/15")
                        break

                    if (zipCode in associatedPopulationsObj || zipCode in chulaVistaPopulations) {

                        // Do not include days with no cases
                        if (data.case_count == null) {
                            data.case_count = 0
                        }

                        partialResults.push(data)

                        if(latestDate == null) {

                            latestDate = dateFormat(updateDate, "yyyy/mm/dd");

                        }

                    }
                }

                this.allResults = partialResults
                this.latestDate = latestDate

                this.refreshResults()

                ServiceApi.getCountyStats()
                    .then((response) => {

                            let allResultsOrig = response.data.features;

                            let allResults = allResultsOrig.reverse()

                            let partialResultsStats = []
                            for (let result of allResults) {

                                let data = result.properties

                                // Strip the timestamp off the end of the date string
                                let updateDate = data.date.slice(0, data.date.indexOf(' '))

                                data.date = updateDate

                                // Do not include any dates before 2020/05/15
                                // if(updateDate == "2020/05/15")
                                //     break


                                // Do not include days with no cases
                                if (data.case_count == null) {
                                    data.case_count = 0
                                }

                                partialResultsStats.push(data)

                            }

                            this.allResultsStats = partialResultsStats

                            // console.log(partialResultsStats)

                            this.refreshResultsStats()
                        }
                    )

            }
        )
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
        // this.refreshResults()
    }

    componentDidUpdate = (prevProps, prevState) => {

        // Refresh results each time the query parameters change
        if(prevProps != this.props) {
             this.refreshResults()
        }

    };

    refreshResultsStats(){
        // let startDate = this.props.startDate
        // startDate = dateFormat(startDate, "yyyy/mm/dd")

        let statsByDate = new Map()

        for (let result of this.allResultsStats) {
            let data = {}

            data.date = result.date

            data.newCases = result.newcases

            data.rollingPercentPositive = result.rolling_perc_pos_cases

            data.age20_29 = result.age20_29
            data.age30_39 = result.age30_39
            data.age40_49 = result.age40_49



            data.hospitalized = result.hospitalized
            data.icu = result.icu
            data.deaths = result.deaths

            statsByDate.set(data.date, data)


        }

        statsByDate = new Map([...statsByDate.entries()].sort())

        let prevDayObj = {hospitalized: 0, icu: 0, age20_29: 0, age30_39: 0, age40_49: 0}

        const compareFieldNames = ['hospitalized', 'icu', 'deaths', 'age20_29', 'age30_39', 'age40_49']

        const regularFieldNames = ['date', 'newCases', 'rollingPercentPositive']


        let objState = {}

        let finalStatsByDate = new Map()

        let queueObj = {}
        for(let fieldName of compareFieldNames){
            queueObj[fieldName] = []
        }

        let runningAverageNumDays = null

        let statsByDateLength = statsByDate.size

        let index = 0
        statsByDate.forEach(( singleDayObj, dateString) => {
            index++

            // if(prevDayObj.hospitalized == null)
            //     prevDayObj.hospitalized = singleDayObj.hospitalized

            let tempObj = {}

            for(let fieldName of compareFieldNames){

                tempObj[fieldName] = singleDayObj[fieldName] - prevDayObj[fieldName]

                // TODO:  Delete average here, do not need it anymore

                // Populate finalCountByDateAverage
                queueObj[fieldName].push(tempObj[fieldName])

                // If index is within 5 most recent dates, change to 3-day average (from 10-day average)
                if(index > statsByDateLength - 5){
                    while(queueObj[fieldName].length > (runningAverageNumDays ? runningAverageNumDays : 5))
                        queueObj[fieldName].shift()
                }
                else{
                    if (queueObj[fieldName].length > (runningAverageNumDays ? runningAverageNumDays : 14))
                        queueObj[fieldName].shift()
                }

                let average = 0
                for (let value of queueObj[fieldName]) {
                    average += value
                }
                average /= queueObj[fieldName].length

                tempObj[fieldName + '_average'] = average
            }

            for(let fieldName of regularFieldNames){
                tempObj[fieldName] = singleDayObj[fieldName]
            }

            // Copy singleDayObj into prevDayObj
            Object.assign(prevDayObj, singleDayObj);


            finalStatsByDate.set(dateString, tempObj)


        })

        for(let fieldName of compareFieldNames.concat(['newCases'])){

            objState[fieldName + 'Chart'] = this.getChartByFieldName(finalStatsByDate, fieldName, fieldName == 'age20_29' ? 1 : null)
        }


        this.setState(objState)

    }


    getChartByFieldName(finalStatsByDate, fieldName, dateChunk){


        let dataPointsArrayStats = []

        let numOfDays

        if(dateChunk === 1){
            numOfDays = 14
        }


        finalStatsByDate.forEach((singleDayObj, key) => {

            let value = singleDayObj[fieldName]

            if(dateChunk === 1) {
                // value += singleDayObj['age30_39']
                value = (value / singleDayObj['newCases']) * 100

            }



            if(value == null)
                value = 0
            else
                value = Math.round(value)





            dataPointsArrayStats.push({x: new Date(key), y: value})


        });

        let dataPointsArrayAverageStats = []

        // dataPointsArrayStats.splice(0,200)

        if(numOfDays == null)
            numOfDays = 14

        var total = 0

        let averageOffset = 1

        if(fieldName == 'newCases'){
            numOfDays = 14
            dateChunk = 1
        }
        if(dateChunk == null)
            dateChunk = 7


        let dataPointsArrayStatsLength = dataPointsArrayStats.length
        let remainder = dataPointsArrayStatsLength % dateChunk


        for(var i = numOfDays; i < dataPointsArrayStatsLength + averageOffset; i++) {
            // total = 0

            if(i > dataPointsArrayStatsLength - 7)
                numOfDays = 3

            for(var j = (i - numOfDays); j < i; j++) {
                total += dataPointsArrayStats[j].y;
            }
            if(i % dateChunk == remainder) {
                dataPointsArrayAverageStats.push({
                    x: dataPointsArrayStats[i - averageOffset].x,
                    y: total / numOfDays
                });

                total = 0;
            }
        }


        // Remove first few entries, start in April
        dataPointsArrayAverageStats.splice(0, 20)




        let chart = {
            axisY2: {
                labelFontSize: 18,
                minimum: 0
            },
            axisX: {
                // interval: 7,
                // intervalType: "week",
                valueFormatString: "M/D",
                stripLines:stripLines,
            },

            data: [
                {
                    axisYType: "secondary",
                    yValueFormatString: "#",
                    xValueFormatString: "MMM D (DDDD)",
                    type: "spline",
                    dataPoints: dataPointsArrayAverageStats
                } ]
        }


        return chart
    }







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

        // Reverse finalCountByDate in order to correctly count weekly amounts
        let reversedMapWeekly = new Map([...finalCountByDate].reverse());
        reversedMapWeekly.forEach((value, key) => {

            if(totalCases == 0)
                prevDateString = key

            count++
            totalCases += value

            if (count % 7 === 0) {
                dataPointsArrayWeekly.push({x: new Date(prevDateString), y: totalCases, indexLabel: totalCases.toString()})

                totalCases = 0
            }
        });

        dataPointsArray.splice(0,10)

        dataPointsArrayAverage.splice(0,10)

        dataPointsArrayPerCapita.splice(0,10)

        // dataPointsArrayWeekly.splice(-1,1)


        let optionsWeekly = {
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

        let optionsAverage = {
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

        let optionsDaily = {
            animationEnabled: true,
            axisY2: {
                labelFontSize: 18,
                minimum: 0,
                stripLines:[
                    {
                        startValue:19.9,
                        endValue:100,
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
            optionsWeekly: optionsWeekly,
            optionsDaily: optionsDaily,
            optionsAverage: optionsAverage

        })
    }


    render(){

        if(this.state.finalZipCountByDate.size == 0)
            return (<></>)

        // console.log("render ResultsComponent")
        // console.log(this.state)


        return(
            <>


                <div className="map-wrapper">
                    <MapChartHeatmap {...this.props} {...this.state} updateParentState={this.updateParentState} />

                    <h5><em>(Select regions above to filter results)</em></h5>
                </div>

                <div className="spacing"></div>
                <div className="spacing"></div>
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
                <div className="spacing"></div>
                <div className="spacing"></div>

                <SortedRiskByZipCode finalZipCountByDate={this.state.finalZipCountByDate} zipCodeMap={this.state.zipCodeMap}></SortedRiskByZipCode>

                <div className="spacing"></div>
                <div className="spacing"></div>
                <div className="spacing"></div>


                <hr />
                <br />

                <div className="contributionChart">


                    <h4>Entire County Stats</h4>

                    <h5>Daily Cases<br /><small>(entire SD county)</small></h5>
                    <CanvasJSChart options={this.state.newCasesChart} />
                    <br />

                    <h5>Weekly Hospitalizations<br /><small>(entire SD county)</small></h5>
                    <CanvasJSChart options={this.state.hospitalizedChart} />
                    <br />


                    <h5>Weekly ICU<br /><small>(entire SD county)</small></h5>
                    <CanvasJSChart options={this.state.icuChart} />

                    <br />
                    <h5>Weekly Deaths<br /><small>(entire SD county)</small></h5>
                    <CanvasJSChart options={this.state.deathsChart} />

                    <br />
                    <h5>Percentage of all cases<br />caused by ages 20-29</h5>
                    <CanvasJSChart options={this.state.age20_29Chart} />
                    <br />

                </div>

            </>

        )


    }


}
export default ResultsComponent