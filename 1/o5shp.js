/* -global document, window */
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
                olga5_frames='b';
                olga5_owners='b';
			`,
			incls: {
				names: ['DoScroll', 'Boards', 'DoResize', 'AO5shp', 'PO5shp', 'DoInit'],
				actscript: document.currentScript,
			},
		},
		o5css = `
			.olga5-clon {
				opacity: 0;
			}
			.olga5-cart {
				cursor: pointer;
                position: fixed;
				overflow: hidden;
			}
		`,
		LastDoResize = () => {
			if (wshp && wshp.DoResize)
				wshp.DoResize('по olga5_ready')
		},
		wshp = C.ModulAdd(W)

		function ShpInit  () {
			C.E.AddEventListener('olga5_ready', () => {
				window.setTimeout(LastDoResize, 1)
			})

			// C.ParamsFill(W)
			C.ParamsFill(W, o5css)

			const excls = document.getElementsByClassName('olga5_shp_none')
			for (const excl of excls) {
				const exs = excl.querySelectorAll('[class *=olga5_shp]')
				for (const ex of exs)
					ex.classList.add('olga5_shp_none')
			}

			wshp.DoInit()

			C.E.DispatchEvent('olga5_sinit', W.modul)

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
