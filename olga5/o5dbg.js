/* global document, window, console */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {               // ---------------------------------------------- o5dbg o5dbgx ---
	'use strict'
	let wshp = null
	const
		C = window.olga5.C,
		W = {
			modul: 'o5dbg',
			Init: DbgInit,
			consts: `o5load=CELP`,
			incls: {
				names: [],
				actscript: document.currentScript,
			}
		},
		actscript = document.currentScript
		// timera = '<-}   инициирован ' + W.modul

	function DbgInit() {
		if (wshp.Pos) wshp.Pos()
		if (wshp.Ccss) wshp.Ccss()
		if (wshp.Logs) wshp.Logs()
		if (wshp.Utils) wshp.Utils()
		if (wshp.Events) wshp.Events()

		C.E.DispatchEvent('o5_scriptDone', W.modul)
	}
	
	if (C.consts.o5nomnu || C.consts.o5noact)
		console.error(`DbgInit не выполняется, т.к. задано:` +
			C.consts.o5nomnu ? `  o5nomnu=${C.consts.o5nomnu}` : '' +
				C.consts.o5noact ? `  o5noact=${C.consts.o5noact}` : '')
	else {
		const
			o5load = actscript.attributes['o5load'],
			nms = o5load ? o5load.value.toUpperCase() : 'U'

		if (nms.includes('P')) W.incls.names.push('Pos')
		if (nms.includes('C')) W.incls.names.push('Ccss')
		if (nms.includes('L')) W.incls.names.push('Logs')
		if (nms.includes('U')) W.incls.names.push('Utils')
		if (nms.includes('E')) W.incls.names.push('Events')
	}
	wshp = C.ModulAdd(W)
})();