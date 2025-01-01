/* global document, window */
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
			incls: {
				names: ['DoScroll', 'Boards', 'DoResize', 'AO5shp', 'PO5shp', 'DoInit'],
				actscript: document.currentScript,
			},
		},
		wshp = C.ModulAdd(W)

		function ShpInit  () {

			C.ParamsFill(W)

			const excls = document.getElementsByClassName('olga5_shpNone')
			for (const excl of excls) {
				const exs = excl.querySelectorAll('[class *=olga5_shp]')
				for (const ex of exs)
					ex.classList.add('olga5_shpNone')
			}

			wshp.DoInit()

			C.E.DispatchEvent('o5_scriptDone', W.modul)

			wshp.activated = false 	// признак, что было одно из activateEvents 
			const activateEvents = ['click', 'keyup', 'resize'],
				wd = window, // document
				SetActivated = () => {
					wshp.activated = true
					activateEvents.forEach(activateEvent => wd.removeEventListener(activateEvent, SetActivated))
				}


			activateEvents.forEach(activateEvent => wd.addEventListener(activateEvent, SetActivated))
		}

})();
