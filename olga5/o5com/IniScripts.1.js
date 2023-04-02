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

	let page = null,
		cc = null

	const myclr = "background: blue; color: white;border: none;"
	class MyEvents {
		meves = []
		constructor(list) {
			const meves = list.trim().split(/\s*[,;]\s*/) || []
			for (const meve of meves) {
				const ss = meve.trim().split(/\s*[:]\s*/)
				if (ss[0].length > 0)
					this.meves.push({ eve: ss[0], isw: ss[1] && ss[1].toUpperCase() == 'W' })
			}
			Object.freeze(this)
		}
		AddEvents = (Fun) => { // addEventListener
			for (const meve of this.meves)
				if (meve.isw) window.addEventListener(meve.eve, Fun, { capture: true })
				else document.addEventListener(meve.eve, Fun)
		}
		RemEvents = (Fun) => { // addEventListener
			for (const meve of this.meves)
				if (meve.isw) window.removeEventListener(meve.eve, Fun, { capture: true })
				else document.removeEventListener(meve.eve, Fun)
		}
	}
	class MyTimer {
		constructor(text) {
			this.text = text
			Object.seal(this.act)
			Object.freeze(this)
		}
		act = { time: 0, name: '' }
		text = ''
		Stop = (add) => {
			// console.log('...=', this.act.time,  this.act.name)
			if (this.act.time) {
				const dt = (' ' + (Number(new Date()) - this.act.time)).padStart(8) + ' ms',
					name = dt + ' ' + this.act.name.padStart(12)
				if (add)
					console.error('%c%s', "background: yellow; color: black;border: none;",
						this.text + name + ' [' + add + ']')
				else
					console.log('%c%s', myclr, this.text + name)
				this.act.time = 0
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
	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
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
			if (!(page && page.pact && page.pact.ready)) return

			const start = page.pact.start
			for (const scrpt of C.scrpts) {
				const act = scrpt.act
				if (!act.timera)
					act.timera = new MyTimer(`---<<<             инициирован `)
				if (start != act.start && act.W && !act.incls)
					if (act.need && act.W.Init) {
						const depend = scrpt.depends.find(depend => (depend.act.need && depend.act.done != start))
						if (!depend) {
							if (cc.o5debug > 1)
								console.log(`--->>>     ______ начало нинициализации _____     ${act.W.modul} `)
							act.start = start
							act.timera.Start(act.W.modul)
							act.W.Init(C)
						}
					} else
						Object.assign(act, { start: start, done: start })
			}
		},
		/**
		 * LoadDone(e) - завершение загрузки очередного скрипта
		 * 			ВЫЗЫВАЕТСЯ: по событию 'olga5_sload'
		 * @param {e} событие Event,  содержащее и имя модуля
		 */
		LoadDone = e => {
			const newloads = [],
				Included = modul => {
					const nam = `загружены включения для '${modul}'`,
						scrpt = C.scrpts.find(scrpt => scrpt.modul == modul)
					if (cc.o5debug > 1)
						console.log(`LoadDone: '${nam}'`)

					scrpt.act.incls = ''
					InitScripts(nam)
				}

			if (cc.o5debug > 1)
				console.log('- - > ' + (e ? `загружен модуль '${e.detail.modul}'` : `загружено ядро библиотеки`))
			for (const scrpt of C.scrpts) {
				const w = scrpt.act.W || window.olga5.find(x => x.modul == scrpt.modul)
				if (w) {
					if (!scrpt.act.W) {
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
			if (cc.o5debug > 2)
				console.log('    > ' + newloads.length ? ` (готовы к инициации: ${newloads.join(', ')})` : ' (но инициировать нечего)')

			if (newloads.length > 0)
				InitScripts(`загрузка [${newloads.join(', ')}]`)
		},

		Finish = istimeout => {
			if (page.pact.timToFinish > 0) window.clearTimeout(page.pact.timToFinish)

			if (document.body.classList.contains(page.cls))
				document.body.classList.remove(page.cls)

			if (page.errs.length > 0) {
				C.ConsoleError(`Скрипты ${istimeout ? 'НЕ' : ''} завершились (есть ошибки)`, page.errs.length, page.errs)
				page.errs.splice(0, page.errs.length) //  могут еще завершиться и без ошибок
			}
			page.pact.timerp.Stop(istimeout ? 'таймер' : '')

			if (!istimeout)
				page.pact.isinited = true

			// const eve = document.scripts.find(script=>script.src.match(/o5shp.js/)) //head.querySelector('script[src*=o5shp.js]') ? 'olga5-incls' : 'olga5_ready'
			window.dispatchEvent(new window.Event('olga5_ready'))
		},
		/**
		 * InitDone(e) - завершение инициализации очередного скрипта
		 * 			ВЫЗЫВАЕТСЯ: по событию 'olga5_sinit'
		 * @param {e} событие Event,  содержащее и имя модуля
		 */
		InitDone = e => {
			if (!e.detail || !e.detail.modul) {
				page.errs.push({ modul: '?', err: `для события '${e.type}' НЕ указан 'detail' или 'detail.modul'` })
				return
			}

			const modul = e.detail.modul.trim(),
				scrpt = C.scrpts.find(scrpt => scrpt.modul == modul)

			if (!scrpt) {
				page.errs.push({ modul: modul, err: `для события '${e.type}' указан несуществующий модуль` })
				return
			}
			const start = page.pact.start,
				act = scrpt.act,
				lefts = []

			act.timera.Stop('')
			act.done = act.start
			C.scrpts.forEach(scr => {
				if (scr.act.done != start && scr.act.need)
					lefts.push(scr.modul)
			})

			if (cc.o5debug > 1 && lefts.length > 0)
				console.log(`\t(осталось инициировать:  ${lefts.join(', ')})`)

			if (lefts.length > 0)
				InitScripts(`инициирован '${modul}'`)
			else
				Finish(0)
		}

	class Page {
		pact = { timerp: new MyTimer("}==  КОНЕЦ  обработки  страницы"), observer: null, }
		olga5Start = 'olga5_Start'
		cls = 'olga5_isLoading'
		errs = []
		childs = []
		Unload = () => {
			if (!pact.ready) return

			const pact = this.pact
			pact.ready = false

			const n0 = this.childs.length
			if (cc.o5debug > 0) console.log('%c%s', myclr,
				`}=====< закрытие по '${e.type}' (n= ${n0}) страницы "${pact.url}"`)

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

			C.scrpts.forEach(scrpt => {
				const act = scrpt.act
				if (act && pact.start == act.start && act.W && act.W.Done)
					act.W.Done()
			})

			this.doneEvents.RemEvents(this.CheckNew)
			// for (const eve of this.doneEvents)
			// 	window.removeEventListener(eve, this.Unload, { capture: true })
			window.dispatchEvent(new window.Event('olga5_done'))
		}
		Load = (url, starts) => {  // начало обработки страницы
			const pact = this.pact,
				NotFinished = () => {
					let prev = ''
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
					Finish(1)
				}

			if (cc.o5debug > 0)
				console.log('%c%s', myclr, "----- старт обработки страницы ", url)

			this.errs.splice(0, this.errs.length)

			if (cc.o5timload) {
				if (pact.timToFinish > 0) window.clearTimeout(pact.timToFinish)
				pact.timToFinish = window.setTimeout(NotFinished, 1000 * cc.o5timload)
			}

			C.QuerySelectorInit(starts, this.olga5Start) //  чтобы пересчитало область определения

			for (const scrpt of C.scrpts) { // делаем при каждой инициализации
				if (C.owners.length == 0) scrpt.act.need = true
				else {
					// if (!scrpt.hasOwnProperty('act') || !scrpt.act.hasOwnProperty('need'))
					// 	console.log('1111')
					scrpt.act.need = false
					for (const owner of C.owners) {  
						if (owner.modules.length == 0) scrpt.act.need = true
						else
							scrpt.act.need = !!owner.modules.find(modul => modul == scrpt.modul)
						if (scrpt.act.need) break
					}
				}
			}

			if (!document.body.classList.contains(this.cls))
				document.body.classList.add(this.cls) // это если есть такой класс

			/* тест моих функций */
			if (C.consts.o5debug > 2) {
				let s = ''
				const modul = '',
					Prt = mtags => {
						s = ''
						mtags.forEach(mtag => {
							s += (!mtag.quals ? C.MakeObjName(mtag) :
								(C.MakeObjName(mtag.tag) + '(' + mtag.quals.join(',') + ')')) + '; '
						})
						console.log(s)
					}
				console.groupCollapsed(` тест моих функций функций выборки `)
				Prt(C.GetTagsByQueryes('[o5popup],[title]', modul))
				Prt(C.GetTagsByIds("div_strt", modul))
				Prt(C.GetTagsByClassNames('olga5_page_header, olga5_shp', modul))
				Prt(C.GetTagsByTagNames('div,p', modul))
				Prt(C.SelectByClassName('olga5_shp', modul, true))
				console.groupEnd()
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

			if (cc.o5debug > 0) {
				const o5inc = C.scrpts.find(scrpt => scrpt.modul == 'o5inc'),
					o5include = document.querySelector('[o5include]')
				if (o5inc && !o5include) C.ConsoleError(`Задан скрипт 'o5inc.js' но отсутствует тег с атрибутом 'o5include'`)
				if (!o5inc && o5include) C.ConsoleAlert(`Имеется тег с атрибутом 'o5include' но отсутствует  скрипт 'o5inc.js'`)
			}

			this.doneEvents.AddEvents(this.CheckNew)	//{ capture: true }
			pact.timerp.Start(url)
			InitScripts(`загружена страница '${url}'`)

		}
		Mutation = function (mutationsList, observer) {
			for (let mutation of mutationsList) {
				let s = ''
				if (mutation.type === 'childList')
					s = 'A child node has been added or removed.'
				else if (mutation.type === 'attributes')
					s = ' attribute was modified.';

				if (s)
					console.log('%c%s', `background: lightgreen;color:aqua;`, s);
			}
		}
		CheckNew = e => {
			const pact = this.pact,
				url = DocURL(),
				starts = document.querySelectorAll("[class *= '" + this.olga5Start + "']"),
				isolga5 = starts && starts.length,
				isloaded = document.readyState == 'complete' ||
					(url.match(/\bolga5-tests\b/i) && document.readyState == 'interactive')

			if (cc.o5debug > 0 && e) {
				console.groupCollapsed('%c%s', `background: green;color:white;`,
					'____>  ' + e.type.padEnd(22) + (isolga5 ? 'ДА' : '  ') + document.readyState[0] + ':' + url.padEnd(55))
				for (const nam in e)
					if (nam != 'type' && !(e[nam] instanceof Function))
						console.log(nam.padEnd(24), e[nam])
				console.groupEnd()
			}

			if (pact.url != url && pact.ready) this.Unload()

			if (pact.url != url || !pact.ready) {
				Object.assign(pact, {
					url: url,
					ready: isloaded && isolga5,
					isinited: false, // не надо больше выполнять инициализацию - всё уже сделано						
					start: Number(new Date()) + Math.random(),
					timToFinish: 0,
					timini: 0,
				})
				if (pact.ready)
					this.Load(url)

				// if (isolga5) { observer.disconnect() }
				// else {
				if (isloaded && !isolga5) {
					const attrs = { attributes: true, childList: true, subtree: true }
					if (!pact.observer)
						pact.observer = new MutationObserver(this.Mutation)
					const c1 = document.getElementsByClassName('content'),
						tag = c1 && c1[0]
					if (tag)
						pact.observer.observe(tag, attrs);
				}
			}
		}
		constructor() {
			this.strtEvents = new MyEvents(cc.o5init_events)
			this.doneEvents = new MyEvents(cc.o5done_events)

			this.strtEvents.AddEvents(this.CheckNew)

			this.CheckNew()

			Object.seal(this.pact)
			Object.freeze(this)
		}

	}

	C.AppendChild = function (owner, child) {
		child.aO5_pageOwner = owner
		owner.appendChild(child)
		page.childs.push(child)
	}
	C.InsertBefore = function (owner, child, reference) {
		child.aO5_pageOwner = owner
		owner.insertBefore(child, reference)
		page.childs.push(child)
	}
	let nbody = 0
	if (!wshp[modulname])
		wshp[modulname] = () => {
			cc = C.consts
			if (cc.o5debug > 0) console.log(` ===  инициализация ${olga5_modul}/${modulname}.js`)

			if (cc.o5nomnu > 0)
				document.body.classList.add('o5nomnu')

			if (cc.o5noact > 0) {
				((C && cc.o5debug > 0) ? C.ConsoleError : console.log)
					("}---> загружено `o5common.js`, но инициализация ОТКЛЮЧЕНА по o5noact= '" + cc.o5noact + "'")
				return
			}

			if (C.scrpts.length > 0) {
				page = new Page()

				window.addEventListener('olga5_sload', LoadDone)
				window.addEventListener('olga5_sinit', InitDone)

				// const doneEvents = cc.o5done_events.trim().split(/\s*[,;]\s*/) || []
				// for (const eve of doneEvents)
				// 	window.addEventListener(eve, page.Unload, { capture: true })

				LoadDone()

				// if (!page.pact.isinited && cc.o5debug > 0) console.log(` ---> ядро библиотеки ожидает :` +
				// 	`  [${initEvents.join(', ') + (cc.o5iblog ? ' и transitionend' : '')}]`)
			}
			else {
				C.ConsoleError(`IniScripts.js: вообще нет скриптов для обработки`)
				window.dispatchEvent(new window.Event('olga5_ready'))
			}
			return true
		}

	if (window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}===< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/${modulname}.js`)
})();