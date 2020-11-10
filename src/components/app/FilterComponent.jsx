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
        booleanVal = booleanVal || false
        this.setState({showLoadButton: false})
        this.props.handleStateObj({loadMore: booleanVal});
    }

    resetChart(){
        this.handleChange(false)
        this.loadMore(false)
        this.setState({showPbButton: true, showLoadButton: true})
    }
    setStartDate(daysAgo){
        let startDate = new Date()
        startDate.setDate(startDate.getDate() - daysAgo)
        startDate = dateFormat(startDate, "yyyy/mm/dd")
        // this.setState({: false})
        this.props.handleStateObj({startDate: startDate})
        console.log(this.props.startDate)

    }




    componentDidMount() {
    }


    render(){


        // TODO:  Add date range

        //TODO:  toggleShowAll toggleHideAll for mapchart
        return(
            <>


                <div className="topSection">
                    {/*{ this.state.showPbButton ? <Button variant="secondary" className="show-pb" onClick={() => {this.handleChange(true)}}>Show PB only</Button> : null }*/}

                    <Button variant="secondary" className="show-pb" onClick={() => {this.setStartDate(7)}}>Show past week</Button>

                    { this.state.showLoadButton ? <Button variant="primary" className="show-pb" onClick={() => {this.loadMore(true)}}>Show all dates</Button> : null }

                    { this.state.showPbButton || this.state.showLoadButton ? null : <Button variant="secondary" className="show-pb" onClick={this.resetChart}>Reset Graphs</Button> }


                </div>



            </>

        )
    }



}
export default FilterComponent