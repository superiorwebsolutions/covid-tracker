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
                "92037",
                "92121",
                "92122",
                "92117",
                "92111",
                "92123",
                "92124",
                "92120",
                "92109",
                "92108",
                "92107",
                "92110",
                "92103",
                "92116",
                "92115",
                "92182",
                "92106",
                "92140",
                "92104",
                "92105",
                "92101",
                "92102",
                "92113",
                "92136",

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
                92115: 66669,
                92182: 606,
                92106: 18424,
                92140: 3435,
                92104: 46945,
                92105: 73428,
                92101: 38725,
                92102: 44545,
                92113: 53688,
                92136: 10699,



            },
            zipCodeNames: {
                92037: "La Jolla",
                92121: "Sorrento Valley",
                92122: "UTC",
                92117: "North Clairemont",
                92111: "East Clairemont",
                92123: "Kearny Mesa",
                92124: "Tierra Santa",
                92120: "Del Cerro",
                92109: "Pacific Beach",
                92108: "Mission Valley",
                92107: "Ocean Beach",
                92110: "Bay Park",
                92103: "Hillcrest",
                92116: "Normal Heights",
                92115: "SDSU Area",
                92182: "SDSU (on-campus)",
                92106: "Point Loma",
                92140: "Loma Portal",
                92104: "North Park",
                92105: "City Heights",
                92101: "Downtown / Little Italy",
                92102: "South Park / Golden Hill",
                92113: "Logan Heights",
                92136: "Naval Base",

                91910: "Chula Vista (west)",
                91911: "Chula Vista (south)",
                91913: "Chula Vista (otay ranch)"

            },
            chulaVistaOnly: false,
            chulaVistaPopulations: {
                91910: 77369,
                91911: 85259,
                91913: 50070,
            },
            filter: false,
            loadMore: false,
            clearSelection: false,
            singleZip: []


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
        console.log("render MainApp")
        console.log(this.state)
        return(
            <>

                <div className="container">


                    <FilterComponent startDate={this.state.startDate} handleStateObj={this.handleStateObj}></FilterComponent>

                    <div className="clearfix"></div>

                    <ResultsComponent singleZip={this.state.singleZip} stateObj={this.state} zipCodesAllowed={this.state.zipCodesAllowed} updateState={this.updateState}></ResultsComponent>


                    <br />
                    {/*<img className="boundary-img" src={boundary} />*/}
                    <br /><br /><br /><br /><br /><br /><br /><br />



                </div>


            </>

        )
    }
}
export default MainApp