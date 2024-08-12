
					/* -global window, document, console, IntersectionObserver */
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
		FindBords = (aO5, blng) => {
			const
				errs = [],
				cls = aO5.cls,
				prevs = aO5.prev.pO5.prevs,
				IsInClass = (classList, clss) => {
					for (const cls of clss)
						if (cls !== '' && !classList.contains(cls)) return false
					return true
				}

			for (const bord of blng.bords) {
				const
					c = (bord.cod || '').trim(),
					t = bord.typ
				let err = '',
					tag = null,
					n = bord.num

				if ('BINC'.indexOf(t) < 0)
					err = `недопустимый тип '${t}'`
				else {
					const
						cu = c.toUpperCase(),
						clss = c.split(/[.,]/),
						cc = Object.assign({}, { strt: true, c: '', t: '', l: '', r: '', b: '', })

					for (const prev of prevs) {
						const
							pO5 = prev.pO5,
							final = pO5.isFinal

						if (t === 'B') {
							const cd = pO5.coldi
							if (cc.strt ||
								cc.c !== cd.c ||
								(cls.dirV === 'U' && (cd.t || cc.c !== cd.c)) ||
								(cls.dirV === 'D' && (cd.b || cc.c !== cd.c))
							)
								tag = prev

							cc.strt = false
							Object.assign(cc, cd)
						}
						else
							if (
								(t === 'I' && pO5.id == c) ||
								(t === 'N' && prev.nodeName == cu) ||
								(t === 'C' && IsInClass(prev.classList, clss))
							)
								tag = prev

						if (tag) {
							if (blng.num <= 1 || --n === 0 || final)
								break
						}
					}
					if (!tag) {
						tag = prevs[prevs.length - 1]
						bord.err += `'${t}:${c}' - не найден`
					}
					else
						if (n > 0)
							bord.err=  `для контейнера '${t}:${c}:${bord.num}' найдено только ${bord.num - n} вложений`
				}
				if (err)
					errs.push(`Для '${t}:${c}:${bord.num}':  ${err}`)
				
				tag.pO5[blng.akey].push(aO5)
				bord.tag = tag
			}
			
			if (errs.length > 0)
				C.ConsoleError(`Для тега '${aO5.name}' ошибки определения контейеров`, errs.length, errs)

			if (o5debug > 1) // для тестирования в shpC.html
				window.dispatchEvent(new CustomEvent('olga5-containers', { detail: { aO5: aO5, akey: blng.akey } }))

		},
		Observe = (entries, observer) => {
			const pO5 = observer.pO5

			for (const entry of entries) {
				const aO5 = entry.target.aO5shp

				if (entry.isIntersecting) {
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
			FindBords(aO5, aO5.owner)
			FindBords(aO5, aO5.ofram)
// вот это - прилепить:
// 				cls = 'olga5-'
// 			ofram.bord.classList.add(cls + ofram.akey)
// 			owner.bord.classList.add(cls + owner.akey)

			// ofram.bord.pO5.frms.push(aO5)
			// owner.bord.pO5.owns.push(aO5)

			ObservePO5(aO5)
		},
		wshp = C.ModulAddSub(olga5_modul, modulname, Boards)

	Object.assign(wshp, {
		name: modulname,
	})
})();

