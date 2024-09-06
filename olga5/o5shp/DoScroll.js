/*jshint asi:true          */
/* -global window, console */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoScroll ---
	"use strict"

	let timeStamp = 0

	const
		olga5_modul = "o5shp",
		modulname = 'DoScroll',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmtOK = "background: cornsilk; color: black;",
		fmtErr = "background: lightgoldenrodyellow; color: black;",
		doc = document.documentElement,
		CalcParentLocate = (pO5, timeStamp) => {
			pO5.pos.tim = timeStamp

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
		SetFixedsPosC = aO5 => {
			const
				posC = aO5.posC,
				bords = aO5.ofram.bords,
				dirup = aO5.cls.dirV === 'U'

			Object.assign(posC, aO5.posW) // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона

			for (const bord of bords) {
				const pO5 = bord.tag.pO5,
					pos = pO5.pos

				if (pos.tim !== timeStamp)
					CalcParentLocate(pO5, timeStamp)

				if (
					(posC.top < pos.top && dirup) ||
					(posC.top + posC.hehight > pos.bottom && !dirup)
				) {
					posC.top = dirup ? pO5.pos.top : pO5.pos.bottom - posC.height
				}
			}
		},
		CutFixeds = aO5 => {
			const
				posC = aO5.posC,
				posS = aO5.posS,
				bords = aO5.owner.bords,
				putop = aO5.cls.putV === 'T'

			let d = 0

			for (const bord of bords) {
				const
					pO5 = bord.tag.pO5

				if (pO5.pos.tim !== timeStamp)
					CalcParentLocate(pO5, timeStamp)

				// вертикальное обрезание зафиксированных
				if ((putop)) {
					d = posC.top + posC.height - pO5.pos.bottom
					if (d > 0) {
						posC.height -= d
					}
				} else {
					d = pO5.pos.top - posC.top
					if (d > 0) {
						posC.top = pO5.pos.top
						posC.height -= d
						posS.top -= d
					}
				}

				// горизонтальное обрезание СЛЕВА зафиксированных

				d = pO5.pos.left - posC.left
				if (d > 0) {
					posC.left = pO5.pos.left
					posC.width -= d
					posS.left -= d
				}
				d = posC.left + posC.width - pO5.pos.right
				if (d > 0) {
					posC.width -= d
				}
			}

		},
		Adhereds = () => {
			let foundAdh = false

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
				},
				AdhAonF = (aO5, fO5) => {
					const
						posC = fO5.posC,
						b = aO5.posW

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

			for (const fO5 of wshp.aO5s)
				if (fO5.act.xFixed) {
					const tagL = fO5.ofram.bordL.tag
					for (const aO5 of wshp.aO5s)
						if (!aO5.act.xFixed)		// && aO5.ofram.bordL.tag == tagL)
							AdhAonF(aO5, fO5)
				}

			if (foundAdh)
				Adhereds()
		},
		DoScroll = e => {
			timeStamp = e.timeStamp

			for (const aO5 of wshp.aO5s) {
				const b = aO5.shdw.getBoundingClientRect()
				Object.assign(aO5.posW, { top: b.top, left: b.left, height: b.height, width: b.width }) // нелья сразу - 'лишние' поля
				Object.assign(aO5.posS, { top: 0, left: 0, })
			}

			for (const aO5 of wshp.aO5s)
				if (aO5.act.xFixed === true || aO5 === e.aO5) {
					SetFixedsPosC(aO5)

					if (aO5 === e.aO5) {
						aO5.DoFixV(true)
						aO5.StrtObs(true)
					}

				}

			Adhereds() 	// прилипнувшие

			for (const aO5 of wshp.aO5s)
				if (aO5.act.xFixed)
					CutFixeds(aO5)

			for (const aO5 of wshp.aO5s)
				if (aO5.act.xFixed) {
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
