/* global document, window, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {              // ---------------------------------------------- o5shp ---
	"use strict";

	const
		C = window.olga5.C,
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
				names: ['DoScroll', 'DoResize', 'MakeAO5', 'DoInit'],
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
}`,
		LastDoResize = () => {
			// if (window.olga5.o5shp && window.olga5.o5shp.DoResize)
			window.olga5.o5shp.DoResize('по olga5_ready')
		}

	function ShpInit() {

		// window.addEventListener('olga5_ready', e => {
		C.E.AddEventListener('olga5_ready', e => {		
			window.setTimeout(LastDoResize, 1)
		})

		C.ParamsFill(W, o5css)
		window.olga5[W.modul].DoInit()

		// window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		C.E.DispatchEvent('olga5_sinit', W.modul)

		window.olga5[W.modul].activated = false 	// признак, что было одно из activateEvents = ['click', 'keyup', 'resize']
		const activateEvents = ['click', 'keyup', 'resize'],
			wd = window, // document
			SetActivated = e => {
				window.olga5[W.modul].activated = true
				activateEvents.forEach(activateEvent => wd.removeEventListener(activateEvent, SetActivated))
			}
		activateEvents.forEach(activateEvent => wd.addEventListener(activateEvent, SetActivated))
	}

	C.ModulAdd(W, { olga5cart: olga5cart, olga5ifix: olga5ifix, })
})();
