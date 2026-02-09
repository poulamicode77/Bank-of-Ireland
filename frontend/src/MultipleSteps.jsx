import React from "react";
import logoBOI from './image/logo_of_BOI.png';

function MultipleSteps(){
    return(
        <div className="container text-center mt-3">
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <a className="navbar-brand" href="#">
              <img src= {logoBOI} width={50} height={50} class="d-inline-block align-top" alt="" />
              <div className="container">
                    <div className="progress-container">
                        <div className="progress">
                            <div className="circle">1</div>
                            <div className="circle">2</div>
                            <div className="circle">3</div>
                        </div>
                    </div>
                </div>
            </a>
          </nav>
        </div>
    )
}
export default MultipleSteps;