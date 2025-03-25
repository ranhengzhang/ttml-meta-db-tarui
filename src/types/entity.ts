import { v4 as uuidv4 } from 'uuid';

export class Entity {
    uuid: string = uuidv4();
    metas: string[] = [];
}