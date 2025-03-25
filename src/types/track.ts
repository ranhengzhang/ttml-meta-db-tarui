import {Entity} from "./entity.ts";

export class Track extends Entity{
    albums: string[];
    feats: string[]; // 根据实际类型调整
    ids: Array<{ key: string; value: string }>;

    constructor(name: string = '') {
        super();
        if (name) this.metas.push(name);
    }
}