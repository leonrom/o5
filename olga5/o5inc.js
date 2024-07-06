/* -global document, window, console */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5inc ---	
	'use strict'
	let
		incls = null
	const
		pard = window.location.search.match(/(&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/),
		o5debug = (pard ? (pard[0].match(/=/) ? parseInt(pard[0].match(/\s*\d+/) || 1) : 1) : 2),
		clrs = {	//	копия из CConsole
			'E': "background: yellow; color: black;border: solid 1px gold;",
			'I': "background: beige;  color: black;border: solid 1px bisque;",
		},
		C = window.olga5 ? window.olga5.C : {
			consts: {
				o5debug: o5debug
			},
			avtonom: true,
			ConsoleInfo: (head, txt, rezs) => {
				console.groupCollapsed('%c%s', clrs['I'], head + ' - ' + txt)
				console.table(rezs)
				console.trace()
				console.groupEnd()
			},
			ConsoleError: (head, ne, rezs) => {
				console.groupCollapsed('%c%s', clrs['E'], head + ` - есть ${ne} ошибок!`)
				console.table(rezs)
				console.trace()
				console.groupEnd()
			},
		},
		_div = document.createElement('div'),
		W = {
			modul: 'o5inc',
			Init: InclStart,
			consts: 'o5getall=true; o5isfinal=1',
		},
		o5include = 'o5include',
		InclFinish = () => {
			let ok = true
			for (const url in incls)
				if (incls[url].err) {
					ok = false
					break
				}
			if (!ok || C.consts.o5debug > 0) {
				const head = `${W.modul}:  обработка 'CInclude'`,
					rezs = []

				for (const url in incls) {
					const incl = incls[url]
					rezs.push({ ori: incl.ori, url: incl.url, err: incl.err || 'OK', })
				}

				if (ok) C.ConsoleInfo(head, 'OK', rezs)
				else
					C.ConsoleError(head + ' - есть ошибки:', rezs.length, rezs)
			}

			// window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
			// window.dispatchEvent(new CustomEvent('olga5-incls', { detail: { modul: W.modul } }))
			if (W.consts.o5isfinal)
				C.E.DispatchEvent('olga5_sinit', W.modul)
			if (C.avtonom) {
				const e = new CustomEvent('olga5-incls', {modul:W.modul})
				window.dispatchEvent(e)
			}
			else
				C.E.DispatchEvent('olga5-incls', W.modul)
		},
		AddIncls = (tags) => {
			// console.log(`INC_1 `)
			const errs = [],
				IsDisplay = tag => {
					let div = tag
					while (div.tagName.match(/div/i)) {
						const nst = window.getComputedStyle(div),
							display = nst.getPropertyValue('display')
						if (display == 'none') {
							return false
						}
						div = div.parentNode
					}
					return true
				}
			for (const tag of tags) // группировка по url'ам, чтобы не грузить лишнее
				if (W.consts.o5getall || IsDisplay(tag)) {
					const ref = tag.getAttribute(o5include)

					tag.removeAttribute(o5include)
					tag.setAttribute('_' + o5include, ref)  // так... для истории

					const
						ss = ref.split(/[?!]/),
						ori = ss[0].trim(),
						wref = (C.DeCodeUrl) ? C.DeCodeUrl(C.urlrfs, ori, '') : { url: ori, err: '' }
					if (wref.err) {
						if (!errs.contains(ori)) errs.push(ori)
						continue
					}

					const url = wref.url,
						sel = ss.length > 1 ? ss[ss.length - 1] : ''
					let incl = incls[url]
					if (!incl) {
						incl = {
							ori: ori,
							url: url,
							mtags: [], err: '', text: '', done: false, isent: false,
							xhr: new XMLHttpRequest(),
						}
						Object.seal(incl)
						incls[url] = incl

						Object.assign(incl.xhr, {
							incl: incl,
							onload: OnLoad,
							onerror: OnError,
							timeout: 10000,
							responseType: 'text',
							withCredentials: true,
						})
						incl.xhr.open("get", url, true)
					}
					incl.mtags.push({ tag: tag, sel: sel.trim(), outer: ref.indexOf('!') >= 0 }) // на случай если и '?' и '&'
				}

			// console.log(`INC_2 `, incls)
			let n = 0
			for (const url in incls) {
				const incl = incls[url]
				if (!incl.isent) {
					incl.isent = true
					incl.xhr.send()
				}
				else
					if (incl.done)	//	но если файл уже был загружен, то не надо ждать					
						DoLoad(incl)
				n++
			}
			return n
		},
		AskFinish = (incl, ok) => {

			if (!ok) console.log(`========  o5inc.OnLoad(${incl.xhr.status})   ${incl.xhr.responseURL}`)
			else
				if (C.consts.o5debug > 0) console.log(`========  o5inc.OnLoad(${incl.xhr.status})  ------ ${incl.xhr.responseURL}`)

			for (const url in incls)
				if (!incls[url].done)
					return

			InclFinish()
		},
		DoLoad = incl => {
			// const errs = [],
			// 	u = incl.xhr.responseText,
			// 	m1 = u.match(/<\s*body/),
			// 	m2 = u.match(/<\/\s*body\s*>/)
			// _div.innerHTML = u.substring(m1.index, m2.index)+'</body>' // incl.xhr.responseText.substring(i)

			const errs = [],
				mm = incl.xhr.responseText.match(/<body[^>]*>/),
				i = mm.index

			// _DIV.innerHTML = mm[0].replace(/<\bbody\b/, '<div') +
			// 	incl.xhr.responseText.substring(i) +
			// 	'\n</div>'
			// const _div = _DIV.children[0]
			_div.innerHTML = incl.xhr.responseText.substring(i)

			if (C.consts.o5debug > 1) {
				console.groupCollapsed(`${W.modul} : Обрабатывается`)
				console.log(_div.innerHTML)
				console.groupEnd()
			}
			const tags = []
			for (const mtag of incl.mtags)
				if (!mtag.done) {
					mtag.done - true
					const
						sel = mtag.sel,
						tag = mtag.tag

					let srcs = null,
						outer = mtag.outer
					if (sel) {
						switch (sel[0]) {
							case '[': srcs = _div.querySelectorAll(sel)
								break
							case '#': srcs = _div.querySelectorAll(`[id='${sel.substring(1)}']`)
								break
							case '.': {
								const s = sel.substring(1),
									ss = s.split(/\s*:\s*/g),
									cc = ss[0],
									qs = _div.querySelectorAll("[class *= '" + cc + "']"),
									mcc = new RegExp('\\b' + cc + '\\b(:\\w*)*', 'g')
								if (qs)
									for (const q of qs) {
										const m = q.className.match(mcc)
										if (m) {
											const mm = m[0].split(/\s*:\s*/g)
											let kv = true
											for (let i = 1; i < ss.length; i++) {
												let ok = false
												for (let j = 1; j < mm.length; j++)
													if (mm[j] == ss[i]) {
														ok = true
														break
													}
												if (!ok) {
													kv = false
													break
												}
											}
											if (kv) {
												if (!srcs) srcs = []
												srcs.push(q)
											}
										}
									}
								break
							}
							default: srcs = _div.getElementsByTagName(sel)
						}
						if (!srcs || srcs.length == 0) {
							errs.push(sel)
							continue
						}
					}
					else {
						srcs = [_div]  // для всего "тела" 1ищвн 2 не включаем
						outer = false
					}

					for (const src of srcs) {
						const s = outer ? src.outerHTML : src.innerHTML
						if (C.consts.o5debug > 1)
							tag.innerHTML += `\n<!-- вставка с id='${src.id}' -->`

						if (outer) //!tag.innerHTML &&
							tag.innerHTML += '\n'
						tag.innerHTML += s.trimRight() + '\n' // тут '\n' надо для "красоты" в тестах
					}
					tags.concat(tag.querySelectorAll("div[" + o5include + "]") || [])

					// const scrpts = tag.getElementsByTagName('script')
					// // for (const scrpt of scrpts){
					// if (scrpts.length > 0) {
					// 	const scrpt = scrpts[0],
					// 		script = document.createElement('script')
					// 	script.innerHTML = "console.log('-234-')"
					// 	// tag.appendChild(script)
					// 	scrpt.parentNode.insertBefore(script, scrpt)
					// }

				}
			if (errs.length > 0)
				incl.err = `не опр. '${errs.join(', ')}'`

			if (tags && tags.length > 0)
				AddIncls(tags)
		},
		OnLoad = function () {
			const
				xhr = this,
				incl = xhr.incl

			if (C.consts.o5debug > 0) {
				console.groupCollapsed(`${W.modul} : прочитан (${xhr.status}) url='${xhr.responseURL}'`)
				console.log(xhr.responseText)
				console.groupEnd()
			}
			incl.done = true


			if (xhr.status == 200)
				DoLoad(incl)
			else
				incl.err = `статус загрузки = ${xhr.status}`

			// delete incl.xhr  надо бы удалять, ео не получается

			AskFinish(incl, true)
		},
		OnError = function () {
			const incl = this.incl
			incl.err = 'ошибка загрузки (блокировано by CORS ?)'
			incl.done = true
			AskFinish(incl, false)
		}

	function InclStart(e) {
		if (C.consts.o5debug > 0) {
			console.log(`========  инициализация '${W.modul}'   ------` +
				` ${C.avtonom ? ('автономно по ' + e.type) : 'из библиотеки'} `)
			_div.style.display = 'none'
			_div.id = 'moe'
			if (C.consts.o5debug > 1) {
				_div.title = "моя копия: чтобы посмотреть, чего загрузили"
				document.body.appendChild(_div)
			}
		}
		if (C.ParamsFill)
			C.ParamsFill(W)
		const tags = document.querySelectorAll("div[" + o5include + "]")
		let n = 0

		// console.log(`INC_0 `)
		if (tags && tags.length > 0) {
			incls = {}
			n = AddIncls(tags)
		}

		if (n == 0)
			InclFinish()
	}

	window.addEventListener(o5include, InclStart)
	if (C.avtonom) {
		document.addEventListener('DOMContentLoaded', InclStart)

		if (o5debug)
			console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
	}
	else
		C.ModulAdd(W)
})();
