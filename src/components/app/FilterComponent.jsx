import React, {Component, useState, useEffect} from "react";
import {Navbar, ToggleButtonGroup, ButtonGroup, Button, ToggleButton} from "react-bootstrap";
import styled from "styled-components";
import Dropdown from "react-bootstrap";



const dateFormat = require('dateformat');


const dropdownOptions = [
    { name: 'Past 7 days', value: 'past-week' },
    { name: '30 days', value: 'past-month' },
    { name: '90 days', value: 'past-3-months' },
    { name: 'All Time', value: 'all-time' },


];



class FilterComponent extends Component{

    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this)
        this.loadMore = this.loadMore.bind(this)
        this.resetChart = this.resetChart.bind(this)
        this.setStartDate = this.setStartDate.bind(this)
        this.handleScroll = this.handleScroll.bind(this)

        this.state = {
            showPbButton: true,
            showLoadButton: true,
            activeButton: "past-week",
            scrolled: false
        }

        this.setActive(this.state.activeButton)

    }


    handleChange(booleanVal){
        booleanVal = booleanVal || false
        this.setState({showPbButton: false})
        this.props.handleStateObj({filter: booleanVal});
    }
    loadMore(booleanVal){
        let startDate = new Date("2020/06/06")
        startDate = dateFormat(startDate, "yyyy/mm/dd")

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

        this.props.setStartDate(startDate)

    }
    chulaVistaOnly(){
        let zipCodeArray = [91910, 91911, 91913]
        this.handleStateObj({singleZip: zipCodeArray})
    }




    componentDidMount() {
        window.addEventListener('scroll',this.handleScroll)
    }

    setActive(button){
        if(button == "all-time")
            this.loadMore()
        else if(button == 'past-week')
            this.setStartDate(7)
        else if(button == 'past-3-months')
            this.setStartDate(90)
        else
            this.setStartDate(30)

        this.setState({activeButton: button})
    }

    setScrolled(booleanVal){
        this.setState({scrolled: booleanVal})
    }

    handleScroll() {
        const offset=window.scrollY;
        if(offset > 120 && this.state.scrolled == false){
            this.setScrolled(true);
        }
        else if(offset <= 120 && this.state.scrolled == true){
            this.setScrolled(false);
        }
    }
    render(){
        console.log("render FilterComponent")
        console.log(this.state)






        let navbarClass = ""
        let hideMenu = ""
        let hideScroller = ""
        if(this.state.scrolled){
            navbarClass = "scrolled"
            hideMenu = "hide"
        }
        else{
            hideScroller = "display-none"
        }

        let showingRegionsText
        if(this.props.singleZip.length == 0){
            showingRegionsText = ""
        }
        else{
            showingRegionsText = ""


            let tempArray = this.props.singleZip.map((zipCode) => {
                return this.props.zipCodeNames[zipCode]
            })

            showingRegionsText += tempArray.join(", ")
        }

        //TODO:  toggleShowAll toggleHideAll for mapchart
        return(
            <>

                <header className="navbar" style={{marginBottom: "10px"}}>

                <ToggleButtonGroup name="filters" className={"topSection " + hideMenu}>

                    {dropdownOptions.map(radio => (
                        <Button
                            key={radio.value}
                            type="radio"
                            variant="outline-primary"
                            value={radio.value}
                            active={this.state.activeButton == radio.value}
                            onClick={(e) => this.setActive(e.currentTarget.value)}
                        >
                            {radio.name}
                        </Button>
                    ))}

                    {/*<Button id="show-week" variant="secondary" className="show-pb" onClick={() => {this.setStartDate(7)}}>Show past week</Button>*/}

                    {/*<Button id="show-all" variant="primary" className="show-pb" onClick={() => {this.loadMore(true)}}>Show all time</Button>*/}

                    {/*{ this.state.showPbButton || this.state.showLoadButton ? null : <Button variant="secondary" className="show-pb" onClick={this.resetChart}>Reset Graphs</Button> }*/}



                </ToggleButtonGroup>


                    {this.props.singleZip.length > 0 &&
                        <>
                    <div className="flex-row">


                        <Button variant="primary" className="clear-selection-top" size="sm"  onClick={() => {
                            this.props.updateClearSelection(true)
                        }}>Reset Filters</Button>




                    </div>

                    <div className="flex-row">
                        <h5 className="showing-regions-text">{showingRegionsText}</h5>
                    </div>

                    </>

                    }

                </header>


                <header className={"navbar " + hideScroller + " " + navbarClass}>




                    <ToggleButtonGroup name="filters" className="topSection">

                            {dropdownOptions.map(radio => (
                                <Button
                                    key={radio.value}
                                    type="radio"
                                    variant="outline-primary"
                                    value={radio.value}
                                    active={this.state.activeButton == radio.value}
                                    onClick={(e) => this.setActive(e.currentTarget.value)}
                                >
                                    {radio.name}
                                </Button>
                            ))}



                        {/*<Button id="show-week" variant="secondary" className="show-pb" onClick={() => {this.setStartDate(7)}}>Show past week</Button>*/}

                        {/*<Button id="show-all" variant="primary" className="show-pb" onClick={() => {this.loadMore(true)}}>Show all time</Button>*/}

                        {/*{ this.state.showPbButton || this.state.showLoadButton ? null : <Button variant="secondary" className="show-pb" onClick={this.resetChart}>Reset Graphs</Button> }*/}


                    </ToggleButtonGroup>


                    {this.props.singleZip.length > 0 &&
                    <>
                        <div className="flex-row">


                            <Button variant="primary" className="clear-selection-top" size="sm"  onClick={() => {
                                this.props.updateClearSelection(true)
                            }}>Reset Filters</Button>




                        </div>

                        <div className="flex-row">
                            <h5 className="showing-regions-text">{showingRegionsText}</h5>
                        </div>

                    </>

                    }

                </header>


            </>

        )
    }



}
export default FilterComponent


