/* global document, window, console*/
/* exported _srcEmpty */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {
	'use strict';
	let C = null
	const olga5_modul = 'o5p2',
		olga5_class = olga5_name + '_o5p2',
		olga5_CSS = `
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
			C.ParamsFill(W)
			C.InitCSS(olga5_CSS, olga5_class, olga5_modul)
			// ...  другие функции инициализации
			window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		}

	const W = {
		modul: olga5_modul, //
		Init: WndInit, // вызывается при инициализации
		class: olga5_class,
	}

	console.log(`}---< загружен:  ${olga5_modul}.js`)
	if (!window.olga5) window.olga5 = []
	window.olga5.push(W)
	window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
})();
