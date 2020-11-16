// TestComponent.js
import React from 'react';

export default class TestComponent extends React.Component {

    updateState(event) {
        this.setState({
            input: event.target.value
        });
    }

    render() {
        return <div><input
            onChange={this.updateState.bind(this)}
            type="text" /></div>;
    }
}