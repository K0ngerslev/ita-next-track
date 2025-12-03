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
function onPostFilter(request,response){
    console.log(request.body);
    response.json('ok');
}


