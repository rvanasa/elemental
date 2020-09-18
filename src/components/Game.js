import React, {useContext, useState} from 'react';
import UserContext from '../contexts/UserContext';
import WorldContext from '../contexts/WorldContext';
import Element from './Element';
import {Container} from 'react-bootstrap';
import sort from 'fast-sort';
import Recipe from './Recipe';
import ElementEditor from './ElementEditor';
import useListener from '../hooks/useListener';
import {COLORS} from '../services/colors';

export default function Game() {

    let world = useContext(WorldContext);
    let user = useContext(UserContext);
    let [inventory, setInventory] = useState(null);
    let [recipe, setRecipe] = useState(null);
    let [editing, setEditing] = useState(null);

    let primitiveElements = world.primitives;

    useListener(user, 'save', () => updateInventory());

    if(!inventory) {
        updateInventory();
        return;
    }

    function updateInventory() {
        let inventory = Object.entries(user.getInventory())
            .map(([id, count]) => {
                let elem = world.getElement(id);
                if(!elem) {
                    console.log('Missing element:', id);
                    user.removeItemsWithId(id);
                    return null;
                }
                return elem;
            })
            .filter(elem => elem);

        setInventory(sort(inventory).asc([elem => COLORS.indexOf(elem.color) /*Color(elem.color).hue()*/, elem => elem.name]));
    }

    function tryCombine(a, b) {
        if((a === b ? user.hasItem(a, 2) : user.hasItem(a) && user.hasItem(b))) {
            let recipe = world.getRecipe(a, b);
            if(!recipe) {
                recipe = world.addRecipe(a, b);
            }
            if(recipe.local) {
                setEditing(recipe.child);
                return;
            }

            user.removeItem(a);
            user.removeItem(b);

            let child = recipe.child;

            user.addItem(child);
            console.log('Crafted:', child.name);

            setRecipe(recipe);
        }
    }

    function onSubmit(elem) {
        setEditing(null);
        if(elem) {
            elem = world.notifyElement(elem);
            if(elem.recipe) {
                recipe = world.notifyRecipe(elem.recipe);
                setRecipe(recipe);
            }
            // console.log(elem);
            // addItem(elem);
        }
    }

    function onClick(elem) {
        // console.log(elem);
        // tryCombine(elem, elem);

        if(elem.recipe) {
            setRecipe(elem.recipe);
        }
    }

    function InventoryElement({element, ...props}) {
        return <Element
            element={element}
            {...props}
            usable
            onClick={onClick}
            onDrop={item => tryCombine(element, item.element)}
        />;
    }

    return (
        <>
            {editing ? (
                <Container fluid="sm">
                    <ElementEditor element={editing} onSubmit={onSubmit}/>
                </Container>
            ) : (
                <>
                    <div className="mb-4" style={{background: '#0005'}}>
                        <Container fluid="sm" style={{height: '4em'}}>
                            {recipe && (
                                <>
                                    <Recipe recipe={recipe} compact/>
                                </>
                            )}
                        </Container>
                    </div>
                    <Container fluid="sm">
                        <div className="mb-4">
                            {primitiveElements.map(element => (
                                <InventoryElement key={element.id} element={element}/>
                            ))}
                        </div>
                        <div className="mb-4">
                            {inventory.map((element, i) => (
                                <InventoryElement
                                    key={element.id + ':' + i}
                                    element={element}
                                    count={user.getItemCount(element)}
                                />
                            ))}
                        </div>
                    </Container>
                </>
            )}
        </>
    );
}