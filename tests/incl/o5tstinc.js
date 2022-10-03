/* global document, window, console, Map*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5com/params
	'use strict'
	let C = null
	const olga5_modul = 'o5tstinc',
	timera = '<--------}   инициирован ' + olga5_modul,
	Includes = () => {
		console.time(timera)
		C = window.olga5.C
		console.timeEnd(timera)
		if (C) window.dispatchEvent(new window.Event(C.events.o5cinit_ + olga5_modul))		
	}
	
	const W = {
		modul: olga5_modul,
		Init: Includes,
	}
	Object.freeze(W)
	if (!window.olga5) window.olga5 = []
	window.olga5.push(W)

	console.log(`}---> загружен:  ${olga5_modul}.js`)
})();
