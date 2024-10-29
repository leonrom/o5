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
		CalcParentLocate = (pO5) => {
			if (pO5.pos.tim === timeStamp)
				return

			if (pO5.isBody)
				Object.assign(pO5.pos,
					{ tim: timeStamp, top: 0, left: 0, right: doc.clientWidth, bottom: doc.clientHeight, })
			else {
				const current = pO5.current,
					isO5 = current.aO5shp,
					p = isO5 ? current.aO5shp.posC :
						current.getBoundingClientRect()

				Object.assign(pO5.pos, {
					tim: timeStamp,
					top: p.top + pO5.add.top,
					left: p.left + pO5.add.left,
					right: isO5 ? p.left + p.width : p.left + current.clientWidth + pO5.add.left,
					bottom: isO5 ? p.top + p.height : p.top + current.clientHeight + pO5.add.top,
				})
			}
		},
		SetFixedsPosC = aO5 => {
			/*
			пересчет 'минимальной' позиции повисабельного объекта
			*/
			const
				posC = aO5.posC,
				bords = aO5.ofram.bords,
				dirup = aO5.cls.dirV === 'U'

			// Object.assign(posC, aO5.posW) // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона

			let ifix = false
			for (const bord of bords) {
				const pO5 = bord.tag.pO5,
					pos = pO5.pos
				// const
				// rshp=aO5.shp.getBoundingClientRect(),
				// rtag=bord.tag.getBoundingClientRect(),
				// rclo=aO5.clon?aO5.clon.getBoundingClientRect():null,
				// rcar=aO5.cart?aO5.cart.getBoundingClientRect():null

				CalcParentLocate(pO5)

				if (		// тут д.б. <=  и >= иначе м.б. дребезг
					(posC.top <= pos.top && dirup) ||
					(posC.top + posC.height >= pos.bottom && !dirup)
				) {
					posC.top = dirup ? pO5.pos.top : pO5.pos.bottom - posC.height
					ifix = true
				}
			}
			return ifix
		},
		CutFixeds = aO5 => {
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

				CalcParentLocate(pO5)

				// вертикальное обрезание зафиксированных
				if ((putop)) {
					d = posC.top + posC.height - pO5.pos.bottom
					if (d > 0) {
						posC.height -= d
						isCuts = true
					}
				} else {
					d = pO5.pos.top - posC.top
					if (d > 0) {
						posC.top = pO5.pos.top
						posC.height -= d
						posS.top -= d
						isCuts = true
					}
				}

				// горизонтальное обрезание СЛЕВА зафиксированных

				d = pO5.pos.left - posC.left
				if (d > 0) {
					posC.left = pO5.pos.left
					posC.width -= d
					posS.left -= d
					isCuts = true
				}
				d = posC.left + posC.width - pO5.pos.right
				if (d > 0) {
					posC.width -= d
					isCuts = true
				}


				if (isCuts) pO5.AddCut(aO5)
				else pO5.DelCut(aO5)
			}

		},
		Adhereds = fO5 => {
			/*
			поиск 'натыкающихся' объектов - только среди тех, 
			которы тоже подвисают на тех же, на которых подвис 'первый'
			*/

			const
				FixV = (aO5, fO5, b, top) => {
					Object.assign(aO5.posC, b)
					aO5.posC.top = top
					if (!aO5.act.xFixed) {
						aO5.DoFixV(fO5)
						// aO5.ShowFix()
					}
				},
				ActOnTop = (pitch, posC, posS, d) => {	// спихиваю верхний в зависимоти ЕГо pitch'а
					switch (pitch) {
						case 'P': posC.height = 0; break
						case 'S': posC.height -= d; posS.top = -d; break
						case 'C': posC.height -= d; break
						default: // case 'O' - просто наезжает
					}
				},
				ActOnBottom = (pitch, posC, posS, d) => { 	// спихиваю нижний в зависимоти ЕГо pitch'а
					switch (pitch) {
						case 'P': posC.top += posC.height; posC.height = 0; break
						case 'S': posC.top += d; posC.height -= d; break
						case 'C': posC.top += d; posC.height -= d; posS.top = -d; break
						default: // case 'O' - просто наезжает
					}
				},
				AdhAonF = (aO5, fO5) => {
					const
						posC = fO5.posC,
						b = aO5.posW

					if (!(b.lef + b.width < posC.left || b.left > posC.left + posC.width)) {
						const cls = fO5.cls,
							dl = cls.level - aO5.cls.level
						let topf = false

						if (fO5.cls.putV === 'T') {
							const d = posC.top + posC.height - b.top

							if (posC.top < b.top && d > 0) {
								if (dl < 0)  
									topf = posC.top + posC.height
								else
									if (dl > 0)
										ActOnTop(cls.pitch, posC, fO5.posS, d)
							}
						} else {
							const d = b.top + b.height - posC.top

							if (posC.top > b.top && b > 0) {
								if (dl < 0)  
									topf = posC.top - aO5.posC.height
								else
									if (dl > 0)
										ActOnBottom(cls.pitch, posC, fO5.posS, d)
							}
						}

						if (topf !== false)
							FixV(aO5, fO5, b, topf)	// прижимаюсь и фиксируюсь
						else
							if (aO5.act.xFixed === fO5)
								aO5.UnFixV()
					}
				}

			const fixedOnBords = fO5.ofram.bords.filter(bord => bord.out) // список ofram на которых подвисло fO5

			if (fixedOnBords)
				for (const fixedOnBord of fixedOnBords) {
					const pO5 = fixedOnBord.tag.pO5
					if (pO5.IsVisi()) {
						const aO5s = pO5.observ.aO5s

						for (const aO5 of aO5s)
							if (!aO5.act.xFixed) {
								AdhAonF(aO5, fO5)
								CutFixeds(aO5)
								Adhereds(aO5)
							}
					}
				}
		},
		DoScroll = e => {
			timeStamp = e.timeStamp

			for (const aO5 of wshp.aO5s)   //  расчет положения - только при наличии видимых bord'ов для вылезших aO5
				if (aO5.IsVisi() || aO5 === e.aO5) {
					const
						// p=aO5.cls.posInPage
						p = aO5.shdw.getBoundingClientRect()

					Object.assign(aO5.posW, { top: b.top, left: b.left, height: b.height, width: b.width }) // нелья сразу - 'лишние' поля
					// Object.assign(aO5.posW, { top: p.top-window.scrollY, left: p.left-window.scrollx, height: p.height, width: p.width }) // нелья сразу - 'лишние' поля
					Object.assign(aO5.posS, { top: 0, left: 0, })
					Object.assign(aO5.posC, aO5.posW)

					if (aO5 === e.aO5)
						aO5.DoFixV(e.bord) // там уже встроено ShowFix()
					else
						if (aO5.act.xFixed.tag) {
							SetFixedsPosC(aO5)	// проверка подвисания уже на самой границе
							CutFixeds(aO5)
						}
				}

			for (const aO5 of wshp.aO5s)   //  проверка подвисшик к вылезших aO5 на видимых bord'ах
				if (aO5.IsVisi() && aO5.act.xFixed.tag)
					Adhereds(aO5) 	// прилипнувшие


			for (const aO5 of wshp.aO5s)
				if (aO5.act.xFixed)
					aO5.ShowFix()			// отображение зафиксированного				
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
					console.log("%c%s", fmtOK, `DoScroll  EventListener : ${act ? 'запуск' : 'убрал   '} после "${txt}"`)
			}
			else
				if (o5debug > 0)
					console.log("%c%s", fmtErr, `DoScroll  EventListener : повтор ${act ? 'запуска ' : 'останова'} после "${txt}"`)
		}
	}()
})();
