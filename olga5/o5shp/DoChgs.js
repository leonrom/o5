/*jshint asi:true          */
/* global window, console, document */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
// Configure desktop -> Mouse Action -> Right-Button
(function () {              // ---------------------------------------------- o5shp/DoChgs ---
	"use strict"

	let wshp, time;
	let tstO5, tstId = 'shp4', tstNam = 'bottom', tstVal = 481;

	// ---- batching ShowFix() per frame ----
	const FixUpdateQueue = new Set()
	let fixUpdateScheduled = false

	function ScheduleShowFixed(aO5) {
		FixUpdateQueue.add(aO5)
		if (!fixUpdateScheduled) {
			fixUpdateScheduled = true
			requestAnimationFrame(() => {
				for (const o of FixUpdateQueue)
					o.ShowFix()
				FixUpdateQueue.clear()
				fixUpdateScheduled = false
			})
		}
	}

	const
		olga5_modul = "o5shp",
		modulname = 'DoChgs',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmtOK = "background: cornsilk; color: black;",
		fmtErr = "background: yellow; color: black;",
		opp = { T: 'B', L: 'R', R: 'L', B: 'T' },

		CanFixsOn = (aO5, pO5) => {
			for (const frame of aO5.frms.frames)
				if (frame.pO5 === pO5)
					return true
		},
		FindExternalFixCuts = (m, pBase) => {
			const bords = pBase.bordss[m]
			for (const aO5 of pBase.aAll) {
				let cF = null
				if (aO5.cls.puts[m])
					for (const p of bords)
						if (CanFixsOn(aO5, p)) {
							cF = p
							break
						}

				aO5.canFixs[m] = cF
				aO5.canCuts[m] = bords[0]	//	(cF === bords[0]) ? null : bords[0]

				if (aO5.pFixs[m])
					aO5.pFixs[m] = cF

				if (o5debug > 2) console.log(`${aO5.name} :  ` +
					`canFixs[${m}] = ${cF ? cF.name : ' -  '},   ` +
					`canCuts[${m}] = ${aO5.canCuts[m] ? aO5.canCuts[m].name : ' -  '}`)
			}
		},
		GetV = (m, aX) => {
			switch (m) {
				case 'T': return aX.top
				case 'L': return aX.left
				case 'R': return aX.left + aX.width
				case 'B': return aX.top + aX.height
			}
		},
		SetV = (m, aX, v) => {
			switch (m) {
				case 'T': aX.top = v; break
				case 'L': aX.left = v; break
				case 'R': aX.left = v - aX.width; break
				case 'B': aX.top = v - aX.height; break
			}
		},
		CheckHidden = (aO5) => {
			if (aO5.posC.height <= 0)
				aO5.hidden.T = aO5.hidden.B = 1
			if (aO5.posC.width <= 0)
				aO5.hidden.L = aO5.hidden.R = 1

			if (!aO5.cls.alive)
				for (const x of 'TLRB')
					if (aO5.hidden[x]
						&& aO5.pFixs[x]
						// && !aO5.forced[x]
					) {
						aO5.DoFix(x, null)

						const
							o = opp[x],
							isTL = 'TL'.includes(x),
							attaches = aO5.attaches[o]
						let j = attaches.length
						while (j-- > 0) {
							const iO5 = attaches[j]
							attaches.splice(j, 1)
							iO5.DoFix(x)
							if (!vv.ToFix(x, iO5, isTL))
								UnAtFrom(x, iO5)
						}
					}
		},
		AttachTo = (x, aO5) => {
			const
				o = opp[x],
				level = aO5.cls.level,
				vC = GetV(o, aO5.posC),
				isTL = 'TL'.includes(x),
				attaches = aO5.attaches[o]
/**
 * ищу тех, кто может прилипнуть к aO5
 */
			for (const iO5 of aO5.aO5s[x])
				if (iO5.cls.level < level
					&& !iO5.pFixs[x]
				) {
					if (!iO5.aFixs[x]) {
						const vI = GetV(x, iO5.posC)
						if (isTL ? vC > vI : vC < vI) {
							iO5.DoFix(x, aO5)
							attaches.push(iO5)
						}
					}
					if (iO5.aFixs[x]) {
						const
							o = opp[x],
							vI = GetV(o, iO5.aFixs[x].posC)

						SetV(x, iO5.posC, vI)

						// InternalTagCuts(o, iO5)
						for (const m of 'TLRB') {
							InternalTagCuts(m, iO5)
							// if (aO5.canCuts[m])		// && !aO5.aFixs[x])
							// 	ExternalFixCuts(m, aO5)
						}
						AttachTo(x, iO5)
					}
				}
		},
		UnAtFrom = (x, aO5) => {
			const
				o = opp[x],
				vC = GetV(o, aO5.posC),
				isTL = 'TL'.includes(x),
				attaches = aO5.attaches[o]
			// isfix = aO5.pFixs[x]||aO5.aFixs[x]

			let j = attaches.length
			while (j-- > 0) {
				const
					iO5 = attaches[j],
					vI = GetV(x, iO5.posO)

				// if (!isfix || (isTL ? vC <=vI : vC >= vI) ){
				if (isTL ? vC <= vI : vC >= vI) {
					iO5.DoFix(x)
					attaches.splice(j, 1)

					if (iO5.attaches[o].length > 0)
						UnAtFrom(x, iO5)
				}
			}
		},
		SetPos = (x, v, aC, aO) => {
			switch (x) {
				case 'T': aC.top = v; break
				case 'L': aC.left = v; break
				case 'R': aC.left = v - aO.width; break
				case 'B': aC.top = v - aO.height; break
			}
		},
		ExternalFixCuts = (x, aO5) => {
			const
				v = aO5.canCuts[x].scops[x],
				aC = aO5.posC
			let d;
			switch (x) {
				case 'T': d = v - aC.top; break
				case 'L': d = v - aC.left; break
				case 'R': d = (aC.left + aC.width) - v; break
				case 'B': d = (aC.top + aC.height) - v; break
			}

			if (d > 0) {
				switch (x) {
					case 'T': aC.height -= d; aC.top += d; aO5.posS.top -= d; break
					case 'L': aC.width -= d; aC.left += d; aO5.posS.left -= d; break
					case 'R': aC.width -= d; break
					case 'B': aC.height -= d; break
				}
			}
		},
		InternalTagCuts = (o, aO5) => {
			const
				pO5 = aO5.frms.tagCut.pO5,
				v = pO5.scops[o],
				aC = aO5.posC

			let d;
			switch (o) {
				case 'T': d = v - aC.top; break
				case 'L': d = v - aC.left; break
				case 'R': d = aC.left + aC.width - v; break
				case 'B': d = aC.top + aC.height - v; break
			}

			if (d > 0)
				switch (o) {
					case 'T': aC.height -= d; aC.top += d; break
					case 'L': aC.width -= d; aC.left += d; break
					case 'R': aC.width -= d; aO5.posS.left -= d; break
					case 'B': aC.height -= d; aO5.posS.top -= d; break
				}
		},
		AbsoluteZIndex = (elem) => {
			let current = elem, zTotal = 0, multiplier = 1;

			while (current && current !== document) {
				const style = window.getComputedStyle(current),
					z = style.zIndex,
					pos = style.position,
					hasContext =
						(pos !== 'static' && z !== 'auto') ||
						['transform', 'opacity', 'filter', 'perspective', 'willChange'].some(p => {
							const v = style[p]
							return v && v !== 'none' && v !== '1'
						})

				if (hasContext) {
					const zNum = isNaN(parseInt(z)) ? 0 : parseInt(z);
					zTotal += zNum * multiplier;
					multiplier *= 1000 // каждый новый контекст — «новый порядок» уровней
				}
				current = current.parentElement
			}

			return zTotal
		},
		ShiftBy = (x, aO5) => {
			const
				o = opp[x],
				level = aO5.cls.level,
				vC = GetV(o, aO5.posC),
				isTL = 'TL'.includes(x)
/**
 * 	ищу тех, которы согут сдвинуть/сжать aO5
 *  среди тех, которые находятся со стороны 'o'
 */	
			let vX = vC, xO5;
			for (const iO5 of aO5.aO5s[x])
				if (iO5.cls.level > level) {		// && !iO5.pFixs[x] && !iO5.aFixs[x]) {
					const vI = GetV(x, iO5.posC)
					if (isTL ? vX > vI : vX < vI) {
						xO5 = iO5
						vX = vI
					}
				}
			let rez = 0
			if (xO5) {
				const d = isTL ? (vC - vX) : (vX - vC), aC = aO5.posC, aS = aO5.posS
				switch (xO5.cls.pitch) {
					case 'C':
						switch (x) {	// сжимает предыдущий	
							case 'T': aC.height -= d; break
							case 'L': aC.width -= d; break
							case 'R': aC.width -= d; aC.left += d; aS.left -= d; break
							case 'B': aC.height -= d; aC.top += d; aS.top -= d; break
						}
						rez = 1
						break
					case 'P':
						switch (x) {	// сталкивает предыдущий
							case 'T': aC.height = 0; break
							case 'L': aC.width = 0; break
							case 'R': aC.width = 0; aC.left += aC.width; break
							case 'B': aC.height = 0; aC.top += aC.height; break
						}
						rez = -1
						break
					case 'S':
						switch (x) {	// сдвигает предыдущий
							case 'T': aC.height -= d; aS.top -= d; break
							case 'L': aC.width -= d; aS.left -= d; break
							case 'R': aC.width -= d; aC.left += d; break
							case 'B': aC.height -= d; aC.top += d; break
						}
						rez = 1
						break
					default: {	//case 'O' - наезжает на предыдущий // ничего не даформируется
						if (isNaN(aO5.act.zIndex)) // еще не определялся - делаем однократно
							aO5.act.zIndex = AbsoluteZIndex(aO5.act.cart)
						let xIndex = xO5.shp.style.zIndex
						if (isNaN(xIndex)) xIndex = 0
						if (xIndex <= aO5.act.zIndex)
							xO5.shp.style.zIndex = aO5.act.zIndex + 1
						rez = -1
					}
				}
				CheckHidden(aO5)

				if (aO5.attaches[opp[x]].length > 0) {
					UnAtFrom(x, aO5)
					AttachTo(x, aO5)
				}
				return rez
			}
		},
		DynamicFixAtt = (x, pBase) => {
			let shifts, n = 0
			do {
				// прилипания к зафиксированным
				for (const aO5 of pBase.bO5s[x]) {
					if (aO5.pFixs[x]) // НЕ надо еще и "|| aO5.aFixs[x]"
						AttachTo(x, aO5)

					if (aO5.attaches[opp[x]].length)
						UnAtFrom(x, aO5)
				}
				// сдвиги зафиксированных
				if (n > 0)
					console.log()
				shifts = 0
				for (const aO5 of pBase.bO5s[x])
					if ((aO5.pFixs[x] || aO5.aFixs[x])
						&& (ShiftBy(x, aO5) > 0)
					)
						shifts++

				n++
			} while (shifts > 0 && n < 5)

			if (shifts > 0)
				console.log("%c%s", fmtErr, `динамическая фиксация по [${x}]`, ` не завершилась за ${n} шагов`)
		},
		vv = (() => {
			let vO = NaN, vF = NaN, pF;
			const
				Set = (m, aO5) => {
					pF = aO5.canFixs[m]
					if (pF) {
						vF = pF.scops[m]
						vO = GetV(m, aO5.posO)
						return true
					}
				}
			return {
				ToFix(x, aO5, isTL) {
					if (aO5.cls.puts[x] && !aO5.aFixs[x])
						if (Set(x, aO5)
							&& aO5.pFixs[x] !== pF
							&& (isTL ? (vO < vF) : (vO > vF))
						)
							aO5.DoFix(x, pF)

					if (aO5.pFixs[x]) {
						SetPos(x, aO5.pFixs[x].scops[x], aO5.posC, aO5.posO)
						return true
					}
				},
				UnFix(o, aO5, isTL) {
					if (Set(o, aO5)
						&& aO5.pFixs[o] === pF
						&& (isTL ? (vO >= vF) : (vO <= vF))
					) {	//	тут не надо расфиксировать приаттаченные - они "отъехали" раньше
						aO5.DoFix(o, null)
						return true
					}
					else
						SetPos(o, aO5.pFixs[o].scops[o], aO5.posC, aO5.posO)
				},
			}
		})()

	let dbgstrt = false
	function MakeScroll(scV, scH, pcO5, fromTest) {
		const GAll = i => pcO5.pBases.values().next().value.aAll[i]
		time = performance.now()
		// направление движения объектов в контейнере - обратное ползунку скроллинга	
		let xs = ''
		if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
		if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

		for (const pInc of pcO5.pIncs) 		// позиции всех вложенных контейнеров
			if (pInc !== pcO5 && pInc.scops.time !== time)
				pInc.CalcScope(time)

		for (const x of xs)
			wshp.PBases.PBase.SetBorders(x, pcO5)

		for (const pBase of pcO5.pBases) {
			pBase.CalcCurPozs()

			for (const aO5 of pBase.aAll)
				for (const x of 'TLRB') {
					aO5.hidden[x] = 0
					if (aO5.pFixs[x])
						SetV(x, aO5.posC, aO5.pFixs[x].scops[x])
				}

			for (const tagCut of pBase.tagCuts)
				if (tagCut.pO5.scops.time !== time)
					tagCut.pO5.CalcScope(time)

			for (const m of 'TLRB')  // вообще-то достаточно "for (const x of xs)" + "[x, opp[x]]"
				if (pBase.bChgs[m] || pBase.bChgs.start || fromTest)
					FindExternalFixCuts(m, pBase)

			pBase.bChgs.start = false

			if (!pBase.pO5.scops.isVisible) continue

			for (const x of xs) {
				// прямой ход и фиксация	по 'x' 
				let isTL = 'TL'.includes(x)
				for (const aO5 of pBase.bO5s[x])
					if (
						aO5.act.ready &&
						!vv.ToFix(x, aO5, isTL)
					)
						break

				// расфиксация по 'opp[x]
				const o = opp[x]
				isTL = 'TL'.includes(o)
				for (const aO5 of pBase.bO5s[o])
					if (aO5.act.ready
						&& aO5.pFixs[o]
						&& vv.UnFix(o, aO5, isTL)
					)
						break
			}

			for (const aO5 of pBase.aAll)
				if (aO5.act.ready && aO5.act.isfix) {
					for (const x of 'TLRB') {
						if (aO5.pFixs[x])
							InternalTagCuts(opp[x], aO5)
						if (aO5.canCuts[x] && !aO5.aFixs[x])
							ExternalFixCuts(x, aO5)
					}
					CheckHidden(aO5)
				}

			// динамическая фиксация остальных на зависших элементах
			for (const x of 'TLRB')
				DynamicFixAtt(x, pBase)

			// отображение зафиксированых
			for (const aO5 of pBase.aAll)
				if (aO5.act.isfix)
					ScheduleShowFixed(aO5)

			//   -----------------------  ОСТАВЬ для примера -------------------------------
			// if (dbgstrt && GAll(1).posC.height > 20)
			// 	console.log('-15-')
			// if (GAll(1).posC.height < 20)
			// 	dbgstrt = true
		}
	}
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll])
})();