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
		W.consts = C.consts

		PrepTables()
		if (o5debug)
			console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
	}
	else
		C.ModulAdd(W)

	Object.assign(window.olga5, { PrepTables: PrepTables, })

})();