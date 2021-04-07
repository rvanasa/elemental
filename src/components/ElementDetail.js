import React, {useContext, useState} from 'react';

import WorldContext from '../contexts/WorldContext';
import UserContext from '../contexts/UserContext';
import {FaCross, FaMinus, FaPlus, FaTimes} from 'react-icons/all';
import './Element.scss';
import Element from './Element';
import useListener from '../hooks/useListener';
import useRedraw from '../hooks/useRedraw';

export default function ElementDetail({element, onClose}) {

    let redraw = useRedraw();

    let world = useContext(WorldContext);
    let user = useContext(UserContext);

    useListener(user, 'save', redraw);

    return (
        <div className="p-2 d-flex">
            <Element element={element} count={user.getItemCount(element)}/>
            <div className="mx-3 flex-grow-1">
                {/*<h3>{element.name}</h3>*/}
                <span className="btn btn-outline-secondary text-white"
                      onClick={() => user.hasKnownElement(element) && user.addItem(element)}>
                    <FaPlus/>
                </span>
                <span className="btn btn-outline-secondary text-white" onClick={() => user.removeItem(element)}>
                    <FaMinus/>
                </span>
            </div>
            {onClose && (
                <div>
                    <span className="btn btn-outline-secondary" onClick={() => onClose()}>
                        <FaTimes/>
                    </span>
                </div>
            )}
        </div>
    );
}
