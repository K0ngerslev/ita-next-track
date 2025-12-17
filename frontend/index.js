console.log('index.js loaded');
// 1. Get the buttons and bars we need to control
const playButton = document.getElementById('playPause');        // the big play/pause button
const progressBar = document.getElementById('progressContainer'); // the gray bar you click on
const greenProgress = document.getElementById('progress');         // the green part that grows
const timeDisplay = document.getElementById('currentTime');      // shows "00:59"
const img = document.getElementById('toggleImage');
// Set default image
const shuffle = document.getElementById('shufflePlaylist');
const liked = document.getElementById('likedPlaylist');
const audio = document.getElementById('audio');
const nextTrack = document.getElementById('nextTrack');
const imgDislike = document.getElementById('imgDislike');



// 2. Remember if the music is playing or paused
let musicIsPlaying = false;
let playLikedSongs = false;

shuffle.addEventListener('click', function (){
    playLikedSongs=false
    shuffle.classList.add('clicked');
    if(liked.classList.contains('clicked')){
    liked.classList.remove('clicked');
    }
    
    // Revert back to normal playlist
    currentIndex = 0;
    if (trackList.length > 0) {
        showCurrentTrack();
        musicIsPlaying = true;
        img.src = 'img/pause.jpg';
        moveProgressTo(0);
    } else {
        console.log('No tracks in playlist yet');
    }
    
    console.log(playLikedSongs)
});
liked.addEventListener('click', function (){
    playLikedSongs=true
    liked.classList.add('clicked');
    if(shuffle.classList.contains('clicked')){
    shuffle.classList.remove('clicked');
    }
        
    
    // Start playing liked songs
    currentIndex = 0;
    if (likedSongs.length > 0) {
        playLikedTracks();
        musicIsPlaying = true;
        img.src = 'img/pause.jpg';
        moveProgressTo(0);
    } else {
        console.log('No liked songs yet');
    }
    
    console.log(playLikedSongs);
})

let trackList = [];       // all filtered tracks from server
let currentIndex = 0;     // which song we are on

// 3. When someone clicks the Play/Pause button
if (playButton) {
    playButton.addEventListener('click', function () {
    // Switch between playing and paused
    musicIsPlaying = !musicIsPlaying;

    // Change the text on the button so people know what will happen next
    if (musicIsPlaying) {
        img.src = 'img/pause.jpg';   // show pause symbol when playing
        if (audio) audio.play().catch(err => console.warn('audio play error:', err));
    } else {
        img.src = 'img/play.png';    // show play symbol when paused
        if (audio) audio.pause();
    }
    });
} 


const likeButton = document.getElementById('imgLike');
if (likeButton) {
    likeButton.addEventListener('click', () => {
        // Toggle 'liked' state via CSS class and then update the src.
        likeButton.classList.toggle('liked');
        likeButton.src = likeButton.classList.contains('liked') ? 'img/green thumb.png' : 'img/like.png';
        // Keep a11y state updated
        likeButton.setAttribute('aria-pressed', likeButton.classList.contains('liked'));
    });
} 

    
document.getElementById('confirm-btn').addEventListener('click', async function (){
    const selectedFilters = {
        genres: [],
        years: []
    };
    document.querySelectorAll('#genres input[type="checkbox"]:checked').forEach(checkbox => {
        selectedFilters.genres.push(checkbox.value);
    });
        document.querySelectorAll('#years input[type="checkbox"]:checked').forEach(checkbox => {
        selectedFilters.years.push(checkbox.value);
    });
    console.log('Selected Filters:', selectedFilters);

    try {
        const response = await fetch('/api/filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(selectedFilters)
        });
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
console.log('Results', data);

trackList = data;
currentIndex = 0;

// Start showing the first + next track
if(!playLikedSongs){
    showCurrentTrack();
}
if(playLikedSongs){
    playLikedTracks();
}

// Start playback
musicIsPlaying = true;
img.src = 'img/pause.jpg';
moveProgressTo(0);

    } catch (error){
        console.error('Error:', error);
    }
    });
// 4. When someone clicks anywhere on the progress bar
if (progressBar) {
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
} else {
    console.warn('Progress bar (#progressContainer) missing');
}
 let totalSongSeconds = 20;

// 5. A helper function that moves the green bar and updates the time
function moveProgressTo(percent) {
    greenProgress.style.width = percent + '%';  // make green bar this wide

    
   

    // Calculate how many seconds into the song we are
    let currentSeconds = Math.round(totalSongSeconds * percent / 100);

    // Turn seconds into MM:SS format (like 01:23)
    let minutes = Math.floor(currentSeconds / 60);   // how many whole minutes
    let seconds = currentSeconds % 60;               // leftover seconds

    // Always show two digits (add a 0 if needed)
    let minutesText = minutes.toString().padStart(2, '0');
    let secondsText = seconds.toString().padStart(2, '0');

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
    // Move to next track

    if(!playLikedSongs){
    currentIndex = (currentIndex + 1) % trackList.length;
    showCurrentTrack();
    }
    if(playLikedSongs){
        currentIndex = (currentIndex + 1) % likedSongs.length;
        playLikedTracks();
    }

    // Reset progress bar
    moveProgressTo(0);
} else {
    moveProgressTo(currentPercent);
}
        }
    }
, 100);
moveProgressTo(0); 



function showCurrentTrack() {
    if (!trackList.length) return;

    const current = trackList[currentIndex];
    const next = trackList[(currentIndex + 1) % trackList.length];

    // Update current track UI
    document.getElementById('currentCover').src = current.album_cover;
    document.getElementById('currentTrack').textContent =
        `${current.title} by ${current.artist}`;
    totalSongSeconds = current.duration;
    document.getElementById('trackLength').textContent = current.duration;

    // Update next track UI
    document.getElementById('nextCover').src = next.album_cover;
    document.getElementById('nextTrack').textContent =
        `${next.title} by ${next.artist}`;
        likeButton.classList.remove('liked');
        likeButton.src = 'img/like.png';
        likeButton.setAttribute('aria-pressed', 'false');
        imgDislike.src = 'img/dislike.png';
        isLiked();

    // Play local file named by track_id if present in /tracks
    try {
        if (audio && current.track_id) {
            const src = `/tracks/${current.track_id}.mp3`;
            // set audio src and play
            audio.src = src;
            audio.play().catch(err => console.warn('audio play error:', err));
        }
    } catch (e) {
        console.warn('Error setting audio source for track_id', e);
    }
}

document.getElementById("gear").addEventListener("click", function(){
    const filters = document.getElementById("filters");
    const confirm = document.getElementById('confirm-btn');

    if (filters.classList.contains("hidden")){
        filters.classList.remove("hidden");
        confirm.classList.remove("invisible");
        filters.classList.add("shown");
        confirm.classList.add("visible");
        
    }
    else if (filters.classList.contains("shown")){
        filters.classList.remove("shown");
        confirm.classList.remove("visible");
        filters.classList.add("hidden");
        confirm.classList.add("invisible");
       
    }
       
})

let likedSongs = [];

document.getElementById("imgLike").addEventListener("click", function(){
    for(let i = 0; i < trackList.length; i++){
        if(nextTrack.innerHTML.includes(trackList[i].title)){
            
            // Check if already in likedSongs
            let found = false;
            for(let j = 0; j < likedSongs.length; j++){
                if(likedSongs[j].title === trackList[i].title){
                    // Correctly remove the specific song by index
                    likedSongs.splice(j, 1);
                    console.log('removed', trackList[i].title, 'from liked songs');
                    imgLike.src='img/like.png';
                    found = true;
                    break; // Exit the inner loop after removing
                }
            }
            
            // If not found in likedSongs, add it
            if (!found) {
                likedSongs.push(trackList[i]);
                console.log('added', trackList[i].title, 'to playlist');
                imgLike.src='img/green thumb.png';
            }
            
            break; // Important: stop searching trackList after finding the match
        }  
    }
    console.log('liked Songs:', likedSongs);
});
//tjekker om en sang allerede er liked
function isLiked(){
for(let i=0;i<likedSongs.length;i++){
    if(nextTrack.innerHTML.includes(likedSongs[i].title)){
        imgLike.src='img/green thumb.png';
        break;
    }
}
}
//skip sang
document.getElementById('skip').addEventListener("click",function(){
    if(playLikedSongs){
        currentIndex = (currentIndex + 1) % likedSongs.length;
        playLikedTracks();
    } else {
        currentIndex = (currentIndex + 1) % trackList.length;
        showCurrentTrack();
    }
    // Make sure skipping actually starts playback and updates UI
    musicIsPlaying = true;
    img.src = 'img/pause.jpg';
    if (audio) audio.play().catch(err => console.warn('audio play error:', err));
    moveProgressTo(0);
    console.log('skipped song');
})

document.getElementById('previous').addEventListener("click",function(){
    if(playLikedSongs){
        currentIndex = (currentIndex - 1 + likedSongs.length) % likedSongs.length;
        playLikedTracks();
    } else {
        currentIndex = (currentIndex - 1 + trackList.length) % trackList.length;
        showCurrentTrack();
    }
    musicIsPlaying = true;
    img.src = 'img/pause.jpg';
    if (audio) audio.play().catch(err => console.warn('audio play error:', err));
    moveProgressTo(0);
    console.log('previous song');
})
function playLikedTracks() {
    if (!likedSongs.length) return;

    const current = likedSongs[currentIndex];
    const next = likedSongs[(currentIndex + 1) % likedSongs.length];

    // Update current track UI
    document.getElementById('currentCover').src = current.album_cover;
    document.getElementById('currentTrack').textContent =
        `${current.title} by ${current.artist}`;
    totalSongSeconds = current.duration;
    document.getElementById('trackLength').textContent = current.duration;

    // Update next track UI
    document.getElementById('nextCover').src = next.album_cover;
    document.getElementById('nextTrack').textContent =
        `${next.title} by ${next.artist}`;
        likeButton.classList.remove('liked');
        likeButton.src = 'img/like.png';
        likeButton.setAttribute('aria-pressed', 'false');
        imgDislike.src = 'img/dislike.png';
        isLiked();
    try {
        if (audio && current.track_id) {
            const src = `/tracks/${current.track_id}.mp3`;
            audio.src = src;
            audio.play().catch(err => console.warn('audio play error:', err));
        }
    } catch (e) {
        console.warn('Error setting audio source for liked track', e);
    }
}
const dislikeArray = [];
imgDislike.addEventListener('click', function(){
   for(let i=0;i<trackList.length;i++){
        if(nextTrack.innerHTML.includes(trackList[i].title)){
            dislikeArray.push(trackList[i]);
            console.log('removed', trackList[i].title, 'from playlist');
            trackList.splice(i,1);
            imgDislike.src='img/red thumb.png';
        }
   } 
})

