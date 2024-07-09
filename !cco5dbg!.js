/* -global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- Events ---
	'use strict'

	const
		C = window.olga5.C,
		olga5_modul = "o5dbg",
		modulname = 'Events'

	C.ModulAddSub(olga5_modul, modulname, () => 
		{
			const
				excls = `key*, mouse*, pointer*`.replace(/[\s\n]/g, '').split(','),
				addocevs = `DOMContentLoaded`,
				phases = ['NONE', 'CAPTURING', 'AT_TARGET', 'BUBBLING',],
				myclr = "background: aqua; color: black;",
				lognam = olga5_modul+'.'+modulname+': ',				
				// const excls = `key*, device*,pointer*, animati*,*screen*`.replace(/[\s\n]/g, '').split(','),
				docs = {},
				wins = {},
				alls = {},
				Act = (e, key) => { // сообщение о наступлении события 'e'
					if (oldT == e.timeStamp) return
					oldT = e.timeStamp
					// if (e.type == 'load')
					// console.log('1')
					const o = e.type,
						ep0 = e.target,
						id = (ep0 && ep0.id) ? ('#' + ep0.id) : '',
						name = (!ep0 || o != 'load') ? o : (o + ` (${ep0.nodeName + id})`),
						doc = document.URL.match(/\/[^\/]*$/)[0].substring(1);
					(window.opener ? window.opener : window).
						console.log('%c%s', myclr, `${lognam} ---> ` + name.padEnd(20) +

							'[ ' + (wins[o] ? 'win' : '').padEnd(3) +
							', ' + (docs[o] ? 'doc' : '').padEnd(3) + ' ] ' +
							'  ' + key.toUpperCase() + ' ' +
							' ' + e.timeStamp.toFixed(1).padEnd(6) +
							`  ${e.eventPhase}=${phases[e.eventPhase].padEnd(10)}` +
							'  ' + doc +
							``)
				},
				acts = [
					{ src: document, eves: docs, key: 'doc' },
					{ src: window, eves: wins, key: 'win' },
				]

			let // mybody = null,
				i = excls.length
			while (i-- > 0)
				if (excls[i])
					excls[i] = new RegExp('\\b' + excls[i].replaceAll('*', '.*'))

			let oldT = 0
			for (const act of acts)
				for (const nam in act.src)
					if (nam.match(/^on.*/)) {

						const o = nam.substring(2).trim(),
							all = alls[o] || { win: ' - ', doc: ' - ', exl: '', }
						let ok = true

						all[act.key] = ' ' + act.key.substring(0, 1) + ' '
						for (const e of excls)
							if (e && o.match(e)) {
								all.exl = '  ---'
								ok = false
								break
							}
						alls[o] = all

						if (ok) {
							act.eves[o] = 1
							act.src.addEventListener(o, e => { Act(e, act.key) }, { capture: true })
							// document.head.addEventListener(o, e => { Act(e, act.key) }, { capture: true })
						}
					}

			addocevs.split(',').forEach(addocev => {
				const act = acts[0],
					o = addocev.trim(),
					all = alls[o] || { win: ' - ', doc: ' + ', exl: '  +++', }
				alls[o] = all
				act.eves[o] = 1
				act.src.addEventListener(o, e => { Act(e, act.key) })
			})

			const salls = Object.keys(alls).sort().reduce( // сортированный объект
				(obj, key) => {
					obj[key] = alls[key];
					return obj
				},
				{}
			)
			// let s = `${'событие: '.padEnd(33)}  win doc искл.`
			console.groupCollapsed('обрабатываемые события')
			for (const nam in salls) {
				const all = salls[nam]
				console.log(`${nam.padEnd(33)}  ${all.win}  ${all.doc} ${all.exl}`)
			}
			console.groupEnd()
		})

})();
/* -global window, console, document */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5dbg/Logs ---
	'use strict'
	const
		olga5_modul = "o5dbg",
		modulname = 'Logs',
		C = window.olga5.C

	C.ModulAddSub(olga5_modul, modulname, () => {
		const oldLog = console.log,
			oldwin = window
		let rez = '-НАШЁЛ',
			err = ''
		try {
			const debug = window.open("", "", "width=200,height=100");
			if (!debug) {
				console.error(`ошибка создания всплывающенго окна (возможно дан 'http' а не  'httpS') ?- см. настроки безопасности браузера`)
				return
			}
			const o5log = debug.document.body

			if (debug.document.title == '') {
				debug.document.title = modulname
				// o5log.innerText = ''
				o5log.innerHTML = `
<style>
body{
	background-color: oldlace;
	font-family: monospace;
	font-style: normal;
	font-size: small;
}
pre{
	line-height: 12px;
	margin: 0 !important;
}
pre span{
	margin-left: calc(100% - 7em);
	background-color: gold;
}
</style>
`
				rez = 'Создал'
			}
			if (o5log) console.log = function () {
				oldLog.apply(console, arguments) // так точнее совпадение временных меток
				const s = Array.prototype.join.call(arguments, ' '),
					dt = new Date(),
					ds = s.trim() == '' || s[0] == '\n' ? '' : (
						(dt.getHours() + ':').padStart(3, '0') +
						(dt.getMinutes() + ':').padStart(3, '0') +
						(dt.getSeconds() + '.').padStart(3, '0') +
						(dt.getMilliseconds() + '').padEnd(3, '0'))
				// o5log.innerText += '\n' + ds + ' ' + s
				o5log.innerHTML += '<pre>' + ds + ' ' + s + '</pre>'
			}
			else err = 'Не удалось инициировать ' + modulname + ' ?'
		} catch (e) {
			err = 'Ошибка инициализации ' + modulname + ' по причине: "' + e.message + '"'
		}
		if (err) console.error(err)
		else console.log('\n<span>' + rez + ' ' + modulname + '</span>')

		oldwin.focus()
	})

})();
/* -global document, window */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5dbg/pos ---
	'use strict'

	let // wshp = {},
		mposPos = null, // объект, в котором позиция мыши
		mposAct = null // текущий двигаемый объект (тот же самый)

	const
		olga5_modul = "o5dbg",
		modulname = 'Pos',
		C = window.olga5.C,
		id = "olga5_mousePos",
		m_borderColorOff = 'lightgray',
		m_borderColorOn = 'red',
		m_borderRadius = '3px',
		m_cursor = 'pointer',
		fmt1 = '     ',
		fmt2 = '    ',
		viewport = { wp: null, W: 0, H: 0 },
		LeftPad = function (mask, text) {
			const m = mask.length,
				s = text + '',
				j = s.length
			if (m <= j) return text
			else return mask.substr(0, m - j) + text
		},
		ShowPos = (e) => {
			if (e) {
				mposPos.pre.innerHTML =
					'B=' + LeftPad(fmt1, e.offsetX.toFixed(0)) + ' ' + LeftPad(fmt2, e.offsetY.toFixed(0)) + ' blck<br/>' +
					'P=' + LeftPad(fmt1, e.pageX.toFixed(0)) + ' ' + LeftPad(fmt2, e.pageY.toFixed(0)) + ' page<br/>' +
					'C=' + LeftPad(fmt1, e.clientX.toFixed(0)) + ' ' + LeftPad(fmt2, e.clientY.toFixed(0)) + ' wndw<br/>' +
					'S=' + LeftPad(fmt1, e.screenX.toFixed(0)) + ' ' + LeftPad(fmt2, e.screenY.toFixed(0)) + ' scrn<br/>' +
					'<span style="font-size: xx-small;font-family: serif;position: relative; top: -7px;">' +
					'чтобы перетащить - захват курсором </span>'
				mposPos.x = e.pageX
				mposPos.y = e.pageY
			} else
				mposPos.x = mposPos.y = 0
		},
		StopMoveAct = (e) => {
			if (mposAct) {
				mposAct.div.style.cursor = m_cursor
				mposAct = null
			}
			ShowPos(e)
		},
		SetVP = () => {
			const wp = window.visualViewport,
				W = wp ? wp.width : window.innerWidth,
				H = wp ? wp.height : window.innerHeight
			Object.assign(viewport, { wp, W, H })
		},
		MyMouseMove = (e) => {
			if (mposAct) mposAct.MoveAct(e.pageX, e.pageY)
			ShowPos(e)
		}

	class Mdiv {
		constructor(div) {
			this.div = div;
			div.style = `
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
				border: 1px solid ${m_borderColorOff};
				border-radius: ${m_borderRadius};
				cursor: ${m_cursor};
				`;
			this.x = 0;
			this.y = 0;
			this.old = { x: 0, y: 0, L: 0, T: 0 };

			div.addEventListener('mousedown', (e) => {
				const mpos = e.currentTarget.aO5mpos;
				mpos.MoveStart(e.pageX, e.pageY);
			});
			div.addEventListener('mouseenter', (e) => {
				e.currentTarget.style.borderColor = m_borderColorOn;
			});
			div.addEventListener('mouseleave', (e) => {
				e.currentTarget.style.borderColor = m_borderColorOff;
			});
			this.MoveStart = (x, y) => {
				const mpos = this; // e.currentTarget.aO5mpos,
				div = mpos.div;
				div.style.cursor = 'grab';
				mpos.old.L = div.offsetLeft;
				mpos.old.T = div.offsetTop;
				mpos.old.x = x;
				mpos.old.y = y;
				mposAct = mpos;
			};
			this.MoveAct = (x, y) => {
				const mpos = this, div = mpos.div, old = mpos.old, dw = 33, dh = 25, w = div.offsetWidth, h = div.offsetHeight;

				let L = old.L + (x - old.x), T = old.T + (y - old.y);

				if (L + w < dw) L = dw - w;
				if (T + h < dh) T = dh - h;
				if (L + dw > viewport.W) L = viewport.W - dw;
				if (T + dh > viewport.H) T = viewport.H - dh;
				div.style.left = L + 'px';
				div.style.top = T + 'px';
			};
		}
	}

	class Mpos {
		constructor(div) {
			Object.setPrototypeOf(this, Object.assign({}, new Mdiv(div)));
			this.pre = document.createElement('pre');
			this.pre.style = `
				font-family: monospace;
				font-size: 14px;
				display: block;
				white-space: pre;
				margin: 1px;
				margin-left: 3px;
				`;
			div.appendChild(this.pre);
			div.id = "olga5_mousePos";
		}
	}

	C.ModulAddSub(olga5_modul, modulname, () => {
		const isInitiated = document.getElementById(id)
		console.log(`${olga5_modul}.${modulname} : ` + (isInitiated ? 'игнорируется' : ''))
		if (isInitiated) return

		const div = document.createElement('div')

		document.body.appendChild(div)

		div.aO5mpos = new Mpos(div)
		mposPos = div.aO5mpos

		window.addEventListener('resize', SetVP)
		document.addEventListener('mouselive', StopMoveAct)
		document.addEventListener('mouseup', StopMoveAct)
		document.addEventListener('mousemove', MyMouseMove)

		SetVP()
		ShowPos()
	})
})();
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
			nms = !o5load ? 'CELP' : o5load.toUpperCase(),
			names = W.incls.names
		if (nms.includes('C')) names.push('Ccss')
		if (nms.includes('E')) names.push('Events')
		if (nms.includes('L')) names.push('Logs')
		if (nms.includes('P')) names.push('pos')
	}
	wshp = C.ModulAdd(W)
})();