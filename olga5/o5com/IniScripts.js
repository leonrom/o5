/* global document, window, console, Map*/
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
		modulname = 'IniScripts'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}
	let cc = null
	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		completeState = "complete",
		myclr = "background: blue; color: white;border: none;",
		HasStart = doc =>
			doc.URL.match(/\bolga5-tests\b/i) || doc.querySelector('.olga5_Start'),
		page = {
			cls: 'olga5_isLoading',
			errs: { load: 0, url: 0 },
			def: { url: '', start: 0, timera: '', timToFinish: 0, timInit: 0, loaded: false, isInitScript: false },
			pact: {},
			childs: [],
			dones: [],
			winits: ['olga5_sload', 'olga5_sinit'],
			initList: [],
			InitDoc: e => {
				const proc = `--- InitDoc (${e ? e.type : 'из InitScripts'}): `
				if (e) {
					if (!e.detail || !e.detail.modul) {
						C.ConsoleError(`${proc} для события '${e.type}' НЕ указан 'detail' или 'detail.modul'`)
						return
					}
					const modul = e.detail.modul.trim(),
						t = e.type == 'olga5_sinit' ? 'i' : 'L'
					if (cc.o5debug > 1) console.log(`${proc}: ${modul}  -> '` + t + `'`)
					if (t == 'i') {
						if (modul) {
							const scrpt = C.scrpts.find(scrpt => scrpt.modul == modul)
							if (scrpt)
								scrpt.act.done = scrpt.act.strt
							else C.ConsoleError(`${proc} для события '${e.type}' указан несуществующий модуль '${modul}'`)
						}
						else C.ConsoleError(`${proc} в событии '${e.type}' не задан атрибут 'modul'`)
					}
					page.initList.push(modul + '/' + t)
				}
				else
					if (cc.o5debug > 2) console.log(`${proc}: отработка после InitScript`)
				// в блоге сюда попадает при еще не инициализированной странице
				// 'o5menu' переделать на ....
				window.clearTimeout(page.pact.timInit)
				if (page.initList.length > 0) {
					if (!page.pact.isInitScript) {
						InitScripts('init/Load')
						// page.pact.timInit = window.setTimeout(InitScripts, 11, 'init/Load')
						// if (cc.o5debug > 2) console.log(`${proc} setTimeout ${page.pact.timInit}`)
					}
				}
				else {
					const start = page.pact.start
					if (!C.scrpts.find(scrpt => scrpt.act.done != start)) {
						if (cc.o5debug > 1) console.log(`${proc}:  закончена инициализация`)
						page.Finish()
					}
					else if (cc.o5debug > 1) {
						let s = ''
						C.scrpts.forEach(scrpt => {
							if (scrpt.act.done != start) s += scrpt.modul + ', '
						})
						console.log(`${proc}:  не закончена инициализация:    ${s}`)
						// C.ConsoleError(`${proc}:  не закончена инициализация:    ${s}`)
					}
				}
			},
			Unload: function (url) { // -"-"
				const n0 = this.childs.length
				if (n0 > 0) {
					if (cc.o5debug > 0) console.log('}=====< Unload: закрытие открытых (n= ' + n0 + ') ' + this.pact.url)
					let n = n0
					while (n-- > 0) {
						const child = this.childs[n],
							owner = child.aO5_pageOwner
						for (const item of owner.children)
							if (item == child) {

								item.remove()
								break
							}
					}
					this.childs.splice(0, n0);
				}
				if (this.pact.loaded) {
					C.scrpts.forEach(scrpt => {
						const act = scrpt.act
						if (act && act.W && act.W.Done)
							act.W.Done()
					})
				}
				this.pact.url = url
				this.pact.loaded = false
				// document.dispatchEvent(new window.Event('visibilitychange')) // для PopUp в Блоггере
				document.dispatchEvent(new CustomEvent('visibilitychange', { detail: { unload: true } }))// для PopUp в Блоггере
				// Object.assign(this.pact, this.def)
			},
			Start: function (url) {
				const timera = `}====<<<   ОБРАБОТАНА СТРАНИЦА ${url}\n`,
					NotFinished = () => {
						const errs = []
						let prev = ''
						for (const scrpt of C.scrpts) {
							const act = scrpt.act
							let err = ''
							if (!err) {
								if (!act.W) err = "не загружен файл "
								else if (act.strt == 0) err = "инициализация не начиналась?"
								else if (act.strt != act.done) err = "инициализация не закончилась"
							}
							if (err) errs.push({ class: scrpt.modul, err: err })
						}
						if (errs.length == 0) errs.push({ err: "какого-то хрена слетела на 'NotFinished()'" })

						page.Finish(errs)
					},
					ActScripts = (scriptDone) => {
						const scrs = C.GetTagsByTagName('script'),
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
				console.time(timera)

				C.ClearOwners() //  чтобы пересчитало область определения

				this.dones.splice(0, this.dones.length)
				Object.assign(this.pact, this.def,
					{ url: url, timera: timera, start: Number(new Date()) + Math.random() })

				if (cc.o5timload) {
					if (this.pact.timToFinish > 0) window.clearTimeout(page.pact.timToFinish)
					this.pact.timToFinish = window.setTimeout(NotFinished, 1000 * cc.o5timload)
				}

				if (!document.body.classList.contains(this.cls))
					document.body.classList.add(this.cls) // это если есть такой класс

				// тут "olga5_sload" и "olga5_sinit"
				this.winits.forEach(eve => window.addEventListener(eve, this.InitDoc))

				if (C.consts.o5doscr)
					ActScripts(C.consts.o5doscr)

				if (cc.o5debug > 0)
					console.log('%c%s', myclr, "}--------<<  старт обработки страницы ", url)

				if (cc.o5debug > 0) {
					const o5inc = C.scrpts.find(scrpt => scrpt.modul == 'o5inc'),
						o5include = document.querySelector('[o5include]')
					if (o5inc && !o5include) C.ConsoleError(`Задан скрипт 'o5inc.js' но отсутствует тег с атрибутом 'o5include'`)
					if (!o5inc && o5include) C.ConsoleAlert(`Имеется тег с атрибутом 'o5include' но отсутствует  скрипт 'o5inc.js'`)
				}
			},
			Finish: function (errs) {
				if (page.pact.timToFinish > 0) window.clearTimeout(page.pact.timToFinish)
				if (!errs)
					window.dispatchEvent(new window.Event('olga5_ready'))

				// Object.assign(this.pact, this.def)

				if (document.body.classList.contains(this.cls))
					document.body.classList.remove(this.cls)

				this.pact.loaded = true
				if (errs)
					C.ConsoleError(`Скрипты не завершились по таймауту ${cc.o5timload} сек.`, errs.length, errs)
				else {
					this.winits.forEach(eve => window.removeEventListener(eve, this.InitDoc))

					if (cc.o5debug > 2)
						console.log('%c%s', myclr, "}===< КОНЕЦ  обработки страницы ", page.pact.url)
				}
				if (this.pact.timera) {
					console.timeEnd(this.pact.timera)
					this.pact.timera = ''
				}
				// if (cc.o5debug > 0)
				// 	console.log('                           ')
			}
		},
		InitScripts = txt => {
			page.pact.isInitScript = true
			const start = page.pact.start,
				l = page.initList.length,
				proc = `InitScripts: ${txt} `

			page.initList.splice(0, l)
			if (!start) {
				if (cc.o5debug > 1)
					console.log(`${proc}: страница еще не загружена - пропускаю  ------------------`)
				return
			} else
				if (cc.o5debug > 1)
					console.log(`--> ${proc}: ` + (l > 0 ? page.initList.join(',') : '') + `   ----------------------------------------`)

			for (const scrpt of C.scrpts) {
				const act = scrpt.act
				/* проверка загруженности этого скрипта */
				if (!act.W) {
					act.W = window.olga5.find(w => w.modul == scrpt.modul)
					if (!act.W)
						continue	// такой скрипт еще не подгружен. ожидаем-с
				}

				const modul = act.W.modul
				/* проверка инициализированности этого скрипта */
				if (start == act.done || !act.W.Init)  // уже инициирован или не требует инициализации (Object.assign(act, { strt: start, done: strt }))
					continue

				/* проверка инициализированности необходимых скриптов */
				let shallini = start != act.strt
				if (shallini) {
					const mods = C.depends[modul]
					if (!mods) {
						for (const scrpt of C.scrpts) {
							if (modul == scrpt.modul) break
							if (start != scrpt.act.done) {
								shallini = false
								break
							}
						}
					}
					else if (mods.length > 0)
						for (const mod of mods) {
							const scrpt = C.scrpts.find(scrpt => mod == scrpt.modul)
							if (scrpt && start != scrpt.act.done) { // скрипт подключен, но его иниц. еще не закончена (или не начиналась)
								shallini = false
								break
							}
						}
				}
				/* проверка инициализация не начиналась и (в отладочном)  - не было ли повтора*/
				if (shallini) {
					if (cc.o5debug > 1) {
						console.log(`    ${proc}:  иниц. '${modul}' `)
						const im = page.dones.find(im => im.modul == modul && !im.shown)
						if (im) {
							C.ConsoleError(`Повтор инициализациии модуля '${modul}' - игнорируется (м.б. заменить 'src' на 'data-src'?)`)
							im.shown = true
						}
						else
							page.dones.push({ modul: modul, shown: false })
					}
					act.strt = start
					act.W.Init(C)
				}
			}

			if (cc.o5debug > 2) console.log(`--< ${proc}`)

			page.pact.isInitScript = false
			page.InitDoc()
			// window.setTimeout(page.InitDoc, 1)

		},
		WinOnLoad = (url, txt) => {
			const proc = `WinOnLoad (${txt})`,
				newurl = page.pact.url != url

			if (C.scrpts.length <= 0 && page.errs.load++ == 0)
				C.ConsoleError(`${proc}: вообще нет скриптов для обработки`)

			if (!url && page.errs.url++ == 0)
				C.ConsoleError(`${proc}: невозможно определить url`)

			if (C.consts.o5debug > 0)
				console.log(`${proc}:  readyState=${document.readyState}, ` +
					`errs=${(page.errs.load > 0 || page.errs.url > 0) ? true : false}, url=${url}` +
					` (url->${(newurl ? 'новый' : 'старый')})`
				)
			// if (document.readyState != 'complete' || !newurl || page.errs.load > 0 || page.errs.url > 0) return
			// if (document.readyState == 'loading' || !newurl || page.errs.load > 0 || page.errs.url > 0) return
			if (!newurl || page.errs.load > 0 || page.errs.url > 0) return

			const match_html = /\.html([?&#]|$)/

			if (page.pact.url && page.pact.url.match(match_html)) { // закрываем старую страницу
				page.Unload(url)
			}
			if (url.match(match_html)) {
				page.Start(url)
				InitScripts(txt)
			}
		},
		EventUrl = doc => {
			return doc ? doc.URL.match(/[^?&#]*/)[0].trim() : ''
		},
		init_events = {
			tim: 0,
			txt: '',
			typ: '',
			Act: e => {
				const txt = e.currentTarget === document ? 'doc' : 'win',
					isold = e.timeStamp == init_events.tim && e.type == init_events.typ,
					doc = e.target.ownerDocument || e.target.document || e.target,
					isdel = init_events.txt != txt,
					url = EventUrl(doc)
				if (cc.o5debug > 0) {
					const src = e.srcElement,
						phases = ['NONE', 'CAPTURING', 'AT_TARGET', 'BUBBLING'],
						name = src.nodeName + (src.id ? '#' + src.id : '') + (src.className ? ('.' + src.className.replace(/\s+/g, '.')) : ''),
						doc = document.URL.match(/\/[^\/]*$/)[0].substring(1),
						fmt = "background: PaleGreen; color: black;",
						ep = e.eventPhase,
						add = e.type == 'message' ? (e.origin + '(' + e.data + ')') :
							(e.type == 'transitionstart' ? (e.propertyName ? `(${e.propertyName})` : '') : '')
					console.log('%c%s', fmt, `${txt}: ${e.type.padEnd(18)} ${('' + e.timeStamp).padEnd(8)}  ${ep}=${phases[ep]}, ${doc} (${document.readyState})`,
						(name.match('undefined') ? 'W' : name) + ' ' + add + ' ' + (isold ? ' - игнорю' : '') + (isold && isdel ? ' и удаляю' : ''))
					// if (name.match('undefined'))
					// console.log('')
				}
				if (isold) { // удалить "лишний" из обработчиков
					if (isdel)
						(txt == 'doc' ? document : window).removeEventListener(e.type, init_events.Act)
					// return
				}

				Object.assign(init_events, { tim: e.timeStamp, txt: txt, typ: e.type })
				if (document.readyState == completeState && HasStart(document)){
					const murl=document.URL.match(/[^?&#]*/)[0]
					if (url == murl)		//	&& page.pact.url != url)
						WinOnLoad(url, `событие '${e.type}'`)}
			}
		}

	Object.assign(page.pact, page.def)
	Object.seal(page.pact)
	Object.freeze(page.def)
	Object.freeze(page)

	C.AppendChild = function (owner, child) { // не делать через => чтобы м.б. this
		child.aO5_pageOwner = owner
		owner.appendChild(child)
		page.childs.push(child)
	}
	C.InsertBefore = function (owner, child, reference) { // не делать через => чтобы м.б. this
		child.aO5_pageOwner = owner
		owner.insertBefore(child, reference)
		page.childs.push(child)
	}
	let nbody = 0
	if (!wshp[modulname])
		wshp[modulname] = () => {
			cc = C.consts
			if (cc.o5debug > 0) console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)

			if (cc.o5nomnu > 0)
				document.body.classList.add('o5nomnu')

			if (cc.o5noact > 0) {
				((C && cc.o5debug > 0) ? C.ConsoleError : console.log)
					("}---> загружено `o5common.js`, но инициализация ОТКЛЮЧЕНА по o5noact= '" + cc.o5noact + "'")
				return
			}

			const depends = {},
				ss = (cc['o5depends'] || C.depends.spisok).split(/[,;]/)
			ss.forEach(s => {
				const uu = s.trim().split(/\s*[\s:=]+\s*/),
					u = uu[0]
				if (u)
					depends[u] = (depends[u] || []).concat(uu.slice(1))
			})
			Object.assign(C.depends, depends)

			// for (const doc of [document, window]) { // отработка загрузки документа
			// 	const eves = cc.o5init_events.trim().split(/\s*[,;]\s*/) || []
			// 	eves.forEach(eve => doc.addEventListener(eve, init_events.Act))
			// }
			const eves = cc.o5init_events.trim().split(/\s*[,;]\s*/) || []
			eves.forEach(eve => document.addEventListener(eve, init_events.Act))

			if (HasStart(document) &&
				(document.readyState == completeState ||
					(document.readyState == 'interactive' && C.consts.isDOMContentLoaded)))
				WinOnLoad(EventUrl(document), "готовность документа (сразу)")

			// window.addEventListener('beforeunload', e => {
			// 	page.Unload('')
			// }, { capture: true })

			if (cc.o5debug > 0)
				console.log(`}---> ядро библиотеки ожидает события:  [${cc.o5init_events}]`)

			InitScripts(`ядро библиотеки`)

			return true
		}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();