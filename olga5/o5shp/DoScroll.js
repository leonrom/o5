/*jshint asi:true          */
/* -global window, console */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoScroll ---
	"use strict"

	const
		olga5_modul = "o5shp",
		modulname = 'DoScroll',
		C = window.olga5.C,
		Scroll = () => {

		},
		// FindDoFix=aO5s=>
		DoScroll = (aO5, doFix) => {
// тут как-то отслеживать изменения и уже по ним вкл AddEventListener

			aO5.visi.doFix=doFix

			for (const aO5 of pO5.aO5s)
				aO5.SetFix()

			let isfix = false
			for (const aO5 of pO5.aO5s)
				if (aO5.act.isFixed) {
					ShowFix(aO5)
					isfix = true

				}

			const eve = 'scroll'
			if (C.E.HasEventListener(eve, Scroll)) {
				if (!isfix)
					C.E.RemoveEventListener(eve, Scroll)
			} else {
				if (isfix)
					C.E.AddEventListener(eve, Scroll)
			}



			// timeStamp = etimeStamp ? etimeStamp : (Date.now() + Math.random())

			// if (aO5s.length > 0) {
			// 	const debug = wshp.W.consts.o5debug > 2
			// 	if (debug)
			// 		console.groupCollapsed(`  старт DoScroll для '` + (() => {
			// 			let s = ''
			// 			aO5s.forEach(aO5 => { s += (s ? ', ' : '') + `${aO5.name}(top=${parseInt(aO5.posW.top)}) ` })
			// 			return s
			// 		})() + "'" + ' (t=' + (Date.now() - datestart) + ')')

			// 	DoScroll(aO5s)

			// 	if (debug) {
			// 		console.trace("трассировка вызовов ")
			// 		console.groupEnd()
			// 	}
			// }

			//  window.olga5.C.E.AddEventListener('olga5_observed', ShowCarcCB)

			// // window.dispatchEvent(new window.Event('o5shp_scroll'))
			// C.E.DispatchEvent('o5shp_scroll', 'OldScroll', true)

			// window.olga5.C.E.AddEventListener('olga5_fix-act', ShowCarcCB)
		},
		wshp = C.ModulAddSub(olga5_modul, modulname, DoScroll)

})();
