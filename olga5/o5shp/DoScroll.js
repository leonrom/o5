/*jshint asi:true          */
/* global window, console, document */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoScroll ---
	"use strict"
	let timeStamp = 0
	const
		olga5_modul = "o5shp",
		// modulname = 'DoScroll',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmtOK = "background: cornsilk; color: black;",
		fmtErr = "background: lightgoldenrodyellow; color: black;",
		doc = document.documentElement,
		onScroll = new CustomEvent('o5_onScroll', { detail: { isScroll: false } }),
		CalcParentsLocates = (aO5, type) => {
			if (o5debug > 2)
				console.log("%c%s", fmtOK, `CalcParentsLocates - '${aO5.name}' ${type}  ${timeStamp.toFixed(1).padStart(8)}`)

			// const bords = aO5[type].bords

			// for (const bord of bords) {
			// 	// if (!bord.tag)				
			// 	// alert('!')
			// 	const pO5 = bord.tag.pO5,
			// 		scope = pO5.scope

			for (const parent of aO5.parents) {
				const pO5 = parent.pO5,
					scope = pO5.scope

				if (scope.pos.tim !== timeStamp) {
					if (pO5.isBody)
						Object.assign(scope.pos,
							{ tim: timeStamp, top: 0, left: 0, right: doc.clientWidth, bottom: doc.clientHeight, })
					else {
						// const current = pO5.current,
						// 	isO5 = current.aO5shp,
						// 	p = isO5 ? isO5.posC : current.getBoundingClientRect()
						const p = parent.getBoundingClientRect()

						Object.assign(scope.pos, {
							tim: timeStamp,
							top: p.top + scope.add.top,
							left: p.left + scope.add.left,
							right: isO5 ? p.left + p.width : p.left + current.clientWidth + scope.add.left,
							bottom: isO5 ? p.top + p.height : p.top + current.clientHeight + scope.add.top,
						})
					}
					if (o5debug > 2)
						console.log("%c%s", fmtOK, `CalcParentsLocates '${pO5.name.padEnd(12)}' : top=${scope.pos.top}`)
				}
			}
		},
		CheckOnBords = aO5 => {
			const
				bords = aO5.ofram.bords,
				dirup = aO5.cls.dirV === 'U',
				found = { xO5: null, tofix: false },
				// btag = { tag: null, posC: aO5.posC },
				IsOver = (posC, pos) => {		// тут д.б. <=  и >= иначе м.б. дребезг
					return (dirup && posC.top <= pos.top) ||
						(!dirup && posC.top + posC.height >= pos.bottom)
				},
				parents = aO5.parents.slice().sort(
					(posC, pos) => {
						(IsOver(posC, pos)) ? 1 : -1
					}
				)

			for (const parent of parents)  // тут не надо пытаться запоминать "аналогичные"
				if (IsOver(aO5.posC, parent.pO5.scope.pos)) {
					found.tofix = true
					if (bords.find(bord => bord.tag === parent)) {
						found.xO5 = parent.pO5
						break
					}
				}
				else
					break

			if (found.tofix) {
				if (!aO5.act.isFix) {
					if (o5debug > 0)
						console.log("%c%s", fmtOK, `CheckOnBords фиксация    '${aO5.name}'`,
							found.xO5 ? `на bord'е: '${xO5.name}` : ``)
					aO5.DoFixV()
				}
				if (found.xO5)
					if (dirup) aO5.posC.top = xO5.pos.top
					else
						aO5.posC.top = xO5.pos.bottom - aO5.posC.height

				aO5.act.pO5fix = found.xO5
			}
			else
				if (aO5.act.isFix) {
					if (o5debug > 0)
						console.log("%c%s", fmtOK, `CheckOnBords расфиксация '${aO5.name}'`)
					aO5.UnFixV()
					aO5.act.pO5fix = null
				}



			// for (const bord of bords)  		//	 ищем ближайший bord
			// 	if (IsOver(btag.posC, bord.tag.pO5.scope.pos))
			// 		Object.assign(btag, { tag: bord.tag, posC: bord.tag.pO5.scope.pos, })

			// if (IsOver(posC, btag.posC))  	// проверка - а не подвиснуть ли на нём
			// 	Object.assign(found, { tofix: true, xO5: btag.tag.pO5, })

			// if (!found.xO5)					// если не подвиснул, то поиск,- не вышел ли за границы
			// 	for (const parent of aO5.parents)  // тут не надо пытаться запоминать "аналогичные"
			// 		if (IsOver(posC, parent.pO5.scope.pos)) {
			// 			Object.assign(found, { tofix: true, })
			// 			break
			// 		}
			// 		else
			// 			if (IsOver(parent.pO5.scope.pos, btag.posC))
			// 				break

			// проверка,- а надо ли подвисать


			// if (found.isfram) {
			// 	posC.top = dirup ? pO5.scope.pos.top : pO5.scope.pos.bottom - posC.height
			// }

			// const act = aO5.act
			// if (xO5) {
			// 	if (!act.pO5fix) {
			// 		if (o5debug > 0)
			// 			console.log("%c%s", fmtOK, `CheckOnBords ` +
			// 				`${!act.pO5fix ? '    ' : 'пере'}фиксация '${aO5.name}' на bord'е: '${xO5.name}'`)
			// 		aO5.DoFixV(xO5, true)
			// 	}
			// }
			// else
			// 	if (act.pO5fix) {
			// 		if (o5debug > 0)
			// 			console.log("%c%s", fmtOK, `CheckOnBords '${aO5.name}' ` +
			// 				`расфиксировано на bord'е: ${act.pO5fix.name}`)
			// 		aO5.UnFixV(act.pO5fix)
			// 	}
		},
		CutFixed = aO5 => {
			/*
			обрезание подвисшего объекта и
			*/
			const
				posC = aO5.posC,
				posS = aO5.posS,
				bords = aO5.owner.bords,
				putop = aO5.cls.putV === 'T'

			let d = 0,
				isCuts = false

			for (const bord of bords) {
				const
					pO5 = bord.tag.pO5

				// вертикальное обрезание зафиксированных
				if ((putop)) {
					d = posC.top + posC.height - pO5.scope.pos.bottom
					if (d > 0) {
						posC.height -= d
						isCuts = true
					}
				} else {
					d = pO5.scope.pos.top - posC.top
					if (d > 0) {
						posC.top = pO5.scope.pos.top
						posC.height -= d
						posS.top -= d
						isCuts = true
					}
				}

				// горизонтальное обрезание СЛЕВА зафиксированных
				d = pO5.scope.pos.left - posC.left
				if (d > 0) {
					posC.left = pO5.scope.pos.left
					posC.width -= d
					posS.left -= d
					isCuts = true
				}
				d = posC.left + posC.width - pO5.scope.pos.right
				if (d > 0) {
					posC.width -= d
					isCuts = true
				}

				// if (isCuts) pO5.AddCut(aO5)
				// else
				// 	if (pO5.IsCuts())
				// 		pO5.DelCut(aO5)
			}
		},
		Adhereds = (aO5, pO5fix) => {
			/*
			поиск натыкающихся на 'aO5' - только среди тех, 
			которы тоже подвисают на тех же, на которых подвис первый 'aO5'
			*/

			const
				cls = aO5.cls,
				posC = aO5.posC,
				totop = cls.putV === 'T',
				origH = posC.height,
				bottom = posC.top + posC.height,
				aO5s = pO5fix.aO5s,
				n = aO5s.length

			for (let i = 0; i < n; i++) {
				const
					iO5 = aO5s[totop ? i : n - i - 1],
					iO5act = iO5.act

				if (!iO5act.uScroll || iO5act.isFix)
					return

				const
					iO5posW = iO5.posW,
					dlevel = cls.level - iO5.cls.level,
					d = totop ? bottom - iO5posW.top : iO5posW.top + iO5posW.height - posC.top

				if (
					d <= 0 ||
					dlevel === 0 ||
					iO5act.isFix ||
					iO5posW.left > posC.left + posC.width ||
					iO5posW.lef + iO5posW.width < posC.left
				)
					continue

				let topf = false

				if (totop) {
					if (posC.top < iO5posW.top) {
						if (dlevel < 0)
							topf = bottom
						else
							switch (iO5.cls.pitch) {
								case 'P': posC.height = 0; break
								case 'S': posC.height -= d; aO5.posS.top = -d; break
								case 'C': posC.height -= d; break
								case 'O': break
							}
					}
					else
						posC.height = 0
				}
				else {
					if (bottom > iO5posW.top + iO5posW.height) {
						if (dlevel < 0)
							topf = posC.top - iO5.posC.height
						else
							switch (iO5.cls.pitch) {
								case 'P': posC.top += posC.height; posC.height = 0; break
								case 'S': posC.top += d; posC.height -= d; break
								case 'C': posC.top += d; posC.height -= d; aO5.posS.top = -d; break
								case 'O': break
							}
					}
					else
						posC.height = 0
				}

				if (topf !== false) {// прижимаюсь и фиксируюсь
					Object.assign(iO5.posC, iO5posW, { top: topf })
					iO5.DoFixV(aO5, false)

					Adhereds(iO5, pO5fix)
				}
				if (aO5.act.pO5fix && posC.height == 0 && origH > 0) {
					if (aO5.cls.alive)
						aO5.act.iO5hid = iO5
					else
						aO5.UnFixV()
				}

				break
			}
		},
		Scroll = e => {
			if (e) timeStamp = e.timeStamp
			const
				aO5s = wshp.aO5s

			for (const aO5 of aO5s) {
				const iO5hid = aO5.act.iO5hid
				if (iO5hid)
					for (const iO5 of aO5s)
						if (iO5 === iO5hid) {
							if (!iO5.act.pO5fix)
								aO5.act.iO5hid = null
							break
						}
			}

			for (const aO5 of aO5s)
				if (aO5.act.uScroll) {
					const
						p = aO5.act.shdw.getBoundingClientRect()

					if (o5debug > 2)
						console.log("%c%s", fmtOK, `Scroll ${timeStamp.toFixed(1).padStart(8)} ` +
							`'${aO5.name}' : top=${p.top}`)

					// Object.assign(aO5.act, { aO5fix: null })
					Object.assign(aO5.posW, { top: p.top, left: p.left, height: p.height, width: p.width }) // нелья сразу - 'лишние' поля
					Object.assign(aO5.posS, { top: 0, left: 0, })
					Object.assign(aO5.posC, aO5.posW)
				}

			for (const aO5 of aO5s) { // д.б. отдельно, после пересчета всех
				const act = aO5.act
				if (act.uScroll) {

					CalcParentsLocates(aO5, 'ofram') // пересчитываются размеры всех предков-контейнеров        
					CheckOnBords(aO5)

					if (act.isFix && !act.iO5hid) {
						CalcParentsLocates(aO5, 'owner')	// обрезаем которые на bord'ах
						CutFixed(aO5)
						Adhereds(aO5, act.pO5fix) 	 // с передачей ссылки на общий для всех контейнер
					}
				}
			}

			for (const aO5 of wshp.aO5s)
				if (aO5.act.isFix)
					aO5.ShowFix()			// отображение зафиксированного				

			onScroll.DispatchEvent({})
		},
		DoScroll = isScroll => {
			const
				args = { nam: 'scroll', fun: Scroll, arg: true }

			if (wshp.isScroll !== isScroll) {
				if (!onScroll.DispatchEvent) {
					Object.seal(onScroll.detail)
					onScroll.DispatchEvent = detail => {
						Object.assign(onScroll.detail, detail)
						window.dispatchEvent(onScroll)
					}
				}
				Object.assign(wshp, { isScroll: isScroll, timeStamp: Date.now() + Math.random() })

				if (isScroll) {
					window.addEventListener(args.nam, args.fun, args.arg)

					Scroll()
				}
				else
					window.removeEventListener(args.nam, args.fun, args.arg)

				onScroll.DispatchEvent({ isScroll: isScroll, })
			}
		},
		wshp = C.ModulAddSub(olga5_modul, DoScroll)

	Object.assign(wshp, { isScroll: false, timeStamp: 0 })
})();