/* global document, window, console, Map*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5inc ---	
	'use strict'
	const mdebug = window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=)(\s*\d*)/)
	let C = {
		consts: { o5debug: mdebug ? (mdebug[5] ? mdebug[5] : 1) : 0 },
		ConsoleInfo: (head, len, rezs) => {
			console.groupCollapsed(head + ' - OK')
			console.table(rezs)
			console.groupEnd()
		},
		ConsoleError: (head, ne, rezs) => {
			console.groupCollapsed(head + ` - есть ${ne} ошибок!`)
			console.table(rezs)
			console.groupEnd()
		},
	}
	const
		W = {
			modul: 'o5inc',
			Init: Includes,
			// src: document.currentScript.src,
		},
		incls = {},
		act = {
			div: null,
			cnt: 0,
			DecFinish: function () {
				if (--this.cnt <= 0) {
					const rezs = [],
						head = `o5inc:  обработка 'CInclude'`
					let ne = 0
					for (const ori in incls) {
						const incl = incls[ori],
							err = incl.err > 1 ? 'ERROR' : incl.err > 0 ? 'error' : ''
						if (err) ne++

						rezs.push({ url: incl.url, err: err, status: incl.status, load: incl.text, bad_selector: incl.undef })
					}

					if (ne) C.ConsoleError(head, ne, rezs)
					else
						if (C.consts.o5debug > 0) C.ConsoleInfo(head, 'OK', rezs)

					window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
					window.dispatchEvent(new CustomEvent('olga5-incls', { detail: { modul: W.modul } })) // для тестов
				}
			}
		},
		FindIncl = (_url) => {
			let incl = null
			for (const ori in incls)
				if (incls[ori].url == _url)
					return incls[ori]
			C.ConsoleError(`Не определён incl-источник загрузки для url='${_url}'`)
		},
		OnLoad = function () {
			const xhr = this,
				ok = xhr.status == 200,
				incl = FindIncl(xhr._url)

			if (C.consts.o5debug > 0) console.log(`========  o5inc.OnLoad(${xhr.status})  ------ ${xhr._url}`)

			if (incl) {
				Object.assign(incl, { status: xhr.status, text: xhr.statusText, err: ok ? 0 : 2 })

				if (ok) {
					let tagid = null,
						ok = false
					const s = xhr.responseText,
						m1 = s.match(/<body\.*>/),
						i1 = (m1 && m1.length > 0) ? (m1.index + m1[0].length) : 0,
						i2 = i1 > 0 ? s.lastIndexOf('</body') : s.length,
						res = (i1 > 0 ? s.substring(i1, i2) : s).trim(),
						AddSel = tag => {
							tagid.tag.innerHTML += (tagid.tag.innerHTML ? '<br/>' : '') + tag.innerHTML
							ok = true
						}

					if (C.consts.o5debug > 1) {
						console.groupCollapsed(`Содержимое прочитанного '${incl.url}'`)
						console.log(s)
						console.groupEnd
					}
					for (tagid of incl.tagids) {
						let sel = tagid.selector
						ok = false
						if (sel) {
							if (!act.div) {
								act.div = document.createElement('div')  // первый и единственный раз
								act.div.innerHTML = res
							}

							let tags = ''
							switch (sel[0]) {
								case '': AddSel(act.div)
									break
								case '[': tags = act.div.querySelectorAll(sel)
									if (tags)
										for (const t of tags)
											AddSel(t)
									break
								case '#': //tag = AddSel(act.div.querySelector(`[id='${sel.substring(1)}']`))
									tags = act.div.querySelectorAll(`[id='${sel.substring(1)}']`)
									if (tags)
										for (const t of tags)
											AddSel(t)
									break
								case '.':
									const clss = sel.substring(1).split(/\s*:\s*/),
										cls = clss[0]
									tags = act.div.querySelectorAll(`[class *='${cls}']`)
									if (tags) {
										let s = ''
										for (let i = 1; i < clss.length; i++) {
											const cls = clss[i].trim()
											if (cls)
												s += (s?'|':'') + ':' + cls
										}

										const match = new RegExp(`\\b` + cls + (s ? `(:[^\\s]*)*(${s})+` : ``) + `\\b`)
										// Match: scls => new RegExp(`\\b` + scls + `([,:][^\\s\\)]*)*\\b`),

										for (const t of tags)
											if (t.className.match(match))
												AddSel(t)
									}
									break
								default: tags = act.div.getElementsByTagName(sel)
									if (tags)
										for (const t of tags)
											AddSel(t)
							}

							if (!ok) {
								if (C.consts.o5debug > 1)
									console.error(`inc: не определён селектор '${tagid.selector}' (м.б. ошибка парности тегов <div>)`)
								incl.undef += (incl.undef ? ',' : '') + tagid.selector
								incl.err = 1
							}
						} else
							tagid.tag.innerHTML += res
					}
				}
			}
			if (C.consts.o5debug > 2) console.log("}========  OnLoad() 2 -----------------------------------------------")
			act.DecFinish()
		},
		OnError = function (e) {
			const xhr = this,
				incl = FindIncl(xhr._url)
			if (incl)
				Object.assign(incl, { status: xhr.status, text: 'ошибка OnError... ', undef: 'блокировано by CORS ?', err: 3 })
			act.DecFinish()
		},
		AutoInit = e => { // автономный запуск
			if (!Array.from(document.scripts).find(script => script.src.match(/\/o5(com|common)?.js$/)))
				W.Init()
		}

	function Includes(c) {
		if (c && !typeof c == 'event') C = c
		if (C.consts.o5debug > 0) console.log(`========  инициализация '${W.modul}'   ------ ${c ? 'из библиотеки' : 'автономно'}`)

		const tags = document.querySelectorAll("div[o5include]"),
			doneattr = W.modul + '-done'
		if (tags)
			for (const tag of tags) { // группировка по url'ам, чтобы не грузить лишнее
				const done = tag.getAttribute(doneattr)
				if (done) {
					console.error('%c%s', "background: yellow; color: black;", `(========  повтор инициализации для id='${tag.id}'`)
					continue
				}
				tag.setAttribute(doneattr, 'OK')

				const ref = tag.getAttribute('o5include'),
					ss = ref.split('?'),
					ori = ss[0].trim()

				if (!incls[ori]) {
					const wref = (C.DeCodeUrl) ? C.DeCodeUrl(C.urlrfs, ori, '') : { url: ori, err: '' },
						text = wref.err ? `Перекодирование` : ``

					incls[ori] = { tagids: [], status: 0, text: text, err: wref.err, undef: '', url: wref.url }
					Object.seal(incls[ori])
				}
				incls[ori].tagids.push({ tag: tag, selector: ss[1] }) // (ss[1] ? ss[1] : '') })
				// tag.attributes.removeNamedItem(o5include)// 'это на потом: чтобы могло искать и обрабатывать вложенные
			}

		act.cnt = 0
		for (const ori in incls) {
			const url = incls[ori].url,
				xhr = new XMLHttpRequest()
			Object.assign(xhr, { _url: url, onload: OnLoad, onerror: OnError, timeout: 10000, responseType: 'text', withCredentials: true, })

			act.cnt++
			xhr.open("get", url, true)
			xhr.send()
		}
		if (act.cnt == 0)
			act.DecFinish()
	}

	document.addEventListener('DOMContentLoaded', AutoInit)

	if (!window.olga5) window.olga5 = []
	if (!window.olga5.find(w => w.modul == W.modul)) {
		if (C.consts.o5debug > 0)
			console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		window.olga5.push(W)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error('%c%s', "background: yellow; color: black;border: solid 2px red;", `}---< Повтор загрузки '${W.modul}`)

})();
