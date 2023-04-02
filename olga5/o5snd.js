/* global document, window, console*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5snd ---
	'use strict';

	const
		W = {
			modul: 'o5snd',
			Init: SndInit,
			class: 'olga5_snd',
			consts: `		
				o5shift_speed=0.5 # при Shift - замедлять вдвое;
				o5return_time=0.3 # при возобновлении "отмотать" 0.3 сек ;
			`,
			urlrfs: 'btn_play="", btn_stop=',
			incls: {
				names: ['AO5snd', 'Imgs', 'Prep'],
				actscript: document.currentScript,
			}
		},
		css = {
			olga5sndError: `olga5-sndError`, olga5sndLoad: `olga5-sndLoad`, olga5sndPause: `olga5-sndPause`,
			olga5sndPlay: `olga5-sndPlay`, olga5sndNone: `olga5-sndNone`, olga5freeimg: `olga5-freeimg`,
		},
		o5css = `
		.${W.class}:not(.${css.olga5sndNone}) {
			cursor: pointer;
		}
		.${W.class}.${css.olga5sndPlay} {
			cursor: progress;
			animation: olga5_viewTextWash 5s infinite linear;
		}
		.${W.class}.${css.olga5sndPause} {
			cursor: wait;
			animation: none;
		}
		.${W.class}.${css.olga5sndError} {
			opacity: 0.5;
			outline: 2px dotted black;
			cursor: help;
		}
		.${W.class}.${css.olga5sndLoad} {
			opacity: 0.5;
			outline: 1px dotted black;
			cursor: wait;
		}
		img.${W.class}:not(.${css.olga5freeimg}) {
			background-color: transparent;
			position: inherit;
			padding: 0 !important;
			vertical-align: bottom;
			border-radius: 50%;
			box-shadow: none !important;
			animation: none;
			max-height: 28px;
			max-width:  28px;
		}
		img.${W.class}.${css.olga5sndPlay} {
			animation: olga5_sndImgSwing 2s infinite linear;
		}
		@keyframes olga5_viewTextWash {
			100%,0% {background-color: white;color: aqua;}
			75%,25% {background-color: gold;}
			50% {background-color: coral;color: blue;    }
		}
		@keyframes olga5_sndImgSwing {
			100%,50%,0% {transform: rotateZ(0deg);}
			25% {transform: rotateZ(33deg);}
			75% {transform: rotateZ(-33deg);}
		}
	`
	function SndInit(c) {
		const wshp = window.olga5[W.modul]

		wshp.css = css

		c.ParamsFill(W, o5css)

		const mtags = c.SelectByClassName(W.class, W.modul)
		wshp.Prepare(mtags)
		window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
	}

	if (!window.olga5) window.olga5 = []
	if (!window.olga5[W.modul]) window.olga5[W.modul] = {}

	Object.assign(window.olga5[W.modul], { W: W, })
	if (!window.olga5.find(w => w.modul == W.modul)) {
		if (window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/))
			console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		window.olga5.push(W)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error('%c%s', "background: yellow; color: black;border: solid 2px red;", `}---< Повтор загрузки '${W.modul}`)
})();
