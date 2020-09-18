import EventEmitter from 'events';

class User extends EventEmitter {
    constructor(storageKey = 'user') {
        super();

        this.storageKey = storageKey;
        this.data = {
            name: null,
            inventory: {},
            knownElements: [],
        };
    }

    get name() {
        return this.data.name;
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
        if(!this.data.knownElements.includes(element)) {
            this.data.knownElements.push(element);
        }
        this.save().catch(console.error);
        return true;
    }

    getKnownElements() {
        return this.data.knownElements;
    }

    async load() {
        this.emit('load', this);
        let item = localStorage[this.storageKey];
        if(item) {
            Object.assign(this.data, JSON.parse(item));
        }
    }

    async save() {
        this.emit('save', this);
        if(this.data) {
            localStorage[this.storageKey] = JSON.stringify(this.data);
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