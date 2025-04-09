export enum IdType {
    NCM = "ncmMusicId",
    QQ = "qqMusicId",
    SPF = "spotifyId",
    AM = "appleMusicId",
    ISRC = "isrc"
}

export interface Id {
    key: string
    value: string
}