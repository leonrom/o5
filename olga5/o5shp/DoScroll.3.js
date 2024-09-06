/*jshint asi:true          */
/* -global window, console */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoScroll ---
	"use strict"

	let isScroll = false
	const
		olga5_modul = "o5shp",
		modulname = 'DoScroll',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmtOK = "background: cornsilk; color: black;",
		fmtErr = "background: lightgoldenrodyellow; color: black;",
		doc = document.documentElement,
		CalcParentLocate = pO5 => {
			if (pO5.isBody)
				Object.assign(pO5.pos,
					{ tim: timeStamp, top: 0, bottom: doc.clientHeight, left: 0, right: doc.clientWidth })
			else {
				const current = pO5.current,
					isO5 = current.aO5shp,
					p = isO5 ? current.aO5shp.posC :
						current.getBoundingClientRect()

				// console.log(`--:  CalcParentLocate(${pO5.name}) - p.top=${p.top}, pO5.add.top=${pO5.add.top}`)
				Object.assign(pO5.pos, {
					tim: timeStamp,
					top: p.top + pO5.add.top,
					left: p.left + pO5.add.left,
					bottom: isO5 ? p.top + p.height : p.top + current.clientHeight + pO5.add.top,
					right: isO5 ? p.left + p.width : p.left + current.clientWidth + pO5.add.left,
				})
			}
		},
		// PrepareBords = (bords, isf, timeStamp) => {
		// 	const
		// 		bO5 = document.body.pO5,
		// 		a = { to: bO5, le: bO5, ri: bO5, bo: bO5 }

		// 	for (const bord of bords) {
		// 		const pO5 = bord.tag.pO5,
		// 			pos = pO5.pos

		// 		if (pos.tim !== timeStamp) {
		// 			pos.tim = timeStamp
		// 			CalcParentLocate(pO5)
		// 		}
		// 		// делать проверки на overflowX / Y и соотв.включать
		// 		if (pos.top !== pos.bottom && pO5.scroll.ovfY !== 'visible') {
		// 			if (a.to === null || a.to == bO5 ||
		// 				(isf && a.to.pos.top < pos.top) ||
		// 				(!isf && a.to.pos.top > pos.top)
		// 			) a.to = pO5
		// 			if (a.bo === null || a.bo == bO5 ||
		// 				(isf && a.bo.pos.bottom > pos.bottom) ||
		// 				(!isf && a.bo.pos.bottom < pos.bottom)
		// 			) a.bo = pO5
		// 		}
		// 		if (pos.left != pos.right && pO5.scroll.ovfX !== 'visible') {
		// 			if (a.le === null || a.le == bO5 ||
		// 				(isf && a.le.pos.left < pos.left) ||
		// 				(!isf && a.le.pos.left > pos.left)
		// 			) a.le = pO5
		// 			if (a.ri === null || a.ri == bO5 ||
		// 				(isf && a.ri.pos.right > pos.right) ||
		// 				(!isf && a.ri.pos.right < pos.right)
		// 			) a.ri = pO5
		// 		}
		// 	}

		// 	// console.log(`--:  a.to=${a.to.name}, a.to.pos.top=${a.to.pos.top}`)
		// 	return a
		// },
		CutBounds = aO5 => {
			const
				// putV = aO5.cls.putV,
				// act = aO5.act,
				posC = aO5.posC

			const owner = aO5.owner,
				b = owner.bo.pos.bottom,
				t = owner.to.pos.top,
				l = owner.le.pos.left,
				r = owner.ri.pos.right

			let d = posC.top + posC.height - b
			if (d > 0) {
				posC.height -= d
			}
			d = t - posC.top
			if (d > 0) {
				posC.top = t
				posC.height -= d
				aO5.posS.top -= d
			}
			d = posC.left + posC.width - r
			if (d > 0) {
				posC.width -= d
			}
			d = l - posC.left
			if (d > 0) {
				posC.left = l
				posC.width -= d
				aO5.posS.left -= d
			}
			if (posC.height <= 0)
				aO5.act.readyFix = false
		},
		Adhereds = timeStamp => {
			// const
			// 	IsAbove = (l1, r1, l2, r2) => {
			// 		return (l2 >= l1 && l2 <= r1) || (r2 >= l1 && r2 <= r1) ||
			// 			(l1 >= l2 && l1 <= r2) || (r1 >= l2 && r1 <= r2)
			// 	},
			// 	Missed = (l1, r1, l2, r2) => {
			// 		return r1 < l2 || l1 > r2  // || r2 < l1 || l2 > r1
			// 	}
			let foundAdh = false
			// posC = null,
			// posS = null,
			// level = 0,
			// pitch = ''

			const
				FixV = (aO5, fO5, b, top) => {
					Object.assign(aO5.posC, b)
					aO5.posC.top = top
					if (!aO5.act.xFixed) {
						aO5.DoFixV(fO5)
						aO5.ShowFix()
					}
					foundAdh = true
				},
				ActOnTop = (pitch, posC, posS, d) => {	// спихиваю верхний в зависимоти ЕГо pitch'а
					switch (pitch) {
						case 'P':
							posC.height = 0
							break
						case 'S':
							posC.height -= d
							posS.top = -d
							break
						case 'C':
							posC.height -= d
							break
						default: // case 'O' - просто наезжает
					}
				},
				ActOnBottom = (pitch, posC, posS, d) => { 	// спихиваю нижний в зависимоти ЕГо pitch'а
					switch (pitch) {
						case 'P':
							posC.topo += posC.height
							posC.height = 0
							break
						case 'S':
							posC.top += d
							posC.height -= d
							break
						case 'C':
							posC.top += d
							posC.height -= d
							posS.top = -d
							break
						default: // case 'O' - просто наезжает
					}
				}

			for (const fO5 of wshp.aO5s) {
				if (fO5.act.xFixed) {
					const posC = fO5.posC
					// posS = fO5.posS
					// level = fO5.act.level
					// pitch = fO5.cls.pitch

					for (const aO5 of wshp.aO5s) {
						if (aO5.act.xFixed)
							continue

						const b = aO5.shdw.getBoundingClientRect()
						if (!(b.lef + b.width < posC.left || b.left > posC.left + posC.width))
							if (fO5.cls.putV === 'T') {
								const d = posC.top + posC.height - b.top

								if (posC.top < b.top && d > 0) {
									if (fO5.act.level > aO5.act.level)  // прижимаюсь и фиксируюсь
										FixV(aO5, fO5, b, posC.top + posC.height)
									else
										ActOnTop(fO5.cls.pitch, posC, fO5.posS, d)
								}
								else
									if (aO5.act.xFixed === fO5)
										aO5.UnFixV()
							} else {
								const d = b.top + b.height - posC.top

								if (posC.top > b.top && b > 0) {
									if (fO5.act.level > aO5.act.level)  // прижимаюсь и фиксируюсь
										FixV(aO5, fO5, b, posC.top - aO5.posC.height)
									else
										ActOnBottom(fO5.cls.pitch, posC, fO5.posS, d)
								}
								else
									if (aO5.act.xFixed === fO5)
										aO5.UnFixV()
							}
					}
				}
			}
			if (foundAdh)
				Adhereds(timeStamp)
		},
		DoScroll = e => {
			// for (const aO5 of wshp.aO5s) {    // делаю для всех, т.к. могут понадобиться в Adhereds()
			// 	const
			// 		b = aO5.shdw.getBoundingClientRect() // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона
			// 	Object.assign(aO5.posW, { top: b.top, left: b.left, height: b.height, width: b.width, })
			// }

			for (const aO5 of wshp.aO5s)
				if (aO5.act.xFixed === true || aO5 === e.aO5) {
					// 	aO5.CalcPosC(pos)
					// ...
					const
						b = aO5.shdw.getBoundingClientRect(),
						bords = aO5.ofram.bords,
						dirup = aO5.cls.dirV === 'U'

					let top = false,
						p = null

					for (const bord of bords) {
						const pO5 = bord.tag.pO5,
							pos = pO5.pos

						if (pos.tim !== timeStamp) {
							pos.tim = timeStamp
							CalcParentLocate(pO5)
						}

						if (
							(b.top < pos.top && dirup) ||
							(b.top + b.hehight > pos.bottom && !dirup)
						) {
							b.top = dirup ? top : bottom - b.height
							p = pO5
							break
						}
					}
					Object.assign(aO5.posC, b)

					if (aO5 === e.aO5) {
						aO5.DoFixV(true)
						aO5.StrtObs(true)
					}


					// // итоговые внутренние  рамки подвисания
					// Object.assign(aO5.ofram, PrepareBords(aO5.ofram.bords, true, e.timeStamp))

					// положение зафиксированного
					Object.assign(aO5.posS, { top: 0, left: 0, })
					// Object.assign(aO5.posC, aO5.posW)
					// aO5.posC.top = aO5.cls.putV === 'T' ?
					// 	aO5.ofram.to.pos.top :
					// 	aO5.ofram.bo.pos.bottom - posC.height
				}

			for (const aO5 of wshp.aO5s)
				if (aO5.act.xFixed) {
					// итоговые  внешние рамки обрезания
					Object.assign(aO5.owner, PrepareBords(aO5.owner.bords, false, e.timeStamp))

					CutBounds(aO5)			// обрезание зафиксированных
					Adhereds(e.timeStamp) 	// прилипнувшие

					aO5.ShowFix()			// отображение зафиксированного
				}
		},
		wshp = C.ModulAddSub(olga5_modul, DoScroll)

	wshp.fixed = []
	wshp.escroll = new class {
		#eve
		#isScroll
		constructor() {
			this.#eve = 'scroll'
			this.#isScroll = null
		}
		ScrollAct(act, txt) {
			if (act !== this.#isScroll) {
				this.#isScroll = act
				if (act)
					window.addEventListener(this.#eve, DoScroll, true)
				else
					window.removeEventListener(this.#eve, DoScroll, true)
				if (o5debug > 0)
					console.log("%c%s", fmtOK, `Скроллинг  EventListener : ${act ? 'запуск' : 'убрал   '} после "${txt}"`)
			}
			else
				if (o5debug > 0)
					console.log("%c%s", fmtErr, `Скроллинг  EventListener : повтор ${act ? 'запуска ' : 'останова'} после "${txt}"`)
		}
	}()
})();
