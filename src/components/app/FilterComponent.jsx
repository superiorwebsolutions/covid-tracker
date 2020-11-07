import React, {Component} from "react";
import {Button} from "react-bootstrap";






class FilterComponent extends Component{



    constructor(props) {
        super(props);

        this.handleChange = this.handleChange.bind(this)
        this.loadMore = this.loadMore.bind(this)
        this.resetChart = this.resetChart.bind(this)

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



    componentDidMount() {
    }


    render(){

        return(
            <>

                <div className="topSection">
                    { this.state.showPbButton ? <Button variant="secondary" className="show-pb" onClick={() => {this.handleChange(true)}}>Show PB only</Button> : null }
                    { this.state.showLoadButton ? <Button variant="primary" className="show-pb" onClick={() => {this.loadMore(true)}}>Load more data</Button> : null }

                    { this.state.showPbButton || this.state.showLoadButton ? null : <Button variant="secondary" className="show-pb" onClick={this.resetChart}>Reset Chart</Button> }


                </div>



            </>

        )
    }



}
export default FilterComponent