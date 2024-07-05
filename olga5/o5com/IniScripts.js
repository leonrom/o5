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
			if (!(C.page && C.page.pact && C.page.pact.ready)) return

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
			((C && C.consts.o5debug > 0) ? C.ConsoleError : console.log)
				("}---> загружено `ядро библиотеки`, но инициализация ОТКЛЮЧЕНА по o5noact= '" + C.consts.o5noact + "'")
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