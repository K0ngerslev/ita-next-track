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
		dislike_status int not null,
        track_id bigint primary key,
	    title text not null,
	    artist text not null,
		genre text not null,
		release_year int not null,
	    duration real not null,
		album_cover text not null
    )
`);	
console.log('Tables recreated.');

console.log('Importing data from CSV files...');
await upload(db, 'db/short-tracks.csv', `
	copy tracks (dislike_status, track_id, title, artist, genre, release_year, duration, album_cover)
	from stdin
	with csv header`);
console.log('Data imported.');

await db.end();

console.log('Database recreated.');
