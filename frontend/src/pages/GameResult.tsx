import { useState } from "react";
import { set } from "react-hook-form";
import {Route, useNavigate, useNavigation} from "react-router-dom";
import { useLocation } from "react-router-dom";
import { gameInfo } from "../components/Canvas";
import { MatchHistoryDto } from "../dto/dto";

function GameWon(props:MatchHistoryDto) {
    const Navigate = useNavigate();

    return (
        <div>
            <div className='text-center'>
                <h1>You Won vs {props.Loser} : {props.scoreX} - {props.scoreY} </h1>
            </div>
            <div className="flex-container">
                <div className="mc-menu">
                    <div className="mc-button full">
                        <button className="title" onClick={() => Navigate('/HomePage')}>Back to Main Menu</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function GameLost(props:MatchHistoryDto) {
    const Navigate = useNavigate();
    return (
        <div>
            <div className='text-center'>
                <h1>You Lost vs {props.Winner} : {props.scoreY} - {props.scoreX} </h1>
            </div>
            <div className="flex-container">
                <div className="mc-menu">
                    <div className="mc-button full">
                        <button className="title" onClick={() => Navigate('/HomePage')}>Back to Main Menu</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SpectateResult(props:MatchHistoryDto) {
    const Navigate = useNavigate();
    return (
        <div>
            <div>
                <div className='text-center'>
                    <h1> {props.Winner} is the Winner !!! </h1>
                    <h1>He Won {props.scoreX} - {props.scoreY} vs {props.Loser} </h1>
                </div>
                <div className="flex-container">
                    <div className="mc-menu">
                        <div className="mc-button full">
                            <button className="title" onClick={() => Navigate('/HomePage')}>Back to Main Menu</button>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
    }


function Disconnected() {
    const Navigate = useNavigate();

    const Back = () => {
        Navigate('/');
        sessionStorage.clear();
        document.cookie = "";
        window.location.reload();
    }
    return (
        <div>
            <div className='text-center'>
                <h1>You got Disconnected</h1>
            </div>
                <div className="flex-container">
                    <div className="mc-menu">
                        <div className="mc-button full">
                            <button className="title" onClick={() => Back()}>Back to Log</button>
                        </div>
                    </div>
                </div>
            </div>);
}


export {GameWon, GameLost, SpectateResult, Disconnected};
