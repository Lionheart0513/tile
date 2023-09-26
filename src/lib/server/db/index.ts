import Database from 'better-sqlite3';
import { DB_PATH } from '$env/static/private';
import type { List } from './types';

const db = new Database(DB_PATH, { verbose: console.log });

export function getList(limit = 50): List[] {
    const sql = `
    select id
    , name
    , description
    from List 
    order by id
    `;
    const stmnt = db.prepare(sql);
    const rows = stmnt.all({ limit });
    return rows as List[];
}

export function registerRecord(name: Text, description: Blob): void {
    const sql = `
    insert into list (name, description)
    values ($name, $description)
    `;

    const stmnt = db.prepare(sql);
    stmnt.run({ name, description });
}

export function updateRecord(selectId: number, name: Text, description: Blob): void {
    const sql = `
    update list
        set name = $name, description = $description
    where id = $selectId
    `;
	const stmnt = db.prepare(sql);
	stmnt.run({ selectId, name, description });
}

export function deleteRecord(selectId: number){
    const sql = `
    delete from list
    where id = $selectId
    `;
    const stmnt = db.prepare(sql);
	stmnt.run({ selectId });
}
