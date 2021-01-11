import React, {Component} from "react";
import {associatedPopulationsObj, chulaVistaPopulations, zipCodeNames, colorScale} from "../../Constants";
import {Table} from "react-bootstrap";

class SortedRiskByZipCode extends Component{

    constructor(props) {
        super(props);
    }

    refreshResults(){
        this.numDays = this.props.finalZipCountByDate.size


        if (this.props.chulaVistaOnly === true)
            this.associatedPopulations = chulaVistaPopulations
        else
            this.associatedPopulations = associatedPopulationsObj


        let sortedZipCodeMapPerCapita = new Map()

        this.props.zipCodeMap.forEach((caseCount, zipCode) => {
            let caseCountPerCapita100k = Math.round(((caseCount / this.associatedPopulations[zipCode]) * 100000) / this.numDays)
            sortedZipCodeMapPerCapita.set(zipCode, caseCountPerCapita100k)
        })

        let sortedZipCodeMap = new Map([...sortedZipCodeMapPerCapita].sort((a, b) => b[1] - a[1]))

        this.sortedArray = []
        sortedZipCodeMap.forEach((caseCount, zipCode) => {
            this.sortedArray.push(zipCode)
        })
    }


    render() {

        if(this.props.finalZipCountByDate.size == 0)
            return (<></>)

        this.refreshResults()

        return(<div className="regions-by-risk">
            <h5>Highest Risk Areas<br /><small>(past {this.numDays} days)</small></h5>
            <Table>
                <thead>
                <tr>
                    <th>City region</th>
                    <th className="cases-per-capita">Cases per capita</th>
                </tr>
                </thead>

                <tbody>

                {
                    this.sortedArray.map((zipCode) => {
                        let caseCount = this.props.zipCodeMap.get(zipCode)

                        let caseCountPerCapita100k = Math.round(((caseCount / this.associatedPopulations[zipCode]) * 100000) / this.numDays)

                        this.zipCodeName = zipCodeNames[zipCode]

                        return (
                            <tr>
                                <td>{this.zipCodeName}</td>
                                <td className="regions-cases" style={{background: colorScale(caseCountPerCapita100k)}}>{caseCountPerCapita100k}</td>
                            </tr>
                            )
                    })
                }
                </tbody>
            </Table>

    </div>)

    }


}
export default SortedRiskByZipCode