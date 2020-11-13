import React, {Component, useState} from "react";
import {Button} from "react-bootstrap";

const dateFormat = require('dateformat');


class FilterComponent extends Component{

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this)
        this.loadMore = this.loadMore.bind(this)
        this.resetChart = this.resetChart.bind(this)
        this.setStartDate = this.setStartDate.bind(this)

        this.state = {
            showPbButton: true,
            showLoadButton: true
        }
    }


    handleChange(booleanVal){
        booleanVal = booleanVal || false
        this.setState({showPbButton: false})
        this.props.handleStateObj({filter: booleanVal});
    }
    loadMore(booleanVal){
        let startDate = new Date("2020/06/06")
        startDate = dateFormat(startDate, "yyyy/mm/dd")
        console.log(startDate)
        this.props.setStartDate(startDate)
        //
        // booleanVal = booleanVal || false
        // this.setState({showLoadButton: true})
        // this.props.handleStateObj({loadMore: booleanVal});
    }

    resetChart(){
        this.handleChange(false)
        this.loadMore(false)
        this.setState({showPbButton: true, showLoadButton: true})
    }
    setStartDate(daysAgo){
        let startDate = new Date()
        // Need to subtract 12 to adjust for data
        startDate.setDate(startDate.getDate() - daysAgo - 12)
        startDate = dateFormat(startDate, "yyyy/mm/dd")
        console.log(startDate)
        this.props.setStartDate(startDate)

    }
    chulaVistaOnly(){
        let zipCodeArray = [91910, 91911, 91913]
        this.handleStateObj({singleZip: zipCodeArray})
    }




    componentDidMount() {
    }


    render(){


        // TODO:  Add date range

        //TODO:  toggleShowAll toggleHideAll for mapchart
        return(
            <>


                 {/*TODO:  top filter is sticky*/}

                <div className="topSection">
                    {/*{ this.state.showPbButton ? <Button variant="secondary" className="show-pb" onClick={() => {this.handleChange(true)}}>Show PB only</Button> : null }*/}

                    <Button variant="secondary" className="show-pb" onClick={() => {this.setStartDate(7)}}>Show past week</Button>

                    { this.state.showLoadButton ? <Button variant="primary" className="show-pb" onClick={() => {this.loadMore(true)}}>Show all time</Button> : null }

                    { this.state.showPbButton || this.state.showLoadButton ? null : <Button variant="secondary" className="show-pb" onClick={this.resetChart}>Reset Graphs</Button> }


                </div>



            </>

        )
    }



}
export default FilterComponent