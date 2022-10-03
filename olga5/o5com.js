/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  сборщик модулей ядра библиотеки
**/
//
(function () {              // ---------------------------------------------- o5com ---
	'use strict'
	const olga5_modul = "o5com",
		// modulname= 'o5com',
		timera = '                                                                <   инициирован ' + olga5_modul

	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const C = window.olga5.C

	const wshp = window.olga5[olga5_modul],
		modnames = ['CConsole', 'CEncode', 'CApi', 'CParams', 'TagsRef', 'IniScripts'],

		IncludeScripts = ({ modul = '', names = [], actscript = C.o5script, iniFun = {}, args = [] }) => {
			const nams = {},
				o5timload = C.o5script.attributes['o5timload'] || 3,
				load = { is_set: false, timeout: 0, path: '' },
				actpath = actscript.src.match(/\S*\//)[0],
				OnTimer = () => {
					let s = ''
					for (const nam in nams)
						if (!nams[nam]) s += (s ? ', ' : '') + nam

					if (s)
						console.error(`Для ${modul} недозагрузились скрипты: ${s} (таймер o5timload=${o5timload}с.)`)
					load.timeout = 0
				},
				OnLoad = (name) => {
					nams[name] = true
					for (const nam in nams)
						if (!nams[nam]) return

					if (load.timeout > 0) {
						window.clearTimeout(load.timeout)
						load.timeout = 0
					}
					iniFun(args)
				},
				OnError = (name, e) => {
					console.error(`Для ${name} ошибка дозагрузки '${name}' (из ${e.target.src})`)
					// OnLoad(name)
				}

			for (const name of names) { // в очерёдности размещения	
				if (!window.olga5[modul]) {
					C.ConsoleError(`В скрипте, выполняющем дозагрузку скриптов, не создан объект 'window.olga5.${modul}'`)
					continue
				}
				if (!window.olga5[modul][name]) {
					if (!load.is_set) Object.assign(load, {
						is_set: true,
						// path: C.o5scriptPath + modul + '/',
						path: actpath + modul + '/',
						timeout: window.setTimeout(OnTimer, 1000 * o5timload),
					})
					nams[name] = false

					const script = document.createElement('script')

					if (script.readyState) script.onreadystatechange = () => { OnLoad(name); }
					else script.onload = () => { OnLoad(name); }
					script.onerror = function (e) { OnError(name, e); }

					script.src = load.path + name + '.js'
					script.dataset.o5add = modul
					if (C.consts.o5debug > 0) {
						const MakeObjName = obj => obj ? (
							(obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
								('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
								'.' + (obj.className ? obj.className : '?'))) : 'НЕОПР.'
						console.log(`Вставляю скрипт ${name.padEnd(13)}  перед  ${modul + '.js'} (в parentNode=${MakeObjName(actscript.parentNode)})`)
					}

					if (actscript.parentNode)
						actscript.parentNode.insertBefore(script, actscript)
					else // это ватще-то заплатка. по-хорошему надо бы убрать 'actscript' оставив 'module'	
						for (const scr of document.scripts)
							if (scr.src.lastIndexOf('/' + modul + '.js') > 0) {
								scr.parentNode.insertBefore(script, scr)
								break
							}
				}
			}
			if (!load.timeout) iniFun(args)
		},
		RunO5com = () => {
			console.time(timera)
			Object.assign(C, {
				IncludeScripts: IncludeScripts,
			})

			const _url_olga5 = C.o5script.src.match(/\S*\//)[0],
				errs = []
			for (const modname of modnames) {
				if (wshp[modname]) wshp[modname](_url_olga5)
				else
					errs.push(modname)
			}

			if (errs.length > 0)
				console.error(`Не найдены [${errs.join(', ')}] в ${olga5_modul}.js ( где-то синтаксическая ошибка ?)`)
			console.timeEnd(timera)
		},
		GetBaseHR = (root) => { // функции определения адреса текущиещей страницы и корня сайна
			const url = new window.URL(window.location) //"http://rombase.h1n.ru/o5/2020/olga5-all.html")
			if (root == 'root') return url.origin + '/'
			else return url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1)
		},
		TryToDigit = x => {
			if (typeof x === 'undefined') return true
			const val = ('' + x).replace(C.repQuotes, '')

			const i = parseInt(val)
			if (i == val) return i
			const f = parseFloat(val)
			if (f == val) return f
			const rez = val.replace(/\s*;\s*\n+\s*/g, ';').replace(/\s*\n+\s*/g, ';')
			return rez.replace(/\t+/g, ' ').trim()
		},
		GetAttribute = (attrs, name) => { // нахождение значения 'attr' в массиве атрибутов 'attrs'
			const nams = [name, 'data-' + name, '_' + name, 'data_' + name]
			for (const nam of nams)
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
							const prms = u.split(/[=:]/),
								nam = Repname(prms[0])
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
		repQuotes: /^\s*['"`]?\s*|\s*['"`]?\s*$/g,  // необязат. первая и последняя кавычки с окруж. пробелами,
		TryToDigit: TryToDigit,
		ParamsFillFromScript,
		GetAttrs: GetAttrs,
		GetAttribute: GetAttribute,
		Repname: Repname,
		o5script: document.currentScript,
		o5attrs: GetAttrs(document.currentScript.attributes),
		cstate: { activated: false }, // общее состояние 
		urlrfs: {
			_url_html: GetBaseHR('href'),
			_url_root: GetBaseHR('root'),
			_url_olga5: '' // будет задан при инициализации (document.currentScript.src.match(/\S*\//)[0],)
		},
		consts: {
			o5debug: 0, o5nomnu: 0, o5noact: 0, o5timload: 3, o5only: 0,
			o5incls: '', o5doscr: 'olga5_sdone',
			o5init_events: 'DOMContentLoaded, readystatechange, transitionstart, transitionend, message',
			isDOMContentLoaded: false
		},
		constsurl: {},
		depends: { spisok: "o5ref o5inc, o5pop, o5snd:o5ref o5inc; o5shp=o5snd o5ref, o5shp:o5inc, o5blog o5mnu o5inc, o5mnu o5inc" },
		save: { hash: null, xs: null, p: '', n1: -1, urlName: 'url', libName: 'ядро', }, // сохранение для "красивой" печати - потом удалю
		// urlSaveName: 'url',
		// libSaveName: 'ядро'		
	})

	document.addEventListener('DOMContentLoaded', e => C.consts.isDOMContentLoaded = true, { once: true })
	const xs = {}, // временное хранилилище для считываемых параметров
		p = 'consts',
		defs = C[p]

	Object.assign(C.save, { xs: xs, p: p, n1: -1 })

	ConstsFillFromUrl(xs)
	C.save.n1 = ParamsFillFromScript(xs, defs, C.o5attrs, p)

	for (const nam in xs) defs[nam] = xs[nam].val

	IncludeScripts({ modul: olga5_modul, names: modnames, actscript: C.o5script, iniFun: RunO5com, })

	const activateEvents = ['click', 'keyup', 'resize'],
		SetActivated = e => {
			C.cstate.activated = true
			activateEvents.forEach(activateEvent => document.removeEventListener(activateEvent, SetActivated))
		}
	activateEvents.forEach(activateEvent => document.addEventListener(activateEvent, SetActivated))
	//и почему таки не меняется изображение?

	console.log(`}---< загружено ядро библиотеки`)
})();
