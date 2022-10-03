/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () { // ====================================================================================================
	'use strict'
	let C = {
		Encode: (url) => { return ({ url: url, num: 0, err: '' }) },
		ConsoleError: () => { console.log.apply(console, arguments) },
		MakeObjName: (tag) => { return tag.nodeName + '.' + tag.id + '.' + tag.className }
	}
	const olga5_script = document.currentScript, // || document.scripts[document.scripts.length - 1],
		olga5_snam = olga5_script.src.replace(/(\S+\/)|(.js$)/g, ''),
		attrs = olga5_script.attributes,
		o5timer = (attrs && attrs.o5timer) ? parseFloat(attrs.o5timer.value) : '0.7',
		// o5timer = o5ti == '?' ? -1 : (o5ti ? o5ti : 0.7),
		o5timerms = o5timer < 0 ? -1 : (o5timer > 0.1 ? o5timer * 1000 : 100),
		olga5_class = 'olga5_popup',
		olga5_popup_act = olga5_class + '_act',
		olga5_CSS = `
.${olga5_class}{
	cursor: pointer;
	color: black;
	background-color: lavender;
	border: 1px solid darkgray;
	border-radius: 4px;
	padding: 0px 3px 1px 2px;
}
.${olga5_popup_act} {
    animation: blink ${o5timerms}ms infinite linear;
}
@keyframes blink {
    100% {opacity: 0;}
    50% {opacity: 1;}
    0% {opacity: 0;}
}
`,
		Timer = function () {
			this.timeStamp = 0 //  event.timeStamp - Возвращает время (в миллисекундах), в котором было создано событие
			this.timeDate0 = 0 //  (new Date()).now() - количество миллисекунд, прошедших с 1 январ...
			this.DateToStamp = (time) => { return time.getTime() - this.timeDate0 + this.timeStamp }
		},
		startTimer = new Timer(),
		optsMoe = { local: 0, namOff: 'закрыть', setDef: false, s: '' }, // s - переопределяемаая результирующая строка длс win.open()
		optsSizW = { left: 99999, width: 144 },
		optsSizH = { top: 1, height: 111 },
		optsWnd = { alwaysRaised: 1, alwaysOnTop: 1, menubar: 0, toolbar: 0, status: 0, resizable: 1, scrollbars: 0 },
		optsAll = Object.assign({}, optsWnd, optsSizW, optsSizH, optsMoe),
		ClosePop = (p, popups, name) => {
			if (p && p.tag && popups[name]) {
				if (p.tblink) window.clearInterval(p.tblink)

				if (p.tag.value) p.tag.value = p.namON
				else p.tag.innerHTML = p.namON

				p.tag.classList.remove(olga5_popup_act)

				delete popups[name]
			}
		},
		DoBlink = (key, msec) => {
			const p = window.olga5.popups[key]
			if (!p || !p.win || (!p.local && !p.win.window)) { // значит уже успело закрыться
				ClosePop(p, window.olga5.popups, key)
				return
			}
			// const tag = p.tag
			if (p.errn == 0) {
				try { // тут м.б. ошибку по дуступу из другого домена
					const doc = p.win.document
					if (doc && msec > 100) { // лкно наконец-то загрузилось
						if (p.title.length <= 1 && doc.title.length > 1) {
							p.title = doc.title
							p.titl2 = doc.title.replace(/./g, '*') + '*'
						}
						const is0 = p.title.trim() == doc.title.trim()
						doc.title = is0 ? p.titl2 : p.title
					}
					// if (p.tblink) window.clearTimeout(p.tblink)
				} catch (e) {
					p.errn++
					console.log('DoBlink: прекращено: ' + e.message)
					// tag.classList.remove(clsAct)
				}
				if (msec < 100) msec = 99
			}
			p.tblink = window.setTimeout(DoBlink, msec, key, msec)
		},
		GetKey = function (tag) {
			return olga5_class + '_' + (tag && tag.id ? tag.id : '')
		},
		PopUp = function (tag, url, s) { // p - синоним - popup
			const key = GetKey(tag),
				p = window.olga5.popups[key],
				oldtag = p ? p.tag : null
			if (p) {
				p.win.close()
				ClosePop(p, window.olga5.popups, key) // на всяк случай - дублирую!
			}

			if ((!tag || tag != oldtag) && url) {
				const wref = C.Encode(url)
				if (wref.err.length > 0) {
					console.error('PopUp: url=' + url + ', err=' + wref.err);
					return
				}

				const ref = wref.num > 0 ? wref.url : url,
					local = tag.o5popup.moes.local,
					win = local ? window.olga5.CreateWin() : window.open(ref, key, s)

				if (win) {
					window.olga5.popups[key] = { // д.б. перед win.focus()..
						win: win,
						ref: ref,
						tag: tag,
						errn: 0,
						title: ' ',
						titl2: '*',
						tblink: null,
						start: startTimer.DateToStamp(new Date()),
						namON: tag ? (tag.value ? tag.value : tag.innerHTML) : '',
						local: local,
					}
					Object.seal(window.olga5.popups[key])

					if (tag && tag.o5popup) {
						const namOff = tag.o5popup.moes.namOff
						if (namOff && namOff.length > 0) {
							if (tag.value) tag.value = namOff
							else tag.innerHTML = namOff
						}
					}

					if (o5timerms >= 0 && tag && tag.id && tag.id.length > 0) {
						DoBlink(key, o5timerms)
						tag.classList.add(olga5_popup_act)
					}
					// if (local) window.document.activeElement = win
					// else
					win.focus()
				} else
					C.ConsoleError("Ошибка создания окна '" + url + "' для", C.MakeObjName(tag))
			}
		},
		CalcOpts = function (sopts) {
			const opts = Object.assign({}, optsAll),
				ww = window.screen.width,
				wh = window.screen.height,
				Mstb = (val, wx) => {
					let rez = parseInt(val, 10)
					if (val.indexOf && val.indexOf('%') >= 0)
						rez = Math.round((wx * rez) / 100)
					return rez
				}

			if (sopts && sopts.trim().length > 0) {
				const moes = sopts.split(/;|,/g)
				for (const moe of moes) {
					const pp = moe.split(/:|=/g)
					if (pp.length > 0) {
						const p1 = pp[0].trim()
						if (p1.length > 0)
							opts[p1] = pp.length > 1 ? pp[1].trim() : 1
					}
				}
			}
			opts.s = ''
			for (const opt in opts) {
				if (typeof optsMoe[opt] == 'undefined') {
					const v1 = opts[opt]
					let v2 = v1
					if (typeof optsSizW[opt] != 'undefined') v2 = Mstb(v1, ww)
					if (typeof optsSizH[opt] != 'undefined') v2 = Mstb(v1, wh)
					opts.s += (opts.s == '' ? '' : ',') + opt + '=' + v2
				}
			}
			return opts
		},
		DoClick = (e) => {
			const tag = e.currentTarget
			PopUp(tag, tag.o5popup.url, tag.o5popup.s)
			e.cancelBubble = true
		},
		CloseAnonime = (e) => { // закрывются только анонимные
			const p = window.olga5.popups[GetKey(null)]
			if (p && p.tag && p.tag.id == '')
				if (e.timeStamp > p.start)
					p.win.close()
		},
		InitPopUp = function () {
			if (document.body[olga5_class]) return
			else document.body[olga5_class] = true
			const timera = "}-------->>    ИНИЦИАЛИЗАЦИЯ " + olga5_snam

			if (window.olga5.C) {
				C = window.olga5.C
				if (C.params.is_debug > 0) console.time(timera)

				C.InitCSS(olga5_CSS, olga5_class)
			}
			const tags = document.querySelectorAll("[o5popup]")
			for (const tag of tags) {
				const args = tag.attributes.o5popup.value.split(';'),
					opts = Object.assign({}, optsAll, CalcOpts(args[1] ? args[1].trim() : '')),
					moes = {}

				for (const nam in opts)
					if (typeof optsMoe[nam] != 'undefined') moes[nam] = opts[nam] // || 1

				const url = args[0].trim()
				if (url.length > 0) {
					tag.o5popup = { url: url, moes: moes, s: opts.s }
					Object.seal(tag.o5popup)

					tag.classList.add(olga5_class)
					tag.addEventListener('click', DoClick)
				}
				if (moes.setDef) {
					opts.setDef = false
					opts.s = ''
					Object.assign(optsAll, opts)
				}
			}
			window.olga5.PopUp = function (tag, url, pars) {
				const s = CalcOpts(pars).s
				PopUp(tag, url, s)
			}
			window.olga5.PopWork = function (nam, dir) {
				const url = dir + nam + '.html',
					tags = document.getElementsByTagName(nam)
				if (tags && tags.length > 0)
					PopUp(tags[0], url, CalcOpts('left=99999,top=1,width=444,height=333').s)
				else
					C.ConsoleError("Не найдены теги '${nam}'")
			}
			window.olga5.PopShow = function (width, height, url) {
				const moe = url.indexOf('/') >= 0 ? url :
					window.location.origin + window.location.pathname + '?no_mnu#' + url
				PopUp(null, moe, CalcOpts(`left=99999,top=1,width=${width},height=${height}`).s)
			}

			window.addEventListener('beforeunload', function (e) {
				console.log(e.nodeName + '  o5pops');
				for (const key in window.olga5.popups) {
					// console.log(e.type + '          key=' + key);
					window.olga5.popups[key].win.close()
				}
			})

			window.addEventListener('click', CloseAnonime)
			window.addEventListener('scroll', CloseAnonime)
			window.addEventListener('resize', CloseAnonime)

			window.addEventListener('pageshow', function (e) {
				if (startTimer.timeDate0 == 0) {
					// const dt = new Date()
					startTimer.timeDate0 = (new Date()).getTime()
					startTimer.timeStamp = e.timeStamp
				}
			})

			if (window.olga5.C && C.params.is_debug > 0) console.timeEnd(timera)
			window.dispatchEvent(new window.Event('o5cinit_' + olga5_class))
		}
	Object.seal(optsMoe)
	Object.seal(optsSizW)
	Object.seal(optsSizH)
	Object.seal(optsWnd)

	console.log('}---> прочитал и добавил `' + olga5_snam + '.js`  (' + olga5_class + ')');
	const W = {
		script: olga5_script,
		class: olga5_class,
		snam: olga5_snam,
		Init: InitPopUp,
		params: {},
	}
	Object.freeze(W)

	if (!window.olga5) window.olga5 = []
	window.olga5.push(W)
	window.olga5.popups = {}
	window.dispatchEvent(new window.Event('o5sload_' + olga5_snam))
	if (attrs && attrs.o5auto) {
		const eves = attrs.o5auto && attrs.o5auto.value ? [attrs.o5auto.value] : ['message', 'DOMContentLoaded']
		for (const eve of eves) {
			window.addEventListener(eve, InitPopUp)
		}
	}
})();
