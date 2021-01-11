
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import './assets/style.css'



import React from "react";
import MainApp from "./components/app/MainApp";
import CountyResultsComponent from "./components/app/CountyResultsComponent";




function App() {
  return (
      <>

        <div className="App">
              <MainApp></MainApp>
        </div>
      </>
  );
}

export default App;
