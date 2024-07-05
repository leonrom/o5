/* global document, window, console, Map*/
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
		GetAttribute = (attrs, name) => { // нахождение значения 'attr' в массиве атрибутов 'attrs'
			for (const nam of [name, 'data-' + name, '_' + name, 'data_' + name])
				if (attrs.hasOwnProperty(nam)) return attrs[nam]
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
							if (C.consts.hasOwnProperty(nam)) {
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
				if (defs.hasOwnProperty(nam) && !xs.hasOwnProperty(nam)) {
					const add = defs.hasOwnProperty(nam) ? '' : stradd
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
							const add = defs.hasOwnProperty(nam) ? '' : stradd,
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
