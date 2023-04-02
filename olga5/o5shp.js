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
			consts: `		
				o5shp_dummy=0.123; //  просто так, для проверок в all0_.html
                olga5_frames='s';
                olga5_owners='b';
			`,
			incls: {
				names: ['DoScroll', 'DoResize', 'AO5shp', 'DoInit'],
				actscript: document.currentScript,
			},
		},
		olga5cart = 'olga5-cart',
		olga5ifix = 'olga5-ifix',
		o5css = `
.${olga5cart} {
    position : fixed;
    overflow : hidden;
    background-color : transparent;
    direction : ltr; // эти 4 д.б. тут чтобы "перебить" из shp
	opacity: 0;  // это только вначале
}
.${olga5cart}.${olga5ifix} {
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

	Object.assign(window.olga5[W.modul], { W: W, olga5cart: olga5cart, olga5ifix: olga5ifix, })
	if (!window.olga5.find(w => w.modul == W.modul)) {
		if (window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/))
			console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		window.olga5.push(W)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error('%c%s', "background: yellow; color: black;border: solid 2px red;", `}---< Повтор загрузки '${W.modul}`)
})();
