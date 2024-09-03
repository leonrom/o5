
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
					itag = -1,
					n = bord.num

				if ('SIBNC'.indexOf(t) < 0)
					err = `недопустимый тип '${t}'`
				else {
					const
						cu = c.toUpperCase(),
						clss = c.split(/[.,]/)
					let first = true

					if (t === 'S') {                    // Screen - подвисание на верхнем уровне (на целом экране)                            
						itag = prevs.length - 1
						n--
					}
					else
						for (let i = 0; i < prevs.length; i++) {
							const
								prev = prevs[i],
								pO5 = prev.pO5

							// if (pO5.name == '#main')
							// 	console.log('')
							if (
								(t === 'I' && pO5.id == c) ||
								(t === 'B' && (pO5.scroll.diffT || pO5.scroll.diffB)) ||
								(t === 'N' && prev.nodeName == cu) ||
								(t === 'C' && IsInClass(pO5, clss))
							) {
								itag = i
								if (--n <= 0 || bord.num <= 1) // именно в такой очередности
									break
							}
						}

					if (itag < 0) {
						itag = prevs.length - 1
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

				const tag = prevs[itag]

				if (!tag.pO5[akey].includes(aO5)) {
					tag.pO5[akey].push(aO5)
					tag.classList.add('olga5-' + akey)
				}
				bord.tag = tag
				bord.itag = itag
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
			// сортировка по вложенности от внутреннего к внешнему
			blng.bords.sort((b1, b2) => { return b1.itag - b2.itag })
			// if (blng.bords.length>1)
			// console.log(blng.bords[0].tag.id, blng.bords[1].tag.id)

			if (err)
				C.ConsoleError(`Тег '${aO5.name}' - устранил дублирующие контейнеры:`, err)

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

					s += `${aO5.name} ${entry.isIntersecting ? 'видно' : 'нету '} ${entry.intersectionRatio.toFixed(3)} ${(shp.classList.contains('olga5-clon') ? 'clon' : '')}`
				}
				console.log('--:  Observe', pO5.name, s)
			}

			for (const entry of entries) {
				const shp = entry.target,
					aO5 = shp.aO5shp,
					act = aO5.act,
					isr = entry.intersectionRatio

				if (entry.isIntersecting) {
					if (isr === 1)
						act.readyFix = true

					if (shp.classList.contains('olga5-clon')) { // т.е. это есть клон) 
						if (isr === 1 || !act.readyFix) {
							aO5.UnFixV()
							observer.observe(aO5.shp)
							observer.unobserve(aO5.clon)
							wshp.DoScroll(aO5)
						}
					}
					else
						if (isr < 1 && !act.isFixed && act.readyFix) { // д.б. именно isFixed (не IsFixed())
							const
								br = entry.boundingClientRect,
								top = entry.intersectionRect.top,
								bottom = entry.intersectionRect.bottom

							if (
								(br.top < top && aO5.cls.dirV === 'U') ||
								(br.bottom > bottom && aO5.cls.dirV === 'D')
							) {
								aO5.DoFixV(pO5, shp)
								observer.unobserve(aO5.shp)
								observer.observe(aO5.clon)
								wshp.DoScroll(aO5)
							}

						}
				}
			}
		},
		Boards = aO5 => {
			const
				fmt = "background: cornsilk; color: black;",
				MaxZIndex = bords => {
					let cIndex = 1
					for (const bord of bords) {
						const pO5 = bord.tag.pO5
						if (pO5.scroll.zIndex < 0) {
							let maxZIndex = 0
							for (const child of pO5.current.children) {
								const zIndex = parseInt(child.style.zIndex) || 0
								if (!isNaN(zIndex) && zIndex >= maxZIndex)
									maxZIndex = zIndex
							}
							pO5.scroll.zIndex = maxZIndex
						}
						if (cIndex < pO5.scroll.zIndex)
							cIndex = pO5.scroll.zIndex
					}
					return cIndex
				}

			FindBords(aO5, aO5.owner)
			FindBords(aO5, aO5.ofram)

			const
				bord = aO5.ofram.bords[aO5.ofram.bords.length - 1],
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

			aO5.act.cIndex += MaxZIndex(aO5.ofram.bords) + 1

			C.E.DispatchEvent('o5shp_scroll', 'DoScroll', true)  // вызов shpX_BordNames в alltst.js

			if (o5debug > 1)
				console.log("%c%s", fmt,
					`добавил ${aO5.name} в observer на  ${pO5.name}`)
		},
		wshp = C.ModulAddSub(olga5_modul, Boards)

})();

