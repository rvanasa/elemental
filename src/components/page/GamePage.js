import React, {useContext, useState} from 'react';
import UserContext from '../../contexts/UserContext';
import WorldContext from '../../contexts/WorldContext';
import Element from '../Element';
import {Container} from 'react-bootstrap';
import Recipe from '../Recipe';
import ElementEditor from '../ElementEditor';
import useListener from '../../hooks/useListener';

export default function GamePage() {

    let world = useContext(WorldContext);
    let user = useContext(UserContext);
    let [inventory, setInventory] = useState(null);
    let [recipe, setRecipe] = useState(null);
    let [suggesting, setSuggesting] = useState(null);

    let primitiveElements = world.primitives;

    useListener(user, 'save', () => updateInventory());

    if(!inventory) {
        updateInventory();
        return;
    }

    function updateInventory() {
        let inventory = Object.keys(user.getInventory())
            .map(id => {
                let elem = world.getElement(id);
                if(!elem) {
                    console.log('Missing element:', id);
                    user.removeItemsWithId(id);
                    return null;
                }
                return elem;
            })
            .filter(elem => elem);

        // sort(inventory).asc([elem => COLORS.indexOf(elem.color) /*Color(elem.color).hue()*/, elem => elem.name]);

        setInventory(inventory);

        // setInventory(user.getInventory());///
    }

    function tryCombine(a, b) {
        if((a === b ? user.hasItem(a, 2) : user.hasItem(a) && user.hasItem(b))) {
            let recipe = world.getRecipe(a, b);
            if(!recipe) {
                recipe = world.addRecipe(a, b);
            }
            if(recipe.local) {
                setSuggesting(recipe.child);
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
        setSuggesting(null);
        if(elem) {
            elem = world.notifyElement(elem);
            if(elem.recipe) {
                recipe = world.notifyRecipe(elem.recipe);
                setRecipe(recipe);

                ///
                user.removeItem(recipe.parent1);
                user.removeItem(recipe.parent2);
            }

            user.suggest(elem)
                .catch(console.error);

            // console.log(elem);
            // addItem(elem);
        }
    }

    // function onClick(elem) {
    //     // console.log(elem);
    //     // tryCombine(elem, elem);
    //
    //     // if(elem.recipe) {
    //     //     setRecipe(elem.recipe);
    //     // }
    //
    //     user.addItem(elem, 1);
    // }

    function InventoryElement({element, ...props}) {
        return <Element
            element={element}
            {...props}
            usable
            // onClick={onClick}
            onDrop={item => tryCombine(element, item.element)}
        />;
    }

    return (
        <>
            {suggesting ? (
                <Container fluid="sm">
                    <ElementEditor element={suggesting} onSubmit={onSubmit}/>
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
                            {/*<Element onDrop={elem=>}></Element>*/}
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