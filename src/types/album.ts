import {Entity} from "./entity.ts";

export class Album extends Entity {
    artists: string[] = [];
    tracks: string[] = [];

    constructor(name: string = '') {
        super();
        if (name) this.metas.push(name);
    }
}