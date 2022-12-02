/* global document, window, console*/
/* exported _srcEmpty */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- pusto ---
	'use strict';
	let C = null	// если нужна ссылка на ядро библиотеки для использования её API
	const
		W = {
			modul: 'pusto', 		// уникальное имя модуля 'W' для регистрации
			Init: WndInit,      	// функция, вызываемая при инициализации 'W'
			/* необязательные параметры  */
			Done: null,						// функция, вызываемая по завершении работы
			class: 'olga5_pusto',			// CSS-класс выделения тегов для обработки модулем
			consts: 'xyz=3.14, moe-attr=?',	// список констант модуля - для задания атрибутами
			urlrfs: '', 					// список именованных ссылок -"-
		},

		/*  Константы, функции и обработчики событий - требуемые в "WndInit(c)" */
		o5css = ` 	// необязательный встраиваемый CSS-класс для модуля 
        	.${W.class} { cursor: pointer; animation: none; }
        	// ... иные CSS-описания
     	`,
		_srcEmpty = 'about:blank'  // пример некоей константы

	function WndInit(c) { 		// определение парамеров модуля и заморозка 'W'
		if (c) {				// т.к. 'c' не определено при автономном вызове 
			c.ParamsFill(W, o5css) 	// при отсутствии 'o5css' - c.ParamsFill(W)
			C = c
		}
		// ... иные функции/операторы инициализации заданные внутри  "WndInit(c)"

		/* информирование ядра библиотеки о завершении инициализации */
		// console.log(` инициирован:  ${W.modul}.js`)
		window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
	}

	if (!window.olga5) window.olga5 = []
	/* Для автономного вызова инициализации через 'window.olga5.pusto.W.Init()' */
	window.olga5[W.modul] = { W: W }

	/* Информирование ядра библиотеки об окончании загрузки модуля */
	if (!window.olga5.find(w => w.modul == W.modul)) {
		window.olga5.push(W)
		console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error(`Повтор загрузки '${W.modul}`)
})();
