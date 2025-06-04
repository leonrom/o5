/* -global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  сборщик модулей ядра библиотеки
 * 
**/
// 
(function () {              // ---------------------------------------------- o5com ---
	const
		E = { // тут везде tag===window.  Д.б. перед 'use strict'
			Err: err => {
				console.error("%c%s", "background: yellow; color: black;border: solid 1px gold;", 'E: ' + err)
			},
			Msg: (txt, eve, nFun) => {
				if (C.consts.o5debug > 0) {
					console.groupCollapsed("%c%s", "background: lightblue; color: black;border: solid 1px gold;",
						`${txt} для eve='${eve}'\n ф-ии "${nFun}"`)
					console.trace()
					console.groupEnd()
				}
			},
			NFun: (Fun) => Fun.name || Fun,
			events: [],
			donets: [],
			AddEventListener: (eve, Fun, opts) => {
				const nFun = E.NFun(Fun)
				E.Msg('AddEventListener', eve, nFun)
				if (E.events.find(event => event.eve == eve && event.nFun == nFun && event.opts == opts))
					E.Err(`повторная регистрация  '${eve}' для ф-ии "${nFun}"`)
				else {
					const
						caller = arguments.callee
					for (const donet of E.donets)
						if (donet.eve == eve)
							if (donet.callers.includes(caller))
								E.Err(`Повторное выполнение '${eve}' для ф-ии "${nFun}"`)
							else {
								donet.callers.push(caller)
								Fun(donet.e)
							}

					E.events.push({ eve: eve, nFun: nFun, opts: opts })
					window.addEventListener(eve, Fun, opts)
				}
			},
			RemoveEventListener: (eve, Fun) => {
				const nFun = E.NFun(Fun)
				E.Msg('RemoveEventListener', eve, nFun)
				let i = E.events.length,
					k = -1
				while (i-- > 0 && k < 0)
					if (E.events[i].eve == eve && E.events[i].nFun == nFun)
						k = i

				if (k < 0)
					E.Err(`удаление неприсвоенного события '${eve}' функции "${nFun}" `)
				else {
					E.events.splice(k, 1)
					window.removeEventListener(eve, Fun)
				}
			},
			DispatchEvent: (eve, modulx, canrep) => {
				const modul = modulx ? modulx : ''
				if (C.consts.o5debug > 1 && !canrep) {
					console.groupCollapsed(`DispatchEvent: '${eve}' для modul= '${modul}'`)
					console.trace()
					console.groupEnd()
				}
				const donet = E.donets.find(donet => donet.eve == eve && donet.modul == modul)
				let e = null
				if (donet) {
					e = donet.e
					if (!canrep)
						E.Err(`повторная генерация события '${eve}' modul="${modul}"`)
				}
				else {
					const e2 = new CustomEvent(eve, modul ? { detail: { modul: modul } } : {})
					E.donets.push({ eve: eve, modul: modul, callers: [], e: e2, })
					e = e2
				}
				window.dispatchEvent(e)
			},
			Init: () => {
				E.events.splice(0, E.events.length)
				E.donets.splice(0, E.donets.length)
			},
		}

	'use strict'
	const olga5_modul = "o5com"
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const
		modnames = ['CConsole', 'CEncode', 'CApi', 'CParams', 'TagsRef', 'IniScripts','CPops'], // 'IniScripts' д.б. ПОСЛЕДНИМ
		wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		strt_time = Number(new Date()),
		IncludeScripts = ({ modul = '', names = [], actscript = C.o5script, iniFun = {}, args = [] }) => {
			const
				nams = {},
				load = { is_set: false, timeout: 0, path: '' },
				actpath = actscript.src.match(/\S*\//)[0],
				OnTimer = () => {
					let s = ''
					for (const nam in nams)
						if (!nams[nam]) s += (s ? ', ' : '') + nam

					if (s)
						console.error(`Для ${modul} недозагрузились скрипты: ${s} (таймер o5timload=${C.consts.o5timload}с.)`)
					load.timeout = 0
				},
				OnLoad = name => {
					const lefts = []
					nams[name] = true
					for (const nam in nams)
						if (!nams[nam]) lefts.push(nam)

					if (C.consts.o5debug > 1)
						console.log(`загружено включение '${name}' осталось [${lefts.join(', ')}]`)
					if (lefts.length == 0) {
						if (load.timeout > 0) {
							window.clearTimeout(load.timeout)
							load.timeout = 0
						}
						iniFun(args)
					}
				},
				OnError = (name, e) => {
					console.error(`Для ${name} ошибка дозагрузки '${name}' (из ${e.target.src})`)
					// OnLoad(name)
				}

			for (const name of names)
				nams[name] = false
			for (const name of names) { // в очерёдности размещения	
				if (!window.olga5[modul]) {
					C.ConsoleError(`В скрипте, выполняющем дозагрузку скриптов, не создан объект 'window.olga5.${modul}'`)
					continue
				}
				if (window.olga5[modul][name]) OnLoad(name)
				else {
					if (!load.is_set)
						Object.assign(load, {
							is_set: true,
							path: actpath + modul + '/',
							timeout: window.setTimeout(OnTimer, 1000 * C.consts.o5timload),
						})

					const script = document.createElement('script')

					if (script.readyState) script.onreadystatechange = () => { OnLoad(name); }
					else script.onload = () => { OnLoad(name); }
					script.onerror = function (e) { OnError(name, e); }

					script.src = load.path + name + '.js'
					script.dataset.o5add = modul
					script.setAttribute('async', '')

					if (C.consts.o5debug > 0) {
						const MakeObjName = obj => obj ? (
							(obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
								('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
								'.' + (obj.className ? obj.className : '?'))) : 'НЕОПР.'
						console.log(`вставка ${(name + '.js').padEnd(15)}  перед  ${modul + '.js'} (в parentNode=${MakeObjName(actscript.parentNode)})`)
					}

					if (actscript.parentNode)
						actscript.parentNode.insertBefore(script, actscript)
					else // это ватще-то заплатка. по-хорошему надо бы убрать 'actscript' оставив 'module'	
						for (const scr of document.scripts)
							if (scr.src.lastIndexOf('/' + modul + '.js') > 0) {
								scr.parentNode.insertBefore(script, scr.nextSibling)   // т.е. тут insertAfter
								break
							}
				}
			}
			// console.log('--------------------- load.timeout='+load.timeout)
			// if (!load.timeout) iniFun(args)
		},
		RunO5com = () => {
			const
				DoneO5com = (e) => {
					if (e)
						document.removeEventListener('readystatechange', DoneO5com)

					const _url_olga5 = C.o5script.src.match(/\S*\//)[0],
						errs = []

					for (const modname of modnames)
						if (wshp[modname]) wshp[modname](_url_olga5)
						else
							errs.push(modname)

					const dt = ('' + (Number(new Date()) - strt_time)).padStart(4) + ' ms',
						name = dt + `        ${olga5_modul}`

					if (errs.length > 0)
						console.error('%c%s', "background: yellow; color: black;border: none;",
							`Не найдены [${errs.join(', ')}] в ${olga5_modul}.js ( где-то синтаксическая ошибка ?)`)
					console.log('%c%s', "background: blue; color: white;border: none;", '---<<<  инициализировано ядро      ' + name)
				}

			if (document.body) DoneO5com()
			else
				document.addEventListener('readystatechange', DoneO5com)
		},
		GetBaseHR = (root) => { // функции определения адреса текущиещей страницы и корня сайна
			const url = new window.URL(window.location) //"http://rombase.h1n.ru/o5/2020/olga5-all.html")
			if (root == 'root') return url.origin + '/'
			else return url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1)
		},
		TryToDigit = x => {
// if (x.indexOf && x.indexOf('182')>=0)			
// console.log()
			if (typeof x === 'undefined') return 1		// true
			if (x === !!x) return x
			const val = ('' + x).replace(C.repQuotes, '')

			if (val == 'true') return true
			if (val == 'false') return false

			const i = parseInt(val)
			if (i == val) return i
			const f = parseFloat(val)
			if (f == val) return f
			const rez = val.replace(/\s*;\s*\n+\s*/g, ';').replace(/\s*\n+\s*/g, ';')
			return rez.replace(/\t+/g, ' ').trim()
		},
		HasProperty=(foo,nam)=>{
			return  Object.prototype.hasOwnProperty.call(foo, nam)
			// return  foo.hasOwnProperty(nam)
		},
		GetAttribute = (attrs, name) => { // нахождение значения 'attr' в массиве атрибутов 'attrs'
			for (const nam of [name, 'data-' + name, '_' + name, 'data_' + name])
				if (HasProperty(attrs, nam)) return attrs[nam]
		},
		GetAttrs = attributes => {
			const attrs = {}
			for (const attribute of attributes)
				attrs[Repname(attribute.name)] = TryToDigit(attribute.value)
			return attrs
		},
		Repname = name => {
			return name.trim().replaceAll('-', '_').toLowerCase()
		},
		ConstsFillFromUrl = (xs) => {  // параметры адресной строки,- м.б. (т.е. интерпретируются) только константы
			const hash = window.location.hash
			if (hash)
				C.save.hash = hash ? hash.substring(1).trim() : ''

			const smatchs = window.location.search.match(/[?&]\S+?(#|$)/) || []
			for (const smatch of smatchs) {
				const match = smatch.replaceAll(/(%20|\s)/g, '').trim()
				if (match) {
					const params = match.split(/[,;?&#]/)
					for (const param of params) {
						const u = param.trim()
						if (u.length > 0) {
							const prms = u.split(/[=:]/)
							let nam = Repname(prms[0])
							if (nam == 'o5nomenu' || nam == 'nomenu') nam = 'o5nomnu'
							if (nam == 'debug') nam = 'o5debug'
							// if (nam == 'o5debug') 
							// 	nam = 'o5debug'
							if (HasProperty(C.consts, nam)) {
								const val = TryToDigit(prms[1])
								xs[nam] = { val: val, source: C.save.urlName }
								C.constsurl[nam] = val
							}
						}
					}
				}
			}
		},
		ParamsFillFromScript = (xs, defs, attrs, p) => {
			const stradd = '(добавлен)'
			for (const name in attrs) {
				const nam = Repname(name)
				if (HasProperty(defs, nam) && !HasProperty(xs, nam)) {
					const add = HasProperty(defs, nam) ? '' : stradd
					xs[nam] = { val: TryToDigit(attrs[name]), source: `атрибут${add}` }
				}
			}

			let partype = 'data-o5' + p  // тут в частности o5consts
			if (!attrs[partype]) partype = 'data_o5' + p
			if (!attrs[partype]) partype = 'o5' + p
			if (attrs[partype]) {
				const params = attrs[partype].split(/[;]/)  // параметры в атрибуте разделяются только ';'
				for (const param of params) {
					const u = param.replace(/\s*#.*$/, ''), // trim()
						i = u.indexOf('=')
					if (i > 0) {
						const nam = Repname(u.substring(0, i).trim())
						if (!xs[nam]) {
							const add = HasProperty(defs, nam) ? '' : stradd,
								val = TryToDigit(u.substring(i + 1).trim())
							xs[nam] = { val: val, source: `параметр${add}` }
							// console.log(`${nam} = '${val}'`)
						}
					}
				}
			}

			let n = 0	// подсчет к-ва 'стандартных' параметров
			for (const nam in defs) {
				n++
				if (!xs[nam])
					xs[nam] = { val: TryToDigit(defs[nam]), source: 'default' }
			}
			return n
		}

	Object.assign(C, {
		repQuotes: /^\s*((\\')|(\\")|(\\`)|'|"|`)?\s*|\s*((\\')|(\\")|(\\`)|'|"|`)?\s*$/g,
		olga5ignore: 'olga5-ignore',
		TryToDigit: TryToDigit,
		ParamsFillFromScript,
		GetAttrs: GetAttrs,
		GetAttribute: GetAttribute,
		Repname: Repname,
		IncludeScripts: IncludeScripts,
		E: E,
		o5script: document.currentScript,
		o5attrs: GetAttrs(document.currentScript.attributes),
		cstate: {	 			// общее состояние 
			depends: null,  	// только для подключенных скриптов, но с учетом как o5depends, так и очередности в задании и атрибута async
		},
		urlrfs: {
			_url_html: GetBaseHR('href'),
			_url_root: GetBaseHR('root'),
			_url_olga5: '' // будет задан при инициализации (document.currentScript.src.match(/\S*\//)[0],)
		},
		consts: {
			o5timload: 3, 	//mtiml ? (mtiml[5] ? mtiml[5] : 1) : (C.o5script.attributes['o5timload'] || 3),
			o5debug: 0, 	// mdebug ? (mdebug[5] ? mdebug[5] : 1) : (C.o5script.attributes['o5debug'] || 0),
			o5nomnu: 0,
			o5noact: 0,
			o5only: 0,
			o5incls: '',
			o5doscr: 'olga5_sdone',
         // o5depends: "pusto; o5inc; o5pop= o5snd; o5shp: o5inc, o5ref; o5ref= o5inc; o5snd:o5ref; o5shp=o5snd, o5ref; o5shp; o5inc; o5mnu",
			o5depends: "o5inc; o5pop:o5ref,o5snd; o5ref= o5inc; o5snd:o5ref; o5shp=o5snd, o5ref; o5mnu; o5tab",
			o5init_events: 'readystatechange:d, message',	// , transitionrun, transitionend
			o5hide_events: 'transitionrun',	// , transitionrun, transitionend
			o5done_events: 'beforeunload, olga5_unload',
		},
		constsurl: {},
		save: { hash: null, xs: null, p: '', n1: -1, urlName: 'url', libName: 'ядро', }, // сохранение для "красивой" печати - потом удалю

		ModulAddSub: (modul, sub, Fun) => {
			if (C.consts.o5debug) {
				// const nam = `${modul}/${sub}.js`
				// if ('o5shp/DoInit.js' == nam)
				// 	console.log()
				console.log(`}===< ${document.currentScript.src.indexOf(`/${modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${modul}/${sub}.js`)
			}

			if (window.olga5[modul] && window.olga5[modul][sub]) {
				console.groupCollapsed('%c%s', "background: yellow; color: black;border: solid 2px red;",
					`}---< Повтор загрузки '${modul}/${sub}'`)
				console.log(`Fun_old=${window.olga5[modul][sub]})`)
				console.log(`Fun_new=${Fun})`)
				console.groupEnd()
			}

			if (!window.olga5[modul])
				window.olga5[modul] = {}
			if (Fun)
				window.olga5[modul][sub] = Fun
			return window.olga5[modul]
		},
		ModulAdd: (W, pars) => {
			const modul = W.modul
			if (window.olga5.find(w => w.modul == modul))
				console.error('%c%s', "background: yellow; color: black;border: solid 2px red;",
					`}---< Повтор загрузки '${modul}`)
			else {
				if (C.consts.o5debug)
					console.log(`}---< ${document.currentScript.src.indexOf(`/${modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${modul}.js`)

				if (!window.olga5[modul])
					window.olga5[modul] = {}

				if (pars)
					Object.assign(window.olga5[modul], pars)

				window.olga5[modul].W = W
				window.olga5.push(W)
				// window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: modul } }))
				C.E.DispatchEvent('olga5_sload', W.modul)

				return window.olga5[modul]
			}
		},
        MyJoinO5s : aO5s => {
            let s = ''
            for (const aO5 of aO5s) s += (s ? ', ' : '') + aO5.name
            return s
        },
	})

	const xs = {}, // временное хранилилище для считываемых параметров
		p = 'consts',
		defs = C[p]

	Object.assign(C.save, { xs: xs, p: p, n1: -1 })

	ConstsFillFromUrl(xs)
	C.save.n1 = ParamsFillFromScript(xs, defs, C.o5attrs, p)

	for (const nam in xs) defs[nam] = xs[nam].val

	const
		mm = document.currentScript.src.match(/(!\.js)|(\bo5.js)\s*$/),
		AscInclude = () =>
			IncludeScripts({ modul: olga5_modul, names: modnames, actscript: C.o5script, iniFun: RunO5com, })

	if (mm) wshp.AscInclude = AscInclude  // формальный вызов чтобы всё поотмечать и вызвать iniFun()
	else
		AscInclude()

	console.log(`}+++< загружено ядро библиотеки`)
})();
/* -global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 * расширение логирования
 */
(function () {              // ---------------------------------------------- o5com/CConsole ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CConsole',
		C = window.olga5.C,
		padd = "padding-left:0.5rem;",
		clrtypes = {
			'A': "background: yellow; color: black;border: solid 3px red;",
			'E': "background: yellow; color: black;border: solid 1px gold;",
			'S': "background: blue;   color: white;border: solid 1px bisque;",
			'I': "background: beige;  color: black;border: solid 1px bisque;",
		},
		ConsoleMsg = (styp, txts, add, tab) => {
			const txt = (txts && txts[txts.length - 1] != '') ? txts + ' ' : txts,
				type = styp.substr(0, 1).toUpperCase(),
				clr1 = clrtypes[type],
				clr2 = "margin-left:0.4rem; background: white; color: black; border: solid " +
					(tab ? "1px gray;" : "1px bisque;")

			if (add === null || typeof add === 'undefined' || add === '') console.groupCollapsed('%c%s', (padd + clr1), txt)
			else
				if (Number.isInteger(add)) console.groupCollapsed('%c%s%c%s', (padd + clr1), txt, (padd), add + ' ')
				else console.groupCollapsed('%c%s%c%s', (padd + clr1), txt, (padd + clr2), add + ' ')

			const tt = []
			if (tab) {
				if (tab instanceof Array)
					tab.forEach((v, nam) => {
						let t = {}
						const // ss = [],
							O = (o) => {
								const uu = []
								if (o instanceof NamedNodeMap) {
									for (const atr of o) uu.push(atr.name + '=' + atr.value)
									return uu.join(',')
								} else if (o instanceof Object) {
									for (const x in o) uu.push(x + '=' + o[x])
									return uu.join(',')
								}
								else return (typeof o === 'undefined') ? ' `undef`' : (o == null ? '`null`' : o.toString())
							}
						let s = ''
						if (v instanceof Map) {
							v.forEach((x, nam) => s += (s == '' ? '' : ', ') + nam + ':' + x.toString())
							t[nam].val = '{' + s + '}'
						} else if (v instanceof Array) {
							v.forEach(x => s += (s == '' ? '' : ', ') + x)
							t[nam].val = '{' + s + '}'
						} else if (v instanceof Object) {
							for (const x in v)
								t[x] = O(v[x])
						} else
							t = v //t[nam] = v
						tt.push(t)
					})
				else if (tab instanceof Map)
					tab.forEach((v, nam) => {
						const t = { nam: nam }
						let s = ''
						if (v instanceof Map) {
							v.forEach((x, nam) => s += (s == '' ? '' : ', ') + nam + ':' + x.toString())
							t.val = '{' + s + '}'
						} else if (v instanceof Array) {
							v.forEach(x => s += (s == '' ? '' : ', ') + x)
							t.val = '{' + s + '}'
						} else if (v instanceof Object) {
							for (const x in v) s += (s == '' ? '' : ', ') + x + ':' + v[x]
							t.val = '{' + s + '}'
						} else
							t.val = v
						tt.push(t)
					})
				else for (const t in tab) {
					const v = tab[t]
					if (!t.match(/^\d*$/) && typeof v !== 'function')
						if (typeof v !== 'object') tt.push({ nam: t, val: v })
						else {
							const r = { nam: t }
							if (Array.isArray(v))
								for (let i = 0; i < v.length; i++)
									r['№-' + i] = v[i]
							else
								for (const x in v)
									r[x] = v[x]

							tt.push(r)
						}
				}
				if (tt.length > 0) {
					// tt.push({})    // иначе Chromium проглатывает последний элемент массива
					console.table(tt)
				}
			}
			console.table()
			// console.groupCollapsed(` ... трассировка вызовов :`)
			console.trace()
			// console.groupEnd()
			console.groupEnd()
		}

	C.ModulAddSub(olga5_modul, modulname, () => {
		Object.assign(C, {
			ConsoleMsg: ConsoleMsg,
			ConsoleAlert: (txt, add, tab) => ConsoleMsg('alert', txt, add, tab),
			ConsoleError: (txt, add, tab) => ConsoleMsg('error', txt, add, tab),
			ConsoleSign: (txt, add, tab) => ConsoleMsg('sign', txt, add, tab),
			ConsoleInfo: (txt, add, tab) => ConsoleMsg('info', txt, add, tab),
		})
		return true
	}
	)
})();
/* -global document, window*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5com/CEncode ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CEncode',
		C = window.olga5.C,
		DelBacks = (s0) => {
			// const s00 = s0
			let n = 0
			const mrkN = '\n',
				mrk2 = '..'
			do {
				let l = s0.length,
					m = s0.match(/\.\.[^\/]/)
				if (m) s0 = s0.substr(0, m.index + 2) + '/' + s0.substr(m.index + 2)
				m = s0.match(/[^\/]\.\./)
				if (m) s0 = s0.substr(0, m.index + 1) + '/' + s0.substr(m.index + 1)
				if (l == s0.length) break
			} while (n++ < 99)

			const s2s = s0.split('/')
				// tt = []
			for (let i = 0; i < s2s.length; i++)
				if (s2s[i] == mrk2) {
					let j = i
					while (j-- > 0)
						if (s2s[j] != mrkN && s2s[j] != mrk2 && s2s[j] != '') {
							s2s[j] = mrkN
							s2s[i] = ''
							break
						}
				}

			let i = s2s.length
			while (i-- > 0)
				if (s2s[i] == mrkN || (i > 0 && s2s[i] == '' && s2s[i - 1] == ''))
					s2s.splice(i, 1)

			let s = s2s.join('/').replaceAll(/\/\.\//g, '/')
			return s.replaceAll(/[^:]\/\/+/g, (u) => { return u.substr(0, 2) })
		},
		// IsUrlNam = u => { return !!(u.trim() && !u.match(/[\/.\\#]/)) },
		IsUrlNam = u => {
			const isurl = !!(u && u.trim() && !u.match(/[\/.\\#]/))
			return isurl
		},
		IsFullUrl = url => {
			return url.match(/^https?:/i) ||
				url.match(/^\s*\/*\s*(((\d{1,3}\.){3}\d{1,3})|localhost)\//i)
		},
		DeCodeUrl = function (urlrfs, url, o5attrs = null) { // старое DeCodeUrl
			if (url.match(/^\s*data:/)) {
				return { url: url.trim(), err: '', num: 0 }
			}
			// if (url.match('myTunes-icon'))					
			// 	console.log(121212)				
			const errs = [],
				parts = [],
				Replace4320 = u =>
					u.replaceAll(/(&#43;)/g, '+').replaceAll(/(%20|&nbsp;)/g, ' ').trim(), // давать в такой очерёдностии, иначе снова вернёт %20 !,
				IsCompaund = orig => orig && (orig.includes('+') || IsUrlNam(orig)),
				SplitRefs = (s, refs = null) => {
					s.split('+').forEach(sprt => {
						const prt = sprt.replace(C.repQuotes, ''),	// trim(),
							isnam = IsUrlNam(prt),
							ref = isnam ? C.Repname(prt) : prt

						if (isnam) parts.num++
						if (refs && refs.find(r => ref == r))
							errs.push(`цикл. ссылки ${refs.join('->')}=>${ref};`)
						else {
							const attr = (isnam && o5attrs) ? C.GetAttribute(o5attrs, ref) : null

							if (attr) {
								if (!refs) refs = []
								refs.push(ref)
								SplitRefs(attr, refs)
							}
							else if (isnam) {
								if (urlrfs[ref]) SplitRefs(urlrfs[ref], refs)
								else
									errs.push(`неопр.: '${prt}` + (prt != ref ? ` (т.е. '${ref})` : ''))
							}
							else
								parts.push(ref)
						}
					})
				},
				ss = url.split('?'),
				orig = Replace4320(ss[0].trim()),
				ret = { url: url, err: '', num: 0 }

			if (IsCompaund(orig)) {
				Object.assign(parts, { num: 0, rght: ss[1] ? ('?' + ss[1]) : '' })

				SplitRefs(orig)

				let urld = ''
				for (const part of parts)
					if (urld && part && urld[urld.length - 1] != '/' && part[0] != '/') urld = urld + '/' + part
					else urld = ((urld ? urld : '') + (part ? part : ''))
				// console.log(orig, urld)
				if (urld) {
					if (!IsFullUrl(urld)) {
						if (parts[0] == '') urld = C.urlrfs._url_olga5 + urld
						else urld = C.urlrfs._url_html + urld
						if (!IsFullUrl(urld)) {  // если всё еще нету
							const hr = new window.URL(window.location).href
							urld = hr.substring(0, hr.lastIndexOf('/') + 1) + urld
						}
					}
					urld = DelBacks(urld) + parts.rght
				}
				Object.assign(ret, {
					url: urld,
					err: errs.length > 0 ? errs.join(', ') : (urld ? '' : `пустой 'url'`),
					num: parts.num
				})
			}
			return ret
		},
		TagDes = (tag, ref, errs = null) => {
			const
				regExp1 = /(.*(\/|\+)\s*)|(!*\.js\s*$)/g,
				regExp2 = /(\s*\+\s*)+/g
			for (const code of ['data-', '_', '']) {
				const from = code + ref,
					attr = tag.attributes[from]
				if (attr) {
					const orig = attr.nodeValue

					return {
						code: code,
						from: from,
						modul: orig.replace(regExp1, ''),
						orig: orig,
						trans: !!(orig.match(regExp2) || IsUrlNam(orig)),
					}
				}
			}
			if (errs)
				errs.push({ tag: C.MakeObjName(tag), ref: ref, txt: 'не определены атрибуты' })
		}

	C.ModulAddSub(olga5_modul, modulname, () => {
		Object.assign(C, {
			DelBacks: DelBacks,
			IsFullUrl: IsFullUrl,
			DeCodeUrl: DeCodeUrl,
			TagDes: TagDes,
		})
		return true
	}
	)
})();
/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5com/CApi --- 111
	'use strict'
	const
		C = window.olga5.C,
		olga5_modul = 'o5com',
		modulname = 'CApi',
		// Match = scls => new RegExp(`\\b` + scls + `(\\s*[,:+]\\s*((([\`'"\\(\[])(.*?)\\4)|[^\\s\`'":,+]*))*(\\s*|$)`),
		// Match = scls => new RegExp(`\\b` + scls + `\\b(\\s*:\\s*\\w*|([\`'"\\([])(.*?)\\3)*`),
		Match = scls => new RegExp(`\\b` + scls + `\\b(\\s*[,:+]\\s*[^\\s:\`'"]*|([\`'"\\([])(.*?)\\2)*`),
		mquals = /\s*[:,]\s*/,
		GetTagsBy = (modul, fun, ask) => {
			const list = [],
				errs = [],
				nams = ask.split(ask.match(/;/) ? /\s*;\s*/ : /\s*,\s*/)
			for (const owner of C.owners)
				if (owner.modules.length == 0 || !modul ||
					owner.modules.find(m => { return m == modul })) {
					const Fun = owner.start[fun]
					if (Fun)
						for (const nam of nams) {
							const matches = Fun.call(owner.start, nam)
							let tags = []								
								
							// проверяю сам тег 'olga5_start'
							if (owner.start.matches(nam)) 
								tags.push(owner.start)
								
							if (matches) {
								const amatches =Array.from(matches)
								tags = tags.concat(amatches)
							}

							for (const tag of tags)
								if (!list.includes(tag))
									list.push(tag)
						}
					else
						errs.push({ tag: C.MakeObjName(owner.start), Fun: fun })
				}
			if (errs.length > 0)
				C.ConsoleError(`Ошибочные запросы функций для тегов`, errs.length, errs)
			return list
		}

	C.ModulAddSub(olga5_modul, modulname, () => {
		Object.assign(C, {
			owners: [],
			scrpts: [],
			Match: Match,
			MakeObjName: function (obj, len) { // моё формирование имени объекта
				if (obj) {
					const nam = Object.is(obj, window) ? '#window' : (
						Object.is(obj, document) ? '#document' : (
							(obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
								('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
								'.' + (obj.className ? obj.className : '?')
							)
						))
					return nam.padEnd(len ? len : 0);
				}
				else
					return 'null';
			},
			GetTagsByQueryes: (queryes, modul) => {
				return GetTagsBy(modul, 'querySelectorAll', queryes)
			},
			GetTagsByIds: (ids, modul) => {
				const nams = ids.split(/\s*,\s*/)
				nams.forEach((nam, i, nams) => { nams[i] = '#' + nam });
				return GetTagsBy(modul, 'querySelectorAll', nams.join(','))
			},
			GetTagsByClassNames: (classnams, modul) => {
				const tags = GetTagsBy(modul, 'getElementsByClassName', classnams),
					rez = []
				for (const tag of tags)
					if (!tag.classList.contains(C.olga5ignore))
						rez.push(tag)
				return rez
			},
			GetTagsByTagNames: (tagnams, modul) => {
				return GetTagsBy(modul, 'getElementsByTagName', tagnams)
			},
			SelectByClassName: (classnam, modul, do_not_replace_class) => {
				const tags = GetTagsBy(modul, 'querySelectorAll', '[class *=' + classnam + ']'),
					match = Match(classnam),
					rez = []
				for (const tag of tags)
					if (!tag.classList.contains(C.olga5ignore)) {
						const ms = tag.className.match(match)
						if (ms) {
							const quals = [],
								m = ms[0].trim(),
								ss = m.split(mquals)

							if (!do_not_replace_class)  // кромк IniScript-теста ВСЕГДА убираю квалификаторы
								tag.className = tag.className.replace(m, classnam + ' ')

							for (let j = 1; j < ss.length; j++)
								quals.push(ss[j].trim())
							rez.push({ tag: tag, quals: quals, origcls: ms.input })
						}
					}
				return rez
			},
			QuerySelectorInit: (starts, scls) => {
				C.owners.splice(0, C.owners.length)

				const match = Match(scls),
					errs = []
				if (!starts || starts.length == 0)
					C.owners.push({ start: document.body, modules: [], origcls: 'document' }) // специально чуть по-иному
				else
					for (const tag of starts) {
						const quals = [],
							ms = tag.className.match(match)
						if (ms) {
							const
								m = ms[0].trim(),
								ss = m.split(mquals)

							tag.className = tag.className.replace(m, scls)// ВСЕГДА убираю квалификаторы (остальные в ms - не трогать!)

							for (let j = 1; j < ss.length; j++) {
								const modul = ss[j]

								if (C.scrpts.find(scrpt => scrpt.modul == modul)) quals.push(modul)
								else errs.push(modul)
							}
							C.owners.push({ start: tag, modules: quals, origcls: m }) // специально чуть по-иному
							if (C.consts.o5debug > 2)
								console.log(`${olga5_modul}/${modulname} QuerySelectorInit: id='${tag.id}',  '${m}', \n\t${quals}`)
						}
					}
				if (errs.length > 0)
					C.ConsoleError(`Неопределены квалификаторы для '${scls}': `, errs.join(', '))
			}
		})
		return true
	}
	)
})();
/* -global document, window, console,*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  Общий модуль, обязательный при подключении одного (ли несколиких)   моулей библиотеки
 *
 * параметры могут дублироваться командной строкой вызова страницы
 **/

(function () {              // ---------------------------------------------- o5com/CParams ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CParams',
		C = window.olga5.C,
		csslist = {}, // перечень наименований создаваемых классо
		// repQuotes = /^['"`\s]+|['"`\s]+$/g,
		SplitParams = (s, parnam, dlms = ';') => {
			const errs = [],
				params = {},
				regexp = new RegExp('\\s*[' + dlms + ']\\s*', 'g'),

				regcomments = /(\s+\/\/|#).*?(\n|$|;)/g,

				x = s.replace(/\/\*(.|\n)*?\*\//gm, '').
					replace(regcomments, ';'),		 // убрал оба типа коментов
				spairs = x.trim().split(regexp)

			// const
			// 	match= new RegExp(`\\s*[${dlms}]\\s*$`),
			// 	spairs = []

			// for (const m of mm)
			// 	spairs.push(m[0].replace(/\s+/g, ''))
			// // ,m2=s(Symbol.matchAll(regexp))

			if (C.consts.o5debug > 0) {
				const comments = s.match(regcomments)
				if (comments)
					comments.forEach(comment => {
						if (comment.match(/[^=]=[^=]/))
							errs.push({ par: comment, err: `в комменте подозрительный одиночный '='` })
					})
			}

			for (const spair of spairs)
				if (spair) {
					const pair = spair.split(/\s*=\s*/),
						nam = C.Repname(pair[0].trim())
					if (params[nam])	
						errs.push({ par: spair, err: `повтор '${nam}' (замена)` })
										
					if (pair.length == 1) {
						params[nam] = true
						errs.push({ par: spair, err: `отсутствие '=' (принято =true)` })
					}
					else {
						// const val = (pair[1] || '').replace(match, '').replace(C.repQuotes, '') // .replace(C.repQuote2, '')
						const val = (pair[1] || '').replace(C.repQuote2, '')
						
						if (nam) params[nam] = C.TryToDigit(val)
						else
							if (val.length > 1)
								errs.push({ par: spair, err: `у параметра (с val='${val}') нет имени` })
					}
				}

			if (errs.length > 0)
				C.ConsoleError(`Разбор  параметров `, parnam, errs)

			return params
		},
		DeCodeUrlRfs = (urlrfs, modul) => {
			const urlerrs = [],
				urlsets = []

			for (const nam in urlrfs) {
				const val = urlrfs[nam]
				// if (val.match('myMusikIT'))					
				// console.log(121212)		isurl		
				if (val != null && typeof val !== 'undefined') {
					if (!val.replace)
						alert('значение URL - не строка')
					const url = val.replace(C.repQuotes, ''), //.replace(C.repQuote2, ''),
						wref = C.DeCodeUrl(urlrfs, url)

					if (wref.err.length > 0)
						urlerrs.push({ ori: nam, err: wref.err, url: url })
					urlsets.push({ nam: nam, url: wref.url, 'ориг.': (wref.url != url) ? url : '-"-' })
					urlrfs[nam] = wref.url
				} else
					urlerrs.push({ ori: nam, err: `не определено`, url: '' })
			}

			if (C.consts.o5debug > 0 && urlsets.length == 0)
				C.ConsoleInfo(`${modul}: именованные ссылки отсутствуют`, '   ?')

			if (urlerrs.length > 0)
				C.ConsoleError(`${modul}: недоопределённые ссылки`, urlerrs.length, urlerrs)
		},
		// CopyVals = (xs, c, type) => {
		// 	for (const nam in c) {
		// 		const x = xs.find(x => x.nam == nam)
		// 		if (x) Object.assign(x, { val: c[nam], source: type })
		// 		else xs.push({ nam: nam, val: c[nam], source: type })
		// 	}
		// },
		InitCSS = (W, o5css) => {
			const chs = document.head.children,
				id = W.class + '_internal',
				cmodul = csslist[W.class]
			let err = ''

			if (typeof cmodul === 'undefined') {
				for (const ch of chs)
					if (ch.nodeName == "STYLE" && ch.id == id) {
						err = `Стиль id='${id}' (модуль: '${W.modul}', класс: '${W.class}) уже определён в документе`
						break
					}
			} else
				if (cmodul != W.modul) err = `Класс '${W.class}' повторяется в модулях '${cmodul}' и '${W.modul}. '`

			if (err) C.ConsoleError('>>  создание CSS  ' + err, 'InitCSS')
			else {
				if (C.consts.o5debug > 0)
					console.log(`>>  СОЗДАНИЕ CSS   ${W.class} (для модуля ${W.modul}) с id='${id}'`)
				csslist[W.class] = W.modul

				const styl = document.createElement('style')
				styl.setAttribute('type', 'text/css')
				styl.id = id

				const moeCSS = document.head.appendChild(styl)
				moeCSS.innerHTML = o5css.replace(/(\/\/.*($|\n))|(\s*($|\n))/g, '\n')
				// (\/\/.*$)           мои коменты '//' до конца строки
				// (\/\*(.|\s)*?\*\/)  стандартные коменты (проверить!!! поему-то переносит строки правил)
				// (\s*$)              пустое до конца строки       
			}
		},
		PrintParams = (modul, xs, p, n1) => {
			let n2 = 0
			for (const nam in xs) n2++
			C.ConsoleInfo(`${modul}: все константы '${p}' `, `${('' + n2).padStart(2)} (своих=${('' + n1).padStart(2)})`, xs)
		},
		ParamsFill = function (W, o5css) {
			if (W.isReady)
				return

			const scrpt = C.scrpts.find(scrpt => scrpt.modul == W.modul)

			if (!scrpt) {
				C.ConsoleError(`В 'C.scrpts' не наден модуль `, W.modul)
				return
			}

			if (o5css) InitCSS(W, o5css)

			const m1 = /\s+|\/\/.*$/gm,
				isnew = !!scrpt.script,
				attrs = isnew ? C.GetAttrs(scrpt.script.attributes) : C.o5attrsParamsFillFromScript

			if (!W.origs)
				W.origs = {
					consts: (W.consts || '').replace(m1, ''),
					urlrfs: (W.urlrfs || '').replace(m1, '')
				}

			for (const p of ['consts', 'urlrfs']) {
				const xs = {} // временное хранилилище для считываемых параметров

				for (const nam in C[p]) {
					const source = C.constsurl.hasOwnProperty(nam) ? C.save.urlName : `ядро`
					if (!xs.hasOwnProperty(nam))
						xs[nam] = { val: C[p][nam], source: source }
				}
				if (isnew) {
					const askps = SplitParams(W.origs[p], p, ';'),
						n1 = C.ParamsFillFromScript(xs, askps, attrs, p)

					W[p] = {}	// преобразовываю в объект
					if (p == 'urlrfs') {
						const urls = {}
						for (const nam in xs) urls[nam] = xs[nam].val
						DeCodeUrlRfs(urls, `${W.modul}: `)
						for (const nam in xs)
							xs[nam].url = urls[nam]
					}
					else
						for (const nam in C.constsurl)
							if (xs[nam].source != C.save.urlName)
								Object.assign(xs[nam], { val: C.constsurl[nam], source: `${C.save.urlName}(восстановил)` })

					for (const nam in xs)
						W[p][nam] = xs[nam].val

					if (C.consts.o5debug > 0) PrintParams(W.modul, xs, p, n1)
				}
				else
					if (C.consts.o5debug > 0) C.ConsoleInfo(`${W.modul}: параметры и ссылки берутся только из скрипта ядра библиотеки`)
			}
		}

	C.ModulAddSub(olga5_modul, modulname, url_olga5 => {
		C.urlrfs._url_olga5 = url_olga5

		Object.assign(C, {
			ParamsFill: ParamsFill,
			SplitParams: SplitParams,
		})

		if (C.consts.o5debug > 0) PrintParams(C.save.libName, C.save.xs, C.save.p, C.save.n1)

		const p = 'urlrfs',
			xs = {}, // временное хранилилище для считываемых параметров
			defs = C[p]

		const n1 = C.ParamsFillFromScript(xs, defs, C.o5attrs, p)
		for (const nam in xs) defs[nam] = xs[nam].val

		DeCodeUrlRfs(defs, C.save.libName)

		for (const nam in defs) { xs[nam].url = defs[nam] }
		if (C.consts.o5debug > 0) PrintParams(C.save.libName, xs, p, n1)

		return true
	})
})();
/* -global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  исправление 'src', 'data-src' и 'href' в тегах html-заголовка
 **/
//
(function () {              // ---------------------------------------------- o5com/TagRefs ---
	'use strict'
	let wshp = {}

	const
		olga5_modul = 'o5com',
		modulname = 'TagsRef',
		C = window.olga5.C,
		ReplaceTag = (tagName, change, adrName, url, errs) => {
			const addnew = document.createElement(tagName),
				regExp = new RegExp(/[\\+<>'"`=#\\/\\\\]/)
			let err = false
			for (const attr of change.attributes) {
				if (!err && attr.name.match(regExp)) {
					errs.push({ tag: tagName, ref: attr.name, txt: `cодержит кавычки или '+><=#/'` })
					err = true
				}
				else
					try {
						addnew.setAttribute(attr.name, attr.value) // здесь копирую "как есть" 
					} catch (err) {
						errs.push({ tag: tagName, ref: url, txt: (attr.name + '=' + attr.value), err:err.message })
					}
			}
			addnew.setAttribute(adrName, url)

			change.parentNode.insertBefore(addnew, change)
			change.parentNode.removeChild(change) //  ??  а вот удалять  -м.б. и не надо: для контроля

			return addnew
		},
		ConvertScripts = () => {
			// if (!(Symbol.iterator in Object(window.olga5))) return		//?

			const errs = [],
				scrs = [],
				preloads = [],
				load_snm = {},
				Orig = (obj) => {
					const origs = obj.outerHTML.match(/\s(data-)?src\s*=\s*["*'][^"']*["*']/g)
					if (origs && origs.length > 0) {
						origs.forEach(orig => {
							orig = orig.replaceAll(/["'s*]/g, '')
						})
						return origs.join(', ')
					} else
						return '-нету-'
				}

			for (const w of window.olga5)
				preloads.push({ w: w, orig: Orig(C.o5script), script: C.o5script, isset: false, })

			/*				сначала из тегов <script>, пропуская те, которые в скомпилированном			*/

			const s = C.consts.o5incls.trim(),
				incls = s ? s.split(/\s*[,;]\s*/) : [],
				match_o5 = /\bo5\w+/,  // начинаются с o5
				igns = [],
				needs = {}

			incls.forEach(incl => { if (incl) needs[incl] = 1 })
			for (const script of document.scripts) {
				// if (C.consts.o5debug > 1) console.log(`тег <script>: id= '${script.id}', src= "${script.src}"`)

				// if (script === C.o5script) // это ядро, т.е. конец скриптов (не зависимо от наличия 'o5_scripts')
				// 	break
				if (script === C.o5script) // пропускаю ядро и модуль o5inc
					continue

				if (script.dataset.o5add) continue 		// это добавленный мною скрипт		
				if (script.innerText.trim()) continue	// это встроенный скрипт

				const td = C.TagDes(script, 'src', errs)

				if (!td || !(td.modul.match(match_o5) || (td.trans && !C.consts.o5only)))
					continue

				if (incls.length > 0)
					if (needs[td.modul]) needs[td.modul] = 0
					else {
						igns.push(td.modul)
						continue
					}

				if (load_snm[td.modul])
					errs.push({ tag: td.modul, ref: td.orig, txt: 'повторная загрузка модуля' })
				load_snm[td.modul] = td.orig // перезаписываю!

				const w = window.olga5.find(w => w.modul == td.modul),
					scrpt = { modul: td.modul, orig: td.orig, act: { W: w, need: false }, script: script, }
				let dochg = ''
				if (!w || td.code == '_' || (td.trans && td.code != 'data-')) {
					dochg = !w ? 'новый  ' : 'замена '
					if (C.consts.o5debug > 1) console.log(`тег <script>: id= '${script.id}' -> в обработку (${dochg}): orig=${td.orig}`)

					scrpt.act.W = null
					let url = td.orig
					if (td.trans) {
						const wref = C.DeCodeUrl(C.urlrfs, td.orig)
						if (wref.err)
							errs.push({ tag: td.modul, ref: td.from, txt: wref.err })
						url = wref.url
					}
					if (!script.getAttribute('async') && !script.getAttribute('defer'))
						script.setAttribute('async', '')
					scrpt.script = ReplaceTag('script', script, 'src', url, errs)
				}

				C.scrpts.push(scrpt)
				scrs.push({
					modul: scrpt.modul,
					orig: scrpt.orig,
					src: scrpt.script.src,
					txt: dochg + td.from
				})
			}
			/*				дописываю те, которые в скомпилированном и отсутствуют в SCRIPT's			*/
			for (const w of window.olga5) {
				const modul = w.modul
				if (!C.scrpts.find(scrpt => scrpt.modul == modul))
					// if (!igns(modul)) {
					if (!igns.includes(modul)) {
						C.scrpts.push({ modul: modul, orig: '', act: { W: w, need: false }, script: C.o5script })
						scrs.push({ modul: modul, orig: '', src: C.o5script.src, txt: `из скомпилированного` })
					}
			}

			/* строю зависимости cкриптов (сначала идут скомпилированные) - сначала по 'o5depends'*/
			const ss = C.consts['o5depends'].split(/\s*[;]+\s*/),
				sinc = 'o5inc',
				o5inc = C.scrpts.find(scrpt => scrpt.modul == sinc)

			for (const s of ss) {
				const uu = s.trim().split(/\s*[:=]+\s*/), // split(/[:=]/), // 
					u = uu[0],
					rfs = uu[1] ? uu[1].split(/\s*,\s*/) : []
				if (u) {
					const scrpt = C.scrpts.find(scrpt => scrpt.modul == u)
					if (scrpt) {
						scrpt.depends ||= (scrpt.modul != sinc && o5inc) ? [o5inc] : []
						for (const rf of rfs)
							if (rf != sinc) { // уже и так включено
								const scr = C.scrpts.find(scrpt => scrpt.modul == rf)
								if (scr && !scrpt.depends.includes(scr))
									scrpt.depends.push(scr)
							}
					}
				}
			}

			// const depends = []
			// for (const s of ss) {
			// 	const uu = s.trim().split(/\s*[:=]+\s*/)
			// 	depends.push({ modul: uu[0], rfs: rfs })
			// }
			// for (const scrpt of C.scrpts) {
			// 	scrpt.depends ||= (scrpt.modul != sinc && o5inc) ? [o5inc] : []
			// 	for (const depend of depends)
			// 		if (depend.modul == scrpt.modul) 
			// 			for (const rf of depend.rfs)
			// 				if (!scrpt.depends.includes(rf)) // уже и так включено
			// 					scrpt.depends.push(scr)
			// }

			/* -"- тепер для остальны */
			const sdeps = [],
				cdeps = []
			for (const scrpt of C.scrpts) {
				if (!scrpt.depends)
					scrpt.depends = scrpt.script.attributes.hasOwnProperty('async') ? [] : cdeps.concat(sdeps)
				if (scrpt.orig) sdeps.push(scrpt)
				else cdeps.push(scrpt)
			}
			/* в отладочном режиме - делаю проверку*/
			if (C.consts.o5debug > 0) {
				let scrpt = null
				const list = [],
					errs = [],
					ChectForRev = (modul, depends) => {
						let ok = true
						list.push(modul)
						for (const depend of depends)
							if (depend === scrpt) {
								errs.push({ scrpt: scrpt.modul, refs: list.join('-> ') })
								ok = false
							}
						if (depends.length > 0 && ok)
							for (const depend of depends)
								ChectForRev(depend.modul, depend.depends)
						list.pop()
					}
				for (scrpt of C.scrpts)
					ChectForRev(scrpt.modul, scrpt.depends)
				if (errs.length > 0)
					C.ConsoleError(`зацикленные ссылки в зависимостях модулей`, errs.length, errs)
			}

			const errneeds = []
			for (const need in needs) {
				if (needs[need]) errneeds.push(need)
			}
			if (errneeds.length > 0)
				C.ConsoleError(`Из заданных в 'o5incls' отсутствуют модули:`, errneeds.join(', '))
			// сюда проверь!?
			if (C.consts.o5debug > 0) {
				if (scrs.length > 0) C.ConsoleInfo("Найденные olga5 SCRIPT'ы : ", scrs.length, scrs)
				else C.ConsoleInfo("Не найдены olga5 SCRIPT'ы ?")

				if (igns.length > 0)
					C.ConsoleInfo(`Проигнорированы скрипты, отсутствующие в 'o5incls': `, igns.join(', '))

				if (C.consts.o5debug > 1) { // тестирование атрибутов
					const errs = []
					for (const scrpt of C.scrpts)
						for (const attr of scrpt.script.attributes)
							if (!attr.name || attr.name.match(/['"`\+\.,;]/))
								errs.push({ 'атрибут': attr.name, 'скрипт': scrpt.script.src, })
					if (errs.length > 0)
						C.ConsoleError(`${errs.length} странных атрибутов (м.б. перепутаны кавычки?) у скрипта`, s, errs)
				}
			}
			if (errs.length > 0)
				C.ConsoleError(`Ошибки в преобразовании SCRIPT `, errs.length, errs)

			for (const scrpt of C.scrpts) {
				Object.assign(scrpt.act, { done: 0, start: 0, timeout: 0, timera: null, incls: null, })
				Object.seal(scrpt.act)
				Object.freeze(scrpt)
			}
			Object.freeze(C.scrpts)

			scrs.splice(0, scrs.length)
			errs.splice(0, errs.length)
		},
		ConvertLinks = () => {
			const links = [],
				errs = []
			for (const child of document.head.children)
				if (child.tagName.toLowerCase() == 'link') {
					const td = C.TagDes(child, 'href', errs)
					if (!td.orig) {
						C.ConsoleError(`обнаружен <link> без 'href', '_href' или 'data-href': `, child.outerHTML, null)
						continue
					}
					if (td.trans) { 									// для link'ов не надо проверять 'o5'
						const wref = C.DeCodeUrl(C.urlrfs, td.orig)
						if (wref.err)
							errs.push({ tag: td.modul, ref: td.from, txt: wref.err })

						ReplaceTag('link', child, 'href', wref.url, errs)
						links.push({ orig: td.orig, src: wref.url, txt: td.from })
					}

					wshp.o5iniready ||= child.href.match(/\/o5ini\.css$/)
				}

			if (C.consts.o5debug > 0)
				if (links.length > 0) C.ConsoleInfo("Скорректированные LINK'и : ", links.length, links)
				else C.ConsoleInfo("Скорректированных LINK'ов нет ")

			if (errs.length > 0)
				C.ConsoleError(`Ошибки в преобразовании LINK `, errs.length, errs)

			links.splice(0, links.length)
			errs.splice(0, errs.length)

		}

	wshp = C.ModulAddSub(olga5_modul, modulname, () => {
		ConvertScripts()
		ConvertLinks()
	})
})();
/* -global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  загрузка (при необходимости) и инициализация подключаемых скриптов
 **/
//
(function () {              // ---------------------------------------------- o5com/IniScripts ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'IniScripts',
		C = window.olga5.C,
		myclr = "background: blue; color: white;border: none;"
	class MyEvents {
		doceves = ['DOMContentLoaded', 'readystatechange', 'visibilitychange', 'blur']
		meves = []
		constructor(list) {
			const meves = list.trim().split(/\s*[,;]\s*/) || []
			for (const meve of meves) {
				const ss = meve.trim().split(/\s*[:]\s*/)
				if (ss[0].length > 0) {
					const eve = ss[0],
						su = ss[1] ? ss[1].toUpperCase() : '',
						isd = su == 'D' ? true : (su == 'W' ? false : this.doceves.includes(eve))
					this.meves.push({ eve: eve, isd: isd })
				}
				// this.meves.push({ eve: ss[0], isd: ss[1] && ss[1].toUpperCase() == 'D' })
			}
			Object.freeze(this)
		}
		AddEvents = (Fun) => { // addEventListener
			for (const meve of this.meves)
				if (meve.isd) document.addEventListener(meve.eve, Fun, true)
				else
					window.addEventListener(meve.eve, Fun)
			// C.E.AddEventListener(meve.eve, Fun)
		}
		RemEvents = (Fun) => { // addEventListener
			for (const meve of this.meves)
				if (meve.isd) document.removeEventListener(meve.eve, Fun, true)
				else {
					window.removeEventListener(meve.eve, Fun)
					// C.E.RemoveEventListener(meve.eve, Fun)
				}
		}
	}
	class MyTimer {
		constructor(text) {
			this.text = text
			this.act = { time: 0, name: '' }
			Object.seal(this.act)
			Object.freeze(this)
		}
		Stop = (add) => {
			// console.log('...=', this.act.time,  this.act.name)
			if (this.act.time) {
				const dt = (' ' + (Number(new Date()) - this.act.time)).padStart(8) + ' ms',
					name = dt + ' ' + this.act.name.padStart(12)
				if (add)
					console.error('%c%s', "background: yellow; color: black;border: none;",
						this.text + name + ' [' + add + ']')
				else {
					console.log('%c%s', myclr, this.text + name)
					this.act.time = 0
				}
			}
		}
		Start = (name) => {
			if (this.act.time)
				this.Stop('не закончено')

			this.act.time = Number(new Date())
			this.act.name = name
			// console.log('...+', this.act.time,  this.act.name)
		}
	}
	const
		DocURL = () => document.URL.match(/[^?&#]*/)[0].trim(),
		/**
		 * InitScripts(nam) - выполнение очередного требуемого скрипта
		 * 			ВЫЗЫВАЕТСЯ: 
		 * 				- в конце инициализации данного скрипта
		 * 				- по событиям загрузки и/или обновления документа
		 * 				- по событиям загрузки и/или инициализаации очередного скрипта
		 * 			ВЫПОЛНЯЕТСЯ если документ содержит тег '.olga5_Start' (или загружен тест)
		 * 				или документ уже загружен/обновлён, или вызов был по обновлению документа
		 * @param {nam} наименование скрипта (для протокола)
		 * @param {isok}  необязательный признак готовности документа (наименование события)
		 */
		InitScripts = nam => {
			if (!(C.page && C.page.pact && C.page.pact.ready)) {
				if (C.consts.o5debug > 1)
					console.log(`--->>>     ______ InitScripts _____     ${nam} -- return`)
				return
			}

			if (C.consts.o5debug > 1)
				console.log(`--->>>     ______ InitScripts _____     ${nam} `)
			const start = C.page.pact.start
			for (const scrpt of C.scrpts) {
				const act = scrpt.act
				// if (act.W.modul=='o5inc')				
				// act.timera =0
				if (!act.timera)
					act.timera = new MyTimer(`---<<<             инициирован `)
				if (start != act.start && act.W && !act.incls)
					if (act.need && act.W.Init) {
						const depend = scrpt.depends.find(depend => (depend.act.need && depend.act.done != start))
						if (!depend) {
							if (C.consts.o5debug > 1)
								console.log(`--->>>     ______ начало нинициализации _____     ${act.W.modul} `)
							act.start = start
							act.timera.Start(act.W.modul)
							act.W.Init()
						}
					} else
						Object.assign(act, { start: start, done: start })
			}
		},
		OnInit = e => {	//  завершение инициализации очередного скрипта
			if (!e.detail || !e.detail.modul) {
				C.page.errs.push({ modul: '?', err: `для события '${e.type}' НЕ указан 'detail' или 'detail.modul'` })
				return
			}

			const modul = e.detail.modul.trim(),
				scrpt = C.scrpts.find(scrpt => scrpt.modul == modul),
				start = C.page.pact.start,
				lefts = []
			C.scrpts.forEach(scr => {
				if (scr.modul != modul && scr.act.done != start && scr.act.need)
					lefts.push(scr.modul)
			})
			if (C.consts.o5debug > 1) {
				console.log(`- - > после инициализации '${modul}': ` +
					(lefts.length > 0 ? `осталось:  ${lefts.join(', ')}` : ` не осталось`))
			}
			if (scrpt) {
				const act = scrpt.act
				act.timera.Stop('')
				act.done = act.start
				if (lefts.length > 0)
					InitScripts(`инициирован '${modul}'`)
				else
					C.page.PageFinish(0)
			} else
				C.page.errs.push({ modul: modul, err: `для события '${e.type}' указан несуществующий модуль` })
		},
		OnLoad = e => {	// завершение загрузки очередного скрипта
			const start = C.page.pact.start,
				newloads = [],
				Included = modul => {
					const nam = `загружены включения для '${modul}'`,
						scrpt = C.scrpts.find(scrpt => scrpt.modul == modul)
					if (C.consts.o5debug > 0)
						console.log(`OnLoad: '${nam}'`)

					scrpt.act.incls = ''
					// const debug = window.open("", "", "width=200,height=100");
					InitScripts(nam)
				}

			if (C.consts.o5debug > 1)
				console.log('- - > после загрузки ' + (e ? ` '${e.detail.modul}'` : ` ядра`))
			for (const scrpt of C.scrpts) {
				const w = scrpt.act.W || window.olga5.find(x => x.modul == scrpt.modul)
				if (w) {
					if (scrpt.act.start != start || !scrpt.act.W) {
						scrpt.act.W = w
						newloads.push(w.modul)
					}
					if (w.incls && scrpt.act.incls == null) {
						scrpt.act.incls = w.incls
						C.IncludeScripts({
							modul: w.modul,
							names: w.incls.names,
							actscript: w.incls.actscript,
							iniFun: Included,
							args: [w.modul]
						})
					}
				}
			}
			if (C.consts.o5debug > 2)
				console.log('    > ' + newloads.length ? ` (готовы к инициации: ${newloads.join(', ')})` : ' (но инициировать нечего)')

			if (newloads.length > 0)
				InitScripts(`загрузка [${newloads.join(', ')}]`)
		}

	class Page {
		pact = { url: '', ready: false, start: 0, timerp: new MyTimer("}==  КОНЕЦ  обработки  страницы"), timer: 0, mos: [] }
		errs = []
		ScriptsFinish = e => { // закрытие всех новых элементов страницы

			const pact = this.pact
			if (!pact.ready) return

			pact.ready = false

			const n0 = this.childs.length
			if (C.consts.o5debug > 0) console.log('%c%s', myclr,
				`}=====< закрытие по '${e.type}' (n= ${n0}) страницы "${pact.url}"`)

			let n = n0
			while (n-- > 0) {
				const child = this.childs[n],
					owner = child.aO5_pageOwner
				for (const item of owner.children)
					if (item == child) {
						// item.remove()
						item.style.display = 'none'
						owner.removeChild(item)
						break
					}
			}
			this.childs.splice(0, n0);

			C.scrpts.forEach(scrpt => {
				const act = scrpt.act
				if (act && pact.start == act.start && act.W && act.W.Done)
					act.W.Done()
			})

			this.donePage.RemEvents(this.ScriptsFinish)
			// window.dispatchEvent(new window.Event('olga5_done'))
			C.E.DispatchEvent('olga5_done')
		}
		ScriptsStart = () => {  // начало обработки страницы

			C.QuerySelectorInit(this.starts, this.olga5Start) //  чтобы пересчитало область определения

			for (const scrpt of C.scrpts) { // делаем при каждой инициализации
				if (C.owners.length == 0) scrpt.act.need = true
				else {
					scrpt.act.need = false
					for (const owner of C.owners) {
						if (owner.modules.length == 0) scrpt.act.need = true
						else
							scrpt.act.need = !!owner.modules.find(modul => modul == scrpt.modul)
						if (scrpt.act.need) break
					}
				}
			}
			if (C.consts.o5debug > 0) {
				let asknoneed = []
				for (const scrpt of C.scrpts)
					if (!scrpt.act.need)
						asknoneed.push(scrpt.modul)
				const l = asknoneed.length
				if (l > 0)
					C.ConsoleError(`В скриптах заданы ${l} 'ненужн${l > 1 ? 'ых' : 'ый'}' модул${l > 3 ? 'ей' : (l > 1 ? 'я' : 'ь')}: `, asknoneed.join(', '))
			}

			if (C.consts.o5doscr) {  // запуск встроенных cкриптоав
				const scrs = C.GetTagsByTagNames('script'),
					scriptDone = C.consts.o5doscr,
					m = new RegExp('\\bdocument\\.currentScript\\.setAttribute\\s*\\(\\s*[\'`"]' + scriptDone + '.*?(;|\\n|$)', 'i')

				for (const scr of scrs) {
					const matchs = scr.innerText.match(m)
					if (matchs) {
						const atr = scr.attributes[scriptDone]
						if (!atr || atr.value != 1) {
							const s = scr.innerText.replace(matchs[0], '')
							if (C.consts.o5debug > 0)
								console.log(`Выполняется скрипт: \n${s}`)
							eval(s)
							scr.setAttribute(scriptDone, 1)
						}
					}
				}
			}
		}
		PageFinish = bytimer => { // конец инициалзации страницы
			const pact = this.pact
			pact.timerp.Stop(bytimer ? 'таймер' : '')
			if (pact.timer > 0) {
				window.clearTimeout(pact.timer)
				pact.timer = 0
			}
			if (document.body.classList.contains(this.cls))
				document.body.classList.remove(this.cls)

			if (bytimer) {
				for (const scrpt of C.scrpts) {
					const act = scrpt.act
					let err = ''
					if (!err) {
						if (!act.W) err = "не загружен файл "
						else if (act.start == 0) err = "инициализация не начиналась?"
						else if (act.start != act.done) err = "инициализация не закончилась"
					}
					if (err) this.errs.push({ modul: scrpt.modul, err: err })
				}
			}

			const errs = this.errs
			if (errs.length > 0) {
				C.ConsoleError(`Скрипты ${bytimer ? 'НЕ' : ''} завершились (есть ошибки)`, errs.length, errs)
				errs.splice(0, errs.length) //  могут еще завершиться и без ошибок
			}
			if (pact.mos) {
				const mos = this.pact.mos
				for (const mo of mos)
					mo.disconnect()
				// mo = null
				mos.splice(0, mos.length)
				// mos = null
			}
			this.loadDone.RemEvents(OnLoad)
			this.initDone.RemEvents(OnInit)
			// window.dispatchEvent(new window.Event('olga5_ready'))
			C.E.DispatchEvent('olga5_ready')
		}
		PageStart = (url) => {
			if (C.consts.o5debug > 0)
				console.log('%c%s', myclr, "----- старт обработки страницы ", url)

			if (!document.body.classList.contains(this.cls))
				document.body.classList.add(this.cls) // это если есть такой класс

			const pact = this.pact
			pact.timerp.Start(url)
			if (C.consts.o5timload) {
				if (pact.timer > 0) window.clearTimeout(pact.timer)
				pact.timer = window.setTimeout(this.PageFinish, 1000 * C.consts.o5timload, true)
			}

			this.loadDone.AddEvents(OnLoad)
			this.initDone.AddEvents(OnInit)
			this.donePage.AddEvents(this.ScriptsFinish)

			this.errs.splice(0, this.errs.length)
			this.ScriptsStart()
			// InitScripts(`загружена страница '${url}'`)

			OnLoad()  // после InitScripts
		}
		clr = "background: green;color:white;"
		CheckInit = (e, second) => { // проверка и начало инициализации страницы !
			const o5inc = 'o5inc',
				pact = this.pact,
				url = DocURL(),
				starts = document.querySelectorAll("[class *= '" + this.olga5Start + "']"),
				isolga5 = starts && starts.length,
				isloaded = document.readyState == 'complete' ||
					(url.match(/\bolga5-tests\b/i) && document.readyState == 'interactive'),
				isnew = pact.url != url || !pact.ready

			if (C.consts.o5debug > 1 && e) {
				console.groupCollapsed('%c%s', this.clr, '____>  ' + e.type.padEnd(22) +
					(isolga5 ? 'ДА ' : '  ') + (isnew ? 'новая ' : 'повт. ') +
					document.readyState[0] + ':' + url.padEnd(55))
				for (const nam in e)
					if (nam != 'type' && !(e[nam] instanceof Function)) console.log(nam.padEnd(24), e[nam])
				console.groupEnd()
			}
			// if (isloaded && !C.scrpts.finish){ // уточняю конечный список скриптов - м.б. еще чего ждать
			// 	C.scrpts.finish=true
			// }
			if (isnew && isloaded) {

				pact.start = Number(new Date()) + Math.random()

				let w = null,
					o5include = null
				if (!second) {
					o5include = document.querySelector('[o5include]')
					w = window.olga5.find(modul => modul.modul == o5inc)

					if (!w && o5include) C.ConsoleError(`Имеется тег с атрибутом 'o5include' но отсутствует модуль '${o5inc}'`)
					else
						if (w && !o5include && C.consts.o5debug > 0)
							C.ConsoleInfo(`¿ Задан модуль '${o5inc}' но отсутствует тег с атрибутом 'o5include' ?`)
				}


				// забрать в общую обработку
				// проверить, чтобы в очерёдности обработки o5inc  всегда было первым!				
				// 				if (w && o5include) {
				// 					const
				// 						scrpt = C.scrpts.find(scrpt => scrpt.modul == o5inc)
				// 					if (scrpt)
				// 						Object.assign(scrpt.act, { W: w, start: pact.start, done: pact.start, need:false })
				// 					else
				// 						C.ConsoleError(`Не найден scrpt для modul='${o5inc}'`)

				// 					// window.addEventListener('olga5-incls', e => this.CheckInit(e, true))	//1
				// 					C.E.AddEventListener('olga5-incls', e => this.CheckInit(e, true))	//1
				// 					w.Init()
				// 				}
				// 				else


				if (isolga5) {
					this.ScriptsFinish(e)
					Object.assign(pact, { url: url, ready: true })

					pact.mos.splice(0, pact.mos.length)

					this.starts.splice(0, this.starts.length)
					for (let i = 0; i < starts.length; i++)
						this.starts[i] = starts[i]

					this.PageStart(url)
				}
				else
					C.ConsoleError(`Отсутствует тег с класом '${this.olga5Start}'`) // или атрибутом 'o5include'`)
			}
		}
		CheckHide = e => { // проверка и начало инициализации страницы
			const pact = this.pact,
				url = DocURL()

			if (pact.url != url && pact.ready) {
				console.log('%c%s', this.clr, '____<  ' + e.type.padEnd(22) + ' закрыл: ' + url.padEnd(55))

				this.ScriptsFinish(e)
				pact.url = url
			}
		}
		AppendChild = (owner, child) => {
			child.aO5_pageOwner = owner
			owner.appendChild(child)
			this.childs.push(child)
		}
		InsertBefore = (owner, child, reference) => {
			child.aO5_pageOwner = owner
			owner.insertBefore(child, reference)
			this.childs.push(child)
		}

		constructor() {
			this.olga5Start = 'olga5_Start'
			this.cls = 'olga5_isLoading'
			this.childs = []
			this.starts = []

			const initEvents = new MyEvents(C.consts.o5init_events)
			initEvents.AddEvents(this.CheckInit)	//{ capture: true }

			const closeEvents = new MyEvents(C.consts.o5hide_events)
			closeEvents.AddEvents(this.CheckHide)	//{ capture: true }

			this.donePage = new MyEvents(C.consts.o5done_events)
			this.loadDone = new MyEvents('olga5_sload')
			this.initDone = new MyEvents('olga5_sinit')
			Object.seal(this.pact)
			Object.freeze(this)
		}
	}

	let wshp = C.ModulAddSub(olga5_modul, modulname, () => {
		if (C.consts.o5debug > 0) console.log(` ===  инициализация ${olga5_modul}/${modulname}.js`)

		if (C.consts.o5nomnu > 0)
			document.body.classList.add('o5nomnu')

		if (C.consts.o5noact > 0) {
			((C && C.consts.o5debug > 0) ? C.ConsoleError : console.log)("}---> загружено `ядро библиотеки`, но инициализация ОТКЛЮЧЕНА по o5noact= '" + C.consts.o5noact + "'")
			return
		}

		if (C.scrpts.length > 0) {
			Object.assign(C, {
				page: new Page(),
			})
			C.E.Init()  // сброс событий
		}
		else {
			C.ConsoleInfo(`IniScripts.js: вообще нет скриптов для обработки`)
			// window.dispatchEvent(new window.Event('olga5_ready'))
			C.E.DispatchEvent('olga5_ready')
		}

		return true
	}
	)

	if (wshp.AscInclude)
		wshp.AscInclude()
})();