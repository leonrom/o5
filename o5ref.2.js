/* global document, window, console, Object, Map*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/*eslint no-useless-escape: 0*/
(function () {              // 3---------------------------------------------- o5ref ---
	'use strict';

	const
		C = window.olga5.C,
		currentScript = document.currentScript,
		W = {
			modul: 'o5ref',
			Init: RefInit,
			consts: 'o5tag_attrs=;o5tag_table="§¶▸▹↢⇔↣ₔᐞ"',
			urlrfs: '',
		},
		ParseTagAttrs = params => {
			const errs = [],
				otags = {}
			// aa=onYouTubeIframeAPIReady
			for (const pnam in params) {
				const param = params[pnam]
				if (!param)
					errs.push({ 'где': `nam='${pnam}'`, err: `пустой параметр` })
				else {
					const regexp = /\s*[,;]+\s*/g,
						nams = pnam.split(regexp),
						attrs = param.split(regexp)

					for (const attr of attrs)
						if (attr && attr.match(/\s+/)) {
							errs.push({ par: `в значении '${pnam}=${attr}'`, err: `пробелы заменены ','` })
							attr.replace(/\s+/g, ',')
						}

					for (const nam of nams) {
						if (!nam) {
							errs.push({ par: `nam='${nam}'`, err: `пустой 'тег' в параметре` })
							continue
						}
						if (!otags[nam]) otags[nam] = {}
						for (const attr of attrs) {
							if (attr)
								if (!otags[nam][attr]) otags[nam][attr] = 0// счетчик использования
						}
					}
				}
			}
			if (errs.length > 0)
				C.ConsoleError(`Ошибки в параметрах`, 'o5tag_attrs', errs)
			return otags
		},
		ConvertUrls = otags => {
			let tagnams = ''
			for (const nam in otags)
				tagnams += (tagnams ? ',' : '') + nam

			const tags = C.GetTagsByTagNames(tagnams, W.modul),
				undefs = [],
				rez = []

			for (const tag of tags) {
				const nam = C.MakeObjName(tag),
					attrs = otags[(tag.tagName.toLowerCase())],
					o5attrs = C.GetAttrs(tag.attributes)

				for (const attr in attrs)
					if (attr) {
						const tagattr = tag.attributes[attr]
						if (tagattr) {
							const ori = tagattr.nodeValue,
								wref = C.DeCodeUrl(W.urlrfs, ori, o5attrs),
								anew = attr.replace(/(data-)|(_)/, '')
							// anew = (attr[0] == '_') ? attr.substring(1) : attr

							if (wref.err)
								undefs.push({ 'имя (refs)': nam, 'атрибут': attr, 'адрес': ori, 'непонятно': wref.err })

							if (wref.url && (ori != wref.url || attr != anew)) {
								if (attr != anew)     	// если обработано без ошибок, то удаляю - чтоб другие модули не повторяли
									tag.removeAttribute(attr)

								tag.setAttribute(anew, wref.url)

								rez.push({ nam: nam, attr: (attr + (anew != attr ? ` (${anew})` : ``)), src: ori, rez: wref.url })
								attrs[attr]++
							}
						}
					}
			}

			if (rez.length < 1) C.ConsoleError(`${W.modul}: не выполнено ни одной подстановки?`)
			else
				if (C.consts.o5debug > 0) C.ConsoleInfo(`${W.modul}: выполнено подстановок для тегов:`, rez.length, rez)

			if (undefs.length > 0)
				C.ConsoleError(`${W.modul}: неопределённые адреса: `, undefs.length, undefs)
			// if (unreal.length > 0) C.ConsoleAlert(`${W.modul}: непонятные адреса: `, unreal.length, unreal)
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
				m_line = new RegExp('\\s*[\\n' + d_line + ']+\\s*', 'gm'),		// разделитель строк
				m_cell = new RegExp('\\s*(\\d*' + cellD + '|' + cellC + ')\\s*', 'g'),	// разделитель ячеек (для '▸' - с числом)
				m_Cell = new RegExp('[^' + cellC + cellD + ']*([' + cellC + cellD + ']|$)', 'g'),  // содержимое ячейки
				m_alig = new RegExp('\\s*[' + aligL + aligC + aligR + cellV + ']\\s*', 'g'), // признак выравнивания и объединения
				mschwa = new RegExp(schwa + '.{1}', 'g'),
				Schwa = s => '<sup>' + s.substring(1) + '</sup>'
			// проверить с d_line				

			for (const tag of tags) {
				const ss = tag.innerHTML.split(m_line),
					rows = []
				for (const s of ss) {
					if (!s || s.match(/^\s*#/)) continue

					if (s[s.length - 1] == d_line) s[s.length - 1] = ' '
					if (s[0]==d_head){
						s[0]=' '
					}

					const cells = s.match(m_Cell),
						tds = []

					let txt = '',
						cspan = 0,
						ih = cells[0] ? cells[0].indexOf(d_head) : -2

					const isth = ih >= 0 

					for (const cell of cells) {
						const mCs = cell.match(m_cell),
							mC = mCs && mCs.length > 0 ? mCs[0].trim() : null,
							u = cell.replace(m_cell, '')  // в объединённой ячейке объединяем отдельные слова. Чтобы раздельно - через &nbsp;						

						if (!mC && !u) continue	// это пустая (незакрытая) ячейка в конце строки справа

						if (ih < 0) txt += u
						else {
							txt += u.substring(ih + 1).trim()
							ih = -3 // чтоб только один раз
						}

						if (mC && mC[0] == cellC) cspan++
						else {
							let align = '',
								isspan = false

							const mA = txt.match(m_alig)
							if (mA) {
								for (const m of mA) {
									switch (m.trim()) {
										case aligL: align = 'left'; break
										case aligC: align = 'center'; break
										case aligR: align = 'right'; break
										case cellV: isspan = true; break
									}
								}
								txt = txt.replace(m_alig, '') //все вычистил, сработал лишь первый							
							}

							const len = mC ? mC.length - 1 : 0
							tds.push({
								isth: isth,
								txt: txt.replace(mschwa, Schwa),
								isspan: isspan,
								vspan: '',
								cspan: cspan ? ` colspan=${cspan + 1}` : '',
								align: align ? ` style="text-align:${align};"` : '',
								class: len > 0 ? ' class="cellD_' + parseInt(mC.substring(0, len)) + '"' : '',
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

				for (const tds of rows)
					if (n > tds.length)
						for (let i = tds.length; i < n; i++)
							tds.push({
								isth: tds[0].isth, txt: '', isspan: false, vspan: '', cspan: '', align: '', class: '',
							})

				for (let i = 0; i < n; i++) {	// перебо сначала по столбцам
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

				let html = '',
					odd = -1
				for (const tds of rows) {
					let row = '',
						cls = ''
					for (const td of tds){
// if (td.txt=='кясратан')						
// console.log()
						if (td.isspan) {
							if (td === tds[0])
								cls = 'o5table-span'
						}
						else {
							if (td === tds[0])
								odd = -odd
							const head = td.isth ? 'th' : 'td'
							row += '<' + head + td.class + td.cspan + td.vspan + td.align + '>' + td.txt + '</' + head + '>'
						}}
					if (odd > 0) cls += ' o5table-odd'
					html += '<tr' + (cls ? ` class="${cls}"` : ``) + '>' + row + '</tr>\n'
				}
				table.innerHTML = html

				table.style.opacity = 1
				// table.tBodies[0].style.verticalAlign='bottom';

				tag.parentNode.insertBefore(table, tag)
				tag.parentNode.removeChild(tag)
			}
		},
		PrepTubes = () => {
			let YT = null
			const sel = 'o5youtube',
				tags = C.GetTagsByQueryes('[' + sel + ']'),
				onPlayerReady = e => {
					const aO5 = e.target.g.aO5
					if (!aO5.ready) { // при первой установке статуса удаляю фон чтоб не выглядывал
						aO5.ready = true
						aO5.tag.removeAttribute('style')
						if (aO5.style)
							aO5.tag.setAttribute('style', aO5.style)
					}
					// console.log(1)
				},
				onPlayerStateChange = e => {
					const act = e.target.getPlayerState(),
						aO5 = e.target.g.aO5
					let s = ''
					switch (act) {
						case 0: s = 'воспроизведение видео завершено'; break
						case 1: s = 'воспроизведение'; break
						case 2: s = 'пауза'; break
						case 3: s = 'буферизация'; break
						case 5: s = 'видео находится в очереди'; break
						default: s = 'воспроизведение видео не началось'
					}
					// console.log(aO5.tag.id, 2, act, s)
					if (act == 1) {
						window.dispatchEvent(new CustomEvent('olga5_stopPlay', { detail: { tag: aO5.tag, type: 'yt', } }))
					}
				},
				onYtReady = e => {	//	
					YT = window.YT
					// console.log(4)
				},
				AddFrame = e => {
					if (YT === null) {
						YT = 0
						const script = document.createElement('script')
						script.src = "https://www.youtube.com/iframe_api"

						script.onload = function () {
							window.YT.ready(onYtReady)
						}
						script.onerror = function () {
							C.ConsoleError("ошибка загрузки YouTube API ", this.src)
						}

						// var firstScriptTag = document.getElementsByTagName('script')[0]
						// firstScriptTag.parentNode.insertBefore(script, firstScriptTag)
						currentScript.parentNode.insertBefore(script, currentScript)
					}

					const tag = e.target,
						aO5 = tag.aO5yt

					if (YT && YT.loaded) {
						const x = document.createElement('div'),	// кандидат на намену через iFrame
							div = tag.appendChild(x)

						if (aO5.chkmove) {
							if (aO5.chkmove == 'wait')
								tag.removeEventListener('mousemove', AddFrame)
							tag.aO5yt.chkmove = ''
						}

						aO5.player = new window.YT.Player(div, {
							height: 'inherit',
							width: 'inherit',
							videoId: aO5.videoId,
							events: {
								'onReady': onPlayerReady,
								'onStateChange': onPlayerStateChange
							}
						})
						aO5.iframe = aO5.player.getIframe()
						aO5.iframe.aO5 = aO5

						// tag.addEventListener('olga5_stopPlay', e => {
						// 	// console.log(aO5.tag.id, 5)
						// 	e.target.aO5yt.player.playVideo()
						// })
						window.addEventListener('olga5_stopPlay', e => {
							const act = e.detail.tag
							for (const tag of tags)
								if (tag !== act && tag.aO5yt.player)
									tag.aO5yt.player.stopVideo()
							// console.log(act.id, 5, e.detail)
						})
					}
					else
						if (aO5.chkmove == 'ask') {
							aO5.chkmove = 'wait'
							tag.addEventListener('mousemove', AddFrame)
						}
				}

			for (const tag of tags) {
				const videoId = tag.attributes[sel].nodeValue,
					style = tag.getAttribute('style') || ''

				if (style)
					tag.removeAttribute('style')
				tag.setAttribute('style', style + `background: url(//img.youtube.com/vi/${videoId}/hqdefault.jpg) 0% 0% / contain no-repeat;background-position: center;`)
				tag.aO5yt = { player: null, videoId: videoId, chkmove: 'ask', tag: tag, style: style, ready: false }

				tag.addEventListener('mouseover', AddFrame, { once: true })
				// tag.addEventListener('olga5_stopPlay', e => {
				// 	if (this !== e.detail.tag)
				// 		this.aO5yt.player.stopVideo()
				// 	// console.log(act.id, 5, e.detail)
				// })
			}
		}

	let no_o5tag_attrs = false

	function RefInit() {

		C.ParamsFill(W)

		const o5tag_attrs = 'o5tag_attrs',
			s = W.consts[o5tag_attrs]

		if (s) {
			const params = C.SplitParams(s, o5tag_attrs, ';\n'),
				otags = ParseTagAttrs(params)
			if (C.consts.o5debug > 0) C.ConsoleInfo(`${W.modul}: обрабатываемые атрибуты тегов`, o5tag_attrs, otags)
			ConvertUrls(otags)
		}

		PrepTubes()
		PrepTables()

		// window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		C.E.DispatchEvent('olga5_sinit', W.modul)

		// InitRPos()
	}

	C.ModulAdd(W)
})();
