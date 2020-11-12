import React, {Component} from "react";

import ServiceApi from "../../services/ServiceApi";

import {Table} from 'react-bootstrap';

import CanvasJSReact from "./canvasjs.react";
import ResultsComponent from "./ResultsComponent";
import FilterComponent from "./FilterComponent";
import boundary from "../../assets/boundary.jpg";
let CanvasJSChart = CanvasJSReact.CanvasJSChart;


// import CanvasJSReact from 'canvasjs.react';
// var CanvasJS = CanvasJSReact.CanvasJS;
// var CanvasJSChart = CanvasJSReact.CanvasJSChart;


class MainApp extends Component{

    constructor(props){
        super(props);

        this.state = {
            finalCountByDate: new Map(),
            finalCountByDateAverage: new Map(),
            finalPerCapitaByDate: new Map(),
            finalPerCapitaByDateAverage: new Map(),
            finalCountByWeekAverage: new Map(),
            startDate: new Date("August 01, 2020"),
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
                92109,
                92108,
                92107,
                92110,
                92103,
                92116,
                92115,
                92106,
                92140,
                92104,
                92105,
                92101,
                92102,
                92113,
                92136

            ],
            associatedPopulationsObj: {
                92037: 41031,
                92121: 4529,
                92122: 47550,
                92117: 55256,
                92111: 46475,
                92123: 26823,
                92124: 31814,
                92120: 31335,
                92109: 47844,
                92108: 18858,
                92107: 28052,
                92110: 26381,
                92103: 32946,
                92116: 33114,
                92115: 58276,
                92106: 18424,
                92140: 3435,
                92104: 46945,
                92105: 73428,
                92101: 38725,
                92102: 44545,
                92113: 53688,
                92136: 10699,
    },

            // TODO:  Add zipCodeObject that stores the names of the cities (use this in Map.Chart.js setTooltipContent

            associatedPopulations: [
                46781,
                4179,
                43728,
                51332,
                45096,
                26823,
                26823,
                30443,
                49744,
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
            ],
            filter: false,
            loadMore: false,
            singleZip: null


        }

        this.updateState = this.updateState.bind(this)
        this.handleStateObj = this.handleStateObj.bind(this)




    }

    handleStateObj(stateObj){

        this.setState(stateObj)
    }


    updateState(newState){
        this.setState(newState)
        // console.log(this.state)
    }


    componentDidMount(){

    }


    render(){

        return(
            <>

                <div className="container">


                    <FilterComponent startDate={this.state.startDate} handleStateObj={this.handleStateObj}></FilterComponent>

                    <div className="clearfix"></div>



                    <ResultsComponent singleZip={this.state.singleZip} stateObj={this.state} zipCodesAllowed={this.state.zipCodesAllowed} updateState={this.updateState}></ResultsComponent>

                    <h5>All covid results within this region</h5>
                    <br />
                    {/*<img className="boundary-img" src={boundary} />*/}
                    <br /><br /><br /><br /><br /><br /><br /><br />



                </div>


            </>

        )
    }
}
export default MainApp