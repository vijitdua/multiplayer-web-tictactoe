import MyAppBar from "../components/MyAppBar";
import {useEffect, useState} from "react";
import {checkIfValidRoom, clearGameCookies, stringBoardToArray} from "../api/manageGameRoom";
import StatusBar from "../components/StatusBar";
import Board from "../components/Board";
import {Box, Container, Grid} from "@mui/material";
import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";
import PlayerDataDisplay from "../components/PlayerDataDisplay";
import {refreshGame} from "../api/game";
import Cookies from "universal-cookie";

function LoggedInLandingPage() {
    const cookie = new Cookies();
    const [inGameStatus, setInGameStatus] = useState(null);
    // Add board data here
    const [status, setStatus] = useState(cookie.get(`state`));
    const [waitingForJoin, setWaitingForJoin] = useState(null);
    const [board, setBoard] = useState([
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ]);

    async function checkIfInGame() {
        let status = await checkIfValidRoom();
        setInGameStatus(status);
        return status;
        // Remove room data if not in a valid room
    }

    useEffect( () => {
        async function func(){
            let inGame = await checkIfInGame();
            if (inGame) {
                if(cookie.get('roomType') === `hosted` && !(cookie.get(`oppUserName`))){
                    setWaitingForJoin(true);
                }
                else{
                    setWaitingForJoin(false);
                }
            }
        }
        func();
    }, []);

    useEffect(() => {
        async function refreshFunc(){
            let didRefreshGameWork = await refreshGame();
            if(didRefreshGameWork){
                setWaitingForJoin(false);
                setStatus(cookie.get('state'));
                setBoard(stringBoardToArray(cookie.get('game')));
            }
        }

        const interval = setInterval(() => {
            refreshFunc();
        }, 1000);

        //Clearing the interval
        return () => clearInterval(interval);
    }, []);


    // If in game
    if (inGameStatus === true) {
        // setInterval(() => {setIsStatusUpdate(refreshGame())}, 2000);

        return (<>
            <MyAppBar/>
            <Container maxWidth='md'>
                <Box sx={{
                    marginTop: `30px`,
                    '& > *': {
                        margin: `10px`
                    },
                }}>
                    <StatusBar gameStatus={status}/> <br/>
                    {/*//TODO: Fix*/}
                    <Board grid={board}/>
                    <PlayerDataDisplay waitingForJoin={waitingForJoin}/>
                </Box>
            </Container>
        </>);
    }
    // If not in a game
    else if (inGameStatus === false) {
        return (<>
            <MyAppBar/>
            <Container maxWidth='lg'>
                <Box>
                    <Grid container spacing={2} justifyContent="center" sx={{mt: '10px'}}>
                        <CreateRoom/>
                        <JoinRoom/>
                    </Grid>
                </Box>
            </Container>
        </>);
    }
    // Loading
    else {
        return (<>
            <MyAppBar/>
            Loading
        </>);
    }

    //TODO: Check if user is in a game room, if game room is alive. If they have permission to connect, and then load the game room page. Otherwise not. Also clear game room cookies if anything is false.
}

export default LoggedInLandingPage;