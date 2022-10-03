/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/*
всплывающие подсказки
контекстное меню
при наведении "на рамку" - рамка делаетсяштриховая а курсор : на-размеры, в рядом - кнопка закрытия (по наведении на неё - снова меняется курсор)
все стили - через псевло-класся
закрыти после клика: ghb gjdnjhyjq gjgsnrt cjplfybz bcrfnm div с таким key и если есть....
*/
(function () { // ====================================================================================================
	'use strict'
	const olga5_script = document.currentScript, // || document.scripts[document.scripts.length - 1],
		olga5_snam = olga5_script.src.replace(/(\S+\/)|(.js$)/g, ''),
		olga5_class = 'olga5_moewnd',
		div_style = `
			padding-left:0.5px;
			width: 150px;
			height: 80px;
			background-color: antiquewhite;
			position: fixed;
			bottom: 7px;
			right: 2px;
			opacity: 0.9;
			line-height: 18px;
			z-index: 9999999;
			`,
		MoveStart = (div, x, y) => {
			const old = div.o5win.old
			old.L = div.offsetLeft
			old.T = div.offsetTop
			old.x = x
			old.y = y

			const wp = window.visualViewport,
				act = div.o5win.act
			act.W = wp ? wp.width : window.innerWidth
			act.H = wp ? wp.height : window.innerHeight
			act.w = div.offsetWidth
			act.h = div.offsetHeight

			div.style.cursor = 'grab'
		},
		MoveAct = (div, x, y) => {
			const old = div.o5win.old,
				act = div.o5win.act

			let L = old.L + (x - old.x),
				T = old.T + (y - old.y)

			if (L + act.w < 11) L = 11 + act.w
			if (T + act.h < 11) T = 11 + act.h
			if (L + 11 > act.W) L = act.W - 11
			if (T + 11 > act.H) T = act.H - 11
			div.style.left = L + 'px'
			div.style.top = T + 'px'
		},
		moveEvents = [{ eve: 'mouselive', act: 'StopMove' }, { eve: 'mouseup', act: 'StopMove' }, { eve: 'mousemove', act: 'DoMove' }, ],
		MoveStop = (div) => {
			for (const moveEvent of moveEvents) {
				window.removeEventListener(moveEvent.eve, div.o5win[moveEvent.act])
			}
		},
		CreateWin = function (id) {
			const key = olga5_class + '_' + id
			let div = document.getElementById(key)
			if (div) {
				MoveStop(div)
				div.parentNode.removeChild(div)
				return
			}

			div = document.createElement('div')
			document.body.appendChild(div)
			div.style = div_style
			div.o5win = {
				act: { W: 0, H: 0, w: 0, h: 0, },
				old: { x: 0, y: 0, L: 0, T: 0 },
				StopMove: () => { MoveStop(div) },
				DoMove: (e) => { MoveAct(div, e.pageX, e.pageY) },
			}
			Object.seal(div.o5win.act)
			Object.seal(div.o5win.old)
			Object.freeze(div.o5win)

			div.addEventListener("mousedown", (e) => {
				const div = e.currentTarget
				MoveStart(div, e.pageX, e.pageY)
				for (const moveEvent of moveEvents) {
					window.addEventListener(moveEvent.eve, div.o5win[moveEvent.act])
				}
			})
			div.addEventListener('mouseenter', (e) => {
				e.currentTarget.style.borderColor = 'blue' //m_borderColorOnx, y
			})
			div.addEventListener('mouseleave', (e) => {
				e.currentTarget.style.borderColor = 'yellow' // m_borderColorOff
			})
			return div
		},
		WndInit = function () {
			console.log("}-------->>    Инициирован скрипт '" + olga5_snam + "'")
			window.dispatchEvent(new window.Event('o5cinit_' + olga5_class))
		}

	console.log('}---> прочитал и добавил `' + olga5_snam + '.js`  (' + olga5_class + ')');
	const W = {
		script: olga5_script,
		class: olga5_class,
		snam: olga5_snam,
		Init: WndInit,
	}
	Object.freeze(W)

	if (!window.olga5) window.olga5 = []
	window.olga5.push(W)
	window.olga5.CreateWin = CreateWin
	window.dispatchEvent(new window.Event('o5sload_' + olga5_snam))
})();
