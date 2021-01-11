import React, {Component} from "react";

import CanvasJSReact from "../../assets/canvasjs.react";
import {stripLines} from "../../Constants";
import ServiceApi from "../../services/ServiceApi";


let CanvasJSChart = CanvasJSReact.CanvasJSChart;


class CountyResultsComponent extends Component{

    constructor(props) {
        super(props);

        this.state = {

        }
    }

    componentDidMount() {
        // After zip results are rendered, then render the county stats
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

                    this.refreshCountyResults()
                }
            )
    }

    refreshCountyResults(){
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
                    while(queueObj[fieldName].length > (runningAverageNumDays ? runningAverageNumDays : 7))
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

        var total = 0

        let averageOffset = 1

        if(fieldName == 'newCases'){
            numOfDays = 14
            dateChunk = 1
        }
        if(dateChunk == null)
            dateChunk = 7


        if(numOfDays == null)
            numOfDays = 14


        let dataPointsArrayStatsLength = dataPointsArrayStats.length
        let remainder = dataPointsArrayStatsLength % dateChunk


        for(var i = numOfDays; i < dataPointsArrayStatsLength + averageOffset; i++) {
            // total = 0

            // Use 3 day running average, if within 7 days of today
            if(i > dataPointsArrayStatsLength - 7)
                numOfDays = 7

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
        dataPointsArrayAverageStats.splice(0, dateChunk === 1 ? 20 : 2)

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

    render(){
        return(
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
        )
    }
}
export default CountyResultsComponent