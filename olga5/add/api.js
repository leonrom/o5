/*
https://developers.google.com/youtube/iframe_api_reference?hl=ru
http://mtyiu.github.io/tutorials/6/youtube-iframe-api.pdf
https://forum.freecodecamp.org/t/adding-a-click-event-to-the-youtube-without-using-their-api/239443
https://developer.mozilla.org/en-US/docs/Web/HTML/Element/video
*/

var scriptUrl = 'https://www.youtube.com/s/player/b128dda0/www-widgetapi.vflset/www-widgetapi.js';
window['yt_embedsEnableHouseBrandAndYtCoexistence'] = true;
try {
	var ttPolicy = window.trustedTypes.createPolicy("youtube-widget-api", {
		createScriptURL: function (x) {
			return x
		}
	});
	scriptUrl = ttPolicy.createScriptURL(scriptUrl)
} catch (e) { 
	console.error(e.message)
}
var YT;
if (!window["YT"])
	YT = {
		loading: 0,
		loaded: 0
	};
var YTConfig;
if (!window["YTConfig"])
	YTConfig = {
		"host": "https://www.youtube.com"
	};
if (!YT.loading) {
	YT.loading = 1;
	(function () {
		var l = [];
		YT.ready = function (f) {
			if (YT.loaded)
				f();
			else
				l.push(f)
		}
			;
		window.onYTReady = function () {
			YT.loaded = 1;
			var i = 0;
			for (; i < l.length; i++)
				try {
					l[i]()
				} catch (e) { 
	console.error(e.message)
				}
		}
			;
		YT.setConfig = function (c) {
			var k;
			for (k in c)
				if (c.hasOwnProperty(k))
					YTConfig[k] = c[k]
		}
			;
		var a = document.createElement("script");
		a.type = "text/javascript";
		a.id = "www-widgetapi-script";
		a.src = scriptUrl;
		a.async = true;
		var c = document.currentScript;
		if (c) {
			var n = c.nonce || c.getAttribute("nonce");
			if (n)
				a.setAttribute("nonce", n)
		}
		var b = document.getElementsByTagName("script")[0];
		b.parentNode.insertBefore(a, b)
	}
	)()
}
;

/////////////

const AddFrame = e => {
	if (YT === null) {
		const script = document.createElement('script')
		script.src = "https://www.youtube.com/iframe_api"
		// script.setAttribute('crossorigin', true)

		YT = 0
		script.onload = function () {
			YT = window.YT
			YT.ready(onYtReady)
		}

		var firstScriptTag = document.getElementsByTagName('script')[0]
		firstScriptTag.parentNode.insertBefore(script, firstScriptTag)
	}

	const tag = e.target

	if (YT && YT.loaded) {
		if (tag.aO5yt.chkmove) {
			tag.removeEventListener('mousemove', AddFrame)
			tag.aO5yt.chkmove = false
		}
		tag.aO5yt.player = new window.YT.Player('player', {
			height: '360',
			width: '640',
			videoId: 'M7lc1UVf-VE',	//tag.aO5yt.videoId,
			events: {
				'onReady': onPlayerReady,
				'onclick': onPlayerClick,
				'onStateChange': onPlayerStateChange
			}
		});
		tag.addEventListener('click', e=>{

	console.log(5)
	e.target.aO5yt.player.playVideo()
		})
	}

	// const tag = e.target,
	// 	videoId = tag.attributes[sel].nodeValue,
	// 	src = "//www.youtube.com/embed/" + videoId + "",
	// 	pars = "color='white'; theme='light'; showinfo=0 rel=0 iv_load_policy=3 fs=0 disablekb=1 controls=2 autoplay=0 "

	// tag.innerHTML = "<iframe src=\"" + src + "?" + pars + "\"  style='border: none;width: 100%;height: 100%'></iframe>"

}
