/* global document, window, console, Map*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5inc ---	
	'use strict'
	const mdebug = window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=)(\s*\d*)/)
	let C = {
		consts: { o5debug: mdebug ? (mdebug[5] ? mdebug[5] : 1) : 0 },
		Match: scls => new RegExp(`\\b` + scls + `[,:]*[^\\s\\)]*`),
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
					else C.ConsoleInfo(head, 'OK', rezs)
					window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
				}
			}
		},
		SelInclDests = () => {
			const tags = document.querySelectorAll("div[o5include]")
			if (tags)
				for (const tag of tags) { // группировка по url'ам, чтобы не грузить лишнее
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
				ok = xhr.status == 200

			if (C.consts.o5debug > 0) console.log(`}========  o5inc.OnLoad(${xhr.status})  ------ ${xhr._url}`)

			const incl = FindIncl(xhr._url)

			if (incl) {
				Object.assign(incl, { status: xhr.status, text: xhr.statusText, err: ok ? 0 : 2 })

				if (ok) {
					const s = xhr.responseText,
						m1 = s.match(/<body\.*>/),
						i1 = (m1 && m1.length > 0) ? (m1.index + m1[0].length) : 0,
						i2 = i1 > 0 ? s.lastIndexOf('</body') : s.length,
						res = (i1 > 0 ? s.substring(i1, i2) : s).trim()

					for (const tagid of incl.tagids) {
						let sel = tagid.selector
						if (sel) {
							if (!act.div) {
								act.div = document.createElement('div')  // первый и единственный раз
								act.div.innerHTML = res
							}

							let tag = null,
								ts = null

							switch (sel[0]) {
								case '': tag = act.div
									break
								case '[': tag = act.div.querySelector(sel)
									break
								case '#': tag = act.div.querySelector(`[id='${sel.substring(1)}']`)
									break
								case '.':
									const cls = sel.substring(1),
										match = C.Match(cls)
									ts = act.div.querySelectorAll(`[class *='${cls}']`)
									if (ts)
										for (const t of ts)
											if (t.className.match(match)) {
												tag = t
												break
											}
									break
								default: ts = act.div.getElementsByTagName(sel)
									if (ts) tag = ts[0]
							}

							if (tag) tagid.tag.innerHTML += tag.innerHTML
							else {
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
		}

	function Includes(c) {
		if (c) C = c
		if (C.consts.o5debug > 0) console.log(`}========  o5inc.Includes()   ------ ${c ? 'из библиотеки' : 'автономно'}`)

		SelInclDests()
		for (const ori in incls) {
			const url = incls[ori].url,
				xhr = new XMLHttpRequest()
			Object.assign(xhr, { _url: url, onload: OnLoad, onerror: OnError, timeout: 10000, responseType: 'text', withCredentials: true, })

			act.cnt++
			xhr.open("get", url, true)
			xhr.send()
		}
		if (!act.cnt)
			act.DecFinish()
	}

	window.addEventListener("DOMContentLoaded", e => {
		if (!window.olga5.C) // библиотеки-то - НЕТУ
			Includes()
	})

	if (!window.olga5) window.olga5 = []
	if (!window.olga5.find(w => w.modul == W.modul)) {
		window.olga5.push(W)

		if (C.consts.o5debug > 0)
			console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error(`Повтор загрузки '${W.modul}`)
	// window.olga5[W.modul] = { W: W } // ради автономного доступ по-имени
})();
