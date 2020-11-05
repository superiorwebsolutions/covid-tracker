import React, {Component} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import ServiceApi from "../../services/ServiceApi";

import {Table} from 'react-bootstrap';


class MainComponent extends Component{

    constructor(props){
        super(props);

        this.state = {
            finalCountByDate: new Map(),
            finalCountByDateAverage: new Map(),
            finalPerCapitaByDate: new Map(),
            finalPerCapitaByDateAverage: new Map(),
            finalCountByWeekAverage: new Map(),
            // Not including anything north of sorrento valley
            zipCodesAllowed: [
                92037,
                92121,
                92122,
                92117,
                92111,
                92123,
                92124,
                92120,
                92110,
                92108,
                92107,
                92110,
                92103,
                92116,
                92115,
                92106,
                92140,
                92103,
                92104,
                92105,
                92101,
                92102,
                92113,
                92136

            ],
            associatedPopulations: [
                46781,
                4179,
                43728,
                51332,
                45096,
                26823,
                26823,
                30443,
                26317,
                25341,
                18858,
                28651,
                25341,
                18858,
                28651,
                25341,
                31066,
                31680,
                58560,
                19330,
                3435,
                31066,
                44414,
                69813,
                37095,
                43267,
                56066,
                10699
            ]


        }


    }
    componentDidMount(){
        this.refreshResults()
    }

    refreshResults(){
        this.setState({
            loading: true
        })


        ServiceApi.getAllResults()
            .then(
                (response) => {

                    let d = new Date();

                    let dateTwoWeeksAgoString = d.getFullYear() + "/" + d.getMonth() + "/" + d.getDate()
                    let dateTwoWeeksAgoFormatted = d.getFullYear() + "/" + d.getMonth() + "/" + d.getDate() + " 08:00:00+00";


                    let resultsByZip = response.data.features;
                    let allResultsOrig = response.data.features;
                    allResultsOrig.reverse()

                    let allResults = allResultsOrig.slice(0,25000)
                    allResults.reverse()





                    let objCountByDate = new Map();
                    let finalCountByDate = new Map()

                    let objPerCapitaByDate = new Map();
                    let finalPerCapitaByDate = new Map();


                    for(let result of allResults){

                        let data2 = result.properties

                        let zipCode = data2.ziptext



                        let caseCount = data2.case_count

                        let ratePer100k = data2.rate_100k


                        let updateDate = data2.updatedate
                        let dateString = updateDate.slice(0,updateDate.indexOf(' '))


                        //let dateString = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();



                        if(this.state.zipCodesAllowed.includes(parseInt(zipCode))){

                            if(caseCount == null || caseCount == 0){
                                continue
                            }

                                if(objCountByDate.has(dateString)){
                                    objCountByDate.set(dateString, objCountByDate.get(dateString) + caseCount)
                                    // if(ratePer100k != null)
                                    //     objPerCapitaByDate.set(dateString, objPerCapitaByDate.get(dateString) + ratePer100k)
                                }
                                else{
                                    objCountByDate.set(dateString, caseCount)
                                    // if(ratePer100k != null)
                                    //     objPerCapitaByDate.set(dateString, ratePer100k)
                                }







                        }
                    }

                    console.log(allResults)


                    // TRAVERSE objCountByDate and compare totals to one day prior
                    let prevDayCount = 0
                    for(let [dateString, result] of objCountByDate){
                            finalCountByDate.set(dateString, result - prevDayCount)

                            prevDayCount = result

                    }


                    // let prevDayRate = 0
                    // for(let [dateString, result] of objPerCapitaByDate){
                    //
                    //     finalPerCapitaByDate.set(dateString, result - prevDayRate)
                    //
                    //     prevDayRate = result
                    //
                    // }

                    //console.log()


                    let finalCountByDateAverage = new Map()
                    let finalPerCapitaByDateAverage = new Map()

                    let finalCountByWeekAverage = new Map()

                    let queue = []
                    for(let [dateString, result] of finalCountByDate) {
                        queue.push(result)
                        if(queue.length > 5)
                            queue.shift()

                        let average = 0
                        for(let value of queue){
                            average += value
                        }
                        average /= queue.length

                        finalCountByDateAverage.set(dateString, average)
                    }




                    // queue = []
                    // for(let [dateString, result] of finalPerCapitaByDate) {
                    //     queue.push(result)
                    //     if(queue.length > 5)
                    //         queue.shift()
                    //
                    //     let average = 0
                    //     for(let value of queue){
                    //         average += value
                    //     }
                    //     average /= queue.length
                    //
                    //     finalPerCapitaByDateAverage.set(dateString, average)
                    // }

                    // Calculate weekly totals
                    let count = 0
                    let totalCases = 0
                    let prevDateString = ""
                    for(let [dateString, result] of finalCountByDateAverage) {
                        count += 1
                        totalCases += result

                        //let average = 0

                        //average /= queue.length
                        if (count % 7 == 0){

                            finalCountByWeekAverage.set(prevDateString + " to " + dateString, totalCases)
                            prevDateString = dateString
                            totalCases = 0
                        }


                    }


                    this.setState({
                        finalCountByDate: finalCountByDate,
                        finalCountByDateAverage: finalCountByDateAverage,
                        // finalPerCapitaByDate: finalPerCapitaByDate,
                        // finalPerCapitaByDateAverage: finalPerCapitaByDateAverage,
                        finalCountByWeekAverage: finalCountByWeekAverage,
                        loading: false
                    })


                    //console.log(finalCountByDate)

console.log(finalCountByDate)


                }
            )
    }



    render(){

        let populationTotal = 0

        for(let value of this.state.associatedPopulations){
            populationTotal += value
        }


        let object = {}

        let objectAverage = {}

        let objectWeekly = {}

        let reversedMapAverage = new Map([...this.state.finalCountByDateAverage].reverse());

        reversedMapAverage.forEach((value, key) => {
            var keys = key.split('.'),
                last = keys.pop();
            keys.reduce((r, a) => r[a] = r[a] || {}, objectAverage)[last] = value;
        });

        let reversedMap = new Map([...this.state.finalCountByDate].reverse());

        reversedMap.forEach((value, key) => {
            var keys = key.split('.'),
                last = keys.pop();
            keys.reduce((r, a) => r[a] = r[a] || {}, object)[last] = value;
        });

        let reversedMapWeekly = new Map([...this.state.finalCountByWeekAverage].reverse());

        reversedMapWeekly.forEach((value, key) => {
            var keys = key.split('.'),
                last = keys.pop();
            keys.reduce((r, a) => r[a] = r[a] || {}, objectWeekly)[last] = value;
        });

        return(
            <>
                <div className="container">


                    <br />
                    <h3>Cases per week</h3>


                    <div className="resultsByZip-wrapper">
                        <Table  striped bordered hover>
                            <thead>

                            <tr>
                                <td>
                                    Date
                                </td>
                                <td>
                                    Cases
                                </td>
                                <td>
                                    Rate per 100k
                                </td></tr>
                            </thead>
                            <tbody>
                            {

                                Object.keys(objectWeekly).map((dateString) => {
                                    let caseCount = Math.round(objectWeekly[dateString])

                                    //let caseRate = Math.round(this.state.finalPerCapitaByDateAverage.get(dateString))

                                    return(
                                        <>

                                            <tr>
                                                <td>{dateString}</td>
                                                <td>{caseCount}</td>
                                                <td>{(caseCount / populationTotal * 100000).toFixed(1)}</td>

                                            </tr>

                                        </>

                                    )
                                })
                            }
                            </tbody>

                        </Table>

                    </div>





                    <br />
                    <h3>Cases per day (5 day average)</h3>


                    <div className="resultsByZip-wrapper">
                        <Table  striped bordered hover>
                            <thead>

                            <tr>
                                <td>
                                    Date
                                </td>
                                <td>
                                    Cases
                                </td>
                            <td>
                                Rate per 100k
                            </td>
                            </tr>
                            </thead>
                            <tbody>
                        {

                            Object.keys(objectAverage).map((dateString) => {
                                let caseCount = Math.round(objectAverage[dateString])


                                return(
                                    <>

                                            <tr>
                                                <td>{dateString}</td>
                                                <td>{caseCount}</td>
                                                <td>{(caseCount / populationTotal * 100000).toFixed(1)}</td>

                                            </tr>

                                    </>

                                )
                            })
                        }
                            </tbody>

                        </Table>

                    </div>
<br /><br />
                    <h3>Cases per day</h3>

                    <div className="resultsByZip-wrapper">
                        <Table  striped bordered hover>
                            <thead>

                            <tr>
                                <td>
                                    Date
                                </td>
                                <td>
                                    Cases
                                </td>
                                <td>
                                    Rate per 100k
                                </td>
                            </tr>
                            </thead>
                            <tbody>
                            {
                                Object.keys(object).map((dateString) => {
                                    let caseCount = object[dateString]

                                    return(
                                        <>

                                            <tr>
                                                <td>{dateString}</td>
                                                <td>{caseCount}</td>
                                                <td>{(caseCount / populationTotal * 100000).toFixed(1)}</td>

                                            </tr>

                                        </>

                                    )
                                })
                            }
                            </tbody>

                        </Table>

                    </div>

                </div>





            </>

        )
    }
}
export default MainComponent