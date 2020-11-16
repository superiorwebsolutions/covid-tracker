import React from 'react';
import { shallow } from 'enzyme';
import TestComponent from './TestComponent';
import {describe, it} from "@jest/globals";
describe("TestComponent", () => {
    it("should render my component", () => {
        const wrapper = shallow(<TestComponent />);
    });

    it("should render initial layout", () => {
        // when
        const component = shallow(<TestComponent />);
        // then
        expect(component.getElements()).toMatchSnapshot();
    });

    it("should create an entry in component state", () => {
        // given
        const component = shallow(<TestComponent />);
        const form = component.find('input');
        // when
        form.props().onChange({target: {
                name: 'myName',
                value: 'myValue'
            }});
        // then
        expect(component.state('input')).toBeDefined();
    });

    it("should create an entry in component state with the event value", () => {
        // given
        const component = shallow(<TestComponent />);
        const form = component.find('input');
        // when
        form.props().onChange({target: {
                name: 'myName',
                value: 'myValue'
            }});
        // then
        expect(component.state('input')).toEqual('myValue');
    });
});