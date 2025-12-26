let songs = [];
let currFolder = "";
let currentSong = new Audio();

async function getSongs(folder) {
  currFolder = folder;

  // fetch info.json
  const res = await fetch(`/${folder}/info.json`);
  const data = await res.json();

  songs = data.songs;

  const songUl = document.querySelector(".songlist ul");
  songUl.innerHTML = "";

  songs.forEach((song) => {
    songUl.innerHTML += `
      <li>
        <img src="svg/music.svg" class="invert">
        <div class="info">
          <div>${song.replace(".mp3", "")}</div>
          <div>Sonu</div>
        </div>
        <div class="playnow">
          <span>Play Now</span>
          <img src="svg/play.svg" class="invert">
        </div>
      </li>
    `;
  });
  async function loadPlaylists() {
  const res = await fetch("/song/playlists.json");
  const playlists = await res.json();

  const container = document.querySelector(".songs-container");
  container.innerHTML = "";

  playlists.forEach(pl => {
    container.innerHTML += `
      <div class="song-card" data-folder="${pl.folder}">
        <img src="/song/${pl.folder}/${pl.cover}"
             onerror="this.src='/svg/music.svg'">
        <h3>${pl.title}</h3>
        <p>${pl.description}</p>
      </div>
    `;
  });

  document.querySelectorAll(".song-card").forEach(card => {
    card.addEventListener("click", async () => {
      await getSongs(`song/${card.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

loadPlaylists(  )
  Array.from(songUl.children).forEach((li, index) => {
    li.addEventListener("click", () => {
      playMusic(songs[index]);
    });
  });
}




function playMusic(track) {
  currentSong.src = `/${currFolder}/${track}`;
  currentSong.play();

  document.getElementById("play").src = "svg/pause.svg";
  document.querySelector(".song-info").innerText = track;
}


  //  time
  
function secondsToTime(seconds) {
  if (isNaN(seconds)) return "00:00";
  let m = Math.floor(seconds / 60);
  let s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}


async function main() {
  await getSongs("song/aujla");

  if (songs.length > 0) {
    playMusic(songs[0]);
    currentSong.pause();
  }

  // play , pause
  document.getElementById("play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "svg/pause.svg";
    } else {
      currentSong.pause();
      play.src = "svg/play.svg";
    }
  });

  /* TIME UPDATE */
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerText =
      `${secondsToTime(currentSong.currentTime)} / ${secondsToTime(currentSong.duration)}`;

    document.querySelector(".seek-circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    const percent = e.offsetX / e.target.clientWidth;
    currentSong.currentTime = currentSong.duration * percent;
  });

  // next
  document.getElementById("next").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    index = (index + 1) % songs.length;
    playMusic(songs[index]);
  });

  // previous
  document.getElementById("previous").addEventListener("click", () => {
    let index = songs.indexOf(currentSong.src.split("/").pop());
    index = (index - 1 + songs.length) % songs.length;
    playMusic(songs[index]);
  });

//  previous
  document.querySelector(".range input").addEventListener("input", (e) => {
    currentSong.volume = e.target.value / 100;
  });

  document.querySelector(".volume img").addEventListener("click", (e) => {
    if (currentSong.volume > 0) {
      currentSong.volume = 0;
      e.target.src = "svg/mute.svg";
    } else {
      currentSong.volume = 0.3;
      e.target.src = "svg/volume.svg";
    }
  });
}

main();
