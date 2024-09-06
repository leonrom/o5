
/* -global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/Boards ---11
	"use strict"

	const
		olga5_modul = "o5shp",
		// modulname = 'Boards',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmtOK = "background: cornsilk; color: black;",
		fmtErr = "background: lightgoldenrodyellow; color: black;",
		pO5Ls = [],
		FindBords = (aO5, blng) => {
			const
				errs = [],
				akey = blng.akey,
				prevs = aO5.prev.pO5.prevs,
				IsInClass = (pO5, clss) => {
					const clst = pO5.classOrig

					for (const cls of clss)
						if (
							(cls === '' && clst.length > 0) ||
							(cls !== '' && (clst.length === 0 || !clst.includes(cls)))
						)
							return false
					return true
				}

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

				const tag = prevs[itag],
					cls = 'olga5-' + akey

				if (!tag.classList.contains(cls))
					tag.classList.add('olga5-' + akey)		// olga5-oframs, olga5-owners`
				bord.tag = tag
				bord.itag = itag
			}

			// устранение дублирования
			const pO5s = []

			let err = '',
				i = blng.bords.length

			while (i-- > 0) {
				const bord = blng.bords[i],
					pO5 = bord.tag.pO5

				if (pO5s.includes(pO5)) {
					blng.bords.splice(i, 1)
					err += (err ? ', ' : '') + pO5.name + ' (' + bord.typ + ':' + bord.cod + ':' + bord.num + ')'
				}
			}
			// сортировка по вложенности от внутреннего к внешнему
			//   НЕ нужна, т.к. всё равно надо по всем проерять
			// blng.bords.sort((b1, b2) => { return b1.itag - b2.itag })


			if (o5debug > 1) {
				let s = ''
				for (const bord of blng.bords)
					s += (s ? ', ' : '') + bord.tag.pO5.name
				console.log("%c%s", fmtOK, aO5.name, akey, '[ ' + s + ' ]')  //, akey=='oframs'?('bordL=' + blng.bordL.tag.pO5.name):'')
			}
			if (err)
				C.ConsoleError(`Тег '${aO5.name}' - устранил дублирующие контейнеры:`, err)

			if (errs.length > 0)
				C.ConsoleError(`Тег '${aO5.name}' - ошибки определения контейеров`, errs.length, errs)

			if (o5debug > 1) // для тестирования в shpC.html
				window.dispatchEvent(new CustomEvent('olga5-containers', { detail: { aO5: aO5, akey: akey } }))

		},
		AddToObserver = (aO5, blng) => {

			// создание observer'а на bord'е и включение в него aO5			
			blng.bordL = blng.bords[blng.bords.length - 1]

			let tag = blng.bordL.tag,
				pO5 = tag.pO5,
				pO5L = pO5.scroll.pO5L

			if (pO5L === null) {	// т.е. еще не инициирован
				pO5L = pO5.scroll.pO5L = new wshp.PO5L(pO5)
				pO5Ls.push(pO5L)
			}
			pO5L.AddO5(aO5)
		},
		ObserveM = entries => {
			// ПРОВЕРКА и останавливаем блочные обосреватели и отключаем контроль скроллинга

			// let isf = false
			// for (const pO5 of obsrvM.pO5s)
			// 	if (!isf && pO5.po.active)
			// 		for (const paO5 of pO5.po.paO5s)
			// 			if (paO5.aO5.xFixed) {
			// 				isf = true
			// 				break
			// 			}

			if (o5debug > 1)
				console.log("%c%s", fmtOK, `ObserveM - задание скроллинга`)

			for (const entry of entries) {
				const pO5L = entry.target.pO5.scroll.pO5L
				pO5L.ActPO(entry.isIntersecting)
			}

			let nf = 0,
				s = ''
			for (const pO5L of pO5Ls)
				if (pO5L.IsVisi()) {
					if (pO5L.HasFix()) {
						nf++
						s += '+'
					}
					else
						s += '-'
					s += pO5L.pO5.name + ', '
				}

			wshp.escroll.ScrollAct(nf > 0, `видимость bord'ов [${s}] (+- наличие fixed)`)

			if (o5debug > 2) {
				if (wshp.aO5s.length > 0)
					C.Debug.ShowBounds(wshp.aO5s)
				else
					console.log('нету подвисабельных')
			}
		},
		Boards = aO5 => {
			const
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

			if (o5debug > 1)
				console.log("%c%s", fmtOK,
					`Bords: добавляю ${aO5.name} `)

			FindBords(aO5, aO5.owner)
			FindBords(aO5, aO5.ofram)

			AddToObserver(aO5, aO5.ofram)

			aO5.act.cIndex += MaxZIndex(aO5.ofram.bords) + 1

			obsrvM.observe(aO5.ofram.bordL.tag)
		},
		obsrvM = new IntersectionObserver(ObserveM, {
			root: null,
			rootMargin: '10px',
			threshold: [0.01],
		}),
		wshp = C.ModulAddSub(olga5_modul, Boards)

})();

