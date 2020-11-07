import React, {Component} from "react";

import ServiceApi from "../../services/ServiceApi";

import {Table} from 'react-bootstrap';

import CanvasJSReact from "./canvasjs.react";
let CanvasJSChart = CanvasJSReact.CanvasJSChart;


// import CanvasJSReact from 'canvasjs.react';
// var CanvasJS = CanvasJSReact.CanvasJS;
// var CanvasJSChart = CanvasJSReact.CanvasJSChart;


class ResultsComponent extends Component {

    constructor(props) {
        super(props);

        this.refreshResults = this.refreshResults.bind(this)
    }




    refreshResults() {

        ServiceApi.getAllResults()
            .then(
                (response) => {

                    let allResultsOrig = response.data.features;
                    allResultsOrig.reverse()

                    let allResults = allResultsOrig.slice(0, 25000)
                    allResults.reverse()


                    let objCountByDate = new Map();
                    let finalCountByDate = new Map()

                    let zipCodesAllowed;

                    if (this.props.stateObj.filter == true) {
                        zipCodesAllowed = [92109]
                        this.props.updateState({associatedPopulations: [49744]})

                    }
                    else
                        zipCodesAllowed = this.props.stateObj.zipCodesAllowed



                    for (let result of allResults) {

                        let data2 = result.properties

                        let zipCode = data2.ziptext


                        let caseCount = data2.case_count


                        let updateDate = data2.updatedate
                        let dateString = updateDate.slice(0, updateDate.indexOf(' '))


                        //let dateString = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();



                        if (zipCodesAllowed.includes(parseInt(zipCode))) {
                            let currentDate
                            if (this.props.stateObj.loadMore == true) {
                                currentDate = new Date("May 25, 2020")

                            }
                            else{
                                currentDate = new Date("August 01, 2020")
                            }



                            let dateFormat = require('dateformat');
                            let currentDateString = dateFormat(currentDate, "yyyy/mm/dd");

                            // Only show results after cutoff date
                            if (caseCount == null || caseCount == 0 || currentDateString >= dateString) {
                                continue
                            }

                            if (objCountByDate.has(dateString)) {
                                objCountByDate.set(dateString, objCountByDate.get(dateString) + caseCount)

                            } else {
                                objCountByDate.set(dateString, caseCount)
                            }


                        }
                    }
                    objCountByDate = new Map([...objCountByDate.entries()].sort())


                    //console.log(allResults)


                    // TRAVERSE objCountByDate and compare totals to one day prior
                    let prevDayCount = 0
                    for (let [dateString, result] of objCountByDate) {
                        finalCountByDate.set(dateString, result - prevDayCount)

                        prevDayCount = result

                    }


                    let finalCountByDateAverage = new Map()

                    let finalCountByWeekAverage = new Map()

                    let queue = []
                    let finalCountByDateLength = finalCountByDate.size

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



                    // Calculate weekly totals
                    let count = 0
                    let totalCases = 0
                    let prevDateString = ""
                    for (let [dateString, result] of objCountByDate) {
                        count += 1
                        totalCases += result

                        //let average = 0

                        //average /= queue.length
                        if (count % 7 == 0) {

                            finalCountByWeekAverage.set(prevDateString + " to " + dateString, totalCases)
                            prevDateString = dateString
                            totalCases = 0
                        }


                    }


                    this.props.updateState({
                        finalCountByDate: finalCountByDate,
                        finalCountByDateAverage: finalCountByDateAverage,
                        finalCountByWeekAverage: finalCountByWeekAverage,
                        loading: false
                    })


                    //console.log(finalCountByDate)

                }
            )
    }

    
    componentDidMount(){
        this.refreshResults()
    }
    componentDidUpdate(prevProps, prevState){

        if(prevProps.stateObj.filter != this.props.stateObj.filter || (prevProps.stateObj.loadMore != this.props.stateObj.loadMore))
            this.refreshResults()

    }




    render(){




        // var CanvasJS = CanvasJSReact.CanvasJS;
        // var CanvasJSChart = CanvasJSReact.CanvasJSChart;



        let dataPointsArrayAverage = []
        let dataPointsArray = []
        let dataPointsArrayWeekly= []
        let dataPointsArrayPerCapita = []


        let populationTotal = 0

        for(let value of this.props.stateObj.associatedPopulations){
            populationTotal += value
        }


        let object = {}

        let objectAverage = {}

        let objectWeekly = {}

        let reversedMapAverage = new Map([...this.props.stateObj.finalCountByDateAverage]);

        let count1 = 0
        reversedMapAverage.forEach((value, key) => {
            value = Math.round(value)
            count1++

            var keys = key.split('.'),
                last = keys.pop();
            keys.reduce((r, a) => r[a] = r[a] || {}, objectAverage)[last] = value;

            if(value > 0) {


                dataPointsArrayAverage.push({x: new Date(key), y: value})



                dataPointsArrayPerCapita.push({x: new Date(key), y: Math.round(value / populationTotal * 100000)})
            }

        });

        let reversedMap = new Map([...this.props.stateObj.finalCountByDate]);

        reversedMap.forEach((value, key) => {
            var keys = key.split('.'),
                last = keys.pop();
            keys.reduce((r, a) => r[a] = r[a] || {}, object)[last] = value;

            if(value > 0) {
                dataPointsArray.push({x: new Date(key), y: value})


            }

        });

        let reversedMapWeekly = new Map([...this.props.stateObj.finalCountByDate].reverse());

        let finalCountByDateLength = this.props.stateObj.finalCountByDate.length

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


            //
            //
            // var keys = key.split('.'),
            //     last = keys.pop();
            // keys.reduce((r, a) => r[a] = r[a] || {}, objectWeekly)[last] = value;
            //
            // if(value > 0) {
            //     dataPointsArrayWeekly.push({y: value})
            // }

        });


        // console.log(dataPointsArrayWeekly)









        dataPointsArray.splice(0,10)

        dataPointsArrayAverage.splice(0,10)

        dataPointsArrayPerCapita.splice(0,10)


        dataPointsArrayWeekly.splice(-1,1)

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
                text: "Cases per day (averaged)",
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
            }]
        }

        const options_daily = {
            animationEnabled: true,
            title:{
                text: "Cases per capita (100k)",
                fontSize: 22
            },
            subtitles: [{
                text: "Purple Tier > 7 per 100k (restrictions)"
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



        return(
            <>


                <br />

                <div className="contributionChart">
                    <CanvasJSChart options={options_weekly} />
                    <br />
                    <CanvasJSChart options={options_average} />
                    <br />
                    <CanvasJSChart options={options_daily} />
                </div>

                <br /> <br /> <br />

                {/*<h3>Cases per week</h3>*/}



                {/*<div className="resultsByZip-wrapper">*/}



                    {/*<Table  striped bordered hover>*/}
                    {/*    <thead>*/}

                    {/*    <tr>*/}
                    {/*        <td>*/}
                    {/*            Date*/}
                    {/*        </td>*/}
                    {/*        <td>*/}
                    {/*            Cases*/}
                    {/*        </td>*/}
                    {/*        <td>*/}
                    {/*            Rate per 100k*/}
                    {/*        </td></tr>*/}
                    {/*    </thead>*/}
                    {/*    <tbody>*/}
                    {/*    {*/}

                    {/*        Object.keys(objectWeekly).map((dateString) => {*/}
                    {/*            let caseCount = Math.round(objectWeekly[dateString])*/}


                    {/*            //let caseRate = Math.round(this.props.stateObj.finalPerCapitaByDateAverage.get(dateString))*/}

                    {/*            return(*/}

                    {/*                <>*/}
                    {/*                    <tr>*/}
                    {/*                        <td>{dateString}</td>*/}
                    {/*                        <td>{caseCount}</td>*/}
                    {/*                        <td>{(caseCount / populationTotal * 100000).toFixed(1)}</td>*/}

                    {/*                    </tr>*/}

                    {/*                </>*/}

                    {/*            )*/}
                    {/*        })*/}
                    {/*    }*/}
                    {/*    </tbody>*/}

                    {/*</Table>*/}




                {/*</div>*/}








                {/*<br />*/}
                {/*<h3>Cases per day (5 day average)</h3>*/}


                {/*<div className="resultsByZip-wrapper">*/}
                {/*    <Table  striped bordered hover>*/}
                {/*        <thead>*/}

                {/*        <tr>*/}
                {/*            <td>*/}
                {/*                Date*/}
                {/*            </td>*/}
                {/*            <td>*/}
                {/*                Cases*/}
                {/*            </td>*/}
                {/*            <td>*/}
                {/*                Rate per 100k*/}
                {/*            </td>*/}
                {/*        </tr>*/}
                {/*        </thead>*/}
                {/*        <tbody>*/}
                {/*        {*/}

                {/*            Object.keys(objectAverage).map((dateString) => {*/}
                {/*                let caseCount = Math.round(objectAverage[dateString])*/}


                {/*                return(*/}
                {/*                    <>*/}

                {/*                        <tr>*/}
                {/*                            <td>{dateString}</td>*/}
                {/*                            <td>{caseCount}</td>*/}
                {/*                            <td>{(caseCount / populationTotal * 100000).toFixed(1)}</td>*/}

                {/*                        </tr>*/}

                {/*                    </>*/}

                {/*                )*/}
                {/*            })*/}
                {/*        }*/}
                {/*        </tbody>*/}

                {/*    </Table>*/}

                {/*</div>*/}
                {/*<br /><br />*/}
                {/*<h3>Cases per day</h3>*/}

                {/*<div className="resultsByZip-wrapper">*/}
                {/*    <Table  striped bordered hover>*/}
                {/*        <thead>*/}

                {/*        <tr>*/}
                {/*            <td>*/}
                {/*                Date*/}
                {/*            </td>*/}
                {/*            <td>*/}
                {/*                Cases*/}
                {/*            </td>*/}
                {/*            <td>*/}
                {/*                Rate per 100k*/}
                {/*            </td>*/}
                {/*        </tr>*/}
                {/*        </thead>*/}
                {/*        <tbody>*/}
                {/*        {*/}
                {/*            Object.keys(object).map((dateString) => {*/}
                {/*                let caseCount = object[dateString]*/}

                {/*                return(*/}
                {/*                    <>*/}

                {/*                        <tr>*/}
                {/*                            <td>{dateString}</td>*/}
                {/*                            <td>{caseCount}</td>*/}
                {/*                            <td>{(caseCount / populationTotal * 100000).toFixed(1)}</td>*/}

                {/*                        </tr>*/}

                {/*                    </>*/}

                {/*                )*/}
                {/*            })*/}
                {/*        }*/}
                {/*        </tbody>*/}

                {/*    </Table>*/}

                {/*</div>*/}







            </>

        )


    }


}
export default ResultsComponent