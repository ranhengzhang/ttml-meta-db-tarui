import {Dexie, Table} from "dexie";
import {Artist} from "../types/artist.ts";
import {Album} from "../types/album.ts";
import {Track} from "../types/track.ts";

export class MetaDatabase extends Dexie {
    artists!: Table<Artist>;
    albums!: Table<Album>;
    tracks!: Table<Track>;

    constructor() {
        super('MetaDatabase');

        // 定义数据库模式和索引
        this.version(1).stores({
            artists: 'uuid, albums*, metas*', // 索引数组字段用*
            albums: 'uuid, artists*, tracks*, metas*',
            tracks: 'uuid, albums*, ids.key*, metas*' // 索引对象数组属性
        });
    }
}

export const db = new MetaDatabase();