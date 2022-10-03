/* global document, window, console*/
/* exported _srcEmpty */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {
	'use strict';
	let C = null
	const olga5_modul = 'o5p1',
		olga5_class = olga5_name + '_o5p1',
		olga5_CSS = `
        .olga5_snd {
            cursor: pointer;
            border: 1px dotted transparent !important;
            animation: none;  
        }
        // ... другие CSS-описания
     `,
		_srcEmpty = 'about:blank',
		// ...  другие константы, функции, обработчики событий
		WndInit = function (c) { // Модуль инициализации скрипта
			C = c
			c.ParamsFill(W, olga5_CSS)
			// ...  другие функции инициализации
			window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		}

	const W = {
		modul: olga5_modul,
		Init: WndInit, // вызывается при инициализации
		class: olga5_class,
	}

	if (!window.olga5) window.olga5 = []
	window.olga5.push(W)

	console.log(`}---< загружен:  ${olga5_modul}.js`)
	window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
})();