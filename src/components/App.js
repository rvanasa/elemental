import React, {useEffect, useState} from 'react';

import './App.scss';
import {findWorld} from '../services/world';
import WorldContext from '../contexts/WorldContext';
import Loading from './Loading';
import UserContext from '../contexts/UserContext';
import {findUser} from '../services/user';
import {DndProvider} from 'react-dnd-multi-backend';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';
import GamePage from './page/GamePage';
import LoginPage from './page/LoginPage';
import HistoryPage from './page/HistoryPage';
import SelectionContext from '../contexts/SelectionContext';
import ElementDetail from './ElementDetail';

export default function App() {

    let [world, setWorld] = useState(null);
    let [user, setUser] = useState(null);
    let [selected, setSelected] = useState(null);

    useEffect(() => {
        findWorld()
            .then(setWorld)
            .catch(console.error);

        findUser()
            .then(setUser)
            .catch(console.error);
    }, []);

    if(!world || !user) {
        return <Loading/>;
    }

    // function NavButton({to, children}) {
    //     return (
    //         <div className="h1 px-2 pb-2 pt-1 mb-0">
    //             <Link to={to}>
    //                 {children}
    //             </Link>
    //         </div>
    //     );
    // }

    return (
        <>
            <DndProvider options={HTML5toTouch}>
                <BrowserRouter>
                    {/*<div className="d-flex justify-content-around">*/}
                    {/*    <NavButton to="/">*/}
                    {/*        <FaTh/>*/}
                    {/*    </NavButton>*/}
                    {/*    <NavButton to="/history">*/}
                    {/*        <FaHistory/>*/}
                    {/*    </NavButton>*/}
                    {/*    <NavButton to="/suggestions">*/}
                    {/*        <FaPen/>*/}
                    {/*    </NavButton>*/}
                    {/*    <NavButton to="/user">*/}
                    {/*        <FaUser/>*/}
                    {/*    </NavButton>*/}
                    {/*</div>*/}
                    <WorldContext.Provider value={world}>
                        <UserContext.Provider value={user}>
                            <SelectionContext.Provider value={{selected, setSelected}}>
                                {selected && (
                                    <div className="position-fixed w-100"
                                         style={{background: '#222', boxShadow: '0 .25em #0008', zIndex: 100}}>
                                        <ElementDetail element={selected} onClose={() => setSelected(null)}/>
                                    </div>
                                )}
                                <div onClick={() => setSelected(null)}>
                                    <Switch>
                                        <Route path="/login">
                                            <LoginPage/>
                                        </Route>
                                        <Route path="/history">
                                            <HistoryPage/>
                                        </Route>
                                        <Route path="/">
                                            <GamePage/>
                                        </Route>
                                    </Switch>
                                </div>
                            </SelectionContext.Provider>
                        </UserContext.Provider>
                    </WorldContext.Provider>
                </BrowserRouter>
            </DndProvider>
        </>
    );
};
