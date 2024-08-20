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
		doc = document.documentElement,
		PrepareBords = (bords, isf, timeStamp) => {
			const
				bO5 = document.body.pO5,
				a = { to: bO5, le: bO5, ri: bO5, bo: bO5 },
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
				}

			for (const bord of bords) {
				const pO5 = bord.tag.pO5,
					pos = pO5.pos

				if (pos.tim !== timeStamp) {
					pos.tim = timeStamp
					CalcParentLocate(pO5)
				}
				// делать проверки на overflowX / Y и соотв.включать
				if (pos.top !== pos.bottom && pO5.scroll.ovfY !== 'visible') {
					if (a.to === null || a.to == bO5 ||
						(isf && a.to.pos.top < pos.top) ||
						(!isf && a.to.pos.top > pos.top)
					) a.to = pO5
					if (a.bo === null || a.bo == bO5 ||
						(isf && a.bo.pos.bottom > pos.bottom) ||
						(!isf && a.bo.pos.bottom < pos.bottom)
					) a.bo = pO5
				}
				if (pos.left != pos.right && pO5.scroll.ovfX !== 'visible') {
					if (a.le === null || a.le == bO5 ||
						(isf && a.le.pos.left < pos.left) ||
						(!isf && a.le.pos.left > pos.left)
					) a.le = pO5
					if (a.ri === null || a.ri == bO5 ||
						(isf && a.ri.pos.right > pos.right) ||
						(!isf && a.ri.pos.right < pos.right)
					) a.ri = pO5
				}
			}

			// console.log(`--:  a.to=${a.to.name}, a.to.pos.top=${a.to.pos.top}`)
			return a
		},
		CutBounds = aO5 => {
			const putV = aO5.cls.putV,
				act = aO5.act,
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
		Scroll = e => {
			for (const aO5 of wshp.fixed) {
				// итоговые внутренние и внешние рамки
				Object.assign(aO5.ofram, PrepareBords(aO5.ofram.bords, true, e.timeStamp))
				Object.assign(aO5.owner, PrepareBords(aO5.owner.bords, false, e.timeStamp))

				// положение зафиксированного
				const posW = aO5.posW,
					posC = aO5.posC,
					b = aO5.shdw.getBoundingClientRect() // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона

				Object.assign(posW, { top: b.top, left: b.left, height: b.height, width: b.width, })
				Object.assign(aO5.posS, { top: 0, left: 0, })
				Object.assign(posC, posW)
				posC.top = aO5.cls.putV === 'T' ?
					aO5.ofram.to.pos.top :
					aO5.frames.bo.pos.bottom - posC.height

				// console.log(`--:  aO5.ofram.to.pos.top=${aO5.ofram.to.pos.top}`)

				CutBounds(aO5)		// обрезание зафиксированных

				aO5.ShowFix()		// отображение зафиксированного
			}
		},
		Add2fixed = aO5 => {
			const
				CalcLevel = (aO5, level) => {
					const bords = aO5.ofram.bords,
						xO5 = bords[bords.length - 1].aO5shp
					if (xO5)
						CalcLever(xO5, ++level)
					return level
				},
				level = aO5.cls.level = CalcLevel(aO5, 0)

			let i = wshp.fixed.length
			while (i-- > 0)
				if (wshp.fixed[i].cls.level < level)
					break

			wshp.fixed.splice(i + 1, 0, ...[aO5])
		},
		DoScroll = (aO5, entry) => {
			if (entry) {
				const
					br = entry.boundingClientRect,
					top = entry.intersectionRect.top,
					bottom = entry.intersectionRect.bottom

				if (
					(br.top >= top && aO5.cls.dirV === 'U') ||
					(br.bottom <= bottom && aO5.cls.dirV === 'D')
				)
					return 'N'
				console.log(`--:  DoScroll entry.intersectionRect.top=${entry.intersectionRect.top}`)
				const
					posC = aO5.posC,
					b = aO5.shdw.getBoundingClientRect() // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона

				Object.assign(aO5.posW, { top: b.top, left: b.left, height: b.height, width: b.width, })
				Object.assign(posC, aO5.posW)
				posC.top = aO5.cls.dirV === 'U' ? top : bottom - posC.height

				aO5.DoFixV()

				Add2fixed(aO5)
				if (!isScroll) {
					console.log(`добавляю: addEventListene для ${aO5.name} `)
					window.addEventListener('scroll', Scroll, true)
					isScroll = true
				}
			} else {
				aO5.UnFixV()

				wshp.fixed.splice(wshp.fixed.indexOf(aO5), 1)

				if (wshp.fixed.length === 0 && isScroll) {
					console.log(`убрал   : removeEventListener для ${aO5.name} `)
					window.removeEventListener('scroll', Scroll, true)
					isScroll = false
				}
			}
			aO5.ShowFix()


			if (o5debug > 2)
				if (wshp.fixed.length > 0)
					C.Debug.ShowBounds(wshp.fixed)
				else
					console.log('ytne gjldbcib[')
		},
		wshp = C.ModulAddSub(olga5_modul, modulname, DoScroll)

	wshp.fixed = []
})();
