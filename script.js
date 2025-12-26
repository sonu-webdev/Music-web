let songs;
let currfolder;

async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3002/${folder}/`);
    let response = await a.text();
    const div = document.createElement('div');
    div.innerHTML = response;
    let as = div.getElementsByTagName('a');

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            let filename = element.href.split("/").pop();
            filename = filename.split("\\").pop();
            filename = filename.replace(/.*%5C/g, "");
            songs.push(filename);
        }
    }

    let songul = document.querySelector(".songlist ul");
    songul.innerHTML = "";

    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `  <li><img src="music.svg" alt="" class="invert">
            <div class="info">
              <div>${song.replaceAll("%20", " ").replaceAll("%5", "").replaceAll("CsongC", "").replaceAll("C    ulture.mp3", "")}</div>
              <div>Sonu</div>
            </div>
            <div class="playnow">
              <div>Play Now</div>
              <img src="play.svg" alt="" class="invert">
            </div></li>  `;
    }

    let lis = document.querySelector('.songlist').getElementsByTagName('li');
    Array.from(lis).forEach(e => {
        e.addEventListener('click', element => {
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
}

function secondToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}

let play = document.getElementById('play');
let currentSong = new Audio();

let playmusic = (track) => {
    // Clean the track name - remove any backslashes or path separators
    let cleanTrack = track.replaceAll("\\", "").replaceAll("%5C", "");

    currentSong.src = `http://127.0.0.1:3002/${currfolder}/` + cleanTrack;
    play.src = "pause.svg";
    currentSong.play();

    document.querySelector(".song-info").innerHTML = decodeURI(cleanTrack);
    document.querySelector(".song-time").innerHTML = "00:00 / 00:00";
}

async function displayAlbum() {
    let a = await fetch(`http://127.0.0.1:3002/song/`);
    let response = await a.text();

    const div = document.createElement('div');
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let cardContainer = document.querySelector(".songs-container");

    for (let i = 0; i < anchors.length; i++) {
        const e = anchors[i];
        let linkText = e.textContent.trim();

        // Skip parent directory
        if (linkText === '../' || linkText === '..' || linkText === '.') continue;

        // If link text ends with / and doesn't contain a file extension, it's a folder
        if (linkText.endsWith('/') && !linkText.match(/\.(mp3|json|jpg|png|svg)$/i)) {
            let folder = linkText.replace(/\/$/, ''); // Remove trailing slash


            // Try to get the metadata of the folder
            try {
                let metaResponse = await fetch(`http://127.0.0.1:3000/song/${folder}/info.json`);
                let metadata = await metaResponse.json();

                cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="song-card">
                  <img src="song/${folder}/cover.jpg" alt="">
                  <h3 class="song-title">${metadata.title}</h3>
                  <p class="song-subtitle">${metadata.description}</p>
                </div>`;
            } catch (error) {
                // Create a card even without info.json
                cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="song-card">
                  <img src="song/${folder}/cover.jpg" alt="" onerror="this.src='music.svg'">
                  <h3 class="song-title">${folder.charAt(0).toUpperCase() + folder.slice(1)}</h3>
                  <p class="song-subtitle">Music Playlist</p>
                </div>`;
            }
        }
    }

    // Attach event listeners AFTER cards are created
    attachPlaylistListeners();
}

function attachPlaylistListeners() {
    Array.from(document.getElementsByClassName("song-card")).forEach(e => {
        e.addEventListener('click', async item => {
            await getsongs(`song/${item.currentTarget.dataset.folder}`)
            // Auto-play first song when switching playlist
            if (songs.length > 0) {
                playmusic(songs[0]);
            }
        })
    });
}

async function main() {
    await getsongs("song/aujla")

    await displayAlbum()

    // Initialize first song with proper URL
    if (songs.length > 0) {
        document.querySelector(".song-info").innerHTML = decodeURI(songs[0])
        currentSong.src = `http://127.0.0.1:3000/${currfolder}/` + songs[0]
    }

    let play = document.getElementById('play')
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "play.svg"
        }
    })

    // listen for timeupdate event
    currentSong.addEventListener('timeupdate', () => {
        document.querySelector('.song-time').innerHTML = `${secondToMinutesSeconds(currentSong.currentTime)}/${secondToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".seek-circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })
    currentSong.addEventListener('ended',()=>{
        let currentTrack = currentSong.src.split("/").pop();
        let index = songs.indexOf(currentTrack);

        if(index >= 0 && index <songs.length-1){
            playmusic(songs[index+1])
        }
        else if(index=== songs.length-1){
            playmusic(songs[0])
        }
    })

    // add a eventlistener to the seekbar
    document.querySelector('.seekbar').addEventListener('click', (e) => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector('.seek-circle').style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    // adding a eventlistener to the hamburger
    document.querySelector('.hamburger').addEventListener('click', () => {
        document.querySelector('.cross').style.display = "block";
        document.querySelector('.sidebar').style.left = '0%';
    })
    document.querySelector('.cross').addEventListener('click', () => {
        document.querySelector('.cross').style.display = "none";
        document.querySelector('.sidebar').style.left = '-110%';
    })

    // Previous and Next buttons - ONLY ADD ONCE
    let previous = document.getElementById('previous');
    let next = document.getElementById('next');

    previous.addEventListener('click', () => {
        let currentTrack = currentSong.src.split("/").pop();
        let index = songs.indexOf(currentTrack);

        if (index > 0) {
            playmusic(songs[index - 1]);
        } else if (index === 0) {
            playmusic(songs[songs.length - 1]);
        } else {
            // If not found, play first song
            if (songs.length > 0) playmusic(songs[0]);
        }
    });

    next.addEventListener('click', () => {
        let currentTrack = currentSong.src.split("/").pop();
        let index = songs.indexOf(currentTrack);

        if (index >= 0 && index < songs.length - 1) {
            playmusic(songs[index + 1]);
        } else if (index === songs.length - 1) {
            playmusic(songs[0]);
        } else {
            // If not found, play first song
            if (songs.length > 0) playmusic(songs[0]);
        }
    });

    // add a event listener to the volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        if (currentSong.volume > 0) {

            document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("mute.svg", "volume.svg")
        }
    })
    // add a event listener for the mute
    document.querySelector(".volume img").addEventListener('click', e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0

        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")

            document.querySelector(".range").getElementsByTagName("input")[0].value = 30
            currentSong.volume = 0.30;


        }
    })
}

main()