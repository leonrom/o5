/* global document, window, console, Map*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5inc ---	
	'use strict'
	let C = null
	const
		W = {
			modul: 'o5inc',
			Init: Includes,
			// src: document.currentScript.src,
		},
		timera = '                                                                <   инициирован ' + W.modul,
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
					console.timeEnd(timera)

					if (C)
						(ne == 0 ? C.ConsoleInfo : C.ConsoleError)(head, rezs.length, rezs)
					else {
						console.groupCollapsed(head + (ne > 0 ? ` - есть ${ne} ошибок!` : ''))
						console.table(rezs)
						console.groupEnd()
					}
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
						const wref = (C && C.DeCodeUrl) ? C.DeCodeUrl(C.urlrfs, ori, '') : { url: ori, err: '' },
							text = wref.err ? `Перекодирование` : ``

						incls[ori] = { tagids: [], status: 0, text: text, err: wref.err, undef: '', url: wref.url }
						Object.seal(incls[ori])
					}
					incls[ori].tagids.push({ tag: tag, selector: (ss[1] ? ss[1] : '') })
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
			if (C.consts.o5debug > 0) console.log("}========  OnLoad() 1 -----------------------------------------------")
			const xhr = this,
				ok = xhr.status == 200,
				incl = FindIncl(xhr._url)

			if (incl) {
				Object.assign(incl, { status: xhr.status, text: xhr.statusText, err: ok ? 0 : 2 })

				if (ok) {
					const s = xhr.responseText,
						m1 = s.match(/<body\.*>/),
						i1 = (m1 && m1.length > 0) ? (m1.index + m1[0].length) : 0,
						i2 = i1 > 0 ? s.lastIndexOf('</body') : s.length,
						res = (i1 > 0 ? s.substring(i1, i2) : s).trim()

					for (const tagid of incl.tagids) {
						if (tagid.selector) {
							if (!act.div) act.div = document.createElement('div')  // первый и единственный раз
							act.div.innerHTML = res

							const tag = act.div.querySelector(tagid.selector)

							if (tag) tagid.tag.innerHTML = tagid.tag.innerHTML + tag.innerHTML
							else {
								console.error(`inc: не определён селектор '${tagid.selector}' (м.б. ошибка парности тегов <div>)`)
								incl.undef += (incl.undef ? ',' : '') + tagid.selector
								incl.err = 1
							}
						} else
							tagid.tag.innerHTML += res
					}
				}
			}
			if (C.consts.o5debug > 0) console.log("}========  OnLoad() 2 -----------------------------------------------")
			act.DecFinish()
		},
		OnError = function (e) {
			const xhr = this,
				incl = FindIncl(xhr._url)
			if (incl)
				Object.assign(incl, { status: xhr.status, text: 'ошибка OnError... ', undef: 'блокировано by CORS ?', err: 3 })
			act.DecFinish()
		}

	function Includes() {
		console.time(timera)
		C = window.olga5.C
		if (C.consts.o5debug > 0) console.log("}========  Includes() 1 -----------------------------------------------")

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

	if (!window.olga5) window.olga5 = []
	if (!window.olga5.find(w => w.modul == W.modul)) {
		window.olga5.push(W)
		console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error(`Повтор загрузки '${W.modul}`)
	window.olga5[W.modul] = { W: W } // ради автономного доступ по-имени
})();
