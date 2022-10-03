/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 * расширение логирования
 */
(function () {              // ---------------------------------------------- o5com/CConsole ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CConsole'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		padd = "padding-left:0.5rem;",
		clrtypes = {
			'A': "background: yellow; color: black;border: solid 3px blue;",
			'E': "background: yellow; color: black;border: solid 1px gold;",
			'S': "background: blue;   color: white;border: solid 1px bisque;",
			'I': "background: beige;  color: black;border: solid 1px bisque;",
		},
		ConsoleMsg = (styp, txts, add, tab) => {
			const txt = (txts && txts[txts.length - 1] != '') ? txts + ' ' : txts,
				type = styp.substr(0, 1).toUpperCase(),
				clr1 = clrtypes[type],
				clr2 = "margin-left:0.4rem; background: white; color: black; border: solid " +
					(tab ? "1px gray;" : "1px bisque;"),
				Is_debug = () => { return (C && C.consts && C.consts.o5debug != undefined) ? C.consts.o5debug : false }
			if (type != 'A' && type != 'E' && Is_debug() <= 0) // когда НЕ выдаётся сообщение
				return

			if (add === null || typeof add === 'undefined' || add === '') console.groupCollapsed('%c%s', (padd + clr1), txt)
			else
				if (Number.isInteger(add)) console.groupCollapsed('%c%s%c%s', (padd + clr1), txt, (padd), add + ' ')
				else console.groupCollapsed('%c%s%c%s', (padd + clr1), txt, (padd + clr2), add + ' ')
			// console.group(txt)

			const tt = []
			if (tab) {
				if (tab instanceof Array)
					tab.forEach((v, nam) => {
						let t = {}
						const ss = [],
							O = (o) => {
								const uu = []
								if (o instanceof NamedNodeMap) {
									for (const atr of o) uu.push(atr.name + '=' + atr.value)
									return uu.join(',')
								} else if (o instanceof Object) {
									for (const x in o) uu.push(x + '=' + o[x])
									return uu.join(',')
								}
								else return (typeof o === 'undefined') ? ' `undef`' : (o == null ? '`null`' : o.toString())
							}
						let s = ''
						if (v instanceof Map) {
							v.forEach((x, nam) => s += (s == '' ? '' : ', ') + nam + ':' + x.toString())
							t[nam].val = '{' + s + '}'
						} else if (v instanceof Array) {
							v.forEach(x => s += (s == '' ? '' : ', ') + x)
							t[nam].val = '{' + s + '}'
						} else if (v instanceof Object) {
							for (const x in v)
								t[x] = O(v[x])
						} else
							t = v //t[nam] = v
						tt.push(t)
					})
				else if (tab instanceof Map)
					tab.forEach((v, nam) => {
						const t = { nam: nam }
						let s = ''
						if (v instanceof Map) {
							v.forEach((x, nam) => s += (s == '' ? '' : ', ') + nam + ':' + x.toString())
							t.val = '{' + s + '}'
						} else if (v instanceof Array) {
							v.forEach(x => s += (s == '' ? '' : ', ') + x)
							t.val = '{' + s + '}'
						} else if (v instanceof Object) {
							for (const x in v) s += (s == '' ? '' : ', ') + x + ':' + v[x]
							t.val = '{' + s + '}'
						} else
							t.val = v
						tt.push(t)
					})
				else for (const t in tab) {
					const v = tab[t]
					if (!t.match(/^\d*$/) && typeof v !== 'function')
						if (typeof v !== 'object') tt.push({ nam: t, val: v })
						else {
							const r = { nam: t }
							if (Array.isArray(v))
								for (let i = 0; i < v.length; i++)
									r['№-' + i] = v[i]
							else
								for (const x in v)
									r[x] = v[x]

							tt.push(r)
						}
				}
				if (tt.length > 0) {
					// tt.push({})    // иначе Chromium проглатывает последний элемент массива
					console.table(tt)
				}
			}
			console.table()
			console.groupCollapsed(` ... трассировка вызовов :`)
			console.trace()
			console.groupEnd()
			console.groupEnd()

			// console.log('-------- groupEnd()')
			// console.groupEnd()
			// console.groupEnd()
			// console.groupEnd()
			// console.groupEnd()
		}

	wshp[modulname] = () => {
		// if (C.consts.o5debug > 0) console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)
		Object.assign(C, {
			ConsoleMsg: ConsoleMsg,
			ConsoleAlert: function (txt, add, tab) {
				ConsoleMsg('alert', txt, add, tab);
				// window.setTimeout(ConsoleMsg, 1, 'alert', txt, add, tab)
			},
			ConsoleError: function (txt, add, tab) {
				ConsoleMsg('error', txt, add, tab);
				// window.setTimeout(ConsoleMsg, 1, 'error', txt, add, tab)
			},
			ConsoleSign: function (txt, add, tab) {
				ConsoleMsg('sign', txt, add, tab);
				// window.setTimeout(ConsoleMsg, 1, 'sign', txt, add, tab)
			},
			ConsoleInfo: function (txt, add, tab) {
				ConsoleMsg('info', txt, add, tab)
				// window.setTimeout(ConsoleMsg, 1, 'info', txt, add, tab)
			},
		})
		return true
	}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();
/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5com/CEncode ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CEncode'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		DelBacks = (s0) => {
			// const s00 = s0
			let n = 0
			const mrkN = '\n',
				mrk2 = '..'
			do {
				let l = s0.length,
					m = s0.match(/\.\.[^\/]/)
				if (m) s0 = s0.substr(0, m.index + 2) + '/' + s0.substr(m.index + 2)
				m = s0.match(/[^\/]\.\./)
				if (m) s0 = s0.substr(0, m.index + 1) + '/' + s0.substr(m.index + 1)
				if (l == s0.length) break
			} while (n++ < 99)

			const s2s = s0.split('/'),
				tt = []
			for (let i = 0; i < s2s.length; i++)
				if (s2s[i] == mrk2) {
					let j = i
					while (j-- > 0)
						if (s2s[j] != mrkN && s2s[j] != mrk2 && s2s[j] != '') {
							s2s[j] = mrkN
							s2s[i] = ''
							break
						}
				}

			let i = s2s.length
			while (i-- > 0)
				if (s2s[i] == mrkN || (i > 0 && s2s[i] == '' && s2s[i - 1] == ''))
					s2s.splice(i, 1)

			let s = s2s.join('/').replaceAll(/\/\.\//g, '/')
			return s.replaceAll(/[^:]\/\/+/g, (u) => { return u.substr(0, 2) })
		},
		IsUrlNam = u => { return !!(u.trim() && !u.match(/[\/.\\#]/)) },
		DeCodeUrl = function (urlrfs, url, o5attrs = null) { // старое DeCodeUrl
			if (url.match(/^\s*data:/)) {
				return { url: url.trim(), err: '', num: 0 }
			}
			const errs = [],
				parts = [],
				Replace4320 = u =>
					u.replaceAll(/(&#43;)/g, '+').replaceAll(/(%20|&nbsp;)/g, ' ').trim(), // давать в такой очерёдностии, иначе снова вернёт %20 !,
				IsCompaund = orig => orig && (orig.includes('+') || IsUrlNam(orig)),
				SplitRefs = (s, refs = null) => {
					s.split('+').forEach(sprt => {
						const prt = sprt.trim(),
							isnam = IsUrlNam(prt),
							ref = isnam ? C.Repname(prt) : prt
						// if (prt == 'btnSound' || prt == 'btnsound')
						// 	console.log()

						if (isnam) parts.num++
						if (refs && refs.find(r => ref == r))
							errs.push(`цикл. ссылки ${refs.join('->')}=>${att};`)
						else {
							// let attr = null
							// if (isnam && o5attrs) {
							// 	attr=C.GetAttribute(o5attrs, ref)
							// 	if (!attr && (ref=='href' || ref=='src'))	
							// 	attr=C.GetAttribute(o5attrs, '_'+ref)
							// }							
							const attr = (isnam && o5attrs) ? C.GetAttribute(o5attrs, ref) : null

							if (attr) {
								if (!refs) refs = []
								refs.push(ref)
								// if (!attr.value)
								// console.log(2)
								SplitRefs(attr, refs)
							}
							else if (isnam) {
								if (urlrfs[ref]) SplitRefs(urlrfs[ref], refs)
								else
									errs.push(`неопр.: '${prt}` + (prt != ref ? ` (т.е. '${ref})` : ''))
							}
							else
								parts.push(ref)
						}
					})
				},
				ss = url.split('?'),
				orig = Replace4320(ss[0].trim()),
				ret = { url: url, err: '', num: 0 }

			if (IsCompaund(orig)) {
				Object.assign(parts, { num: 0, rght: ss[1] ? ('?' + ss[1]) : '' })

				SplitRefs(orig)

				let urld = ''
				for (const part of parts)
					if (urld && part && urld[urld.length - 1] != '/' && part[0] != '/') urld = urld + '/' + part
					else urld = ((urld ? urld : '') + (part ? part : ''))

				if (urld) {
					if (!urld.match(/https?:/)) {
						if (parts[0] == '') urld = C.urlrfs._url_olga5 + urld
						else urld = C.urlrfs._url_html + urld
						if (!urld.match(/https?:/)) {  // если всё еще нету
							const hr = new window.URL(window.location).href
							urld = hr.substring(0, hr.lastIndexOf('/') + 1) + urld
						}
					}
					urld = DelBacks(urld) + parts.rght
				}
				Object.assign(ret, {
					url: urld,
					err: errs.length > 0 ? errs.join(', ') : (urld ? '' : `пустой 'url'`),
					num: parts.num
				})
			}
			return ret
		},
		TagDes = (tag, ref, errs = null) => {
			for (const code of ['data-', '_', '']) {
				const from = code + ref,
					attr = tag.attributes[from]
				if (attr) {
					const orig = attr.nodeValue,
						regExp1 = new RegExp('((.*\\/|\\+)\\s*)|(!*\\.js\\s*$)', 'g'),
						regExp2 = new RegExp('(\\s*\\+\\s*)+', 'g')

					return {
						code: code,
						from: from,
						modul: orig.replace(regExp1, ''),
						orig: orig,
						trans: !!(orig.match(regExp2) || IsUrlNam(orig)),
					}
				}
			}
			if (errs)
				errs.push({ tag: C.MakeObjName(tag), ref: ref, txt: 'не определены атрибуты' })
		}

	wshp[modulname] = () => {
		// if (C.consts.o5debug > 0) console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)
		Object.assign(C, {
			DelBacks: DelBacks,
			DeCodeUrl: DeCodeUrl,
			TagDes: TagDes,
		})
		return true
	}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();
/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5com/CApi ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CApi'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	let o5owners = null
	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		Modul = function (owner, modul) {
			return owner.modules.length == 0 || !modul || owner.modules.find(m => { return m == modul })
		},
		TagsByClassName = (start, cls) => {
			const smatch = new RegExp(`\\b` + cls + `(\\s*:\\s*(([\`'"])(.*?)\\3|[^\`'":\\s]*))*`, 'i'),
				sels = start.querySelectorAll("[class *= '" + cls + "']"),
				tags = []

			for (const tag of sels) {
				// if (tag.id == 'i3ee')
				// 	console.log()
				const ms = tag.className.match(smatch)
				if (ms) {
					const quals = [],
						m = ms[0],
						ss = m.match(/:\s*(([`'"])(.*?)\2|[^`'":]*)/gm)

					tag.className = tag.className.replace(m, cls)// ВСЕГДА убираю квалификаторы (остальные в ms - не трогать!)
					if (ss)
						for (const s of ss)
							quals.push(s.replace(/^\s*:\s*|\s*$/g, '')) // кавычки пока оставляю
					if (C.consts.o5debug > 2)
						console.log(`TagsByClassName: id='${tag.id}',  '${m}', \n\t${quals}`)
					tags.push({ tag: tag, quals: quals, origcls: m.trim() })
				}
			}
			return tags
		},
		QuerySelectorInit = () => {
			o5owners = []
			const mtags = TagsByClassName(document, C.olga5_Start)
			if (mtags.length == 0)
				mtags.push({ tag: document, quals: [] })
			for (const mtag of mtags) {
				const modules = []
				for (const modul of mtag.quals)
					modules.push(modul)
				o5owners.push({ start: mtag.tag, modules: modules }) // , Modul: Modul })
			}
		}

	wshp[modulname] = () => {
		// if (C.consts.o5debug > 0) console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)
		Object.assign(C, {
			olga5_Start: 'olga5_Start',
			scrpts: [],
			MakeObjName: function (obj, len) { // моё формирование имени объекта
				if (obj) {
					const nam = Object.is(obj, window) ? '#window' : (
						Object.is(obj, document) ? '#document' : (
							(obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
								('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
								'.' + (obj.className ? obj.className : '?')
							)
						))
					return nam.padEnd(len ? len : 0);
				}
				else
					return 'null';
			},
			ClearOwners: function () { // эт чтоб переситыать по-новому
				o5owners = null
			},
			GetTagsByQuery: function (query, modul) {
				if (o5owners === null) QuerySelectorInit()
				const nodes = []
				for (const owner of o5owners)
					if (Modul(owner, modul)) {
						const tags = owner.start.querySelectorAll(query)
						if (tags && tags.length > 0)
							for (const tag of tags)
								nodes.push(tag)
					}
				return nodes;
			},
			GetTagById: function (id, modul) {
				if (o5owners === null) QuerySelectorInit()
				for (const owner of o5owners) {
					// const tt =  owner.start.querySelector('#' + id)
					const start = owner.start,
						tag = start.getElementById ? start.getElementById(id) : start.querySelector('#' + id)
					if (tag && Modul(owner, modul))
						return tag
				}
			},
			GetTagsByClassName: function (classname, modul) {
				if (o5owners === null) QuerySelectorInit()
				const mtags = []
				for (const owner of o5owners) {
					const tags = TagsByClassName(owner.start, classname)
					if (tags && tags.length > 0 && Modul(owner, modul))
						mtags.push(...tags)
				}
				return mtags
			},
			GetTagsByTagName: function (tagname, modul) {
				if (o5owners === null) QuerySelectorInit()
				const list = [],
					tagnams = tagname.split(',')
				for (const owner of o5owners)
					if (Modul(owner, modul))
						for (const tagnam of tagnams) {
							const tags = owner.start.getElementsByTagName(tagnam.trim())
							if (tags && tags.length > 0)
								list.push(...tags)
						}
				return list
			}
		})
		return true
	}
	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();
/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  Общий модуль, обязательный при подключении одного (ли несколиких)   моулей библиотеки
 *
 * параметры могут дублироваться командной строкой вызова страницы
 **/

(function () {              // ---------------------------------------------- o5com/CParams ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CParams'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		csslist = {}, // перечень наименований создаваемых классо
		// repQuotes = /^['"`\s]+|['"`\s]+$/g,
		SplitParams = (s, parnam, delims = ';') => {
			const errs = [],
				params = {},
				regexp = new RegExp('\\s*[' + delims + ']\\s*', 'g'),
				regcomments = /(\s+\/\/|#).*?(\n|$|;)/g,
				x = s.replace(/\/\*(.|\n)*?\*\//g, '').
					replace(regcomments, ';'),		 // убрал оба типа коментов
				spairs = x.trim().split(regexp)

			if (C.consts.o5debug > 0) {
				const comments = s.match(regcomments)
				if (comments)
					comments.forEach(comment => {
						if (comment.match(/[^=]=[^=]/))
							errs.push({ par: comment, err: `в комменте подозрительный одиночный '='` })
					})
			}

			for (const spair of spairs)
				if (spair) {
					const pair = spair.split('=')
					if (pair.length > 1) {
						const nam = C.Repname(pair[0].trim()),
							val = (pair[1] || '').replace(C.repQuotes, '')

						if (nam) params[nam] = C.TryToDigit(val)
						else
							if (val.length > 1)
								errs.push({ par: spair, err: `у параметра (с val='${val}') нет имени` })
					}
					else
						errs.push({ par: spair, err: `отсутствие '='` })
				}

			if (errs.length > 0)
				C.ConsoleError(`Разбор  параметров `, parnam, errs)

			return params
		},
		DeCodeUrlRfs = (urlrfs, modul) => {
			const urlerrs = [],
				urlsets = []

			for (const nam in urlrfs) {
				const val = urlrfs[nam]
				if (val != null && typeof val !== 'undefined') {
					if (!val.replace)
						alert('значение URL - не строка')
					const url = val.replace(C.repQuotes, ''),
						wref = C.DeCodeUrl(urlrfs, url)

					if (wref.err.length > 0)
						urlerrs.push({ ori: nam, err: wref.err, url: url })
					urlsets.push({ nam: nam, url: wref.url, 'ориг.': (wref.url != url) ? url : '-"-' })
					urlrfs[nam] = wref.url
				} else
					urlerrs.push({ ori: nam, err: `не определено`, url: '' })
			}

			if (C.consts.o5debug > 0 && urlsets.length == 0)
				C.ConsoleInfo(`${modul}: именованные ссылки отсутствуют`, '   ?')

			if (urlerrs.length > 0)
				C.ConsoleError(`${modul}: недоопределённые ссылки`, urlerrs.length, urlerrs)
		},
		CopyVals = (xs, c, type) => {
			for (const nam in c) {
				const x = xs.find(x => x.nam == nam)
				if (x) Object.assign(x, { val: c[nam], source: type })
				else xs.push({ nam: nam, val: c[nam], source: type })
			}
		},
		InitCSS = (W, o5css) => {
			const chs = document.head.children,
				id = W.class + '_internal',
				csso = csslist[W.class]
			let err = ''

			if (typeof csso === 'undefined') {
				for (const ch of chs)
					if (ch.nodeName == "STYLE" && ch.id == id) {
						err = `Стиль id='${id}' (модуль: '${W.modul}', класс: '${W.class}) уже определён в документе`
						break
					}
			} else
				if (csso != W.modul) err = `Класс '${W.class}' повторяется в модулях '${csso}' и '${modul}. '`

			if (err) C.ConsoleError('>>  создание CSS  ' + err, 'InitCSS')
			else {
				if (C.consts.o5debug > 0)
					console.log(`>>  СОЗДАНИЕ CSS   ${W.class} (для модуля ${W.modul}) с id='${id}'`)
				csslist[W.class] = W.modul

				const styl = document.createElement('style')
				styl.setAttribute('type', 'text/css')
				styl.id = id

				const moeCSS = document.head.appendChild(styl)
				moeCSS.innerHTML = o5css.replace(/(\/\/.*($|\n))|(\s*($|\n))/g, '\n')
				// (\/\/.*$)           мои коменты '//' до конца строки
				// (\/\*(.|\s)*?\*\/)  стандартные коменты (проверить!!! поему-то переносит строки правил)
				// (\s*$)              пустое до конца строки       
			}
		},
		PrintParams = (modul, xs, p, n1) => {
			if (C.consts.o5debug > 0) {
				let n2 = 0
				for (const nam in xs) n2++
				C.ConsoleInfo(`${modul}: все константы '${p}' `, `${('' + n2).padStart(2)} (своих=${('' + n1).padStart(2)})`, xs)
			}
		},
		ParamsFill = function (W, o5css) {
			if (W.isReady)
				return

			const scrpt = C.scrpts.find(scrpt => scrpt.modul == W.modul)

			if (!scrpt) {
				C.ConsoleError(`? В 'C.scrpts' не наден модуль `, W.modul)
				return
			}

			if (o5css) InitCSS(W, o5css)

			const isnew = !!scrpt.script,
				attrs = isnew ? C.GetAttrs(scrpt.script.attributes) : C.o5attrs

			for (const p of ['consts', 'urlrfs']) {
				const xs = {} // временное хранилилище для считываемых параметров
				
				let askps = {}
				if (W[p])   // т.е. если параметр был передан отдельно. Если еще не обрабатывался - SplitParams
					askps = (typeof W[p] === 'object') ? W[p] : SplitParams(W[p], p, ';,')

				for (const nam in C[p]) {
					const source = C.constsurl.hasOwnProperty(nam) ? C.save.urlName : `ядро`
					if (!xs.hasOwnProperty(nam)) xs[nam] = { val: C[p][nam], source: source }
				}
				if (isnew) {
					W[p] = {}	// преобразовываю в объект
					const n1 = C.ParamsFillFromScript(xs, askps, attrs, p)

					if (p == 'urlrfs') {
						const urls = {}
						for (const nam in xs) urls[nam] = xs[nam].val
						DeCodeUrlRfs(urls, `${W.modul}: `)
						for (const nam in xs) xs[nam].url = urls[nam]
					}
					else
						for (const nam in C.constsurl)
							if (xs[nam].source != C.save.urlName)
								Object.assign(xs[nam], { val: C.constsurl[nam], source: `${C.save.urlName}(восстановил)` })

					for (const nam in xs)
						W[p][nam] = xs[nam].val

					PrintParams(W.modul, xs, p, n1)
				}
				else
					C.ConsoleInfo(`${W.modul}: параметры и ссылки берутся только из скрипта ядра библиотеки`)
			}
		}

	wshp[modulname] = url_olga5 => {
		C.urlrfs._url_olga5 = url_olga5

		Object.assign(C, {
			ParamsFill: ParamsFill,
			SplitParams: SplitParams,
		})

		PrintParams(C.consts, C.save.xs, C.save.p, C.save.n1)

		const p = 'urlrfs',
			xs = {}, // временное хранилилище для считываемых параметров
			defs = C[p]

		const n1 = C.ParamsFillFromScript(xs, defs, C.o5attrs, p)
		for (const nam in xs) defs[nam] = xs[nam].val

		DeCodeUrlRfs(defs, C.save.libName)

		for (const nam in defs) { xs[nam].url = defs[nam] }
		PrintParams(C.save.libName, xs, p, n1)

		// delete C.save
		Object.freeze(C)
		return true
	}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();
/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  исправление 'src', 'data-src' и 'href' в тегах html-заголовка
 **/
//
(function () {              // ---------------------------------------------- o5com/TagRefs ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'TagsRef'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}
	let trn = 0
	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		// regExp = /[^\/\s+]+$/
		// olga5_script = document.currentScript,
		ReplaceTag = (tagName, change, adrName, url, errs) => {
			const addnew = document.createElement(tagName),
				regExp = new RegExp(/[\\+<>'"`=#\\/\\\\]/)
			let err = false
			for (const attr of change.attributes) {
				if (attr.name.match(regExp)) {
					errs.push({ tag: tagName, ref: attr.name, txt: `cодержит кавычки или '+><=#/'` })
					err = true
				}
				else
					try {
						addnew.setAttribute(attr.name, attr.value) // здесь копирую "как есть" 
					} catch (err) {
						errs.push({ tag: tagName, ref: url, txt: (attr.name + '=' + attr.value) })
					}
			}
			addnew.setAttribute(adrName, url)
			// change.dataset.o5_old = 1 // это нужно, если не удалять оригинал
			if (err || C.consts.o5debug > 1)
				console.log(`добавляю тег <${tagName}> с атрибутом ${adrName}=${url} ${err ? ' с ошибками' : ''}`)

			// if (trn>=7)
			// 	console.log()
			// if (addnew.tagName== "SCRIPT")	
			// console.log(trn++, addnew.src, change.src)
			// if (addnew.tagName== "LINK")	
			// console.log(trn++, addnew.href, change.href)
			change.parentNode.insertBefore(addnew, change)
			change.parentNode.removeChild(change) //  ??  а вот удалять  -м.б. и не надо: для контроля

			return addnew
		},
		ConvertScripts = () => {
			const errs = [],
				scrs = [],
				preloads = [],
				load_snm = {},
				Orig = (obj) => {
					const origs = obj.outerHTML.match(/\s(data-)?src\s*=\s*["*'][^"']*["*']/g)
					if (origs && origs.length > 0) {
						origs.forEach((orig) => {
							orig = orig.replaceAll(/["'s*]/g, '')
						})
						return origs.join(', ')
					} else
						return '-нету-'
				}

			for (const w of window.olga5)
				preloads.push({ w: w, orig: Orig(C.o5script), script: C.o5script, isset: false, })

			/*				сначала из тегов <script>, пропуская те, которые в скомпилированном			*/

			const s = C.consts.o5incls.trim(),
				incls = s ? s.split(/\s*[,;]\s*/) : [],
				match_o5 = /\bo5\w+/,  // начинаются с o5
				igns = [],
				needs = {}

			incls.forEach(incl => needs[incl] = 1)
			for (const script of document.scripts) {
				// if (C.consts.o5debug > 1) console.log(`тег <script>: id= '${script.id}', src= "${script.src}"`)

				if (script === C.o5script) // это ядро, т.е. конец скриптов (не зависимо от наличия 'o5_scripts')
					break

				if (script.dataset.o5add) continue 		// это добавленный мною скрипт		
				if (script.innerText.trim()) continue	// это встроенный скрипт

				const td = C.TagDes(script, 'src', errs)

				if (!td || !(td.modul.match(match_o5) || (td.trans && !C.consts.o5only)))
					continue

				if (incls.length > 0)
					if (needs[td.modul]) needs[td.modul] = 0
					else {
						igns.push(td.modul)
						continue
					}

				// if (needs[td.modul])needs[td.modul]=0
				// else (if )
				// if (Igns(td.modul)) {
				// 	if (C.consts.is_debug > 1) console.log(`   -"-    игнорируется: orig=${td.orig}`)
				// 	continue
				// }

				if (load_snm[td.modul])
					errs.push({ tag: td.modul, ref: td.orig, txt: 'повторная загрузка модуля' })
				load_snm[td.modul] = td.orig // перезаписываю!

				const w = window.olga5.find(w => w.modul == td.modul),
					scrpt = { modul: td.modul, orig: td.orig, act: { W: w }, script: script, }
				let dochg = ''
				if (!w || td.code == '_' || (td.trans && td.code != 'data-')) {
					dochg = !w ? 'новый  ' : 'замена '
					if (C.consts.o5debug > 1) console.log(`тег <script>: id= '${script.id}' -> в обработку (${dochg}): orig=${td.orig}`)

					scrpt.act.W = null
					let url = td.orig
					if (td.trans) {
						const wref = C.DeCodeUrl(C.urlrfs, td.orig)
						if (wref.err)
							errs.push({ tag: td.modul, ref: td.from, txt: wref.err })
						url = wref.url
						// scrpt.script = ReplaceTag('script', script, 'src', wref.url, errs)
					}
					scrpt.script = ReplaceTag('script', script, 'src', url, errs)
				}

				C.scrpts.push(scrpt)	//	{ modul: td.modul, orig: td.orig, act: { W: null }, script: replace, })
				scrs.push({
					modul: scrpt.modul,
					orig: scrpt.orig,
					src: scrpt.script.src,
					txt: dochg + td.from
				})
			}
			/*				дописываю те, которые в скомпилированном и отсутствуют в SCRIPT's			*/
			for (const w of window.olga5) {
				const modul = w.modul
				if (!C.scrpts.find(scrpt => scrpt.modul == modul))
					// if (!igns(modul)) {
					if (!igns.includes(modul)) {
						C.scrpts.push({ modul: modul, orig: '', act: { W: w }, script: C.o5script })
						scrs.push({ modul: modul, orig: '', src: C.o5script.src, txt: `из скомпилированного` })
					}
			}

			const errneeds = []
			for (const need in needs) {
				if (needs[need]) errneeds.push(need)
			}
			if (errneeds.length > 0)
				C.ConsoleError(`Из заданных в 'o5incls' отсутствуют модули:`, errneeds.join(', '))
			// сюда проверь!?
			if (C.consts.o5debug > 0) {
				if (scrs.length > 0) C.ConsoleInfo("Найденные olga5 SCRIPT'ы : ", scrs.length, scrs)
				else C.ConsoleInfo("Не найдены olga5 SCRIPT'ы ?")

				if (igns.length > 0)
					C.ConsoleInfo(`Проигнорированы скрипты, отсутствующие в 'o5incls': `, igns.join(', '))

				if (C.consts.o5debug > 1) { // тестирование атрибутов
					const errs = []
					for (const scrpt of C.scrpts)
						for (const attr of scrpt.script.attributes)
							if (!attr.name || attr.name.match(/['"`\+\.,;]/))
								errs.push({ 'атрибут': attr.name, 'скрипт': scrpt.script.src, })
					if (errs.length > 0)
						C.ConsoleError(`${errs.length} странных атрибутов (м.б. перепутаны кавычки?) у скрипта`, scrpt.modul + '.js', errs)
				}
			}
			if (errs.length > 0)
				C.ConsoleError(`Ошибки в преобразовании SCRIPT `, errs.length, errs)

			for (const scrpt of C.scrpts) {
				Object.assign(scrpt.act, { done: 0, strt: 0, timeout: 0 })
				Object.freeze(scrpt)
			}
			Object.freeze(C.scrpts)

			scrs.splice(0, scrs.length)
			errs.splice(0, errs.length)
		},
		ConvertLinks = () => {
			const links = [],
				errs = []
			for (const child of document.head.children)
				if (child.tagName.toLowerCase() == 'link') {
					const td = C.TagDes(child, 'href', errs)
					if (!td.orig) {
						C.ConsoleError(`обнаружен <link> без 'href', '_href' или 'data-href': `, child.outerHTML, null)
						continue
					}
					if (td.trans) { 									// для link'ов не надо проверять 'o5'
						const wref = C.DeCodeUrl(C.urlrfs, td.orig)
						if (wref.err)
							errs.push({ tag: td.modul, ref: td.from, txt: wref.err })

						ReplaceTag('link', child, 'href', wref.url, errs)
						links.push({ orig: td.orig, src: wref.url, txt: td.from })
					}

					wshp.o5iniready ||= child.href.match(/\/o5ini\.css$/)
				}

			if (C.consts.o5debug > 0)
				if (links.length > 0) C.ConsoleInfo("Скорректированные LINK'и : ", links.length, links)
				else C.ConsoleInfo("Скорректированных LINK'ов нет ")

			if (errs.length > 0)
				C.ConsoleError(`Ошибки в преобразовании LINK `, errs.length, errs)

			links.splice(0, links.length)
			errs.splice(0, errs.length)

		}

	wshp[modulname] = () => {
		// тут еще не определен 'C.consts'                if (C.consts.o5debug > 0) 
		// console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)

		ConvertScripts()
		ConvertLinks()

	}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();
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
						page.pact.timInit = window.setTimeout(InitScripts, 11, 'init/Load')
						if (cc.o5debug > 2) console.log(`${proc} setTimeout ${page.pact.timInit}`)
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
					}
				}
			},
			Unload: function (url) { // -"-"
				const n0 = this.childs.length
				if (n0 > 0) {
					if (cc.o5debug > 0) console.log('}=====< Unload: закрытие открытых (n= ' + n0 + ')')
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
				const timera = `}====<<<   ОБРАБОТАНА СТРАНИЦА ${url}`,
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

				// тут "olga5_sload" и: "olga5_sinit"
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
				if (cc.o5debug > 0)
					console.log('                           ')
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
			window.setTimeout(page.InitDoc, 1)

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
					return
				}

				Object.assign(init_events, { tim: e.timeStamp, txt: txt, typ: e.type })
				if (document.readyState == completeState && HasStart(document))
					if (url == document.URL.match(/[^?&#]*/)[0] && page.pact.url != url)
						WinOnLoad(url, `событие '${e.type}'`)
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

			for (const doc of [document, window]){ // отработка загрузки документа
			const eves=cc.o5init_events.trim().split(/\s*[,;]\s*/) || []
			eves.forEach(eve => doc.addEventListener(eve, init_events.Act))
}
			if (document.readyState == completeState && HasStart(document))
				WinOnLoad(EventUrl(document), "готовность документа (сразу)")

			window.addEventListener('beforeunload', e => {
				page.Unload('')
			}, { capture: true })

			if (cc.o5debug > 0)
				console.log(`}---> ядро библиотеки ожидает события:  [${cc.o5init_events}]`)

			InitScripts(`ядро библиотеки`)

			return true
		}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();/* global document, window, console, Map*/
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
						const MakeObjName = obj =>
							(obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
								('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
								'.' + (obj.className ? obj.className : '?'))
						console.log(`Вставляю скрипт ${name + '.js'}  перед  ${modul + '.js'} (в parentNode=${MakeObjName(actscript.parentNode)})`)
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

			const partype = 'o5' + p
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
		},
		constsurl: {},
		depends: { spisok: "o5ref o5inc, o5pop, o5snd:o5ref o5inc; o5shp=o5snd o5ref, o5shp:o5inc, o5blog o5mnu o5inc, o5mnu o5inc" },
		save: { hash: null, xs: null, p: '', n1: -1, urlName: 'url', libName: 'ядро', }, // сохранение для "красивой" печати - потом удалю
		// urlSaveName: 'url',
		// libSaveName: 'ядро'		
	})

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
