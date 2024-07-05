/* global document, window, console*/
/* exported _srcEmpty */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- pusto ---
	'use strict';
	const
		C = window.olga5.C,	// если нужна ссылка на ядро библиотеки для использования её API
		W = {
			modul: 'pusto', 		// уникальное имя модуля 'W' для регистрации
			Init: WndInit,      	// функция, вызываемая при инициализации 'W'
			/* необязательные параметры  */
			Done: null,						// функция, вызываемая по завершении работы
			class: 'olga5_pusto',			// CSS-класс выделения тегов для обработки модулем
			consts: 'xyz=3.14; moe-attr=?',	// список констант модуля - для задания атрибутами
			urlrfs: '', 					// список именованных ссылок -"-
		},

		/*  Константы, функции и обработчики событий - требуемые в "WndInit(c)" */
		o5css = ` 	// необязательный встраиваемый CSS-класс для модуля 
        	.${W.class} { cursor: pointer; animation: none; }
        	// ... иные CSS-описания
     	`,
		_srcEmpty = 'about:blank'  // пример некоей константы

	function WndInit() { 		// определение парамеров модуля и заморозка 'W'
		if (C) {				// 'C' м.б. не определено при автономном вызове 
			C.ParamsFill(W, o5css) 	// при отсутствии 'o5css' - C.ParamsFill(W)
		}
		// ... иные функции/операторы инициализации заданные внутри  "WndInit(c)"

		/* информирование ядра библиотеки о завершении инициализации */
		// console.log(` инициирован:  ${W.modul}.js`)
		// window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		C.E.DispatchEvent('olga5_sinit', W.modul)
	}

	/* Информирование ядра библиотеки об окончании загрузки модуля */
	C.ModulAdd(W, {})
})();
