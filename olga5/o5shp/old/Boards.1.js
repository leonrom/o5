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
		prevsPO5 = {},
		PutBords = (pO5, txt) => {
			let s = '',
				j = pO5.prevs.length
			while (j-- > 0) {
				const bord = pO5.prevs[j],
					name = bord.pO5 ? bord.pO5.name : C.MakeObjName(bord) // для того pO5 еще только создаётся
				s += (s ? ', ' : '') + name
			}
			if (o5debug > 2)
				console.log(txt + s)
			if (!prevsPO5[pO5.name]) prevsPO5[pO5.name] = s
		},
		FillAsk = (aO5, blng) => {
			const errs = [],
				prevs = aO5.prev.pO5.prevs

			for (const ask of blng.asks) {
				const t = ask.typ,
					c = (ask.cod || '').trim(),
					cu = c.toUpperCase(),
					clss = c.split(/[.,]/)

				Object.assign(ask, { nY: ask.num })

				// let n = -1
				for (const prev of prevs) {
					const
						pO5 = prev.pO5,
						final = pO5.isFinal

					Object.assign(pO5.scroll, {
						yesV: prev.offsetWidth > (prev.clientWidth + pO5.scroll.dw),
						yesH: prev.offsetHeight > (prev.clientHeight + pO5.scroll.dh),
					})

					if (
						(t == 'I' && pO5.id == c && ask.nY-- <= 1) ||
						(t == 'N' && (cu === '' ? final : (parent.nodeName == cu && ask.nY-- <= 1))) ||
						(t == 'C' && IsInClass(parent.classList, clss) && ask.nY-- <= 1) ||
						(t == 'S' && (final || pO5.scroll.yesV)) ||
						(t == 'B' && (final || (aO5.cls.dirV != 'D' && pO5.cdif.ct) || (aO5.cls.dirV != 'U' && pO5.cdif.cb)))
					) {
						// if (n < 0)
						blng.bords.push(prev)
						break
						// n++
					}
				}
				// if (n !== 0)
				// 	errs.push({ ask: ask, err: (n < 0 ? 'не найдено' : `найдено ${n + 1} (>1)`) })
			}

			if (blng.bords.length === 0) {
				const subst = prevs[prevs.length - 1]
				blng.bords.push(subst)

				if (blng.asks.length !== 0)
					C.ConsoleError(`Для ${aO5.name} не найдены границы - подставлено ${subst.pO5.name}'`)
				if (errs.length > 0) C.ConsoleError(`Ошибки определения границ`, errs.length, errs)
			}
		},
		Msg = (s1, s2) => {
			console.log("%c%s", "background: aquamarine; color: black;", s1, (s2 ? s2 : ''))
		},
		SortAll = aO5s => { // сортировка и индексация
			const nest = aO5s.nest

			if (o5debug > 2)
				console.log('  >> яSortAll (' + nest + '): aO5s=' + C.MyJoinO5s(aO5s))

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
			const board = boards.find(board => board.observer === observer),
				pO5 = board.pO5

			let topFix = 0

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
						}
						continue
					}

					if (!board.aO5s.includes(aO5)) {
						board.aO5s.push(aO5)
						SortAll(board.aO5s)
					}

					if (entry.intersectionRatio < 1) {
						const
							posC = aO5.posC,
							top = entry.intersectionRect.top,
							bottom = entry.intersectionRect.bottom

						let doFix = ''

						if (entry.boundingClientRect.top < top && aO5.cls.dirV === 'U') {
							posC.top = top
							doFix = 'U'
						}

						if (entry.boundingClientRect.bottom > bottom && aO5.cls.dirV === 'D') {
							posC.top = bottom - posC.height
							doFix = 'D'
						}

						if (doFix) {
							const b = aO5.shdw.getBoundingClientRect() // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона
							Object.assign(posC, { top: b.top, left: b.left, height: b.height, width: b.width, })
							// Object.assign(posW, posC)
							posC.top = doFix === 'U' ? top : bottom - posC.height
							aO5.DoFixV()
							aO5.ShowFix()

							observer.unobserve(aO5.shp)
							observer.observe(aO5.clon)
						}
					}
				}
				else {
					// u += `из '${pO5.name.padEnd(6)}' удалён    ${aO5.name.padEnd(6)}`
					const i = board.aO5s.indexOf(aO5)
					if (i >= 0) {
						board.aO5s.splice(i, 1)
						// wshp.DoScroll(aO5, 0)
					}
				}
			}
		},
		boards = [],
		Boards = aO5 => {
			wshp.aO5s.push(aO5)

			FillAsk(aO5, aO5.frames)
			FillAsk(aO5, aO5.owners)

			for (const tag of aO5.frames.bords) {
				const pO5 = tag.pO5
				if (!pO5.observer) {
					pO5.observer = new IntersectionObserver(Observe, {
						root: pO5.current === document.body ? null : pO5.current,
						rootMargin: '0px',
						threshold: [0.001, 1],
					})
					// pO5.observer.pO5 = pO5
					boards.push({ pO5: pO5, aO5s: [], observer: pO5.observer, })

					if (o5debug > 1)
						console.log("%c%s", "background: aquamarine; color: black;border: solid 1px gold;",
							`добавил observer  ${pO5.name.padEnd(12)}`)
				}
				pO5.observer.observe(aO5.shp)
			}
		},
		wshp = C.ModulAddSub(olga5_modul, modulname, Boards)

	Object.assign(wshp, {
		name: modulname,
		aO5s: [],
	})
})();
