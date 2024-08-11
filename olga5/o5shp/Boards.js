/* -global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/Boards ---
	"use strict"

	const
		olga5_modul = "o5shp",
		modulname = 'Boards',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmt = "background: cornsilk; color: black;",
		FindBord = (aO5, blng) => {
			const
				prevs = aO5.prev.pO5.prevs,
				cls = aO5.cls,
				IsInClass = (classList, clss) => {
					for (const cls of clss)
						if (cls !== '' && !classList.contains(cls)) return false
					return true
				}

			const t = blng.typ
			let err = '',
				bord = null,
				n = blng.num

			if ('BINC'.indexOf(t) < 0)
				err += (err ? ', ' : '') + t
			else {
				const c = (blng.cod || '').trim(),
					cu = c.toUpperCase(),
					clss = c.split(/[.,]/),
					cc = Object.assign({}, { strt: true, c: '', t: '', l: '', r: '', b: '', })

				for (const prev of prevs) {
					const
						pO5 = prev.pO5,
						final = pO5.isFinal

					let found = null

					if (t === 'B') {
						const cd = pO5.coldi
						if (cc.strt ||
							cc.c !== cd.c ||
							(cls.dirV === 'U' && (cd.t || cc.c !== cd.c)) ||
							(cls.dirV === 'D' && (cd.b || cc.c !== cd.c))
						)
							found = prev

						cc.strt = false
						Object.assign(cc, cd)
					}
					else
						if (
							(t === 'I' && pO5.id == c) ||
							(t === 'N' && prev.nodeName == cu) ||
							(t === 'C' && IsInClass(prev.classList, clss))
						)
							found = prev

					if (found) {
						bord = found
						if ((blng.num && --n === 0) || final)
							break
					}
				}
			}
			if (!bord) {
				bord = prevs[prevs.length - 1]
				blng.err += `'${blng.typ}:${blng.cod}' - не найден`
			}
			else
				if (n > 0)
					blng.err + `для контейнера '${blng.typ}:${blng.cod}:${blng.num}' найдено только ${blng.num - n} вложений`

			const errs = []
			if (err)
				C.ConsoleError(`Для тега '${aO5.name}' не определены типы "${err}"`)

			if (o5debug > 1) // для тестирования в shpC.html
				window.dispatchEvent(new CustomEvent('olga5-containers', { detail: { aO5: aO5, akey: blng.akey } }))

			blng.bord = bord
		},
		SortAll = aO5s => { // сортировка и индексация

			for (const aO5 of aO5s) {
				const b = aO5.shdw.getBoundingClientRect()
				Object.assign(aO5.posW, { top: b.top, left: b.left })
			}
			aO5s.sort((a1, a2) => { // для вызовов (для работы)
				const i1 = Math.round(parseFloat(a1.posW.top)),
					i2 = Math.round(parseFloat(a2.posW.top))
				return (i1 !== i2) ? (i1 - i2) : (a1.cls.level - a2.cls.level)
			})

			let z = 1111
			for (const aO5 of aO5s)
				aO5.act.zIndex = ++z
		},
		Observe = (entries, observer) => {
			// const board = boards.find(board => board.observer === observer),
			// 	pO5 = board.pO5
			const pO5 = observer.pO5

			for (const entry of entries) {
				const aO5 = entry.target.aO5shp

				if (entry.isIntersecting) {
					// u += `в  '${pO5.name.padEnd(6)}' видимость ${aO5.name.padEnd(6)} - ${entry.intersectionRatio.toFixed(3)}`
					if (!aO5) { // т.е. это есть клон
						if (entry.intersectionRatio == 1) {
							const aO5 = entry.target.aO5
							observer.observe(aO5.shp)
							observer.unobserve(aO5.clon)
							aO5.UnFixV()
							aO5.ShowFix()
							// wshp.DoScroll(aO5, false)
						}
						continue
					}

					// if (!pO5.frms.includes(aO5)) {
					// 	pO5.frms.push(aO5)
					// 	SortAll(pO5.frms)
					// }

					if (entry.intersectionRatio < 1) {
						const
							posC = aO5.posC,
							top = entry.intersectionRect.top,
							bottom = entry.intersectionRect.bottom

						let doFix = ''

						if (entry.boundingClientRect.top < top && aO5.cls.dirV === 'U') {
							// posC.top = top
							posC.top = 0
							doFix = 'U'
						}

						if (entry.boundingClientRect.bottom > bottom && aO5.cls.dirV === 'D') {
							// posC.top = bottom - posC.height
							posC.bottom = bottom
							doFix = 'D'
						}

						if (doFix) {
							const b = aO5.shdw.getBoundingClientRect() // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона
							Object.assign(posC, { left: b.left, height: b.height, width: b.width, })
							// Object.assign(posC, { top: b.top, left: b.left, height: b.height, width: b.width, })
							// // Object.assign(posW, posC)
							// posC.top = doFix === 'U' ? top : bottom - posC.height
							aO5.DoFixV()
							aO5.ShowFix()

							observer.unobserve(aO5.shp)
							observer.observe(aO5.clon)

							// wshp.DoScroll(aO5, true)
						}
					}
				}
				else {
					// u += `из '${pO5.name.padEnd(6)}' удалён    ${aO5.name.padEnd(6)}`
					const i = pO5.frms.indexOf(aO5)
					if (i >= 0) {
						pO5.frms.splice(i, 1)
						// wshp.DoScroll(aO5, 0)
					}
				}
			}
		},
		ObservePO5 = aO5 => {
			const tag = aO5.ofram.bord,
				pO5 = tag.pO5

			if (!pO5.observ.observer) {
				pO5.observ.observer = new IntersectionObserver(Observe, {
					root: pO5.current === document.body ? null : pO5.current,
					rootMargin: '0px',
					threshold: [0.001, 1],
				})
				pO5.observ.observer.pO5 = pO5

				if (o5debug > 1)
					console.log("%c%s", fmt,
						`создал observer на ${pO5.name.padEnd(6)}  [${pO5.current.className}]`)
			}
			pO5.observ.observer.observe(aO5.shp)

			if (o5debug > 1)
				console.log("%c%s", fmt,
					`       observer  ${pO5.name.padEnd(6)}  [${pO5.current.className}]   добавил ${aO5.name}`)

		},
		// boards = [],
		Boards = aO5 => {
			const
				ofram = aO5.ofram,
				owner = aO5.owner,
				cls = 'olga5-'

			FindBord(aO5, owner)

			if (ofram.typ === owner.typ && ofram.cod === owner.cod && ofram.num === owner.num) // нефиг искать если то же самое
				ofram.bord = owner.bord
			else
				FindBord(aO5, ofram)

			ofram.bord.classList.add(cls + ofram.akey)
			owner.bord.classList.add(cls + owner.akey)

			ofram.bord.pO5.frms.push(aO5)
			owner.bord.pO5.owns.push(aO5)

			ObservePO5(aO5)
		},
		wshp = C.ModulAddSub(olga5_modul, modulname, Boards)

	Object.assign(wshp, {
		name: modulname,
	})
})();

