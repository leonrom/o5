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
			consts: `		
                o5ofram='s';
                o5owner='b';
                o5zindex=999;
			`,
			incls: {
				names: ['DoScroll', 'Boards', 'DoResize', 'AO5shp', 'PO5shp', 'DoInit'],
				actscript: document.currentScript,
			},
		},
		LastDoResize = () => {
			if (wshp && wshp.DoResize)
				wshp.DoResize('по o5_isInited')
		},
		wshp = C.ModulAdd(W)

		function ShpInit  () {
			C.E.AddEventListener('o5_isInited', () => {
				window.setTimeout(LastDoResize, 1)
			})

			C.ParamsFill(W)

			const excls = document.getElementsByClassName('olga5_shp_none')
			for (const excl of excls) {
				const exs = excl.querySelectorAll('[class *=olga5_shp]')
				for (const ex of exs)
					ex.classList.add('olga5_shp_none')
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
