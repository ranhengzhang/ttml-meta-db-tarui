export interface Track {
    albums: string[];
    feats: never[]; // 根据实际类型调整
    ids: Array<{ key: string; value: string }>;
    metas: string[];
    uuid: string;
}