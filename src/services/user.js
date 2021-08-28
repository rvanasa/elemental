import EventEmitter from 'events';
import axios from 'axios';
import {auth} from '../firebase';
import {COLORS} from './colors';

const API_URL = process.env.REACT_APP_API_URL || '';

axios.interceptors.request.use(async config => {
    config.headers.Authorization = 'Bearer ' + await auth.currentUser.getIdToken();
    return config;
});

class User extends EventEmitter {
    constructor(storageKey = 'user') {
        super();

        this.storageKey = storageKey;
        this.data = {
            name: null,
            inventory: {},
            knownElementIDs: [],
        };

        this.account = auth.currentUser;
        auth.onAuthStateChanged((account) => this.setAccount(account));

        this._savePromise = null;
    }

    isLoggedIn() {
        return !!this.account;
    }

    async findAccountOrLogin() {
        if(!this.account) {
            this.account = (await auth.signInAnonymously()).user;
            console.log('Signed in anonymously');
        }
        return this.account;
    }

    setAccount(account) {
        this.account = account;
        this.emit('account', account);
    }

    hasIdentity() {
        return this.account && !this.account.isAnonymous;
    }

    async suggest(element) {
        if(!element.recipe) {
            console.warn('Tried to suggest element without recipe');
            return;
        }

        console.log(element.submitted ? 'Updating' : 'Adding', 'suggestion:', element);
        if(element.recipe) {
            let {recipe} = element;
            await this.findAccountOrLogin();/////
            let response = await axios.post(API_URL + '/suggest-element', {
                parent1: recipe.parent1.id,
                parent2: recipe.parent2.id,
                name: element.name,
                color: COLORS.indexOf(element.color),
            });
            console.log(response);///
            element.submitted = true;
        }
    }

    getName() {
        return this.data.name;
    }

    getInventory() {
        return this.data.inventory;
    }

    hasItem(element, amount = 1) {
        return element.primitive || this.getItemCount(element) >= amount;
    }

    getItemCount(element) {
        return this.getInventory()[element.id];
    }

    removeItem(element, amount = 1) {
        if(element.primitive) {
            return true;
        }
        let inventory = this.getInventory();
        if(inventory.hasOwnProperty(element.id)) {
            let count = inventory[element.id] - amount;
            if(count > 0) {
                inventory[element.id] = count;
            }
            else {
                delete inventory[element.id];
            }
            this.save().catch(console.error);
            return count >= 0;
        }
        return false;
    }

    removeItemsWithId(id) {
        let inventory = this.getInventory();
        if(inventory.hasOwnProperty(id)) {
            delete inventory[id];
            this.save().catch(console.error);
            return true;
        }
        return false;
    }

    addItem(element, amount = 1) {
        if(element.primitive) {
            return true;
        }
        let inventory = this.getInventory();
        if(!inventory.hasOwnProperty(element.id)) {
            inventory[element.id] = amount;
        }
        else {
            inventory[element.id] += amount;
        }
        if(!this.data.knownElementIDs.includes(element.id)) {
            this.data.knownElementIDs.push(element.id);
        }
        this.save().catch(console.error);
        return true;
    }

    getKnownElementIDs() {
        return this.data.knownElementIDs;
    }

    hasKnownElement(element) {
        return element && (this.getKnownElementIDs().includes(element.id) || this.hasItem(element));
    }

    async load() {
        this.emit('load', this);
        let item = localStorage[this.storageKey];
        if(item) {
            Object.assign(this.data, JSON.parse(item));
        }

        console.log('Loaded:', this.data);
    }

    async save() {
        this.emit('save', this);
        if(this.data) {
            if(!this._savePromise) {
                this._savePromise = new Promise((resolve, reject) => {
                    setTimeout(() => {
                        this._savePromise = null;
                        try {
                            localStorage[this.storageKey] = JSON.stringify(this.data);
                            resolve();
                        }
                        catch(e) {
                            reject(e);
                        }
                    });
                });
            }
            return this._savePromise;
        }
    }
}

let user = null;

export async function findUser() {
    if(!user) {
        user = new User();
        await user.load();
    }
    return user;
}

window.USER = () => user;

window.GIVE = function(id, count = 1) {
    user.inventory[id] = (user.inventory[id] || 0) + count;
};