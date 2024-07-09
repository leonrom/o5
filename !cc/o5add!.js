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
/* -global document, window, console, Object*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/*eslint no-useless-escape: 0*/
(function () { // 3---------------------------------------------- o5tab ---
	'use strict';

	const
		pard = window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/),
		o5debug = (pard ? (pard[0].match(/=/) ? parseInt(pard[0].match(/\s*\d+/) || 1) : 1) : 2),
		o5tagTable = "§¶▸▹↢⇔↣ₔᐞ⇅¿",
		C = window.olga5 ? window.olga5.C : { // заменитель библиотечного
			consts: {
				o5debug: o5debug,
				o5tag_table: o5tagTable
			},
			avtonom: true,
			incdone: false,
			GetTagsByQueryes: query => document.querySelectorAll(query), // второй аргумент - игнорится			
		},
		// currentScript = document.currentScript,
		W = {
			modul: 'o5tab',
			Init: TabInit,
			consts: `o5tag_table= ${o5tagTable}`,
			urlrfs: '',
		},
		cc_span = 'o5tab-span',
		cc_odd = 'o5tab-odd',
		SortTab = e => {
			let up =0
			const th = e.target,
				cc_Up = 'o5tab-sortUp',
				cc_Dn = 'o5tab-sortDn',
				aO5 = th.aO5tab,
				tr = th.parentElement,
				trpa = tr.parentElement,
				table = trpa.tagName == 'TABLE' ? trpa : trpa.parentElement,
				m = th.getAttribute('issort') - 1, // столбцы нумеруют от 1
				mm2 = Number.MAX_SAFE_INTEGER,
				mm1 = mm2 - 1,
				NumsSort = (v1, v2) => {
					return (v1.v == v2.v) ? 0 : ((up && v1.v > v2.v) || (!up && v1.v < v2.v) ? 1 : -1)
				}
			for (const tbody of table.tBodies) {
				const nums = []
				for (let i = 0; i < tbody.rows.length; i++) {
					const r = tbody.rows[i],
						c = r.cells[m],
						u = c ? c.innerText : mm1,
						v = isNaN(u) ? mm2 : parseFloat(u)
					nums.push({
						i: i,
						v: v,
						r: r
					})
				}

				for (const cell of tr.cells)
					if (cell.aO5tab) {
						cell.classList.remove(cc_Up)
						cell.classList.remove(cc_Dn)
					}
				up = aO5.up
				th.classList.add(up ? cc_Up : cc_Dn)

				aO5.up = !aO5.up

				nums.sort(NumsSort )

				let odd = false,
					dec = -1

				for (const num of nums) {
					const r = num.r
					if (!r.classList.contains(cc_span)) {
						const d = Math.trunc(num.v)
						if (dec != d) {
							dec = d
							odd = !odd
						}
					}

					if (odd) r.classList.add(cc_odd)
					else
						if (r.classList.contains(cc_odd))
							r.classList.remove(cc_odd)
					tbody.appendChild(r)
				}
			}
		},
		PrepTables = () => {
			const sel = 'o5table',
				tags = C.GetTagsByQueryes('[' + sel + ']'),
				d = W.consts.o5tag_table,

				d_head = d[0] ? d[0] : '§',
				d_line = d[1] ? d[1] : '¶',
				cellD = d[2] ? d[2] : '▸',
				cellC = d[3] ? d[3] : '▹',
				aligL = d[4] ? d[4] : '↢',
				aligC = d[5] ? d[5] : '⇔',
				aligR = d[6] ? d[6] : '↣',
				schwa = d[7] ? d[7] : 'ₔ',
				cellV = d[8] ? d[8] : 'ᐞ',
				csort = d[9] ? d[9] : '⇅',
				ctitl = d[10] ? d[10] : '¿',
				m_line = new RegExp('\\s*[\\n' + d_line + ']+\\s*', 'gm'), // разделитель строк
				m_cell = new RegExp('\\s+\\w*(' + cellD + '|' + cellC + ')\\s*', 'g'), // разделитель ячеек (для '▸' - с числом)
				m_clsR = new RegExp('^\\s*\\w*' + cellD),      				// проверка класса в начале рядка
				m_clsC = new RegExp('\\s*\\w+' + cellD + '\\s*$'),      				// проверка класса в ячейке				
				m_sort = new RegExp('\\s*\\d*' + csort + '\\s*', 'g'), // целочисл. сортировка ( с необязательным номером столбца (начиная с 1))
				m_Cell = new RegExp('[^' + cellC + cellD + ']*([' + cellC + cellD + ']|$)', 'g'), // содержимое ячейки
				m_alig = new RegExp('\\s*[' + aligL + aligC + aligR + cellV + csort + ']\\s*', 'g'), // признак выравнивания и объединения
				mschwa = new RegExp(schwa + '.{1}', 'g'),
				m_titl = new RegExp('\\s*\\d+\\s*' + ctitl + '\\s*', ''), // целочисл. сортировка ( с необязательным номером столбца (начиная с 1))
				titles = [],
				Schwa = s => '<sup>' + s.substring(1) + '</sup>'

			for (const tag of tags) {
				const ss = tag.innerHTML.split(m_line),
					rows = [],
					ncs = []
				for (let k = 0; k < ss.length; k++) {
					let s = ss[k]
					if (!s || s.match(/^\s*#/)) continue

					const mT = s.match(m_titl)
					if (mT && mT.length > 0) {
						const j = s.indexOf(ctitl),
							s1 = s.substring(0, j - 1).trim(),
							s2 = s.substring(j + 1).trim()
						titles.push({ k: parseInt(s1), s: s2 })
						continue
					}
					// if (s.indexOf('33	▸10      ▸2.5    ▸0.1   ▸12.1  ▸9.3')>=0)
					// 	console.log()

					if (s[s.length - 1] == d_line) s[s.length - 1] = ' '

					const tds = []
					tds.clsR = ''
					tds.isth = s[0] == d_head

					if (!tds.isth) {		// проверка первым символом разделитель ячеек - берём класс рядка
						const mR = s.match(m_clsR)
						if (mR) {
							const len = mR[0] ? mR[0].length - 1 : 0
							if (len > 0) {
								// tds.clsR = ` class="o5tab-tr_${parseInt(mR[0].substring(0, len))}" `
								tds.clsR = ` class="o5tab-tr_${mR[0].substring(0, len)}" `
								s = s.substring(len + 1)
							}
						}
					}

					const cells = (tds.isth ? s.substring(1) : s).match(m_Cell),
						nc = cells.length

					if (!ncs.includes(nc)) {
						if (ncs.length > 0)
							console.error(`o5tab, тег id='${tag.id}': изменено к-во (${ncs[0]}=>${nc}) ячеек в строке ${k}: "${s.substring(0, 33) + (s.length > 33 ? ' ...' : '')}"`)
						ncs.push(nc)
					}
					let txt = '',
						cspan = 0

					for (let i = 0; i < cells.length; i++) {
						const cell = cells[i],
							mcs = cell.match(m_cell),
							mc = mcs && mcs.length > 0 ? mcs[0].trim() : null,
							mC = cell.match(m_clsC),
							u = cell.replace(mC ? m_clsC : m_cell, '') // в объединённой ячейке объединяем отдельные слова. Чтобы раздельно - через &nbsp;						

						if (!mc && !u) continue // это пустая (незакрытая) ячейка в конце строки справа

						txt += u

						if (mc && mc[0] == cellC) cspan++
						else {
							let align = '',
								isspan = false,
								issort = -1,
								stitle = ''

							if (tds.isth) {
								const mS = txt.match(m_sort)
								if (mS) {
									txt = txt.replace(m_sort, '')
									const s = mS[0].trim()
									if (s.length > 1) issort = parseInt(s.substring(0, s.length - 1))
									else issort = i + 1
									const j = s.indexOf(csort)
									if (j >= 0)
										stitle = s.substring(j + 1).trim()
								}
							}
							const mA = txt.match(m_alig)
							if (mA) {
								for (const ma of mA) {
									switch (ma.trim()) {
										case aligL:
											align = 'left';
											break
										case aligC:
											align = 'center';
											break
										case aligR:
											align = 'right';
											break
										case cellV:
											isspan = true;
											break
									}
								}
								txt = txt.replace(m_alig, '') //все вычистил, сработал лишь первый							
							}

							// const len = mC ? mC.length - 1 : 0
							tds.push({
								txt: txt.replace(mschwa, Schwa).trim() + (issort ? ' ' : ''),
								isspan: isspan,
								issort: issort,
								stitle: stitle,
								vspan: '',
								cspan: cspan,
								align: align ? ` style="text-align:${align};"` : '',
								class: mC ? ` o5tab-td_${mC[0].substring(0, mC[0].length - 1).trim()}` : '',
								// class: (len > 0 && mC.indexOf(cellD)>0) ? ` o5tab-td_${mC.substring(0, len)}` : '',
							})
							txt = ''
							cspan = 0
						}
					}
					rows.push(tds)
				}
				let n = 0 // самый длинный рядок
				for (const tds of rows)
					if (n < tds.length) n = tds.length
				n = n - 1

				for (const tds of rows)
					if (n > tds.length) {
						let cspan = 0
						for (let i = 0; i < tds.length; i++)
							if (tds[i].cspan > 0)
								cspan += tds[i].cspan

						for (let i = tds.length + cspan; i < n; i++)
							tds.push({
								txt: '',
								isspan: false,
								issort: -1,
								stitle: '',
								vspan: '',
								cspan: 0,
								align: '',
								class: '',
							})
					}

				for (let i = 0; i < n; i++) { // перебо сначала по столбцам
					let cell = null,
						vspan = 0
					for (const tds of rows)
						if (i < tds.length) {
							const td = tds[i]
							if (td.isspan && cell) {
								cell.txt += ' ' + td.txt
								vspan++
							} else {
								if (vspan) {
									cell.vspan = ` rowspan=${vspan + 1}`
									vspan = 0
								}
								cell = td
							}
						}
				}

				const table = document.createElement('table')

				for (const attr of tag.attributes)
					if (attr.name != sel)
						table.setAttribute(attr.name, attr.value)

				let html = '<thead>\n',
					isbody = false
				for (const tds of rows) {
					let row = '',
						rcls = ''
					const head = tds.isth ? 'th' : 'td'
					if (!tds.isth && !isbody) {
						isbody = true
						html += '</thead>\n' + '<tbody>\n'
					}

					let k = 0
					for (const td of tds) {
						if (tds.isth) k++
						if (td.isspan) {
							if (td === tds[0])
								rcls = cc_span
						} else {
							const cls = td.class ? ` class="${td.class}"` : '',
								sort = td.issort >= 0 ? ` issort=${td.issort}` : '',
								cspan = td.cspan > 0 ? ` colspan=${td.cspan + 1}` : ''
							let titl = ''
							if (tds.isth && sort)
								for (const title of titles)
									if (title.k == k) {
										titl = ` title="${title.s}"`
										break
									}
							row += '<' + head + cls + sort + cspan + td.vspan + td.align + titl + '>' + td.txt + '</' + head + '>'
						}
					}
					html += '<tr' + tds.clsR + (rcls ? ` class="${rcls}"` : ``) + '>' + row + '</tr>\n'
				}
				if (isbody) html += '</tbody>\n'
				else html += '</thead>\n'

				html += '<tfoot>' + '</tfoot>\n'

				table.innerHTML = html

				table.style.opacity = 1

				const atag = tag.parentNode.insertBefore(table, tag)
				tag.parentNode.removeChild(tag)

				const thead = atag.tHead
				for (const row of thead.rows)
					for (const cell of row.cells)
						if (cell.hasAttribute('issort')) {
							cell.aO5tab = {
								up: true
							}
							cell.addEventListener('click', SortTab)
						}

				let odd = false
				for (const tbody of table.tBodies)
					for (const r of tbody.rows) {
						if (!r.classList.contains(cc_span))
							odd = !odd

						if (odd) r.classList.add(cc_odd)
					}
			}
		}

	function TabInit(e) {
		if (C.incdone) return // т.е. уже отработало после o5inc

		if (!C.avtonom)
			C.ParamsFill(W)

		if (o5debug > 0) console.log(`========  инициализация '${W.modul}'   ------` +
			`${C.avtonom ? ('автономно по ' + e.type) : 'из библиотеки'}`)

		PrepTables()

		if (!C.avtonom)
			C.E.DispatchEvent('olga5_sinit', W.modul)
	}

	if (C.avtonom) {
		const Find = (scripts, nam) => {
			const mnam = new RegExp('\\b' + nam + '\\b')
			for (const script of scripts) {
				const attributes = script.attributes
				for (const attribute of attributes) {
					if (attribute.value.match(mnam)) return true
				}
			}
		}
		if (Find(document.scripts, 'o5inc.js'))
			window.addEventListener('olga5-incls', W.Init)
		else
			document.addEventListener('DOMContentLoaded', W.Init)
		// window.addEventListener('olga5-incls', e=>{
		// 	C.incdone = true	
		// 	TabInit(e)
		// })
		// if (!window.olga5)
		// 	window.olga5 = {}

		if (!window.olga5) window.olga5 = []
		Object.assign(window.olga5, { PrepTables: PrepTables, })
		W.consts = C.consts

		PrepTables()
		if (o5debug)
			console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
	}
	else
		C.ModulAdd(W)

})();/* global document, window, console  */
/* exported olga5_menuPopDn_Click    */
/* jshint asi:true                   */
/* jshint esversion: 6               */
(function () { // ---------------------------------------------- o5pop ---
    let focusTime = 0

    const // phases = ['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE'],                
        pard = window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/),
        o5debug = (pard ? (pard[0].match(/=/) ? parseInt(pard[0].match(/\s*\d+/) || 1) : 1) : 2),
        eclr = 'background: yellow; color: black;',
        clrs = { //	копия из CConsole
            'E': `${eclr}border: solid 1px gold;`,
        },
        thisClass = 'olga5_popup',
        cls_Act = thisClass + '-Act',
        cls_errArg = thisClass + '-errArg',
        namo5css = thisClass + '_internal',
        dflts = { // тут все названия дб. в нижнем ренистре !!!
            moes: { text: '', group: '', head: '', },
            sizs: { width: 588, height: 345, left: -22, top: 11, innerwidth: null, innerheight: null, screenx: null, screeny: null, },
            wins: { alwaysraised: 1, alwaysontop: 1, menubar: 0, toolbar: 0, status: 0, resizable: 1, scrollbars: 0, },
        },
        C = window.olga5 ? window.olga5.C : { // заменитель библиотечного
            consts: {
                o5debug: o5debug
            },
            repQuotes: /^\s*((\\')|(\\")|(\\`)|'|"|`)?\s*|\s*((\\')|(\\")|(\\`)|'|"|`)?\s*$/g,
            ConsoleError: (msg, name, errs) => {
                const txt = msg + (name ? ' ' + name + ' ' : '')
                console.groupCollapsed('%c%s', clrs.E, txt)
                if (errs && errs.length > 0) console.table(errs)
                else console.error(txt)
                console.trace("трассировка вызовов :")
                console.groupEnd()
            },
            MakeObjName: obj => (obj ? (
                (obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
                    ('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
                    '.' + (obj.className ? obj.className : '?'))) : 'НЕОПР?'),
            GetTagsByQueryes: query => document.querySelectorAll(query), // второй аргумент - игнорится
            avtonom: true,
        },
        SetTagError = (tag, txt, errs) => { // добавление и протоколирование НОВЫХ ошибок для тегов
            const
                isnew = tag.title.indexOf(txt) < 0,
                first = tag.title == tag.aO5pop.title // .trim().indexOf('?') != 0

            if (first) tag.title = tag.aO5pop.title + ' ?-> ' + txt
            else if (isnew) tag.title = tag.title + '; ' + txt

            if (isnew) C.ConsoleError(`${txt} для тега : `, C.MakeObjName(tag), errs)
            if (!tag.classList.contains(cls_errArg))
                tag.classList.add(cls_errArg)
        },
        RemoveTagErrors = tag => { // добавление и протоколирование НОВЫХ ошибок для тегов            
            if (tag.classList.contains(cls_errArg)) {
                tag.title = tag.aO5pop.title
                tag.classList.remove(cls_errArg)
            }
        },
        AddPars = (pars, dests, errs, force) => {
            for (const _par in pars) {
                const par = _par.toLowerCase()
                let isp = false
                for (const nam in dflts) { // ['moes', 'sizs', 'wins']
                    const dflt = dflts[nam],
                        dest = dests[nam]
                    if (dflt.hasOwnProperty(par)) {
                        if (force || !dest.hasOwnProperty(par))
                            dest[par] = pars[_par]
                        isp = true
                        break
                    }
                }
                if (!isp)
                    errs.push(`неопределённый параметр '${par}' `)
            }
        },
        CopyPars = (pars, dests, errs, force) => {
            for (const nam in dflts) { // ['moes', 'sizs', 'wins']
                const srcs = pars[nam],
                    dest = dests[nam]
                for (const _par in srcs) { // например 'sizs'
                    const par = _par.toLowerCase()
                    if (force || !dest.hasOwnProperty(par))
                        dest[par] = srcs[_par]
                }
            }
        },
        dlmattr = /[\s'"`]*[,;][\s'"`]*/,
        dlmpar = /[\s'"`]*[:=][\s'"`]*/,
        SplitPars = (spar, pars, refs, errs, tagname) => {
            const ss = spar.split(dlmattr)
            for (const s of ss)
                if (s.trim()) {
                    const uu = s.split(dlmpar),
                        u0 = uu[0].replace(C.repQuotes, '')

                    if (uu.length == 1) refs[u0] = null
                    else {
                        const u1 = uu[1].replace(C.repQuotes, '')
                        let nam = u0.toLowerCase()
                        if (nam == 'id') refs[u1] = null
                        else {
                            if (nam.length == 1) {
                                if (nam == 'g') nam = 'group'
                                if (nam == 'n') nam = 'nocss'
                                else if (nam == 'w') nam = 'width'
                                else if (nam == 'h') nam = 'height'
                                else if (nam == 't') nam = 'top'
                                else if (nam == 'l') nam = 'left'
                            }
                            if (!pars.hasOwnProperty(nam))
                                pars[nam] = u1
                            else
                                errs.push(`для  '${tagname}' повтор параметра '${u0}' (без учета регистра и сокращения)`)
                        }
                    }
                }
                else if (ss.length > 0)
                    errs.push(`для  '${tagname}' отсутствие параметра в массиве параметров`)

            if (errs.length > 0)
                C.ConsoleError(`для  '${tagname}' ошибки при разборе строки аргументов`, spar, errs)
        }

    function GetPops(e, args) {
        'use strict'
        const tag = e.currentTarget,
            eve = e.type,
            CalcTagPars = (eve, tag, args, errs) => {
                if (!tag.aO5pop) {
                    tag.aO5pop = Object.assign({}, {
                        name: C.MakeObjName(tag),
                        title: tag.title,
                        tag: tag,
                        apops: {}
                    })
                    Object.freeze(tag.aO5pop)
                }

                const ap = tag.getAttribute(o5popup),
                    pops = tag.aO5pop.apops[eve] = {
                        tag: tag,
                        eve: eve, //для обратного поиска
                        url: '',
                        act: tag,
                        spar: '', // это просто для истории
                        key: tag.aO5pop.name + '(' + eve + ')' + e.timeStamp, // наименование окна
                        wins: {},
                        moes: {},
                        sizs: {},
                        swins: null,
                        smoes: null, // будут доопределены позже
                    }

                if (eve == click && ap) { // при клике 'o5popup' приоритетнее
                    const mm = ap.match(/\s*[;,]\s*/),
                        i = mm ? mm.index : 9999
                    // ss = ap.split(/\s*;\s*/)
                    pops.spar = ap.substring(i + 1)
                    if (tag.a5pop) {
                        const mtag = tag.a5pop.mtag,
                            popup = mtag.tag.attributes.o5popup
                        let url = ''
                        if (popup) {
                            const pars = mtag.tag.attributes.o5popup.nodeValue.split(/[;,]/)
                            url = pars[0].trim()
                            // if (!mtag.match())
                            pops.spar += ',' + mtag.id
                        }
                        pops.url = url ? url : mtag.tag.getAttribute('href')
                    }
                    else
                        pops.url = ap.substring(0, i).trim()
                } else {
                    const l = args.length,
                        nam = l > 0 ? args[0] : '' // имя объекта, на котором д.б. мигание,
                    pops.url = (l > 1) ? args[1] : ''
                    pops.spar = (l > 2) ? args[2] : ''
                    if (nam) {
                        const istr = typeof nam === 'string',
                            act = istr ? document.getElementById(nam) : nam

                        if (act) pops.act = act
                        else
                            errs.push(`для  '${tag.aO5pop.name}' не найден тег мигания '${istr ? nam : C.MakeObjName(nam)}'`)
                    }
                }

                if (C.DeCodeUrl) {
                    const o5attrs = tag ? C.GetAttrs(tag.attributes) : '',
                        ori = (pops.url || '').replace(C.repQuotes, ''),
                        url = (ori.trim() && !ori.match(/[\/.\\#]/)) ? (document.URL + '?o5nomnu#' + ori) : ori,
                        wref = C.DeCodeUrl(W.urlrfs, url, o5attrs)

                    if (wref.err)
                        errs.push(`Ошибка перекодирования url='${pops.url}':  ${wref.err}`)
                    pops.url = wref.url
                }

                Object.seal(pops)

                if (pops.spar) {
                    const refs = {},
                        pars = {}

                    SplitPars(pops.spar, pars, refs, errs, tag.aO5pop.name)
                    AddPars(pars, pops, errs, false)

                    for (const ref in refs) {
                        let itag = refs[ref]
                        if (!itag) {
                            if (itag !== '') {
                                itag = document.getElementById(ref)
                                if (itag) refs[ref] = itag
                                else {
                                    refs[ref] = '' // чтл бы больше не пытать
                                    errs.push(`для  '${tag.aO5pop.name}' в '${eve}' не найден ссылочный тег с id='${ref}'`)
                                }
                            }
                            if (!itag) continue
                        }
                        let iargs = null,
                            ieve = click
                        const iap = itag.getAttribute(o5popup)
                        if (iap) {
                            const ss = ap ? iap.split(/\s*;\s*/) : ['']
                            iargs = [''].concat(ss)
                        } else
                            for (const iattr of itag.attributes)
                                if (iattr.value.match(/\.*PopUp\s*\(/)) {
                                    iargs = iattr.value.match(/(['"])(.*?)\1/g) // внутри парных кавычек

                                    for (let i = 0; i < iargs.length; i++)
                                        iargs[i] = iargs[i].replace(C.repQuotes, '')
                                    ieve = iattr.name.replace('on', '').toLocaleLowerCase()
                                    break
                                }
                        if (iargs) {
                            CalcTagPars(ieve, itag, iargs, errs)
                            CopyPars(itag.aO5pop.apops[ieve], pops, errs, false)
                        } else {
                            errs.push(`для  '${tag.aO5pop.name}' в '${eve}' у тега с id='${ref}' отсутствует атрибут '${o5popup}'`)
                            refs[ref] = '' // чтл бы больше не пытать
                        }
                    }
                }
                return pops
            }

        let pops = null
        const errs = []

        if (tag.aO5pop && tag.aO5pop.apops && tag.aO5pop.apops[eve]) pops = tag.aO5pop.apops[eve]
        else
            pops = CalcTagPars(eve, tag, args, errs)

        if (pops.swins === null) {
            const doubles = {
                left: 'screenx',
                top: 'screeny',
                width: 'innerwidth',
                height: 'innerheight',
            },
                CalcSummString = nam => {
                    const pars = pops[nam],
                        ss = []
                    for (const par in pars) {
                        const v = ('' + pars[par]).trim(),
                            val = v.match(/[\d.,]+/) ? v : `'${v}'`
                        ss.push(par + '=' + val)
                    }
                    return ss.join(',')
                }

            for (const nam in dflts) { // ['moes', 'sizs', 'wins']
                const pars = dflts[nam],
                    dest = pops[nam]
                for (const _par in pars) { // например 'sizs'
                    const par1 = _par.toLowerCase(),
                        par2 = (nam === 'sizs') ? doubles[par1] : ''
                    if (!dest.hasOwnProperty(par1) && !(par2 && dest.hasOwnProperty(par2))) {
                        const v = pars[_par]
                        if (v !== null) dest[par1] = v
                    }
                }
            }

            CalcSizes(pops.sizs, errs, tag.aO5pop.name) //  для проверки корректности

            pops.swins = CalcSummString('wins')
            pops.smoes = CalcSummString('moes')

            Object.freeze(pops)
            for (const nam in dflts)
                if (dflts.hasOwnProperty(nam))
                    Object.freeze(pops[nam])
        }

        if (errs.length > 0)
            C.ConsoleError(`Ошибки обработки (цепочки) ссылок для тега `, C.MakeObjName(tag), errs)
        return pops
    }

    const wopens = [],
        click = 'click',
        o5popup = 'o5popup',
        aclicks = ['click', 'keyup', 'keydown', 'keypress'],
        DClosePops = () => ClosePops(null),
        W = {
            modul: 'o5pop',
            Init: Popups,
            Done: DClosePops,
            class: thisClass,
            consts: `		
                o5nocss=0;  // 0 - подключаются CSS'ы;
                o5timer=0.7 // интервал мигания ;
                o5params=''  // умалчиваемые для mos, sizs, wins;
			`,
        },
        attrs = document.currentScript.attributes,
        timerms = 1000 * ((attrs && attrs.o5timer) ? parseFloat(attrs.o5timer.value) : 2.1),
        o5css = `
.${thisClass},
.${thisClass + 'C'},
.${cls_Act} {
    cursor: pointer;
}        
.${thisClass}{    
	cursor: pointer;
	color: black;
	background-color: lavender;
	border-radius: 4px;
	border: 1px dashed gray;
}
b.${thisClass},
i.${thisClass},
u.${thisClass},
span.${thisClass},
 .${thisClass} {
    padding-left: 4px;				
    padding-right: 3px;
}
img.${thisClass} {
    border: none;
    background-color: transparent;
    position: relative;
}
.${cls_errArg} {
    opacity:0.5;
}
    /*  мигание вызвавшего тега
    */
.${cls_Act} {
    outline-offset: 2x;
    animation: blink ${timerms}ms infinite linear;
}
@keyframes blink {
    99% {outline: 2px dashed  black;outline-offset: 2x;}
    66% {outline: 3px dashed  white;}
    33% {outline: 2px dashed  black;}
    0% {outline: 3px dashed white;outline-offset: -2x;}
}
`,
        ClosePop = wopen => {
            if (o5debug > 1) console.log(`${W.modul}: ClosePop`.padEnd(22) +
                `${wopen.name}`.padEnd(22))
            if (wopen.time + 444 > (new Date()).getTime()) return

            const act = wopen.pops.act
            if (wopen.text)
                act[act.value ? 'value' : 'innerHTML'] = wopen.text

            if (act.classList.contains(cls_Act)) act.classList.remove(cls_Act)

            if (wopen.win.window && !wopen.win.window.closed) wopen.win.close()

            const i = wopens.indexOf(wopen)
            if (i > -1)
                wopens.splice(i, 1)

            if (wopens.length === 0) {
                window.clearInterval(wopens.tBlink)
                wopens.tBlink = 0
            }
        },
        CloseCloseds = () => {
            let i = wopens.length
            while (i-- > 0) {
                const wopen = wopens[i]
                if (wopen.win && wopen.win.closed) ClosePop(wopen)
            }
        },
        // DoBlinks = isnew => {
        DoBlinks = () => {
            CloseCloseds()
            if (wopens.length === 0) return

            for (const wopen of wopens)
                if (!wopen.noact && wopen.head !== '')
                    try { // тут м.б. ошибку по доступу из другого домена
                        const doc = wopen.win.document
                        if (doc) { // окно наконец-то загрузилось
                            const title = doc.title.trim()
                            if (!wopen.titlD && title) {
                                if (o5debug > 1) console.log(`${W.modul}: DoBlinks загрузилось`)
                                wopen.titlD = title
                                wopen.titlB = wopen.head ? wopen.head : title.replaceAll(/./g, '*') + '*'
                            }
                            doc.title = wopen.titlD == title ? wopen.titlB : wopen.titlD
                        }
                    } catch (e) {
                        wopen.noact = e.message
                        C.ConsoleError('DoBlink: прекращено по причине: "' + e.message + '"')
                    }
            wopens.tBlink = window.setTimeout(DoBlinks, timerms)
        },
        GetCSS = () => {
            const chs = document.head.children
            // let i = 0
            for (const ch of chs) {
                // if (i==14)
                // i=i
                // console.log(i++, ch.nodeName, ch.id, ch.id==namo5css)
                if (ch.nodeName.toUpperCase() == "STYLE" && ch.id == namo5css)
                    return ch
            }
        },
        IncludeCSS = () => { // подключение CSS'ов, встроенных в скрипт  (копия из o5com!.js)                
            let css = GetCSS()
            if (!css) {
                if (o5debug > 0)
                    console.log(`>>  СОЗДАНИЕ CSS   ${thisClass} (для модуля ${W.modul})`)
                const styl = document.createElement('style')
                styl.setAttribute('type', 'text/css')
                styl.id = namo5css
                css = document.head.appendChild(styl)
            } else
                if (o5debug > 0)
                    console.log(`>>  ИНЗМЕНЕНИЕ CSS   ${thisClass} (для модуля ${W.modul}) `)
            css.innerHTML = o5css.replace(/(\/\/.*($|\n))|(\s*($|\n))/g, '\n')
        },
        ClosePops = grp => { // закрыть все с такой группой и анонимные ('группа' типа 0)
            'use strict'
            if (wopens.length === 0) return
            let n = 0,
                i = wopens.length
            while (i-- > 0) {
                const wopen = wopens[i],
                    group = wopen.pops.moes.group

                if (grp == group || grp === null || !group) {      //|| typeof grp == 'event') {
                    ClosePop(wopen)
                    n++
                }
            }
            if (o5debug > 0)
                console.log(`${W.modul}: закрыты ${n} окон группы '${grp === null ? 'всё' : grp}'`)
        },
        CalcSizes = (sizs, errs, tagname) => {
            'use strict'
            const screen = window.screen,
                she = screen.height,
                swi = screen.width,
                GetVal = nam => {
                    const u = sizs[nam] // м.б. как строка так и число
                    if (u) {
                        const isw = nam == 'width' || nam == 'left' || nam == 'innerwidth' || nam == 'screenx',

                            v = parseFloat(u),
                            // va = Math.abs(v),   mperc = /\s*[\d.,]*%\s*/
                            val = (u.match && u.match(/\s*[\d.,]+%\s*/)) ? (0.01 * v * (isw ? swi : she)) : v // размер в пикселах]
                        // val= (u.match && u.match(mperc))?( 0.01 * val * (isw ? swi : she) - 0.5 * (isw ? wi : he)):va
                        return {
                            isw: isw,
                            val: val,
                        }
                    }
                }
            let ss = [],
                wi = 0,
                he = 0,
                dtps = {
                    w: false,
                    h: false,
                    l: false,
                    t: false
                },
                CheckDubl = (nam, m1, m2, x, txt) => {
                    if (nam.match(m1) || nam.match(m2)) {
                        if (dtps[x]) errs.push(`для  '${tagname}' дублирование ` + txt)
                        dtps[x] = true
                    }
                }

            for (const nam of ['width', 'height', 'innerwidth', 'innerheight']) {
                const z = GetVal(nam)
                if (z) {
                    const val = Math.abs(z.val)

                    if (z.isw) wi = val
                    else he = val
                    ss.push(nam + '=' + parseInt(val))
                    if (errs) {
                        CheckDubl = (nam, /width/, /innerwidth/, 'w', 'ширины окна')
                        CheckDubl = (nam, /height/, /innerheight/, 'h', 'высоты окна')
                        if (val < 100) errs.push(`для  '${tagname}' значение '${nam}' меньше 100`)
                    }
                }
            }

            const aW = screen.availWidth,
                aH = screen.availHeight,
                RePos = (val, actW, maxW, minL) => {
                    let x = val
                    if (x > maxW) x = maxW - actW
                    if (x > -1) x = minL + x
                    else x = minL // + x + maxW - actW - 4
                    return x
                }
            for (const nam of ['left', 'top', 'screenx', 'screeny']) {
                const z = GetVal(nam)
                if (z) {
                    const isw = z.isw,
                        v = z.val < 0 ? (isw ? aW + z.val - wi : aH - z.val - he) : z.val,
                        val = RePos(v, isw ? wi : he, isw ? aW : aH, isw ? screen.availLeft : screen.availTop)

                    ss.push(nam + '=' + parseInt(val))
                    if (errs) {
                        CheckDubl = (nam, /left/, /screenx/, 'l', 'левой позиции')
                        CheckDubl = (nam, /top/, /screeny/, 't', 'верхней позиции')
                    }
                }
            }
            return ss.join(',')
        },
        optsFocus = {
            capture: true,
            moja: 'fignia'
        },
        Focus = e => {
            if (wopens.length === 0 || focusTime == e.timeStamp) return

            focusTime = e.timeStamp
            window.setTimeout(() => {
                for (const wopen of wopens)
                    wopen.win.focus()
            }, 1)
            if (o5debug > 1)
                console.log(`${W.modul}: Focus для ${wopens.length} тегов (${e.eventPhase}, ${e.isTrusted ? 'T' : 'f'}, ${e.timeStamp.toFixed(1).padEnd(6)}, ${e.type})`)
        },
        o5nocss = attrs && attrs.o5nocss && attrs.o5nocss.value,
        doneattr = W.modul + '-done'

    function WindowOpen(pops, s) {
        const url = pops.url
        if (url && url.length > 1) {
            // let isref = false
            if (url[0] == '#') {
                const id = url.substring(1),
                    tag = document.getElementById(id)
                if (tag) {

                } else {
                    C.ConsoleError(`PopUp: ссылка на отсутствующие внутренний тег:`, id)
                    return
                }
            }
            return window.open(url, pops.key, s)
        }
    }

    function ShowWin(pops) {
        'use strict'
        if (o5debug > 1) console.log(`${W.modul}: ShowWin`.padEnd(22) +
            `${C.MakeObjName(pops.tag)}`.padEnd(22) +
            `${C.MakeObjName(pops.act)}, '${pops.eve}') `)

        const tag = pops.tag,
            wopen = wopens.find(wopen => wopen.pops.tag == tag && wopen.pops.eve == pops.eve)

        if (wopen) { // повтор события на теге - закрываю всплытое окно!
            ClosePop(wopen)
            return
        }

        ClosePops(pops.moes.group)

        const sizs = CalcSizes(pops.sizs),
            s = sizs + ',' + pops.swins,
            win = WindowOpen(pops, s)
        if (win) {
            const wopen = {
                pops: pops,
                win: win,
                head: pops.moes.head,
                text: '',
                titlD: '',
                titlB: '',
                noact: '',
                name: tag.aO5pop.name,
                time: (new Date()).getTime() // отстройка от "дребезжания"o5contents
            }
            const act = pops.act

            if (pops.moes.text) { // для анонимных - не менять текст
                wopen.text = act.value ? act.value : act.innerHTML
                act[act.value ? 'value' : 'innerHTML'] = pops.moes.text
            }
            RemoveTagErrors(tag)

            wopens.push(wopen)

            if (timerms > 99 && tag.classList.contains(thisClass)) {
                act.classList.add(cls_Act)
                if (wopens.tBlink)
                    window.clearInterval(wopens.tBlink)
                DoBlinks(true)
            }
        } else
            if (!aclicks.includes(pops.eve))
                SetTagError(tag, `создание окна по событию '${pops.ve}'`, [`вероятно следует снять запрет на всплытие окон в браузере`])

        return sizs + ',\n' + pops.swins + ',\n' + pops.smoes
    }

    function PopUp() {
        if (arguments.length < 0 || arguments.length > 3) {
            C.ConsoleError(`PopUp: ошибочное к-во аргументов='${arguments.length}'`, [` у PopUp() их д.б. от 1 до 3)`])
            return '?'
        }

        let caller = arguments.callee
        while (caller.caller)
            caller = caller.caller

        const e = caller.arguments[0],
            pops = GetPops(e, arguments)

        if (e.target.nodeName != "A" || !e.target.hasAttribute('href')) {
            e.cancelBubble = true
            return ShowWin(pops)
        }

    }

    function PopShow() { //  устарешая обёртка  ---- width, height, url
        if (arguments.length == 3 && !isNaN(arguments[0]) && !isNaN(arguments[1])) {
            let caller = arguments.callee
            while (caller.caller)
                caller = caller.caller

            const e = caller.arguments[0],
                pops = GetPops(e, ['', arguments[2], `width=${arguments[0]}, height=${arguments[1]}`])
            e.cancelBubble = true
            return ShowWin(pops)
        } else {
            C.ConsoleError(`PopShow: ошибочно к-во или тип аргументов [${arguments.join(', ')}]`)
            return '?'
        }
    }

    function Popups(e) {
        'use strict'
        if (!C.avtonom)
            if (o5nocss || GetCSS()) C.ParamsFill(W) // CSS сохранилось после автономного создания
            else // иначе - никак, т.к. не известно, кто раньше загрузится
                C.ParamsFill(W, o5css) // CSS пересоздаётся (для Blogger'а)

        if (o5debug > 0) console.log(`========  инициализация '${W.modul}'   ------` +
            `${C.avtonom ? ('автономно по ' + e.type) : 'из библиотеки'}`)

        focusTime = 0

        let o5c = null
        const tags = C.GetTagsByQueryes('[' + o5popup + ']'),
            mids = [],
            o5contents = 'o5contents',
            AskRefTag = (tag0, params) => {
                const mcc = params[0].match(/^\s*id=\s*\w+\b/i)
                if (!mcc) return

                const ss = mcc[0],
                    id = ss.split('=')[1].trim(),
                    mid = mids.find(mid => mid.mtag && mid.mtag.id == id),
                    errid = `========  ссылочный id='${id}'`

                if (!o5c) o5c = document.getElementById(o5contents)
                if (!o5c)
                    return `${errid} не найден контент=${o5contents} <li>`

                let mtag = mid ? mid.mtag : null

                if (!mtag) {
                    for (let i = 0; i < o5c.children.length; i++) {
                        const child = o5c.children[i]
                        let tag = null
                        if (child.id == id) tag = child
                        else tag = child.querySelector('#' + id)
                        if (tag) {
                            mtag = { i: i + 1, tag: tag, id: id }
                            break
                        }
                    }
                    if (!mtag)
                        return `${errid} отсутствует в '${o5contents}'`

                    mids.push(mtag)
                }

                const tag = mtag.tag

                //     mpopup = tag.attributes.o5popup
                // if (!mpopup)
                //     return `${errid} не содержит 'o5popup'`

                // const mparams = mpopup.nodeValue.split(/[;,]/)
                // let mli = tag.parentNode

                // while (mli.nodeName != 'LI')
                //     mli = mli.parentNode

                // if (!mli)
                //     return `${errid} не принадлежит <li>`

                tag0.classList.add(o5contents)
                tag0.title = tag0.title + (tag0.title ? ' ' : '') + tag.innerText
                // let s1 = tag0.innerText,
                //     s2 = (tag0.innerText ? '+' : ''),
                //     s3 = tag0.innerText + (tag0.innerText ? ' ' : '') + `[  ${mtag.i} ]`
                tag0.innerHTML = tag0.innerText + (tag0.innerText ? ' ' : '') + `[&#8202;${mtag.i}&#8202;]`
                tag0.a5pop = { mtag: mtag }
                // tag.attributes.o5popup+=',' + id
            }

        if (tags)
            for (const tag of tags) {
                if (tag.getAttribute(doneattr)) {
                    console.error('%c%s', eclr, `(========  повтор инициализации для id='${tag.id}'`)
                    continue
                }
                tag.setAttribute(doneattr, 'OK')
                const params = tag.attributes.o5popup.nodeValue.split(/[;,]/)
                if (params.length > 0) {
                    let err = AskRefTag(tag, params)
                    if (err) {
                        console.error('%c%s', eclr, err + ` (для id='${tag.id}')`)
                        continue
                    }

                    if (!o5nocss && !tag.classList.contains(thisClass) && !params.find(param => param.match(/\bnocss\b/i)))
                        tag.classList.add(thisClass)

                    tag.addEventListener(click, PopUp)
                }
            }

        for (const eve of ['focus', 'click'])
            window.addEventListener(eve, Focus, optsFocus) // т.е. e.eventPhase ==1

        window.addEventListener(click, ClosePops)

        document.addEventListener('visibilitychange', DClosePops) // для автономной работы

        if (!o5nocss) // т.е. если явно НЕ запрещено    
            IncludeCSS()

        const errs = []
        if (attrs && attrs.o5params) {
            const pars = {},
                refs = {} // тут - refs не нуже
            SplitPars(attrs.o5params, pars, refs, errs)
            AddPars(pars, dflts, errs, false, 'конфиг.')
        }
        if (errs.length > 0)
            C.ConsoleError(`Ошибки формирования параметров окна (из url'а):`, errs.length, errs)

        window.dispatchEvent(new CustomEvent('olga5_sinit', {
            detail: {
                modul: W.modul
            }
        }))
        // C.E.DispatchEvent('olga5_sinit')
    }

    if (C.avtonom) {
		const Find = (scripts, nam) => {
			const mnam = new RegExp('\\b' + nam + '\\b')
			for (const script of scripts) {
				const attributes = script.attributes
				for (const attribute of attributes) {
					if (attribute.value.match(mnam)) return true
				}
			}
		}
		if (Find(document.scripts, 'o5inc.js'))
			window.addEventListener('olga5-incls', W.Init)
		else
			document.addEventListener('DOMContentLoaded', W.Init)

        // document.addEventListener('DOMContentLoaded', W.Init)
        // document.addEventListener('olga5-incls', W.Init)
        if (!window.olga5) window.olga5 = []
        Object.assign(window.olga5, {
            PopUp: PopUp,
            PopShow: PopShow
        })

        if (o5debug)
            console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
    } else 
        C.ModulAdd(W)   


})();/* -global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5mnu ---
	'use strict'
	const
		C = window.olga5.C,
		W = {
			modul: 'o5mnu',
			Init: Init,
			class: 'olga5_menu',
			consts: 'o5menudef=; scrollY=-18'
		},
		class_empty = W.class + '_empty',
		class_small = W.class + '_small',
		o5css = `
.${W.class} {
    margin: 0 !important;
    padding: 0 !important;
    font-size: small;
    height: min-content;
    width: max-content;
    z-index: 1111111;
    top: 1px;
    right: 1px;
    position: unset; /* будут присвоено ниже */
    display: initial; 
}
.${W.class}.Left {left: 1px; right:''}

/*.${class_small} {
	width: 144px;
	text-align: center ! important;
	text-align: -moz-center;
	text-align: -webkit-center;
	font-size: smaller ! important;
	line-height: 11px ! important;
}*/

.${W.class} ul {
    margin: 0;
    padding: 0;
    border-radius: 2px;
    display: grid;    /* иначе переносит строки последующего пункта при открытии подменю */
}

.${W.class} li {
    display: block;
    color: white;
    background: gray;
    height: 1.5em;
    text-align: left;
	text-align: -webkit-left;
	text-align: -moz-left;
    border-bottom: 0.01em solid lightseagreen;
    padding: 1px 5px 1px 2px;
    cursor: pointer;
    font-family: sans-serif;
    font-size: small;
    margin-bottom: 0 !important;
    padding-top: 0 !important;
    padding-bottom: 0 !important;
}

.${W.class} li>ul {
    position: absolute;
    top: unset;
    display: none;
    padding: 0;
    margin: 0;
    border: 1px solid darkgrey;
    outline: 1px solid white;
    float: right;
}
.${W.class}.Left li>ul {float: left;}

.${W.class}>li {
    background-color: white;
    border: none;
    border-radius: 8px;
    background-color: transparent;	
	text-align: right;
	text-align: -moz-right;
	text-align: -webkit-right;
	// text-align: -moz-left;
}

.${W.class}.Left>li {
    text-align: left;
	text-align: -webkit-left;
	text-align: -moz-left;
}

.${W.class}>li>ul {
    outline: 1px solid bisque;
    top: 0.5em;
    position: relative;
    right: 0.1em;
}

.${W.class}>li>ul {left: 0.1em;}
.${W.class}>li>ul>li>ul { right: 3.1em; margin-top: -4px;}
.${W.class}>li>ul>li>ul>li>ul { right: 6.1em; margin-top: -3px;}
.${W.class}>li>ul>li>ul>li>ul>li>ul { right: 9.1em; margin-top: -3px;}
.${W.class}>li>ul>li>ul>li>ul>li>ul>li>ul { right: 12.1em; margin-top: -3px;}
.${W.class}.Left>li>ul {left: 0.1em;}
.${W.class}.Left>li>ul>li>ul { left: 3.1em; margin-top: -4px;}
.${W.class}.Left>li>ul>li>ul>li>ul {left: 6.1em; margin-top: -3px;}
.${W.class}.Left>li>ul>li>ul>li>ul>li>ul {left: 9.1em; margin-top: -3px;}
.${W.class}.Left>li>ul>li>ul>li>ul>li>ul>li>ul {left: 12.1em; margin-top: -3px;}

.${W.class} li>span {
    display: flex;
    padding-left: 6px;
    height: 100%;
    align-items: center;
    width: max-content;
    justify-content: flex-start;
    overflow: hidden;
}

.${W.class}>li>span {
    border: 1px solid darkgray;
    border-radius: 8px;
    color: black;
    background-color: yellow;
    padding: 3px 4px 2px 4px;
    justify-content: center;
    height: min-content;
	// width: -moz-min-content;
	width: fit-content;
}

.${W.class} li:hover {
    color: black;
    background-color: lavender;
}

.${W.class}>li:hover {
    background: transparent;
    height: 3em;
}

.${W.class}>li:hover>span {
    color: white;
    background: gray;
    border: 0.01em solid lightseagreen;
    padding-bottom: 4px;
}

.${W.class} li:hover>ul,
.${W.class} li>ul:hover {
    display: block;
}

.${W.class} li:active>ul {    /* для корректного "гашения" - д.б. ПОСЛЕДНИМ ! */
    display: none;
}
.main-outer {
    background-color: ghostwhite;
    border: 1px solid navajowhite;
}

.${class_empty} {
    height: 2px ! important;
    background-color: aqua ! important;
}

.olga5-menuhidden{
	display:none;
}
`,

		// const phases = ['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE',]
		win = { target: '_self', resize: true, scrollX: 0, scrollY: -18, }, // blockclick: false, timclick: 0 },
		Target = function (e) {
			let target = e.toElement || e.target
			while (target && !target.o5menus) target = target.parentElement
			return target
		},
		OnMnu = function (e) {
			const target = Target(e)
			if (target && !target.o5menus.ready) target.o5menus.ready = true
		},
		GoTo = function (o5menus) {
			const tag = document.getElementById(o5menus.ref)
			if (tag) {
				tag.scrollIntoView({ block: o5menus.block, behavior: "smooth" })
				return true
				// if (win.scrollY != 0) window.scrollBy(0, win.scrollY)
			} else
				C.ConsoleError("GoTo: не определён тег в текущем окне: ", o5menus.ref)
		},
		DoMnu = e => {
			if (C.consts.o5debug)
				console.log('DoMnu: ' + e.type + ' ' + e.eventPhase + ' ' + e.timeStamp.toFixed(1).padEnd(6))
			const target = Target(e)
			if (target && target.o5menus.ready) {
				const o5menus = target.o5menus
				o5menus.ready = false

				let ok = true
				if (o5menus.isext) window.open(o5menus.ref, win.target)
				else
					ok = GoTo(o5menus)

				if (ok && win.resize) {
					if (window.olga5.o5shp)
						window.olga5.o5shp.DoResize('из o5mnu')
				}
				win.blockclick = true
				e.cancelBubble = true
			}
		},
		Clear = e => {
			if (C.consts.o5debug)
				console.log('Clear: ' + e.type + ' ' + e.eventPhase + ' ' + e.timeStamp.toFixed(1).padEnd(6) +
					' ' + (win.blockclick ? 'очищаю' : ''))
			if (win.blockclick) {
				win.blockclick = false
				e.cancelBubble = true
			}
			// // win.timclick = e.timeStamp
			// e.cancelBubble = true
		},
		MnuInit = function (items) {
			if (C.consts.o5nomnu > 0) return

			const proc = 'MnuInit',
				errs = []
			if (!items || !items[0]) errs.push(`${proc}: не определеныа структура меню`)
			if (errs.length == 0) {
				const uls = [],
					item0 = items[0],
					base = item0.base || ''

				const id = item0.id || ''
				if (id && document.getElementById(id)) errs.push(`${proc}: повтор создания меню с id='${id}'`)

				if (item0.target) {
					win.target = item0.target
					win.resize = false
				}
				if (W.consts.scrollY) win.scrollY = parseInt(W.consts.scrollY)

				let ul = document.createElement("ul")

				ul.id = id
				ul.className = W.class
				if (item0.right) ul.style.right = item0.right
				else if (item0.left) {
					ul.style.left = item0.left
					ul.classList.add('Left')
				}
				if (item0.top) ul.style.top = item0.top

				let owner = document.body
				if (item0.owner) {
					if (typeof item0.owner === 'object') owner = item0.owner
					else {
						const own = item0.owner.trim(),
							xwner = (!own || own.match(/\.body\b/)) ? document.body : document.querySelector(own)

						if (xwner) owner = xwner
						else
							C.ConsoleError(`${proc}: нет owner'а для '${own}'`)
					}
				}
				if (item0.position) ul.style.position = item0.position
				else if (!item0.owner) ul.style.position = 'fixed'
				else ul.style.position = 'absolute'

				if (ul.style.position == 'absolute') {
					const nst = window.getComputedStyle(owner),
						position = nst.getPropertyValue('position')
					if (position != 'absolute')
						C.ConsoleError(`${proc}: контейнер ${C.MakeObjName(owner)} для меню '${C.MakeObjName(ul)}' имеет position='${position}' (не ''absolute)`)
				}
				if (item0.noremov) owner.insertBefore(ul, owner.firstChild)  // НЕ удаляется по закрытии страницы (owner.appendChild(ul))				
				else
					C.page.InsertBefore(owner, ul, owner.firstChild)

				ul.addEventListener('mousedown', DoMnu, true)
				ul.addEventListener('click', DoMnu, true)
				// window.addEventListener('click', Clear, true)
				C.E.AddEventListener('click', Clear, true)

				uls[0] = ul
				const blc = (item0.block || 's')[0].toLowerCase(),
					block = blc == 's' ? 'start' : (blc == 'e' ? 'end' : (blc == 'n' ? 'nearesr' : 'center'))

				let m = 0
				for (const item of items) {
					const li = document.createElement('li')

					// li.addEventListener('click', Clear, true) 
					li.style.zIndex = 99999
					li.o5menus = { isext: true, block: block }
					if (item.ref) {
						const ref = item.ref || '',
							wl = window.location
						if (ref.length == 0) li.o5menus.ref = wl.origin + wl.pathname
						else if (C.IsFullUrl(ref)) li.o5menus.ref = ref // (ref.match(/^\s*(https?:)\/\//)) li.o5menus.ref = ref
						else if (ref.match(/\.html?($|\?|&|#)/)) li.o5menus.ref = base + ref
						else {
							li.o5menus.ref = ref[0] == '#' ? ref.substr(1) : ref
							li.o5menus.isext = false
						}
					}

					if (item.title) li.title = item.title
					if (item.class) li.classList.add(item.class)
					if (item.style) li.style = item.style

					if (m == 0)
						li.onmouseover = OnMnu

					ul.appendChild(li)

					if (item.span && item.span != '') {
						const span = document.createElement('span')
						span.innerText = item.span
						li.appendChild(span)
					} else
						li.classList.add(class_empty)

					if (item.add) {
						ul = document.createElement("ul")
						ul.style.width = item.add
						li.appendChild(ul)
						uls[++m] = ul
					} else if (item.ret) {
						m = m - item.ret
						if (m < 0) {
							errs.push('m: item.ret=' + item.ret + ', ')
							m = 0
						}
						ul = uls[m]
					}
				}
			}
			if (errs.length > 0)
				C.ConsoleError("${proc}: ошибки создания меню: ", errs.length, errs)
		}

	function Init() {
		const
			InitByText = menu => {// если есть такой атрибут}
				const regval = /^["'`;{\s]*|["'`},\s]*$/g,
					lis = menu.match(/{[^}]*}/g) || [],
					items = [],
					errs = []

				for (const li of lis) {
					const pairs = li.match(/[^,]+(,|})/g),
						item = {}
					for (const pair of pairs) {
						try {
							const i = pair.indexOf(':'),
								nam = pair.substr(0, i).replaceAll(regval, ''),
								val = pair.substr(i + 1).replaceAll(regval, '')
							item[nam] = val
						} catch (err) {
							errs.push({ li: li, pair: pair, err:err.message })
						}
					}
					items.push(item)
				}
				if (errs.length > 0)
					C.ConsoleError("Init: ошибки в строках атрибута 'o5menudef': ", errs.length, errs)

				MnuInit(items)
			}

		if (C.consts.o5nomnu > 0) C.ConsoleInfo(`Меню отключено по o5nomnu=${C.consts.o5nomnu}`)
		else {
			if (!W.isReady) {
				C.ParamsFill(W, o5css)
				window.olga5.Menu = MnuInit
			}

			const menu = (W.consts['o5menudef'] || '').trim()
			if (menu)	// если есть такой атрибут}
				InitByText(menu)

			const tags = C.GetTagsByClassNames('olga5-menuhidden', W.modul)
			if (tags)
				tags.forEach(tag => {
					InitByText(tag.innerText.trim())	//, tag)
				})
		}
		// window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		C.E.DispatchEvent('olga5_sinit', W.modul)
	}

	C.ModulAdd(W)
})();
