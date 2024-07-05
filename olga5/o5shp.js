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
				o5shp_dummy=0.123 //  просто так, для проверок в all0_.html;
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
	cursor: pointer;
}`,
		LastDoResize = () => {
			// if (window.olga5.o5shp && window.olga5.o5shp.DoResize)
			window.olga5.o5shp.DoResize('по olga5_ready')
		}

	function ShpInit() {

		C.E.AddEventListener('olga5_ready', e => {
			window.setTimeout(LastDoResize, 1)
		})

		C.ParamsFill(W, o5css)

		const excls = document.getElementsByClassName('olga5_shp_none') 
		for (const excl of excls) {
			const exs = excl.querySelectorAll('[class *=olga5_shp]')
			for (const ex of exs)
				ex.classList.add('olga5_shp_none')
		}

		window.olga5[W.modul].DoInit()

		C.E.DispatchEvent('olga5_sinit', W.modul)

		window.olga5[W.modul].activated = false 	// признак, что было одно из activateEvents 
		const activateEvents = ['click', 'keyup', 'resize'],
			wd = window, // document
			SetActivated = e => {
				window.olga5[W.modul].activated = true
				activateEvents.forEach(activateEvent => wd.removeEventListener(activateEvent, SetActivated))
			}
		activateEvents.forEach(activateEvent => wd.addEventListener(activateEvent, SetActivated))
	}

	// C.ModulAdd(W, { olga5cart: olga5cart, olga5ifix: olga5ifix, })	
	C.ModulAdd(W, { olga5cart: olga5cart, })
})();
