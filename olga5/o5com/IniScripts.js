/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  загрузка (при необходимости) и инициализация подключаемых скриптов
 **/
//
(function () {              // ---------------------------------------------- o5com/IniScripts ---
	'use strict'
	const
		C = window.olga5.C,
		olga5_modul = 'o5com',
		modulname = 'IniScripts',
		clrPage = "background: green;color:white;",
		clrMy = "background: blue; color: white;border: none;"

	class MyEvents {
		static doceves = ['DOMContentLoaded', 'readystatechange', 'visibilitychange', 'blur']

		constructor(list) {
			const
				eves = list.trim().split(/\s*[,;]\s*/) || [],
				errs = []

			this.meves = []
			for (const eve of eves) {
				const ss = eve.trim().split(/\s*[:]\s*/)
				if (ss[0].length > 0) {
					const eve = ss[0],
						ers = []
					let isd = MyEvents.doceves.includes(eve),
						isu = false

					for (let i = 1; i < ss.length; i++)
						if (ss[i])
							switch (ss[i][0].toUpperCase()) {
								case 'W': isd = 'W'
									break
								case 'D': isd = 'D'
									break
								case 'U': isu = true
									break
								default: "'" + ers.push(ss[i]) + "'"
							}
					this.meves.push({ eve: eve, isd: isd, isu: isu })
					if (ers.length > 0)
						errs.push(`${eve}: ${ers.join(', ')}`)
				}
				if (errs.length > 0)
					C.ConsoleError(`Недопустимые ('W','D','U') квалификаторы событий`, errs.length, errs)
			}
			Object.freeze(this)
		}
		AddEvents(Fun) {
			for (const meve of this.meves)
				(meve.isd ? document : window).addEventListener(meve.eve, Fun, true)
		}
		RemEvents(Fun) {
			for (const meve of this.meves)
				(meve.isd ? document : window).removeEventListener(meve.eve, Fun, true)
		}
	}

	class MyTimer {
		constructor(text) {
			this.text = text
			this.act = { time: 0, name: '' }
			Object.seal(this.act)
			Object.freeze(this)
		}
		Stop(add) {
			// console.log('...=', this.act.time,  this.act.name)
			if (this.act.time) {
				const dt = (' ' + (Number(new Date()) - this.act.time)).padStart(8) + ' ms',
					name = dt + ' ' + this.act.name.padStart(12)
				if (add)
					console.error('%c%s', "background: yellow; color: black;border: none;",
						this.text + name + ' [' + add + ']')
				else {
					console.log('%c%s', clrMy, this.text, name)
					this.act.time = 0
				}
			}
		}
		Start(name, iso5inc) {
			if (this.act.time && !iso5inc)
				this.Stop('не закончено')

			this.act.time = Number(new Date())
			this.act.name = name
			// console.log('...+', this.act.time,  this.act.name)
		}
	}

	const
		// DocURL = () => document.URL.match(/[^?&#]*/)[0].trim(),
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
			const ready = C.page && C.page.pact && C.page.pact.ready,
				start = C.page.pact.start,
				head = ' ______ InitScripts _____   '

			if (C.consts.o5debug > 1)
				console.log(`${head} ${nam} ${ready ? '' : ' не готово - выход'}`)

			if (!ready)
				return
			for (const scrpt of C.scrpts)
			// if (!act.finish)
			{
				const act = scrpt.act
				// if (act.W.modul=='o5inc')				
				// act.timera =0
				if (!act.timera)
					act.timera = new MyTimer(` инициирован `)
				if (start != act.start && act.W && !act.incls)
					if (act.need && act.W.Init) {
						const depend = scrpt.depends.find(depend => (depend.act.need && depend.act.done != start))
						if (!depend) {
							if (C.consts.o5debug > 1)
								console.log(`${head} начало нинициализации  ${act.W.modul} `)
							act.start = start
							act.timera.Start(act.W.modul)
							act.W.Init()
						}
					} else
						Object.assign(act, { start: start, done: start })
			}
		},
		ScriptDone = e => {	//  завершение инициализации очередного скрипта
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

				// if (act.W.modul === 'o5inc') {
				// 	// // 1. почистить в scrpt.depends
				// 	// // 2. на новых страницах - обновляь, что ли???
				// 	// 					act.finish = true
				// }
				if (lefts.length > 0) InitScripts(`инициирован '${modul}'`)
				else
					ScriptsFinish(C.page, 0)
			} else
				C.page.errs.push({ modul: modul, err: `для события '${e.type}' указан несуществующий модуль` })
		},
		ScriptLoad = e => {	// завершение загрузки очередного скрипта
			const start = C.page.pact.start,
				newloads = [],
				Included = modul => {
					const nam = `загружены включения для '${modul}'`,
						scrpt = C.scrpts.find(scrpt => scrpt.modul == modul)
					if (C.consts.o5debug > 0)
						console.log(`ScriptLoad: '${nam}'`)

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
			if (C.consts.o5debug > 1)
				console.log('    > ' + newloads.length ? ` (готовы к инициации: ${newloads.join(', ')})` : ' (но инициировать нечего)')

			if (newloads.length > 0)
				InitScripts(`загрузка [${newloads.join(', ')}]`)
		},
		ScriptsStart = () => {  // начало обработки страницы

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
				const asknoneed = []
				for (const scrpt of C.scrpts)
					if (!scrpt.act.need)
						asknoneed.push(scrpt.modul)
				const l = asknoneed.length
				if (l > 0)
					C.ConsoleError(`В скриптах заданы ${l} 'ненужн${l > 1 ? 'ых' : 'ый'}' (см. квалиф. 'olga5_Start') модул${l > 3 ? 'ей' : (l > 1 ? 'я' : 'ь')}: `, asknoneed.join(', '))
			}

			if (C.consts.o5doscr) {  // запуск встроенных cкриптоав
				const scrs = C.GetTagsByTagNames('script'),
					o5doscr = C.consts.o5doscr,
					m = new RegExp('\\bdocument\\.currentScript\\.setAttribute\\s*\\(\\s*[\'`"]' + o5doscr + '.*?(;|\\n|$)', 'i')

				for (const scr of scrs) {
					const matchs = scr.innerText.match(m)
					if (matchs) {
						const atr = scr.attributes[o5doscr]
						if (!atr || atr.value != 1) {
							const s = scr.innerText.replace(matchs[0], '')
							if (C.consts.o5debug > 0)
								console.log(`Выполняется скрипт: \n${s}`)
							eval(s)
							scr.setAttribute(o5doscr, 1)
						}
					}
				}
				C.page.scriptLoad.AddEvents(ScriptLoad)
				C.page.scriptDone.AddEvents(ScriptDone)

				ScriptLoad()  // проверка - а вдруг чё уже загружно
			}
		},
		ScriptsFinish = (page, bytimer) => { // конец инициализации страницы
			const pact = page.pact

			pact.timerp.Stop(bytimer ? 'таймер' : '')
			if (pact.timer > 0) {
				window.clearTimeout(pact.timer)
				pact.timer = 0
			}
			if (document.body.classList.contains(page.cls))
				document.body.classList.remove(page.cls)

			// console.log('%c%s', clrPage,
			// 	` Обработана страниица`, pact.url)

			if (bytimer) {
				for (const scrpt of C.scrpts) {
					const act = scrpt.act
					let err = ''
					if (!err) {
						if (!act.W) err = "не загружен файл "
						else if (act.start == 0) err = "инициализация не НАЧАТА ?"
						else if (act.start != act.done) err = "инициализация не закончилась"
					}
					if (err) page.errs.push({ modul: scrpt.modul, err: err })
				}
			}
			else {
				if (pact.mos) {
					const mos = page.pact.mos
					for (const mo of mos)
						mo.disconnect()
					// mo = null
					mos.splice(0, mos.length)
					// mos = null
				}
				page.scriptDone.RemEvents(ScriptDone)
				page.scriptLoad.RemEvents(ScriptLoad)
				window.olga5.C.o5Inited = true
				C.E.DispatchEvent('o5_isInited')
			}

			const errs = page.errs
			if (errs.length > 0) {
				C.ConsoleError(`Скрипты ${bytimer ? 'НЕ' : ''} завершились (есть ошибки)`, errs.length, errs)
				errs.splice(0, errs.length) //  могут еще завершиться и без ошибок
			}
		}

	class Page {
		pact = { url: '', ready: false, start: 0, timerp: new MyTimer(" КОНЕЦ  обработки  страницы"), timer: 0, mos: [] }
		errs = []

		PageHidden(e) { // закрытие всех новых элементов страницы

			const pact = this.pact
			if (!pact.ready) return

			let ac1 = 0,
				ac2 = 0
			pact.ready = false

			const n0 = this.childs.length
			if (C.consts.o5debug > 0) console.log('%c%s', clrMy,
				`}=====< закрытие по '${e.type}' (n= ${n0}) страницы "${pact.url}"`)

			let n = n0
			while (n-- > 0) {
				const child = this.childs[n],
					owner = child.aO5_pageOwner
				for (const item of owner.children)
					if (item == child) {
						ac1++
						item.style.display = 'none'
						owner.removeChild(item)
						break
					}
			}
			this.childs.splice(0, n0);

			C.scrpts.forEach(scrpt => {
				const act = scrpt.act
				if (act && pact.start == act.start && act.W && act.W.Done) {
					act.W.Done()
					ac2++
				}
			})

			this.pageDones.RemEvents(this.PageHidden.bind(this))
			if (ac1 || ac2)
				C.E.DispatchEvent('o5_isHidden', `закрытие всех (${ac1}/${ac2}) элементов страницы`)
		}
		PageLoad(e) { 	// проверки и начало инициализации страницы !
			const
				iso5inc = e.type === 'o5inc_ready',
				url = document.URL.match(/[^?&#]*/)[0].trim(),
				pact = this.pact,
				isnew = pact.url != url || !pact.ready,
				head = ` PageLoad (${isnew ? 'новая' : 'повтор'}):  `

			if (iso5inc) {
				const hash = C.save.hash
				if (hash) { // делать именно после дозагрузок документа 
					const tag = document.getElementById(hash)
					if (tag) tag.scrollIntoView({ alignToTop: true, block: 'start', behavior: "auto" })
					else
						this.errs.push({ modul: '?', err: `при событии '${e.type}' НЕ определён hash= '${hash}' в адресной строке` })
				}
				if (!window.olga5.C.o5Inited) {
					if (C.consts.o5debug)
						console.log('%c%s', clrPage, head + ' после o5inc - игнорируется', url)
					return
				}
			}

			const starts = document.querySelectorAll("[class *= '" + this.olga5Start + "']")
			if (!starts || !starts.length) {
				starts=[document.body]
				document.body.classList.add(this.olga5Start)
				console.error('%c%s', clrPage, head + ` нет тегов с ${this.olga5Start} - принят <body>`, url)
			}

			const
				meve = this.pageLoads.meves.find(meve => meve.eve == e.type),
				isU = meve.isu,
				isloaded = document.readyState == 'complete' ||
					(url.match(/\bolga5-tests\b/i) && document.readyState == 'interactive')

			if (!isU || (isnew && isloaded)) {
				if (C.consts.o5debug > 0) {
					console.groupCollapsed('%c%s', clrPage,
						head + ` (${document.readyState})` + ` e= '${e.type}'`.padEnd(22),
						url)
					for (const nam in e)
						if (nam != 'type' && !(e[nam] instanceof Function)) console.log(nam.padEnd(24), e[nam])
					console.groupEnd()
				}

				const
					o5inc = 'o5inc',
					start = Number(new Date()) + Math.random()
				let w = null,
					o5include = null

				pact.start = start

				if (iso5inc) {
					const scrpt = C.scrpts.find(scrpt => scrpt.modul === o5inc),
						act = scrpt.act

					act.start = start
					act.done = start
				} else {
					o5include = document.querySelector('[o5include]')
					w = window.olga5.find(modul => modul.modul === o5inc)

					if (!w && o5include) C.ConsoleError(`Имеется тег с атрибутом 'o5include' но отсутствует модуль '${o5inc}'`)
					else
						if (w && !o5include && C.consts.o5debug > 0)
							C.ConsoleInfo(`¿ Задан модуль '${o5inc}' но отсутствует тег с атрибутом 'o5include' ?`)
				}

				Object.assign(pact, { url: url, ready: true })


				pact.mos.splice(0, pact.mos.length)

				this.starts.splice(0, this.starts.length, ...starts);

				if (C.consts.o5debug > 0)
					console.log('%c%s', clrMy, " СТАРТ обработки страницы ", url)

				if (!document.body.classList.contains(this.cls))
					document.body.classList.add(this.cls) // это если есть такой класс

				pact.timerp.Start(url, iso5inc)
				if (C.consts.o5timload) {
					if (pact.timer > 0)
						window.clearTimeout(pact.timer)
					pact.timer = window.setTimeout(ScriptsFinish, 1000 * C.consts.o5timload, this, true)
				}

				this.pageDones.AddEvents(this.PageHidden.bind(this))

				this.errs.splice(0, this.errs.length)

				C.QuerySelectorInit(this.starts, this.olga5Start) //  чтобы пересчитало область определения

				// сброс событий
				window.olga5.C.o5Inited = false
				C.E.Clear()

				ScriptsStart()	// e.type == 'o5inc_ready'
			}
		}
		AppendChild(owner, child) {
			child.aO5_pageOwner = owner
			owner.appendChild(child)
			this.childs.push(child)
		}
		InsertBefore(owner, child, reference) {
			child.aO5_pageOwner = owner
			owner.insertBefore(child, reference)
			this.childs.push(child)
		}

		static pageLoads = new MyEvents(C.consts.o5_pageLoads)
		static pageDones = new MyEvents(C.consts.o5_pageDones)
		static scriptLoad = new MyEvents('o5_scriptLoad')
		static scriptDone = new MyEvents('o5_scriptDone')

		static {
			Page.prototype.pageLoads = Page.pageLoads
			Page.prototype.pageDones = Page.pageDones
			Page.prototype.scriptLoad = Page.scriptLoad
			Page.prototype.scriptDone = Page.scriptDone
		}

		constructor() {
			this.olga5Start = 'olga5_Start'
			this.cls = 'olga5_isLoading'
			this.childs = []
			this.starts = []

			// this.pageLoads = new MyEvents(C.consts.o5_pageLoads)
			// this.pageDones = new MyEvents(C.consts.o5_pageDones)

			// this.scriptLoad = new MyEvents('o5_scriptLoad')
			// this.scriptDone = new MyEvents('o5_scriptDone')

			this.pageLoads.AddEvents(this.PageLoad.bind(this))	//{ capture: true }

			Object.seal(this.pact)

			Object.freeze(this)
		}
	}

	const wshp = C.ModulAddSub(olga5_modul, modulname, () => {
		console.log('%c%s', "background: aqua; color: black;border: none;",
			` инициализация `,
			`${olga5_modul}/${modulname}.js`)
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
			C.E.Clear()  // сброс событий
		}
		else {
			C.ConsoleInfo(`IniScripts.js: вообще нет скриптов для обработки`)
			C.E.DispatchEvent('o5_isInited')
		}

		return true
	}
	)

	if (wshp.AscInclude)
		wshp.AscInclude()
})();