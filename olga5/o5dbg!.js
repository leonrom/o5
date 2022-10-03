/* global document, window, console */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {               // ---------------------------------------------- o5dbg o5dbgx ---
	'use strict'
	let C = null
	const
		W = {
			modul: 'o5dbg',
			Init: DbgInit,
			// src: document.currentScript.src,
		},
		actscript = document.currentScript,
		timera = '<-}   инициирован ' + W.modul,
		TellInit = function () {
			if (wshp.MousePos) wshp.MousePos()
			if (wshp.CheckCSS) wshp.CheckCSS()
			if (wshp.Listeners) wshp.Listeners()
			if (wshp.DbgLogs) wshp.DbgLogs('o5log')
			console.timeEnd(timera)
			window.dispatchEvent(new window.Event(C.events.o5cinit_ + W.modul))
		}
	function DbgInit(c) {
		let stop = ''
		C = c
		if (C && (C.consts.o5no_mnu || C.consts.o5no_act))
			stop = `DbgInit не выполняется, т.к. задано:` + 
				C.consts.o5no_mnu ? `  C.consts.o5no_mnu=${C.consts.o5no_mnu}` : '' +
				C.consts.o5no_act ? `  C.consts.o5no_act=${C.consts.o5no_act}` : ''
		else {
			console.time(timera)
			if (C.consts.o5_debug > 0)
				console.log(`{-------->    инициализация  ${W.modul}`)

			const names = [],
				o5debug = 'o5debug',
				scrpt = C.scrpts.find(scrpt => scrpt.modul == W.modul)

			if (!scrpt) {
				C.ConsoleError("DbgInit: не найден модуль '" + W.modul + "' ?")
				return
			}

			const o5load = scrpt.script.attributes[o5debug],
				nms = !o5load ? 'P' : ((o5load.includes('*')) ? 'CELP' : o5load.toUpperCase())

			if (nms.includes('C')) names.push('ccss')
			if (nms.includes('E')) names.push('events')
			if (nms.includes('P')) names.push('pos')
			if (names.length > 0) {
				const W2 = {
					modul: W.modul,
					names: names,
					actscript: actscript,
					iniFun: TellInit,
				}
				Object.freeze(W2)
				C.IncludeScripts(W2)
			}
			else
				stop = `не задан атрибут 'o5debug(=[CELP])`
		}
		if (stop) {
			console.error('Отладка не выполнялась: ' + stop)
			window.dispatchEvent(new window.Event(C.events.o5cinit_ + W.modul))
		}
	}

	if (!window.olga5) window.olga5 = []
	window.olga5.push(W)

	if (!window.olga5[W.modul]) window.olga5[W.modul] = { W: W }
	else window.olga5[W.modul].W = W
	const wshp = window.olga5[W.modul]

	console.log(`}---> загружен:  ${W.modul}.js`)
	const e = new window.Event('olga5_sload')
	e.modul = W.modul
	window.dispatchEvent(e)
})();