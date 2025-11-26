import { upload } from 'pg-upload';
import { connect } from './connect.js';

console.log('Recreating database...');

const db = await connect();

console.log('Dropping tables...');
await db.query('drop table if exists tracks');
console.log('All tables dropped.');

console.log('Recreating tables...');
await db.query(`
    create table tracks (
        track_id bigint primary key,
	    title text not null,
	    artist text not null,
		genre text not null,
		release_year not null,
	    duration int not null
    )
`);
console.log('Tables recreated.');

console.log('Importing data from CSV files...');
await upload(db, 'db/short-tracks.csv', `
	copy tracks (track_id, title, artist, genre, release_year, duration)
	from stdin
	with csv header`);
console.log('Data imported.');

await db.end();

console.log('Database recreated.');
