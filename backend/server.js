import express from 'express';
import { connect } from '../db/connect.js';

const db = await connect();


const port = process.env.PORT || 3003;
const server = express();

server.use(express.static('frontend'));
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
    const dbResult = await db.query(`
        select title, artist, duration, album_cover from tracks
        where genre = any($1::text[]) and (release_year / 10) * 10 = any($2::integer[])
        order by random()
        `, [filters.genres, filters.years]);

    response.json(dbResult.rows);
}


