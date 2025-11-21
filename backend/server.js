import express from 'express';
import path from 'path';
import { connect } from '../db/connect.js';
import { play } from './player.js';


const db = await connect();
const tracks = await loadTracks();
const currentTracks = new Map(); // maps partyId to index in tracks

const port = process.env.PORT || 3003;
const server = express();

server.use(express.static('frontend'));
server.use(express.json());
server.use(onEachRequest);
server.get('/api/party/:partyId/currentTrack', onGetCurrentTrackAtParty);
server.get(/\/[a-zA-Z0-9-_/]+/, onFallback); // serve index.html an any other path
server.listen(port, onServerReady);

async function onGetCurrentTrackAtParty(request, response) {
    const partyId = request.params.partyId;
    let trackIndex = currentTracks.get(partyId);
    if (trackIndex === undefined) {
        trackIndex = pickNextTrackFor(partyId);
    }
    const track = tracks[trackIndex];
    response.json(track);
}

function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

async function onFallback(request, response) {
    response.sendFile(path.join(import.meta.dirname, '..', 'frontend', 'index.html'));
}

function onServerReady() {
    console.log('Webserver running on port', port);
}

async function loadTracks() {
    const dbResult = await db.query(`
        select track_id, title, artist, duration
        from   tracks
    `);
    return dbResult.rows;
}

function pickNextTrackFor(partyId) {
    const trackIndex = Math.floor(Math.random() * tracks.length)
    currentTracks.set(partyId, trackIndex);
    const track = tracks[trackIndex];
    play(partyId, track.track_id, track.duration, Date.now(), () => currentTracks.delete(partyId));
    return trackIndex;
}