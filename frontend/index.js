// 1. Get the buttons and bars we need to control
const playButton       = document.getElementById('playPause');        // the big play/pause button
const progressBar      = document.getElementById('progressContainer'); // the gray bar you click on
const greenProgress    = document.getElementById('progress');         // the green part that grows
const timeDisplay      = document.getElementById('currentTime');      // shows "00:59"

// 2. Remember if the music is playing or paused
let musicIsPlaying = false;

// 3. When someone clicks the Play/Pause button
playButton.addEventListener('click', function () {
    // Switch between playing and paused
    musicIsPlaying = !musicIsPlaying;

    // Change the text on the button so people know what will happen next
    if (musicIsPlaying) {
        playButton.textContent = 'Pause';   // show pause symbol when playing
    } else {
        playButton.textContent = 'Play';    // show play symbol when paused
    }
});

// 4. When someone clicks anywhere on the progress bar
progressBar.addEventListener('click', function (event) {
    // Find out exactly where they clicked
    const clickedPosition = event.clientX;                    // where the mouse is on the screen
    const barLeftSide     = progressBar.getBoundingClientRect().left; // where the bar starts
    const barWidth        = progressBar.getBoundingClientRect().width; // how wide the bar is

    // Calculate what percentage of the bar they clicked (0% = start, 100% = end
    const clickedPercent = (clickedPosition - barLeftSide) / barWidth * 100;

    // Make sure the percentage stays between 0 and 100
    const safePercent = Math.max(0, Math.min(100, clickedPercent));

    // Now move the green bar and update the time
    moveProgressTo(safePercent);
});

// 5. A helper function that moves the green bar and updates the time
function moveProgressTo(percent) {
    greenProgress.style.width = percent + '%';  // make green bar this wide

    // The song is 2 minutes long (120 seconds)
    let totalSongSeconds = 120;

    // Calculate how many seconds into the song we are
    let currentSeconds = Math.round(totalSongSeconds * percent / 100);

    // Turn seconds into MM:SS format (like 01:23)
    let minutes = Math.floor(currentSeconds / 60);   // how many whole minutes
    let seconds = currentSeconds % 60;               // leftover seconds

    // Always show two digits (add a 0 if needed)
    let minutesText = minutes.toString().padStart(2, '0');
    secondsText = seconds.toString().padStart(2, '0');

    // Show the time on the screen
    timeDisplay.textContent = minutesText + ':' + secondsText;
}

// 6. Make the song "play" automatically so you can see the bar move
// This runs every half second (500 milliseconds)
setInterval(function () {
    if (musicIsPlaying) {
        // Get current width of the green bar (e.g. "45.5%")
        let currentPercent = parseFloat(greenProgress.style.width) || 0;

        // Move it forward a little bit
        currentPercent = currentPercent + 0.5; // change this number to make it faster/slower

        // If we reached the end → stop and reset
        if (currentPercent >= 100) {
            musicIsPlaying = false;
            playButton.textContent = 'Play';
            moveProgressTo(0); // go back to the beginning
        } else {
            moveProgressTo(currentPercent);
        }
    }
}, 500);

// Start with the correct time showing (00:59 in the screenshot)
moveProgressTo(0); // 49% ≈ 59 seconds of a 120-second song

// --- Filters: allow multiple selections and send to server ---
const confirmButton = document.querySelector('.confirm-btn');
const currentTrackEl = document.getElementById('currentTrack');
let allTracks = [];

// Load the tracks dataset used for client-side filtering
fetch('tracks.json').then(r => r.json()).then(data => { allTracks = data; }).catch(err => { console.error('Could not load tracks.json', err); });

confirmButton.addEventListener('click', () => {
    // Gather checked filters
    const checked = Array.from(document.querySelectorAll('.filter-checkbox:checked'));
    const filters = {};
    for (const cb of checked) {
        const group = cb.dataset.group;
        filters[group] = filters[group] || [];
        filters[group].push(cb.value);
    }
    // Filter locally using loaded dataset
    const genres = filters.genre || [];
    const years = filters.year ? filters.year.map(y => parseInt(y)) : [];

    const matches = allTracks.filter(track => {
        let ok = true;
        if (genres.length) {
            ok = ok && genres.includes(track.genre);
        }
        if (years.length) {
            // years are treated as decade starts (e.g., 1960 => 1960-1969)
            const yearOk = years.some(decadeStart => {
                const start = parseInt(decadeStart);
                const end = start + 9;
                return track.release_year >= start && track.release_year <= end;
            });
            ok = ok && yearOk;
        }
        return ok;
    });

    if (!matches.length) {
        if (!allTracks.length) {
            // fallback: ask server for a track if no local data
            fetch('/api/party/default/currentTrack').then(r => r.json()).then(track => {
                currentTrackEl.textContent = `${track.title} by ${track.artist}`;
            }).catch(err => {
                currentTrackEl.textContent = 'No tracks match the selected filters.';
            });
            return;
        }
        currentTrackEl.textContent = 'No tracks match the selected filters.';
        return;
    }
    // pick a random match
    const picked = matches[Math.floor(Math.random() * matches.length)];
    currentTrackEl.textContent = `${picked.title} by ${picked.artist}`;
});
