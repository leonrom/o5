/* global document, window, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {              // ---------------------------------------------- o5shp ---
	"use strict";
	let C = null

	const
		W = {
			modul: 'o5shp',
			Init: ShpInit,
			class: 'olga5_shp',
			consts: `o5shp_dummy=0.123 # просто так, для проверок в all0_.html`,
			incls: {
				names: ['DoScroll', 'DoResize', 'AO5shp', 'DoInit'],
				actscript: document.currentScript,
			},
		},
		o5css = `
.${W.class} {
    // pointer-events: auto;
}
.${W.class}_gask{
	left : 0;
	top : 0;
	position : absolute;
	height : 100%;
	width : 100%;
}
/* .${W.class}_shdw {    opacity: 0.0; }  - вбивать конкретно в STYLE*/
.${W.class}_cart {
    opacity: 1.0;
    background-color:transparent;
    // cursor: pointer;
    direction : ltr; // эти 4 д.б. тут чтобы "перебить" из shp
    position : fixed;
	// position : absolute;
    display : block;
    z-index : 0;
    padding : 0;
    margin : 0;
    border:none;
    overflow: hidden;
    // pointer-events: none; // не обрабатывать события    - ПРОВЕРИТЬ в браузерах !!!!!!!!!!!!!!!!!
}
.${W.class}_cart.isFix {
	cursor: pointer;
}`

	function ShpInit(c) {
		const wshp = window.olga5[W.modul]

		c.ParamsFill(W, o5css)
		wshp.DoInit()

		window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
	}

	if (!window.olga5) window.olga5 = []
	if (!window.olga5[W.modul]) window.olga5[W.modul] = {}
	
	Object.assign(window.olga5[W.modul], { W: W, })
	if (!window.olga5.find(w => w.modul == W.modul)) {
		window.olga5.push(W)
		if (window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/))
			console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error(`Повтор загрузки '${W.modul}`)
})();
