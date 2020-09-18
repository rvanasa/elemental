import * as React from 'react';
import Element from './Element';
import ElementText from './ElementText';

export default function Recipe({recipe, child, compact}) {
    return (
        <div className="d-flex align-items-center">
            <Element element={recipe.parent1} compact={compact}/>
            <ElementText>+</ElementText>
            <Element element={recipe.parent2} compact={compact}/>
            <ElementText>=</ElementText>
            <Element element={child || recipe.child} compact={compact}/>
        </div>
    );
}