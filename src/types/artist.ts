import {Entity} from "./entity.ts";

export class Artist extends Entity{
    albums: string[] = [];

    constructor(name: string = '') {
        super()
        if (name) this.metas.push(name)
    }
}