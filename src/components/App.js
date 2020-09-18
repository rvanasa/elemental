import React, {useEffect, useState} from 'react';

import './App.scss';
import {findWorld} from '../services/world';
import WorldContext from '../contexts/WorldContext';
import Loading from './Loading';
import Game from './Game';
import UserContext from '../contexts/UserContext';
import {findUser} from '../services/user';
import {DndProvider} from 'react-dnd-multi-backend';
import HTML5toTouch from 'react-dnd-multi-backend/dist/esm/HTML5toTouch';

export default function App() {

    let [world, setWorld] = useState(null);
    let [user, setUser] = useState(null);

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

    return (
        <>
            <WorldContext.Provider value={world}>
                <UserContext.Provider value={user}>
                    <DndProvider options={HTML5toTouch}>
                        <Game/>
                    </DndProvider>
                </UserContext.Provider>
            </WorldContext.Provider>
        </>
    );
};
