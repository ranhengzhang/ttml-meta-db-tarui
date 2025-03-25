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

    async appendArtist(name: string) {
        await this.artists.add(new Artist(name))
    }

    async updateArtist(artist_uuid: string, options: object) {
        await this.artists.update(artist_uuid, options)
    }

    async removeArtist(artist_uuid: string) {
        const artist = await this.artists.get(artist_uuid);
        artist?.albums.forEach(album_uuid => {
            this.removeAlbumFromArtist(album_uuid, artist_uuid)
        })
        this.tracks
            .filter(v=> {
                return v.feats.find(v => v === artist_uuid) !== undefined
            }).toArray().then(l=>{
                l.forEach(v=>db.tracks.update(v.uuid,{feats: v.feats.filter(v=>v !== artist_uuid)}))
        })
        await this.artists.delete(artist_uuid)
    }

    async appendAlbum(name: string) {
        await this.albums.add(new Album(name))
    }

    async updateAlbum(album_uuid: string, options: object) {
        await this.albums.update(album_uuid, options)
    }

    async removeAlbum(album_uuid: string) {}

    async removeAlbumFromArtist(album_uuid: string, artist_uuid: string) {}

    async appendTrack(name: string) {
        await this.tracks.add(new Track(name))
    }

    async updateTrack(track_uuid: string, options: object) {
        await this.tracks.update(track_uuid, options)
    }

    async removeTrack(track_uuid: string) {}

    async removeTrackFromAlbum(track_uuid: string, album_uuid: string) {}
}

export const db = new MetaDatabase();