// This module represents a simulated integration with player devices like AirPods
// and Bluetooth speakers

const players = new Map();

// Call this function to play the specified track at the specified party.
// Parameters:
// - partyCode: a string identifying the party at which the track is being played
// - trackId: the ID of the track, a string
// - duration: the duration of the track in milliseconds, a number
// - started: the timestamp at which the playback started, a Date
// - callbackWhenDone: a function of zero arguments, to be called when playback is done
export function play(partyCode, trackId, duration, started, callbackWhenDone) {
    players.set(partyCode, {
        trackId,
        duration,
        started,
        callbackWhenDone,
    });
}

function trackElapsedTimes() {
    const now = Date.now();
    for (const play of players.values()) {
        const elapsed = now - play.started;
        if (play.duration < elapsed) {
            play.callbackWhenDone();
        }
    }
    setTimeout(() => trackElapsedTimes(), 100);
}

trackElapsedTimes();