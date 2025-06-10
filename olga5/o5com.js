/* global document, window, console, CustomEvent */
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  сборщик модулей ядра библиотеки
 * 
**/
// 
(function () {              // ---------------------------------------------- o5com ---
	// let n3=0
	const
		E = { // тут везде tag===window.  Д.б. перед 'use strict'
			Err: err => {
				console.error("%c%s", "background: yellow; color: black;border: solid 1px gold;", 'E: ' + err)
			},
			Msg: (txt, eve, nFun) => {
				if (C.consts.o5debug > 1) {
					console.groupCollapsed("%c%s", "background: lightblue; color: black;border: solid 1px gold;",
						`${txt} для eve='${eve}'`)
					console.log(`для вызова:\n${nFun}`)
					{
						console.groupCollapsed(`Трассировка вызова`)
						console.trace()
						console.groupEnd()
					}
					console.groupEnd()
				}
			},
			NFun: (Fun) => Fun.name || Fun,
			events: [],
			donets: [],
			HasEventListener: (eve, Fun) => {
				const nFun = E.NFun(Fun),
					has = E.events.find(event => event.eve === eve && event.nFun === nFun)
				return has
			},
			/**
 * Добавить слушатель с поддержкой кастомных опций
 * @param {string} eve - имя события
 * @param {Function} Fun - callback-функция
 * @param {Object|boolean} opts - опции addEventListener и свои кастомные параметры
 *        допустимые native опции: capture, once, passive
 *        кастомные: couldRepeat (boolean, default true)
 */
			AddEventListener: (eve, Fun, opts) => {
				const nFun = E.NFun(Fun)

				if (typeof opts === 'boolean')
					opts = { capture: opts };

				if (E.events.find(event => event.eve == eve && event.nFun == nFun && event.opts == opts)) {
					if (!opts.couldRepeat)
						E.Err(`повторная регистрация  '${eve}' для ф-ии "${nFun}"`)
				}
				else {
					E.Msg('AddEventListener', eve, nFun)

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

					const opts2 = {capture:false, once:false, passive:false}
					for (const opt in opts)
						if (['capture', 'once', 'passive'].includes(opt))
							if (typeof opts[opt] === 'boolean')
								opts2[opt] = opts[opt]
							else E.Err(`значение одной из опций - не булево а '${typeof opts[opt]}'`)

					E.events.push({ eve: eve, nFun: nFun, opts: opts2 })
					window.addEventListener(eve, Fun, opts2)
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
				if (C.consts.o5debug > 1 && !canrep) {
					console.groupCollapsed(`DispatchEvent: '${eve}' ${modulx ? (' из  ' + modulx) : ''} `)
					console.trace()
					console.groupEnd()
				}
				const
					modul = modulx ? modulx : '',
					donet = E.donets.find(donet => donet.eve == eve && donet.modul == modul)
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
				// console.log('---n3= '+n3)
				// if (n3===8) // 4,6
				// 				console.log(eve, '----------------------------------------------------')
				// 				console.log(eve, e)
				// 		n3++
				window.dispatchEvent(e)
			},
			Clear: () => {
				E.events.splice(0, E.events.length)
				E.donets.splice(0, E.donets.length)
			},
			IsDone: eve => { // не используется (думал для замены проверок 'window.olga5.C.o5_isInited',- решил не менять)
				E.donets.find(donet => donet.eve == eve)
			},
		}

	const olga5_modul = "o5com"
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const
		modnames = ['CConsole', 'CEncode', 'CApi', 'CParams', 'TagsRef', 'IniScripts'], // 'IniScripts' д.б. ПОСЛЕДНИМ
		/*
		нафига тут был , 'CPops' ?????????????????????????????????????????????
		*/
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
				ScriptLoad = name => {
					const lefts = []
					nams[name] = true
					for (const nam in nams)
						if (!nams[nam]) lefts.push(nam)

					if (C.consts.o5debug > 0)
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
					// ScriptLoad(name)
				}

			for (const name of names)
				nams[name] = false

			for (const name of names) { // в очерёдности размещения	
				const wshp = window.olga5[modul]

				if (!wshp) {
					C.ConsoleError(`В скрипте, выполняющем дозагрузку скриптов, не создан объект 'window.olga5.${modul}'`)
					continue
				}
				if (wshp[name]) ScriptLoad(name)
				else {
					if (!load.is_set)
						Object.assign(load, {
							is_set: true,
							path: actpath + modul + '/',
							timeout: window.setTimeout(OnTimer, 1000 * C.consts.o5timload),
						})

					const script = document.createElement('script')

					if (script.readyState) script.onreadystatechange = () => { ScriptLoad(name); }
					else script.onload = () => { ScriptLoad(name); }
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
			'use strict'
			const
				DoneO5com = (e) => {
					if (e)
						document.removeEventListener('readystatechange', DoneO5com)

					const _url_olga5 = C.o5script.src.match(/\S*\//)[0],
						dt = ('' + (Number(new Date()) - strt_time)).padStart(4) + ' ms',
						name = dt + `        ${olga5_modul}`,
						errs = []

					console.log('%c%s', "background: blue; color: white;border: none;",
						' инициализировано ядро      ',
						name)

					for (const modname of modnames)
						if (wshp[modname]) wshp[modname](_url_olga5)
						else
							errs.push(modname)

					if (errs.length > 0)
						console.error('%c%s', "background: yellow; color: black;border: none;",
							`Не найдены [${errs.join(', ')}] в ${olga5_modul}.js ( где-то синтаксическая ошибка ?)`)
				}

			if (document.body) DoneO5com()
			else
				document.addEventListener('readystatechange', DoneO5com)
		},
		GetBaseHR = root => { // функции определения адреса текущиещей страницы и корня сайта
			'use strict'
			const url = new window.URL(window.location) //"http://rombase.h1n.ru/o5/2020/olga5-all.html")
			if (root == 'root') return url.origin + '/'
			else return url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1)
		},
		TryToDigit = x => {
			'use strict'
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
		HasProperty = (foo, nam) => {
			'use strict'
			return Object.prototype.hasOwnProperty.call(foo, nam)
			// return  foo.hasOwnProperty(nam)
		},
		GetAttribute = (attrs, name) => { // нахождение значения 'attr' в массиве атрибутов 'attrs'
			'use strict'
			for (const nam of [name, 'data-' + name, '_' + name, 'data_' + name])
				if (HasProperty(attrs, nam)) return attrs[nam]
		},
		GetAttrs = attributes => {
			'use strict'
			const attrs = {}
			for (const attribute of attributes)
				attrs[Repname(attribute.name)] = TryToDigit(attribute.value)
			return attrs
		},
		Repname = name => {
			'use strict'
			return name.trim().replaceAll('-', '_').toLowerCase()
		},
		ConstsFillFromUrl = (xs) => {  // параметры адресной строки,- м.б. (т.е. интерпретируются) только константы
			'use strict'
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
			'use strict'
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
		// olga5ignore: 'olga5-ignore',
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
			o5_pageLoads: 'readystatechange:d, message:u, o5inc_ready',
			o5_pageHides: 'transitionrun:u',
			o5_pageDones: 'beforeunload, o5_unloadPage',
		},
		constsurl: {},
		save: { hash: null, xs: null, p: '', n1: -1, urlName: 'url', libName: 'ядро', }, // сохранение для "красивой" печати - потом удалю
		ModulAddSub: (modul, p1, p2, funcs) => {
			'use strict'
			if (!window.olga5[modul])
				window.olga5[modul] = {}

			const
				wshp = window.olga5[modul],
				sub = p2 ? p1 : p1.name,
				Fun = p2 ? p2 : p1

			if (C.consts.o5debug > 1) {
				console.log(`${document.currentScript.src.indexOf(`/${modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${modul}/${sub}.js`)
			}

			if (wshp && wshp[sub]) {
				console.groupCollapsed('%c%s', "background: yellow; color: black;border: solid 2px red;",
					`Повтор подгрузки '${modul}/${sub}'`)
				console.log(`Fun_old=${wshp[sub]})`)
				console.log(`Fun_new=${Fun})`)
				console.groupEnd()
			}

			wshp[sub] = Fun

			if (funcs)
				for (const func of funcs)
					wshp[sub][func.name] = func

			return wshp
		},
		AddModuleSub: (modul, sub, funcs) => {
			'use strict'
			if (!window.olga5[modul])
				window.olga5[modul] = {}

			const
				wshp = window.olga5[modul]

			if (wshp && wshp[sub]) C.ConsoleError(`Повтор подгрузки '${modul}/${sub}'`)
			else
				if (C.consts.o5debug > 1)
					console.log(`${document.currentScript.src.indexOf(`/${modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${modul}/${sub}.js`)

			wshp[sub] = {}

			if (funcs)
				for (const func of funcs)
					wshp[sub][func.name] = func

			return wshp
		},
		ModulAdd: W => {
			'use strict'
			const modul = W.modul
			if (window.olga5.find(w => w.modul == modul))
				console.error('%c%s', "background: yellow; color: black;border: solid 2px red;",
					`Повтор загрузки '${modul}`)
			else {
				if (C.consts.o5debug)
					console.log(`${document.currentScript.src.indexOf(`/${modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${modul}.js`)

				if (!window.olga5[modul])
					window.olga5[modul] = {}

				const wshp = window.olga5[modul]

				wshp.W = W
				wshp.name = W.modul // просто для облегченияидентификации
				window.olga5.push(W)

				C.E.DispatchEvent('o5_scriptLoad', W.modul)

				return wshp
			}
		},
		MyJoinO5s: aO5s => {
			'use strict'
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

	if (!C.Debug) {
		const
			errors = [],
			Error = nam => {
				if (!errors.includes(nam)) {
					errors.push(nam)
					const err = C.Debug.loaded ? `отсутствует ф-я '${nam}' в модуле 'o5dbg'` :
						`не подключен модуль 'o5dbg' (для вызова '${nam}')`
					console.error("%c%s", "background: yellow; color: black;", err)
				}
			}

		C.Debug = { // тут д.б.  пустышки для всех из o5dbg.Utils
			loaded: false,
			ShowBounds: () => Error('ShowBounds'),
		}
	}

	console.log(`=======  загружено ядро библиотеки  =======`)
})();
