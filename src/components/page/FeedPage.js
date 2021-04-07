import React, {useContext, useState} from 'react';
import UserContext from '../../contexts/UserContext';
import WorldContext from '../../contexts/WorldContext';
import Element from '../Element';
import {Container} from 'react-bootstrap';
import sort from 'fast-sort';
import {COLORS} from '../../services/colors';
import suggestedElementsRef from '../../collections/suggestedElementsRef';

export default function FeedPage() {

    let [suggestions, setSuggestions] = useState(null);

    if(!suggestions) {
        suggestedElementsRef.limit(50).get()
            .then(result => setSuggestions(result))
            .catch(console.error);
        return;
    }

    console.log(suggestions);////

    let world = useContext(WorldContext);
    let user = useContext(UserContext);

    // useListener(user, 'save', () => updateInventory());

    // function onClick(elem) {
    //     user.addItem(elem);
    // }

    return (
        <>
            <Container fluid="sm">

            </Container>
        </>
    );
}