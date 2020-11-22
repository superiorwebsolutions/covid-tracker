import React, {Component} from "react";
import {associatedPopulationsObj, chulaVistaPopulations, zipCodeNames, colorScale} from "../../Constants";
import {Table} from "react-bootstrap";

class SortedRiskByZipCode extends Component{

    constructor(props) {
        super(props);
    }

    render() {

        if(this.props.finalZipCountByDate.size == 0)
            return (<></>)


        let numDays = this.props.finalZipCountByDate.size

        let associatedPopulations

        if (this.props.chulaVistaOnly === true)
            associatedPopulations = chulaVistaPopulations
        else
            associatedPopulations = associatedPopulationsObj


        let sortedZipCodeMapPerCapita = new Map()

        this.props.zipCodeMap.forEach((caseCount, zipCode) => {
            let caseCountPerCapita100k = Math.round(((caseCount / associatedPopulations[zipCode]) * 100000) / numDays)
            sortedZipCodeMapPerCapita.set(zipCode, caseCountPerCapita100k)
        })

        let sortedZipCodeMap = new Map([...sortedZipCodeMapPerCapita].sort((a, b) => b[1] - a[1]))

        let sortedArray = []
        sortedZipCodeMap.forEach((caseCount, zipCode) => {
            sortedArray.push(zipCode)
        })

        return(<div className="regions-by-risk">
            <h5>Highest Risk Areas <small>(past {numDays} days)</small></h5>
            <Table>
                <thead>
                <tr>
                    <th>City region</th>
                    <th style={{width: "160px"}}>Cases per capita</th>
                </tr>
                </thead>

                <tbody>

                {
                    sortedArray.map((zipCode) => {
                        let caseCount = this.props.zipCodeMap.get(zipCode)

                        let caseCountPerCapita100k = Math.round(((caseCount / associatedPopulations[zipCode]) * 100000) / numDays)

                        let zipCodeName = zipCodeNames[zipCode]

                        return (
                            <tr>
                                <td>{zipCodeName}</td>
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