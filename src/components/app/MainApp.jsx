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
            ],
            filter: false,
            loadMore: false


        }

        this.updateState = this.updateState.bind(this)
        this.handleStateObj = this.handleStateObj.bind(this)


    }

    handleStateObj(stateObj){
        this.setState(stateObj)
    }

    updateState(newState){
        this.setState(newState)
    }


    componentDidMount(){

    }


    render(){





        return(
            <>

                <div className="container">


                    <FilterComponent stateObj={this.state} handleStateObj={this.handleStateObj}></FilterComponent>

                    <div className="clearfix"></div>

                    <ResultsComponent stateObj={this.state} updateState={this.updateState}></ResultsComponent>

                    <h5>All results are within this region</h5>
                    <br />
                    <img className="boundary-img" src={boundary} />
                    <br /><br /><br /><br /><br /><br /><br /><br />



                </div>


            </>

        )
    }
}
export default MainApp