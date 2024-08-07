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
		actscript = document.currentScript,
		timera = '<-}   инициирован ' + W.modul

	function DbgInit() {
		if (wshp.Pos) wshp.Pos()
		if (wshp.Ccss) wshp.Ccss()
		if (wshp.Logs) wshp.Logs()
		if (wshp.Events) wshp.Events()
		
		window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))

	}
	if (C.consts.o5no_mnu || C.consts.o5no_act)
		console.error(`DbgInit не выполняется, т.к. задано:` +
			C.consts.o5no_mnu ? `  o5no_mnu=${C.consts.o5no_mnu}` : '' +
				C.consts.o5no_act ? `  o5no_act=${C.consts.o5no_act}` : '')
	else {
		const
			o5load = actscript.attributes['o5load'],
			nms = !o5load ? 'CELP' : o5load.toUpperCase()
			
		if (nms.includes('C')) W.incls.names.push('Ccss')
		if (nms.includes('E')) W.incls.names.push('Events')
		if (nms.includes('L')) W.incls.names.push('Logs')
		if (nms.includes('P')) W.incls.names.push('Pos')
		if (nms.includes('U')) W.incls.names.push('Utils')
	}
	wshp = C.ModulAdd(W)
})();