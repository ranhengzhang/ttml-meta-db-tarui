import {Entity} from "./entity.ts";
import {Id} from "./id.ts";

export class Track extends Entity {
    albums: string[] = [];
    feats: string[] = []; // 根据实际类型调整
    ids: Id[] = [];

    constructor(name: string = '') {
        super();
        if (name) this.metas.push(name);
    }
}