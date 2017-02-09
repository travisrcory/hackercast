const socketAddr = `${window.location.protocol}//${window.location.hostname}:3001`;

const app = new Vue({
	data: {
		audio: null,
		currentTime: null,
		duration: null,
		paused: null,
		podcast: null,
		socket: io.connect(socketAddr)
	},

	el: '#podcast',

	created: function() {
		const podcastId = window.location.pathname.substr(8);

		this._fetchPodcast(podcastId);
	},

	methods: {
		emitPause: function() {
			this.podcast.currentTime = this.audio.currentTime;
			this.podcast.paused = true;

			this.socket.emit('pause', this.podcast);
		},
		emitPlay: function() {
			this.podcast.startTime = Math.floor((new Date).getTime() - (this.currentTime * 1000));
			this.podcast.paused = false;

			this.socket.emit('play', this.podcast);
		},
		toggle: function() {
			this.paused ? this.emitPlay() : this.emitPause();
		},
		_bindAudioEvents: function() {
			this.audio.oncanplay = () => this.paused ? "" : this.audio.play();
			this.audio.ondurationchange = () => this.duration = this.audio.duration;
			this.audio.onpause = () => this.paused = true;
			this.audio.onplay = () => this.paused = false;
			this.audio.ontimeupdate = () => this.currentTime = this.audio.currentTime;
		},
		_bindSocketEvents: function() {
			this.socket.on('play', () => this.audio.play());
			this.socket.on('pause', () => this.audio.pause());
		},
		_fetchPodcast: function(podcastId) {
			fetch(`/podcast/find/${podcastId}`)
				.then(response => response.json())
				.then(podcast => {
					this.podcast = podcast;

					this._initData();
					this._bindAudioEvents();
					this._bindSocketEvents();
				});
		},
		_initData: function() {
			this.audio = new Audio(`${this.podcast.src}`);

			this.currentTime = this.podcast.paused
				? this.podcast.currentTime
				: ((new Date).getTime() - this.podcast.startTime) / 1000;

			this.paused = this.podcast.paused;

			this.audio.currentTime = this.currentTime;
		}
	}
});