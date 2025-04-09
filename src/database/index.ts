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
            artists: 'uuid, albums*, metas*, members*', // 索引数组字段用*
            albums: 'uuid, artists*, tracks*, metas*',
            tracks: 'uuid, albums*, ids*, metas*' // 索引对象数组属性
        });
    }

    async updateArtist(artist_uuid: string, changes: object) {
        await this.artists.update(artist_uuid, changes)
    }

    async removeArtist(artist_uuid: string) {
        const artist = await this.artists.get(artist_uuid) as Artist
        for(const album_uuid of artist.albums) {
            await this.removeAlbumFromArtist(album_uuid, artist_uuid)
        }
        this.tracks
            .filter(v => {
                return v.feats.find(v => v === artist_uuid) !== undefined
            }).toArray().then(async l => {
            await Promise.all(l.map(v => db.tracks.update(v.uuid, {feats: v.feats.filter(v => v !== artist_uuid)})))
        })
        await this.artists.delete(artist_uuid)
    }

    async updateAlbum(album_uuid: string, changes: object) {
        await this.albums.update(album_uuid, changes)
    }

    async appendAlbumToArtist(album_uuid: string, artist_uuid: string) {
        const artist = await this.artists.get(artist_uuid) as Artist;
        const album = await this.albums.get(album_uuid) as Album;

        await this.artists.update(artist_uuid, {albums: [...artist.albums, album_uuid]})
        await this.albums.update(album_uuid, {artists: [...album.artists, artist_uuid]})
    }

    async removeAlbumFromArtist(album_uuid: string, artist_uuid: string) {
        const artist = await this.artists.get(artist_uuid);
        const album = await this.albums.get(album_uuid);

        await this.artists.update(artist_uuid, {albums: artist?.albums.filter(v => v !== album_uuid)})
        await this.albums.update(album_uuid, {artists: album?.artists.filter(v => v !== artist_uuid)})

        await this.tryRemoveAlbum(album_uuid)
    }

    async tryRemoveAlbum(album_uuid: string) {
        const album: Album = await this.albums.get(album_uuid) as Album

        if (album?.artists.length) return
        for (const v of album?.tracks) {
            await this.removeTrackFromAlbum(v, album_uuid)
        }
    }

    async updateTrack(track_uuid: string, changes: object) {
        await this.tracks.update(track_uuid, JSON.parse(JSON.stringify(changes)))
    }

    async appendTrackToAlbum(track_uuid: string, album_uuid: string) {
        const track = await this.tracks.get(track_uuid) as Track;
        const album = await this.albums.get(album_uuid) as Album;

        await this.tracks.update(track_uuid, {albums: [...track.albums, album_uuid]})
        await this.albums.update(album_uuid, {tracks: [...album.tracks, track_uuid]})
    }

    async removeTrackFromAlbum(track_uuid: string, album_uuid: string) {
        const track = await this.tracks.get(track_uuid) as Track;
        const album = await this.albums.get(album_uuid) as Album;

        await this.tracks.update(track_uuid, {albums: track.albums.filter(v => v !== album_uuid)})
        await this.albums.update(album_uuid, {tracks: album.tracks.filter(v => v !== track_uuid)})
    }

    async appendFeatToTrack(artist_uuid: string, track_uuid: string) {
        const track = await this.tracks.get(track_uuid) as Track

        await this.tracks.update(track_uuid, {feats: [...track.feats, artist_uuid]})
    }

    async removeFeatFromTrack(artist_uuid: string, track_uuid: string) {
        const track = await this.tracks.get(track_uuid) as Track

        await this.tracks.update(track_uuid, {feats: track.feats.filter(v=>v!==artist_uuid)})
    }

    async copyXml(track_uuid: string) {
        const track = await this.tracks.get(track_uuid) as Track
        const albums = await Promise.all(track.albums.map(async u => await this.albums.get(u)))
        let artists = [...await Promise.all(track.feats.map(async u => await this.artists.get(u))), ...await Promise.all([...new Set(albums.flatMap(v => v?.artists))].map(async u => await this.artists.get(u)))]
        const members = await Promise.all(artists.flatMap(v => v?.members).map(async v => await this.artists.get(v)))
        artists = Array.from(new Set([...artists, ...members]))
        const xml = [...track.ids.map(t => ({key: t.key, value: t.value})), ...track.metas.map(v => ({
            key: 'musicName',
            value: v
        })), ...albums.flatMap(v => v?.metas).map(v => ({
            key: 'album',
            value: v
        })), ...artists.flatMap(v => v?.metas).map(v => ({key: 'artists', value: v}))]
        const keys = ['ncmMusicId', 'qqMusicId', 'spotifyId', 'appleMusicId', 'isrc', 'musicName', 'artists', 'album']

        return keys.flatMap(k=>xml.filter(s=>s.key===k).map(t=>`<amll:meta key="${t.key}" value="${t.value}"/>`)).join("")
    }
}

export const db = new MetaDatabase();