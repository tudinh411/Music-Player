const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'CLHOE_PLAYER';

const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');  


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeated: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [{
        name: "Espresso",
        singer: "Sabrina Carpenter",
        path: './assets/music/Sabrina Carpenter - Espresso (Official Audio) (320).mp3',
        image: 'espresso.png'
    },
    {
        name: "Blank Space",
        singer: "Taylor Swift",
        path: './assets/music/Taylor Swift - Blank Space (320).mp3',
        image: 'blank_space.jpg'
    },
    {
        name: "Cruel Summer",
        singer: "Taylor Swift",
        path: './assets/music/Taylor Swift - Cruel Summer (Official Audio) (320).mp3',
        image: 'cruel_summer.jpeg'
    },
    {
        name: "Save Your Tears",
        singer: "The Weeknd",
        path: './assets/music/The Weeknd - Save Your Tears (Lyrics) (320).mp3',
        image: 'save_your_tears.jpeg'
    },
    {
        name: "Potential",
        singer: "Rosie",
        path: './assets/music/ROSIE - Potential (Lyric Video) (320).mp3',
        image: 'potential.jpeg'
    },
    {
        name: "Drunk Text",
        singer: "Henry Moodie",
        path: './assets/music/Henry Moodie - drunk text (Lyrics) (320).mp3',
        image: 'drunk_text.jpeg'
    },
    {
        name: "Paint The Town Red",
        singer: "Doja Cat",
        path: './assets/music/Doja Cat - Paint The Town Red (Official Video) (320).mp3',
        image: 'doja_cat.jpeg'
    },
    {
        name: "Birds Of A Feather",
        singer: "Billie Eilish",
        path: './assets/music/BIRDS OF A FEATHER (320).mp3',
        image: 'billie.jpeg'
    },
    {
        name: "Small Girl",
        singer: "Lee Young Ji",
        path: './assets/music/smallgirl.mp3',
        image: 'small_girl.jpeg'
    },
    {
        name: "The Hills",
        singer: "The Weeknd",
        path: './assets/music/The Weeknd - The Hills.mp3',
        image: 'the_hills.jpg'
    },
    {
        name: "One Call Away",
        singer: "Charlie Puth",
        path: './assets/music/Charlie Puth - One Call Away [Official Video].mp3',
        image: 'callaway.jpeg'
    },
    {
        name: "Shivers",
        singer: "Ed Sheeran",
        path: './assets/music/Ed Sheeran - Shivers [Official Video] (1).mp3',
        image: 'Ed_Sheeran_-_Shivers.png'
    }],
    setConfig: function (key,value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config));
    },
    isPlayed: [],
    render: function() {
        const htmls = this.songs.map((song,index) => {
            return `<div class="song" data-index="${index}">
                    <div class="thumb" style="background-image: url('./assets/img/${song.image}'); background-position: center;">
                    </div>
                    <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                    </div>
            </div>
            `
        })
        $('.playlist').innerHTML = htmls.join('');
    },
    defineProperties: function (){
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // CD rotation
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ],{
            duration: 10000,
            iterations: Infinity
        })

        cdThumbAnimate.pause();

        // Zoom in / zoom out the cd image
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Handle events when the play button is clicked
        playBtn.onclick = function () { 
            if(_this.isPlaying){
                audio.pause();
            }
            else{
                audio.play();
            }
        }

        // when the song is played
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
            _this.activeSong();
            _this.scrollToActiveSong();
        }

        // when the song is paused
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // when the song progress changes
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progress.value = progressPercent;
                progress.style.background = `linear-gradient(to right, var(--primary-color) ${progressPercent}%, #d3d3d3 ${progressPercent}%)`;
            }
        }

        // Handle when the progress bar is dragged to seek through the song
        progress.oninput = function (e) {
            const seekTime = audio.duration * e.target.value / 100
            audio.currentTime = seekTime;
        }

        // Smooth transition when a new song is loaded
        audio.onloadeddata = function () {
            progress.value = 0;
            progress.style.background = 'linear-gradient(to right, var(--primary-color) 0%, #d3d3d3 0%)';
        };

        // Handle when going to the next song
        nextBtn.onclick = function (){
            if(_this.isRandom){
                _this.playRandomSong();
            }
            else {
                _this.nextSong();
            }
            audio.play();
        }

        // Handle when going to the previous song
        prevBtn.onclick = function () {
            if(_this.isRandom){
                _this.playRandomSong();
            }
            else {
                _this.prevSong();
            }
            audio.play();
        }

        // when songs are randomly played
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom;
            randomBtn.classList.toggle('active', _this.isRandom);
            _this.isPlayed.push(_this.currentIndex);
            _this.setConfig('isRandom',_this.isRandom);
        }

        // Keep repeating a song
        repeatBtn.onclick = function (e) {
            _this.isRepeated = !_this.isRepeated;
            repeatBtn.classList.toggle('active',_this.isRepeated);
            _this.setConfig('isRepeated',_this.isRepeated);
        }

        // Go to the next song when the current song ends
        audio.onended = function (){
            if(_this.isRepeated){
                audio.play();
            } else {
            nextBtn.click();
            }
        
        }

        // Play anysong that is clicked on 
        playlist.onclick = function (e) {
            const songNode = e.target.closest('.song:not(.active)');
            if (songNode || e.target.closest('.option')) {

                // when click on a song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    audio.play();
                    _this.activeSong();
                    _this.scrollToActiveSong();
                }

                // when click on options
                if(e.target.closest('.option')) {

                }
            }
        }
    },
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
            
        }, 50);
    },
    loadCurrentSong: function () { 
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('./assets/img/${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
        if(this.isRandom) {
            this.isPlayed.push(this.currentIndex);
        }
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeated = this.config.isRepeated;
    },
    nextSong: function () {
        this.currentIndex++;
        if(this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if(this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        if (this.isPlayed.length === this.songs.length) {
            this.isPlayed = [];
        }
        else{
            do {
                newIndex = Math.floor(Math.random() * this.songs.length);
            } while (newIndex === this.currentIndex || this.isPlayed.includes(newIndex)) 
        }

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    activeSong: function () {
        var songElements = $$('.song');
        songElements.forEach(song => {
            song.classList.remove('active');
        })

        songElements[this.currentIndex].classList.add('active');

    },
    start: function() {

        // assign configurations to the app
        this.loadConfig();

        // Render playlist
        this.render();

        // Define object properties
        this.defineProperties();

        // Listen to events
        this.handleEvents();

        // Load the first song into UI
        this.loadCurrentSong();

        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeated);
    
    }
}

app.start();

