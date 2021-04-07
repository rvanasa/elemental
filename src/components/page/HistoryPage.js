import React, {useContext} from 'react';
import UserContext from '../../contexts/UserContext';
import WorldContext from '../../contexts/WorldContext';
import Element from '../Element';
import {Container} from 'react-bootstrap';
import sort from 'fast-sort';
import {COLORS} from '../../services/colors';

export default function HistoryPage() {

    let world = useContext(WorldContext);
    let user = useContext(UserContext);

    // useListener(user, 'save', () => updateInventory());

    // function onClick(elem) {
    //     user.addItem(elem);
    // }

    return (
        <>
            <Container fluid="sm">
                {COLORS.map(color => (
                    <div key={color} className="mb-4">
                        {sort(user.getKnownElementIDs().map(id => world.getElement(id)).filter(element => element && element.color === color)).asc('name').map((element, i) => (
                            <Element
                                key={element.id + ':' + i}
                                element={element}
                                count={user.getItemCount(element)}
                                // onClick={() => onClick(element)}
                            />
                        ))}
                    </div>
                ))}
            </Container>
        </>
    );
}