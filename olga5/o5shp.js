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
			class: 'olga5_shp', consts: `o5shp_dummy=0.123 # просто так, для проверок в all0_.html`,
		},
		actscript = document.currentScript,
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
}`,
		timera = '                                                                <   инициирован ' + W.modul,
		IncludedInit = function (args) {
			const wshp = window.olga5[W.modul]
			if (wshp && wshp.DoInit) wshp.DoInit(args) // там будет и console.timeEnd(timera)
			else {
				console.error(`Для ${W.modul}.js не загружен модуль 'DoInit' ??`)
				// if (C.consts.o5debug > 0)
				console.timeEnd(timera)
			}
		}

	function ShpInit(c) {
		console.time(timera)
		if (C && (!c || c == C))  // чтобы не задавать при повторных (тестовых) инициализациях
			window.olga5[W.modul].DoInit([null, W.class, timera])
		else {
			C = c
			if (C.consts.o5debug > 1)
				console.log(` __________________________________________\n   начало  иниц.:   ${W.modul}`)
			const W2 = {
				modul: W.modul,
				names: ['DoScroll', 'DoResize', 'AO5shp', 'DoInit'],
				actscript: actscript,
				iniFun: IncludedInit,
				args: [null, W.class, timera]
			}
			Object.freeze(W2)

			c.ParamsFill(W, o5css)
			C.IncludeScripts(W2)
		}
	}

	if (!window.olga5) window.olga5 = []

	if (!window.olga5[W.modul]) window.olga5[W.modul] = {}
	Object.assign(window.olga5[W.modul], {
		class: W.class,
	})

	if (!window.olga5.find(w => w.modul == W.modul)) {
		window.olga5.push(W)
		console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		// _console.log(`}---< загружен:  ${W.modul}.js`)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error(`Повтор загрузки '${W.modul}`)
})();
