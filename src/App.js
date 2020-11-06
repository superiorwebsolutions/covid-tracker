import logo from './logo.svg';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './assets/style.css'
import MainComponent from "./components/app/MainComponent";

import React from "react";

function App() {
  return (
      <>
          <head>
              {/*<script type="text/javascript" src="canvasjs.min.js"></script>*/}
          </head>
        <div className="App">

                <img className="boundary-img" src="./assets/boundary.jpg" />
              <MainComponent></MainComponent>

        </div>
      </>
  );
}

export default App;
