addEventListener("DOMContentLoaded", () => {
    let partyCode = establishPartyCode();
    history.replaceState(null, '', partyCode);
    addEventListener('popstate', () => {
        partyCode = establishPartyCode();
    });
    pollForCurrentTrackAt(partyCode);
});

// Extract party code from browser's address field
// or make one up, if it doesn't have one
function establishPartyCode() {
    const pathname = window.location.pathname;
    if (pathname.startsWith('/') && pathname.length > 1) {
        return pathname.substring(1);
    } else {
        return crypto.randomUUID().substring(0, 4);
    }
}

// Start polling loop, repeated asking server for the current track
async function pollForCurrentTrackAt(partyCode) {
    const path = `/api/party/${partyCode}/currentTrack`;
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`GET ${path} failed with ${response.status} ${response.statusText}`)
    }
    const track = await response.json();
    renderCurrentTrack(partyCode, track);
    setTimeout(() => pollForCurrentTrackAt(partyCode), 1000); // refresh every 1000ms
}

// update HTML to reflect party ID and current track
function renderCurrentTrack(partyId, track) {
    const contentDiv = document.getElementById('content');
    contentDiv.textContent = `Party ${partyId} is now listening to ${track.title} by ${track.artist}`
}

