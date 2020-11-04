import React, {Component} from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import ServiceApi from "../../services/ServiceApi";

class MainComponent extends Component{

    constructor(props){
        super(props);

        this.state = {
            resultsByZip: new Object(),
            allResults: [],
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


                    let results = response.data.features

                    console.log(response.data.features)

                    let latUpperBound = 32.895228
                    let latLowerBound = 32.695733

                    let longLowerBound = -117.305832
                    let longUpperBound = -117.110310

                    let numWeeksAgo = 2;
                    let d = new Date();
                    d.setDate(d.getDate() + numWeeksAgo * 7);
                    let dateTwoWeeksAgo = d.getFullYear() + "/" + d.getMonth() + "/" + d.getDate() + " 08:00:00+00";


                    //console.log(allResults)




                }
            )
    }



    render(){


        return(
            <>
                <div className="container">

                    Main Component


                    <div className="resultsByZip-wrapper">
                        {
                            Object.values(this.state.allResults).map((data) => {
                                let caseCount = data.case_count
                                let ratePer100k = data.rate_100k
                                return(
                                    <>
                                        {caseCount} <br />
                                    </>


                                )

                            })



                        }

                    </div>
                </div>




            </>

        )
    }
}
export default MainComponent