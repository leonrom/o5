
/* -global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/Boards ---
	"use strict"

	let isScroll = false
	const
		olga5_modul = "o5shp",
		modulname = 'Boards',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		FindBords = (aO5, blng) => {
			const
				errs = [],
				akey = blng.akey,
				prevs = aO5.prev.pO5.prevs,
				IsInClass = (pO5, clss) => {
					const classTag = pO5.classTag

					for (const cls of clss)
						if (
							(cls === '' && classTag.length > 0) ||
							(cls !== '' && (classTag.length === 0 || !classTag.includes(cls)))
						)
							return false
					return true
				}

			console.log(aO5.name, akey)
			// if (aO5.name == '#shp4-2')
			// 	console.log('')
			for (const bord of blng.bords) {
				const
					c = (bord.cod || '').trim(),
					t = bord.typ
				let err = '',
					tag = null,
					n = bord.num

				if ('SIBNC'.indexOf(t) < 0)
					err = `недопустимый тип '${t}'`
				else {
					const
						cu = c.toUpperCase(),
						clss = c.split(/[.,]/)
					let first = true

					if (t === 'S') {                    // Screen - подвисание на верхнем уровне (на целом экране)                            
						tag = prevs[prevs.length - 1]
						n--
					}
					else
						for (const prev of prevs) {
							const
								pO5 = prev.pO5

							// if (pO5.name == '#main')
							// 	console.log('')
							if (
								(t === 'I' && pO5.id == c) ||
								(t === 'B' && (pO5.scroll.diffT || pO5.scroll.diffB)) ||
								(t === 'N' && prev.nodeName == cu) ||
								(t === 'C' && IsInClass(pO5, clss))
							) {
								tag = prev
								if (--n <= 0 || bord.num <= 1) // именно в такой очередности
									break
							}
						}
					if (!tag) {
						tag = prevs[prevs.length - 1]
						err = `'${t}:${c}' - не найден`
					}
					else
						if (n > 0)
							err = ` контейнер '${t}:${c}:${bord.num}' - найдено ${bord.num - n} из ${bord.num}`
				}
				if (err) {
					bord.err = err
					errs.push(`Селектор '${t}:${c}:${bord.num}':  ${err}`)
				}
				if (!tag.pO5[akey].includes(aO5)) {
					tag.pO5[akey].push(aO5)
					tag.classList.add('olga5-' + akey)
				}
				bord.tag = tag
			}

			// устранение дублирования
			const pO5s = [],
				err = ''
			let i = blng.bords.length

			while (i-- > 0) {
				const bord = blng.bords[i],
					pO5 = bord.tag.pO5

				if (pO5s.includes(pO5)) {
					blng.bords.splice(i, 1)
					err += (err ? ', ' : '') + pO5.name + ' (' + bord.typ + ':' + bord.cod + ':' + bord.num + ')'
				}
			}
			if (err)
				C.ConsoleError(`Тег '${aO5.name}' - устранил дублирующие контейнеры:`, err)


			// const bs = []
			// for (const bord of blng.bords) {
			// 	const pO5 = bord.tag.pO5,
			// 		b = bs.find(b => bs.pO5 === pO5)

			// 	if (b) b.n++
			// 	else
			// 		bs.push({ pO5: pO5, typ: bord.typ, cod: bord.cod, num: bord.num, n: 1 })
			// }
			// const 				ebs = ''
			// for (const b of bs) 
			// 				if (b.n>1){
			// }

			if (errs.length > 0)
				C.ConsoleError(`Тег '${aO5.name}' - ошибки определения контейеров`, errs.length, errs)

			if (o5debug > 1) // для тестирования в shpC.html
				window.dispatchEvent(new CustomEvent('olga5-containers', { detail: { aO5: aO5, akey: akey } }))

		},
		Observe = (entries, observer) => {
			const pO5 = observer.pO5

			if (o5debug > 1) {
				let s = ''
				for (const entry of entries) {
					const shp = entry.target,
						aO5 = shp.aO5shp
					s += `${aO5.name} ${entry.isIntersecting?'видно':'нету '}					 ${entry.intersectionRatio.toFixed(2)} ${(shp.classList.contains('olga5-clon') ? 'clon' : '')}`
				}
				console.log(pO5.name, s)
			}

			for (const entry of entries) {
				const shp = entry.target,
					aO5 = shp.aO5shp

				if (entry.isIntersecting) {
					const isclon=shp.classList.contains('olga5-clon')

					if (entry.intersectionRatio === 1) {
						if (isclon && aO5.act.isFixed) { // т.е. это есть клон) 
							observer.observe(aO5.shp)
							observer.unobserve(aO5.clon)
							// AskStopScroll()
							aO5.UnFixV()
							aO5.ShowFix()
							wshp.DoScroll(aO5, false)
						}
					}
					else
						if (!isclon && !aO5.act.isFixed) {
							const
								// posC = aO5.posC,
								top = entry.intersectionRect.top,
								bottom = entry.intersectionRect.bottom,
								doFix =
									(entry.boundingClientRect.top < top && aO5.cls.dirV === 'U') ? 'U' :
										(entry.boundingClientRect.bottom > bottom && aO5.cls.dirV === 'D' ? 'D' : '')

							if (doFix) {
								const
									posC = aO5.posC,
									b = aO5.shdw.getBoundingClientRect() // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона

								Object.assign(aO5.posW, { top: b.top, left: b.left, height: b.height, width: b.width, })
								Object.assign(posC, aO5.posW)
								posC.top = doFix === 'U' ? top : bottom - height
								aO5.DoFixV()
								aO5.ShowFix()
								wshp.DoScroll(aO5, doFix)
								observer.unobserve(aO5.shp)	
								observer.observe(aO5.clon)

								if (!isScroll) {
									isScroll = true
									window.addEventListener('scroll', wshp.DoScroll)
								}
							}
						}
				}
				// else {
				// 	// u += `из '${pO5.name.padEnd(6)}' удалён    ${aO5.name.padEnd(6)}`
				// 	const i = pO5.frms.indexOf(aO5)
				// 	if (i >= 0) {
				// 		pO5.frms.splice(i, 1)
				// 		// wshp.DoScroll(aO5, 0)
				// 	}
				// }
			}
		},
		Boards = aO5 => {
			const
				fmt = "background: cornsilk; color: black;",
				pO5s = []

			FindBords(aO5, aO5.owners)
			FindBords(aO5, aO5.oframs)

			for (const bord of aO5.oframs.bords) {
				const
					pO5 = bord.tag.pO5

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
					pO5s.push(pO5.name)
			}

			if (o5debug > 1)
				console.log("%c%s", fmt,
					`для ${aO5.name} добавил oframs observer'ы:  ${pO5s.join(', ')}`)
		},
		wshp = C.ModulAddSub(olga5_modul, modulname, Boards)

	Object.assign(wshp, {
		name: modulname,
	})
})();

