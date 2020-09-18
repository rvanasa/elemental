import EventEmitter from 'events';
import {sentenceCase} from 'change-case';
import {v4 as uuidv4} from 'uuid';
import {COLORS} from './colors';

const WORLD_ELEMENT_CHANGE = 'element';
const WORLD_RECIPE_CHANGE = 'recipe';

function shallowReplace(to, from) {
    Object.keys(to).forEach(k => {
        if(!from.hasOwnProperty(k)) {
            delete to[k];
        }
    });
    return Object.assign(to, from);
}

class World extends EventEmitter {
    constructor() {
        super();

        this.primitives = [];
        this.elements = {};
        this.elementByName = {};
        this.recipes = {};
    }

    notifyElement(element) {
        if(!element.id) {
            throw new Error(`Element [${element.name || JSON.stringify(element)}] requires 'id' property`);
        }
        if(this.elements.hasOwnProperty(element.id)) {
            let prev = this.elements[element.id];
            if(!element.local && this.elementByName[prev.name] === this) {
                delete this.elementByName[element.id];
            }
            element = shallowReplace(prev, element);
        }
        else {
            this.elements[element.id] = element;
        }
        if(!element.local) {
            this.elementByName[element.name] = element;
        }
        this.emit(WORLD_ELEMENT_CHANGE, element);
        this.emit(WORLD_ELEMENT_CHANGE + ':' + element.id, element);
        return element;
    }

    notifyRecipe(recipe) {
        let key = this.getRecipeKey(recipe.parent1, recipe.parent2);
        if(!key) {
            throw new Error(`Recipe has invalid parent elements`);
        }
        if(this.recipes.hasOwnProperty(key)) {
            recipe = shallowReplace(this.recipes[key], recipe);
        }
        else {
            this.recipes[key] = recipe;
        }
        this.emit(WORLD_RECIPE_CHANGE, recipe);
        this.emit(WORLD_RECIPE_CHANGE + ':' + key, recipe);
        return recipe;
    }

    getElement(id) {
        return this.elements[id] || null;
    }

    getElementByName(name) {
        return this.elementByName.hasOwnProperty(name) ? this.elementByName[name] : null;
    }

    getRecipeKey(a, b) {
        if(!a.id || !b.id) {
            return null;
        }
        if(a.id > b.id) {
            [a, b] = [b, a];
        }
        return a.id + '+' + b.id;
    }

    getRecipe(a, b) {
        return this.recipes[this.getRecipeKey(a, b)] || null;
    }

    addRecipe(a, b) {
        if(a.id > b.id) {
            [a, b] = [b, a];
        }
        let child = this.notifyElement({
            id: uuidv4(),
            name: a.name + ' + ' + b.name,
            color: Math.random() < .5 ? a.color : b.color,
            local: true,
        });
        let recipe = this.notifyRecipe({
            id: uuidv4(),
            parent1: a,
            parent2: b,
            child,
            local: true,
        });
        recipe.child.recipe = recipe;

        return recipe;
    }

    // updateElement(element){
    //     this.emit('element')
    // }
}

let world = null;

export async function findWorld() {
    if(!world) {
        let [es, rs] = await Promise.all([
            await fetch('/data/Elements.json').then(res => res.json()),
            await fetch('/data/Recipes.json').then(res => res.json()),
        ]);

        world = new World();

        es.forEach(e => {
            e.id = String(e.id);
            e.name = sentenceCase(e.name) || `(Element ${e.id})`;
            e.color = COLORS[e.color];
            e.primitive = e.id < 4;
            world.notifyElement(e);
            if(e.primitive) {
                world.primitives.push(e);
                world.primitives.sort((a, b) => a.id > b.id ? 1 : a.id < b.id ? -1 : 0);
            }
        });
        rs.forEach(r => {
            if(r.parent1 === r.child || r.parent2 === r.child) {
                return;
            }
            if(r.child < 4) {
                return;
            }
            r.parent1 = world.getElement(r.parent1);
            r.parent2 = world.getElement(r.parent2);
            r.child = world.getElement(r.child);

            world.notifyRecipe(r);
        });
    }
    return world;
}