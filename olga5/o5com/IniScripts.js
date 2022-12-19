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
					name=dt + ' ' + this.act.name.padStart(12)
				if (add)
					console.error('%c%s', "background: yellow; color: black;border: none;",
						this.text +  name + ' [' + add + ']')
				else
					console.log('%c%s', myclr, this.text +  name)
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
		olga5Start = 'olga5_Start',
		completeState = "complete",
		DocURL = () => document.URL.match(/[^?&#]*/)[0].trim(),
		IsPageUrl = url => !!(url && url.match(/\.html([?&#]|$)/)),
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
			const url = DocURL(),
				nourl = !IsPageUrl(url),
				isready = (url == page.pact.url) && page.pact.isinited,
				starts = document.querySelectorAll("[class *= '" + olga5Start + "']")

			if (cc.o5debug > 1) {
				let s = '    > ' + `инициация "${nam}"  `
				if (isready || nourl) {
					s += '- пропускаю,-'
					if (isready) s += 'полностью обработана; '
					if (nourl) s += `не 'страничный' url.`
				}
				const noys = []
				if (starts.length == 0) noys.push(`'.olga5_Start'`)
				if (!(document.readyState == completeState)) noys.push(`'completeState'`)
				if (!(document.URL.match(/\bolga5-tests\b/i) && document.readyState == 'interactive')) noys.push(`(и это не 'olga5-tests'`)
				if (!(page.pact.isloaded ||
					starts.length == 0 ||
					document.readyState == completeState ||
					(document.URL.match(/\bolga5-tests\b/i) && document.readyState == 'interactive')))
					if (noys.length > 0)
						s += 'нету: ' + noys.join(', ')
				if (!(isready || nourl) && url != page.pact.url)
					s += ', будет Load()'
				if (!isready || cc.o5debug > 2)
					console.log(s)
			}

			if (isready || nourl)
				return

			page.pact.isloaded ||= starts.length > 0 ||
				(!C.consts.o5iblog && (
					document.readyState == completeState ||
					(document.URL.match(/\bolga5-tests\b/i) && document.readyState == 'interactive')))

			if (page.pact.isloaded) {
				if (url != page.pact.url) // могло измениться пока считал			
					page.Load(url, starts)

				const start = page.pact.start
				for (const scrpt of C.scrpts) {
					const act = scrpt.act
					if (!act.timera)			
						act.timera = new MyTimer(`}<<<---             инициирован `)
					if (start != act.strt && act.W && !act.incls)
						if (act.need && act.W.Init) {
							const depend = scrpt.depends.find(depend => (depend.act.need && depend.act.done != start))
							if (!depend) {
								if (cc.o5debug > 1)
									console.log(`}>>>---     ______ начало нинициализации _____     ${act.W.modul} `)
								act.strt = start
								act.timera.Start(act.W.modul)
								act.W.Init(C)
							}
						} else
							Object.assign(act, { strt: start, done: start })
				}
			}
		},
		TryInitScripts = e => {
			if (page.pact.timini != e.timeStamp) {
				page.pact.timini = e.timeStamp
				let s = `событие ${e.type}`
				if (cc.o5debug > 2) s += ' ' + C.MakeObjName(e.srcElement).padEnd(35) + ' ' + parseInt(e.timeStamp)
				InitScripts(s)
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
			act.done = act.strt
			C.scrpts.forEach(scr => {
				if (scr.act.done != start && scr.act.need)
					lefts.push(scr.modul)
			})

			if (cc.o5debug > 1 && lefts.length > 0)
				console.log(`\t(осталось инициировать:  ${lefts.join(', ')})`)

			if (lefts.length > 0)
				InitScripts(`инициирован '${modul}'`)
			else
				page.Finish(0)
		}

	class Page {
		constructor() {
			Object.seal(this.pact)
			Object.freeze(this)
		}
		cls = 'olga5_isLoading'
		errs = []
		childs = []
		pact = {
			url: '', start: 0, timToFinish: 0, isloaded: false, isinited: false, timini: 0,
			timerp: new MyTimer("}==  КОНЕЦ  обработки  страницы ")
		}

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
		}
		Unload = e => {
			if (!page.pact.url) return

			const n0 = page.childs.length
			if (cc.o5debug > 0) console.log('%c%s', myclr,
				`}=====< закрытие по '${e.type}' (n= ${n0}) страницы "${page.pact.url}"`)

			let n = n0
			while (n-- > 0) {
				const child = page.childs[n],
					owner = child.aO5_pageOwner
				for (const item of owner.children)
					if (item == child) {
						item.remove()
						break
					}
			}
			page.childs.splice(0, n0);

			C.scrpts.forEach(scrpt => {
				const act = scrpt.act
				if (act && act.W && act.W.Done)
					act.W.Done()
			})

			Object.assign(page.pact, { url: '', start: 0, isloaded: false, isinited: false, })
			window.dispatchEvent(new window.Event('olga5_done'))
			// document.dispatchEvent(new CustomEvent('visibilitychange', { detail: { unload: true } }))// для PopUp в Блоггере
		}
		TryUnload = e => {
			const url = DocURL()
			if (IsPageUrl(page.pact.url) && page.pact.url != url)
				page.Unload(e)
		}
		Load = (url, starts) => {  // начало обработки страницы
			const
				NotFinished = () => {
					let prev = ''
					for (const scrpt of C.scrpts) {
						const act = scrpt.act
						let err = ''
						if (!err) {
							if (!act.W) err = "не загружен файл "
							else if (act.strt == 0) err = "инициализация не начиналась?"
							else if (act.strt != act.done) err = "инициализация не закончилась"
						}
						if (err) page.errs.push({ modul: scrpt.modul, err: err })
					}
					page.Finish(1)
				}

			if (cc.o5debug > 0)
				console.log('%c%s', myclr, "}<<  старт обработки страницы ", url)

			page.errs.splice(0, page.errs.length)

			Object.assign(page.pact, {
				url: url,
				start: Number(new Date()) + Math.random(),
				timToFinish: 0,
				isloaded: false, // не надо больше делать проверки загружена ли страница
				isinited: false,	// не надо больше выполнять инициализацию - всё уже сделано
			})
			page.pact.timerp.Start(url)

			if (cc.o5timload) {
				if (page.pact.timToFinish > 0) window.clearTimeout(page.pact.timToFinish)
				page.pact.timToFinish = window.setTimeout(NotFinished, 1000 * cc.o5timload)
			}

			C.QuerySelectorInit(starts, olga5Start) //  чтобы пересчитало область определения

			if (cc.o5iblog) {
				const hdr = document.querySelector('.olga5_page_header')
				if (hdr)
					hdr.style.display = 'none'
			}

			for (const scrpt of C.scrpts) { // делаем при каждой инициализации
				if (C.owners.length == 0) scrpt.act.need = true
				else {
					if (!scrpt.hasOwnProperty('act') || !scrpt.act.hasOwnProperty('need'))
						console.log('1111')
					scrpt.act.need = false
					for (const owner of C.owners) {  // ничего не указано - считаем все заданными!
						if (owner.modules.length == 0) scrpt.act.need = true
						else
							scrpt.act.need = !!owner.modules.find(modul => modul == scrpt.modul)
						if (scrpt.act.need) break
					}
				}
			}

			if (!document.body.classList.contains(page.cls))
				document.body.classList.add(page.cls) // это если есть такой класс

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
			if (C.consts.o5doscr) {  // запуск встроенных криптоав
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
			if (cc.o5debug > 0) console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)

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

				const initEvents = cc.o5init_events.trim().split(/\s*[,;]\s*/) || []
				for (const eve of initEvents)
					window.addEventListener(eve, e => InitScripts(`событие '${e.type}'`))
				if (cc.o5iblog)
					for (const eve of ['transitionend'])
						window.addEventListener(eve, TryInitScripts)

				const doneEvents = cc.o5done_events.trim().split(/\s*[,;]\s*/) || []
				for (const eve of doneEvents)
					window.addEventListener(eve, page.Unload, { capture: true })
				if (cc.o5iblog)
					for (const eve of ['transitionrun', 'message']) {
						window.addEventListener(eve, e => {
							page.TryUnload(e)
							TryInitScripts(e)
						})
					}
				// document.addEventListener('visibilitychange', e => {
				// 	// if (document.visibilityState === 'hidden') {
				// 	// 	console.log('%c%s',myclr,'visibilitychange: '+document.visibilityState, 
				// 	// 	'\n\t new='+e.target.document.URL, '\n\t old='+page.pact.url)
				// 	// }
				// 	console.log('%c%s', myclr, 'visibilitychange: ' + document.visibilityState,
				// 		'\n\t new=' + e.target.URL, '\n\t old=' + page.pact.url)
				// 	// if (document.visibilityState === 'hidden')
				// 	// 	page.TryUnload(e)
				// 	// if (document.visibilityState === 'visible')
				// 	// 	TryInitScripts(e)
				// })

				LoadDone()

				if (!page.pact.isinited && cc.o5debug > 0) console.log(`}---> ядро библиотеки ожидает :` +
					`  [${initEvents.join(', ') + (cc.o5iblog ? ' и transitionend' : '')}]`)
			}
			else {
				C.ConsoleError(`IniScripts.js: вообще нет скриптов для обработки`)
				window.dispatchEvent(new window.Event('olga5_ready'))
			}
			return true
		}

	if (window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();