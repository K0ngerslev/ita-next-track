import express from 'express';
import { connect } from '../db/connect.js';

const db = await connect();


const port = process.env.PORT || 3003;
const server = express();

server.use(express.static('frontend'));
// serve mp3 files placed in db/tracks at /tracks/<file>
server.use('/tracks', express.static('db/tracks'));
server.use(express.json());
server.use(onEachRequest);
server.post('/api/filter', onPostFilter);
server.listen(port, onServerReady);


function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

function onServerReady() {
    console.log('Webserver running on port', port);
}

async function onPostFilter(request,response){
    let filters = request.body;
    if(filters.genres.length>0 && filters.years.length>0){
    const dbResult = await db.query(`
        select track_id, title, artist, duration, album_cover from tracks
        where genre = any($1::text[]) and (release_year / 10) * 10 = any($2::integer[])
        order by random()
        `, [filters.genres, filters.years]);
    response.json(dbResult.rows);
    }
    if(filters.genres.length>0 && filters.years.length===0){
    const dbResult = await db.query(`
        select track_id, title, artist, duration, album_cover from tracks
        where genre = any($1::text[])
        order by random()
        `, [filters.genres]);
    response.json(dbResult.rows);
    }
    if(filters.genres.length===0 && filters.years.length>0){
    const dbResult = await db.query(`
        select track_id, title, artist, duration, album_cover from tracks
        where (release_year / 10) * 10 = any($1::integer[])
        order by random()
        `, [filters.years]);
    response.json(dbResult.rows);
    }
    if(filters.genres.length===0 && filters.years.length===0){
    const dbResult = await db.query(`
        select track_id, title, artist, duration, album_cover from tracks
        order by random()
    `)
    response.json(dbResult.rows);
    }
}



