/* global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5snd/CSS ---
    "use strict"
    const olga5_modul = 'o5snd'

    if (!window.olga5) window.olga5 = []
    if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

    const wshp = window.olga5[olga5_modul],
        css = { _clsError: `_error`, _clsLoad: `_load`, _clsPause: `_pause`, _clsPlay: `_play`, _clsNone: `_none`, o5freeimg: `o5freeimg`, }

    function CSS(olga5_class) {
        return `
.${olga5_class}:not(.${css._clsNone}) {
    cursor: pointer;
}
.${olga5_class}.${css._clsPlay} {
    cursor: progress;
    animation: olga5_viewTextWash 5s infinite linear;
}
.${olga5_class}.${css._clsPause} {
    cursor: wait;
    animation: none;
}
.${olga5_class}.${css._clsError} {
    opacity: 0.5;
    outline: 2px dotted black;
    cursor: help;
}
.${olga5_class}.${css._clsLoad} {
    opacity: 0.5;
    outline: 1px dotted black;
    cursor: wait;
}
img.${olga5_class}:not(.${css.o5freeimg}) {
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
img.${olga5_class}.${css._clsPlay} {
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
    }

    wshp.CSS = CSS
    Object.assign(wshp.CSS, css)
    wshp.CSS.NewClassList = function (snd) { // искусственное создание classList'а
        const cls = [],
            ss = snd.className.split(' ')
        for (const si of ss) {
            const s = si.trim()
            if (s.length > 0) cls.push(s)
        }
        cls.snd = snd
        cls.contains = function (nam) {
            return this.includes(nam)
        }
        cls.remove = function (nam) {
            const k = this.indexOf(nam)
            if (k >= 0) {
                this.splice(k, 1)
                this.snd.className = this.join('')
            }
        }
        cls.add = function (nam) {
            if (!this.includes(nam) ) {
                this.push(nam)
                this.snd.className = this.join('')
            }
        }
        return cls
    }
    
	if (window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/))
    console.log(`}---< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/CSS.js`)
})();
