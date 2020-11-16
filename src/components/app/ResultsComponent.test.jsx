import React from 'react';
import { shallow } from 'enzyme';
import ResultsComponent from './ResultsComponent';
import {describe, it} from "@jest/globals";

describe("ResultsComponent", () => {
    
     // let zipCodeMap = '{"92037":54,"92101":227,"92102":136,"92103":94,"92104":94,"92105":178,"92106":35,"92107":44,"92108":58,"92109":156,"92110":49,"92111":87,"92113":167,"92115":142,"92116":48,"92117":79,"92120":37,"92121":1,"92122":35,"92123":61,"92124":52,"92136":9,"92140":0,"92182":2}'

    it("should create an entry in component state with the event value", () => {
        // given
        const component = shallow(<ResultsComponent />);
        // const comp = React.mount(component)
        expect(component.state('latestDate')).toEqual("2020/11/13");
    });


});