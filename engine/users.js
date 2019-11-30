// THIS FILE IS LOCKED BY MARCO TEREH. ANYBODY ELSE PLEASE DO NOT COMMIT TO THIS FILE WITHOUT DISCUSSING IT FIRST.

const consts = require('./common_constants');
const BODYPART_TYPE = consts.BODYPART_TYPE;
const MAX_HEALTH = consts.MAX_HEALTH;
const MAX_INFLATE = consts.MAX_INFLATE;
const INFLATE_RATE = consts.INFLATE_RATE;
const REGEN_RATE = consts.REGEN_RATE;
const ACTION = consts.ACTION;

const CELL_INNER_RADIUS = 14;

class Users {
    constructor() {
        this._users = [];
        this._id = 0;
    }
    get _newId() {return this._id++};

    add(x, y) {
        let newId = this._newId;
        this._users.push(new User(
            newId,
            x, y
        ));
        return newId;
    }

    remove(id) {
        if (typeof(id) !== 'number') return;

        this._users = this._users.filter((user)=>{return user.id !== id});
    }

    forEach(...params) {
        // noinspection JSCheckFunctionSignatures
        this._users.forEach(...params);
    }

    with(id, cb) {
        let found = this._users.find(elem => elem.id === id);
        if (found){
            cb(found);
        }
    }

    find(id) {
        let found = this._users.find(elem => elem.id === id);
        if (found){
            return found;
        }
        return null;
    }
}

module.exports = Users;

class User {
    constructor(id, x, y) {
        this.id = id;
        this.nextActions = [];

        this.x = x;
        this.y = y;
        this.movedV = false;
        this.movedH = false;

        this.callbacks = [];
        this.color = Math.floor(Math.random() * 8);

        this.components = [
            {
                type: BODYPART_TYPE.CELL,
                faces: [-1, -1, -1, -1, -1, -1],
                health: MAX_HEALTH,
                coords: {up: 0, fwd: 0, bwd: 0}
            }
        ];
        this.rotation = 0;
    }

    tick_reset() {
        this.movedH = false;
        this.movedV = false;
    }

    tick_parts() {
        this.components.forEach(component => {
            switch (component.type) {
                case BODYPART_TYPE.BOUNCE:
                    component.inflated += INFLATE_RATE;
                    if (component.inflated >= MAX_INFLATE) {
                        component.inflated = MAX_INFLATE;
                        component.working = true;
                    }
                    break;
                case BODYPART_TYPE.CELL:
                    component.health += REGEN_RATE;
                    if (component.health >= MAX_HEALTH) {
                        component.health = MAX_HEALTH;
                    }
                    break;
                case BODYPART_TYPE.SHIELD:
                case BODYPART_TYPE.SPIKE:
                    break;
                default:
                    console.log('unknown bodypart type encountered')
            }
        })
    }

    register(cb) {
        this.callbacks.push(cb);
    }

    update(content) {
        this.callbacks.forEach(cb => {
            cb(content);
        })
    }

    export() {
        return {
            id: this.id,
            position: {
                x: this.x,
                y: this.y
            },
            color: this.color,
            rotation: this.rotation,
            bodyparts: this.components.slice(),
        }
    }

    act(action) {
        this.nextActions.push(action);
    }

    grow(part, face, type) {
        if (this.components[part].type !== BODYPART_TYPE.CELL) return -1;
        if (this.components[part].faces[face] !== -1) return -2;
        // -3 reserved for no such user
        let newcoords = {
            up: this.components[part].coords.up,
            fwd: this.components[part].coords.fwd,
            bwd: this.components[part].coords.bwd
        };
        if (face === 2 || face === 3) {
            newcoords.up += 1;
        }
        if (face === 5 || face === 0) {
            newcoords.up -= 1;
        }
        if (face === 0 || face === 1) {
            newcoords.fwd += 1;
        }
        if (face === 3 || face === 4) {
            newcoords.fwd -= 1;
        }
        if (face === 4 || face === 5) {
            newcoords.bwd += 1;
        }
        if (face === 1 || face === 2) {
            newcoords.bwd -= 1;
        }
        // This *should* not be possible I think. If it turns out to be expensive maybe we can remove it.
        if (this.components.find(cmp => cmp.coords.up  === newcoords.up
                                              && cmp.coords.fwd === newcoords.fwd
                                              && cmp.coords.bwd === newcoords.bwd)) {
            return -4;
        }

        let newComponent = {};
        let idx = this.components.push(newComponent) - 1;

        newComponent.type = type;
        // noinspection FallThroughInSwitchStatementJS
        switch (type) {
            case BODYPART_TYPE.BOUNCE:
                newComponent.inflated = MAX_INFLATE;
                newComponent.working = true;
            case BODYPART_TYPE.SPIKE:
                newComponent.body = part;
                break;
            case BODYPART_TYPE.CELL:
                newComponent.health = MAX_HEALTH;
                newComponent.faces = [-1, -1, -1, -1, -1, -1];
                newComponent.coords = newcoords;

                this.components.forEach((component, index) => {
                    if (component.coords.up === newComponent.coords.up - 1
                     && component.coords.fwd === newComponent.coords.fwd + 1
                     && component.coords.bwd === newComponent.coords.bwd) {
                        newComponent.faces[0] = index;
                        component.faces[3] = idx;
                    } else if (component.coords.up === newComponent.coords.up
                            && component.coords.fwd === newComponent.coords.fwd + 1
                            && component.coords.bwd === newComponent.coords.bwd - 1) {
                        newComponent.faces[1] = index;
                        component.faces[4] = idx;
                    } else if (component.coords.up === newComponent.coords.up + 1
                            && component.coords.fwd === newComponent.coords.fwd
                            && component.coords.bwd === newComponent.coords.bwd - 1) {
                        newComponent.faces[2] = index;
                        component.faces[5] = idx;
                    } else if (component.coords.up === newComponent.coords.up + 1
                            && component.coords.fwd === newComponent.coords.fwd - 1
                            && component.coords.bwd === newComponent.coords.bwd) {
                        newComponent.faces[3] = index;
                        component.faces[0] = idx;
                    } else if (component.coords.up === newComponent.coords.up
                            && component.coords.fwd === newComponent.coords.fwd - 1
                            && component.coords.bwd === newComponent.coords.bwd + 1) {
                        newComponent.faces[4] = index;
                        component.faces[1] = idx;
                    } else if (component.coords.up === newComponent.coords.up - 1
                            && component.coords.fwd === newComponent.coords.fwd
                            && component.coords.bwd === newComponent.coords.bwd + 1) {
                        newComponent.faces[5] = index;
                        component.faces[2] = idx;
                    }
                });

                break;
            case BODYPART_TYPE.SHIELD:
                break;
            default:
                console.log('invalid bodypart type');
        }

        this.components[part].faces[face] = idx;
        return 0;
    }

    damage(part, amt) {
        let component = this.components[part];
        // noinspection FallThroughInSwitchStatementJS
        switch(component.type) {
            case BODYPART_TYPE.BOUNCE:
                if (component.working) {
                    component.inflated = 0;
                    component.working = false;
                    break;
                }
            case BODYPART_TYPE.SPIKE:
                component = component.body;
            case BODYPART_TYPE.CELL:
                component.health -= amt;
                if (component.health <= 0) {
                    this.shrink(part);
                }
                break;
            case BODYPART_TYPE.SHIELD:
                break;
            default:
                console.log('unknown bodypart encountered: ', component.type);
        }
    }

    shrink(part) {
        if (part === 0) {
            this.act({action: ACTION.DESTROY});
            return;
        }
        delete this.components[part];
        this.components.forEach(component => {
            component.faces = component.faces.map(val => {
                if (val === part) {
                    return -1;
                }
                return val;
            })
        });

        this.mark(0);
        this.components.forEach((component, index) => {
            if (!component.isVisited) {
                delete this.components[index];
            }
        });
        this.unmark(0);
    }

    mark(root = 0, cb) {
        if (this.components[root].isVisited) return;
        this.components[root].isVisited = true;
        cb ? cb(this.components[root]) : 0;
        if(!this.components[root].faces) return;

        this.components[root].faces.forEach(face => {
            if (face === -1) return;
            this.mark(face, cb);
        })
    }

    unmark (part = 0, cb) {
        if (!this.components[part].isVisited) return;
        delete this.components[part].isVisited;
        cb ? cb(this.components[part]) : 0;
        if(!this.components[part].faces) return;

        this.components[part].faces.forEach(face => {
            if (face === -1) return;
            this.unmark(face, cb);
        })
    };

    collides_with_user(user) {
        //TODO(anno): this
        if (this.distance_to_user(user) > this.size() + user.size()) return false;

        let setPos = (part, pos) => {
            if (this.components[part].isVisited) return;
            this.components[part].isVisited = true;

            if (this.components[part].type === BODYPART_TYPE.SHIELD
             || this.components[part].type === BODYPART_TYPE.BOUNCE) {
                this.components[part].position = {x: pos.flat.x, y: pos.flat.y};
            } else {
                this.components[part].position = {x: pos.x, y: pos.y};
            }

            if (this.components[part].type !== BODYPART_TYPE.CELL) return;
            this.components[part].faces.forEach(face => {
                if (face === -1) return;

                //TODO(anno): calculate new position

                setPos(face, {});
            })
        }
    }

    get size() {
        // TODO(anno): maybe make a more exact calculation. For now it returns the largest possible size for these
        // body parts
        return this.components.reduce((acc, part) => {
            if (part.type !== BODYPART_TYPE.CELL) return acc;
            return acc + CELL_INNER_RADIUS * 2;
        }, 0) + CELL_INNER_RADIUS * 2;
    }

    distance_to_user(user) {
        return Math.abs(Math.sqrt((this.x - user.x) * (this.y - user.y)));
    }
}