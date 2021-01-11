import React, {Component} from "react";

import ResultsComponent from "./ResultsComponent";
import FilterComponent from "./FilterComponent";

const dateFormat = require('dateformat');

class MainApp extends Component{

    constructor(props){
        super(props);

        let startDate = new Date()
        // Need to subtract 12 to adjust for data
        startDate.setDate(startDate.getDate() - 7 - 12)
        startDate = dateFormat(startDate, "yyyy/mm/dd")

        this.state = {
            startDate: startDate,
            clearSelection: false,
            singleZip: [],
            chulaVistaOnly: false,
        }

        this.updateState = this.updateState.bind(this)
        this.updateClearSelection = this.updateClearSelection.bind(this)
        this.setStartDate = this.setStartDate.bind(this)

    }

    updateState(newState){
        this.setState(newState)
    }
    updateClearSelection(){
        this.setState({singleZip: []})
    }

    setStartDate(startDate){
        this.setState({startDate: startDate})
    }

    render(){

        return(
            <>
                <div className="container">

                    <h4 className="main-title">San Diego Covid Tracker</h4>

                    <FilterComponent zipCodeNames={this.state.zipCodeNames} singleZip={this.state.singleZip} startDate={this.state.startDate}
                                     updateClearSelection={this.updateClearSelection} setStartDate={this.setStartDate}  handleStateObj={this.updateState}>
                    </FilterComponent>

                    <div className="clearfix"></div>

                    <ResultsComponent {...this.state} updateState={this.updateState}></ResultsComponent>

                    <br /><br /><br /><br /><br /><br /><br /><br />

                </div>
            </>

        )
    }
}
export default MainApp