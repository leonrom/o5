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

		SetBords = (m, pOut, bords, pBase, isTL, vb) => {
			const
				v = pOut.scops[m],
				iOut = bords.indexOf(pOut),
				inside = isTL ? vb < v : vb >= v //	граница 'vb' у pBase внутри pOut

			if (iOut >= 0) {
				if (!inside) {	// было пересечение а теперь стало внутри
					bords.splice(iOut, 1)
					pBase.bChgs[m] = bords[0]
				}
			}
			else
				if (inside) {	// пересечения не было а вышло из внутри
					let i = bords.length
					while (i-- > 0)
						if (isTL ? bords[i].scops[m] >= v : bords[i].scops[m] < v)
							break

					bords.splice(i, 0, pOut)
					pBase.bChgs[m] = bords[0]
				}
		},
		CalcCovers = (m, isTL, pcO5) => {	//  пересчет въезжания вложенных контейнеров
			let covers;
			for (const pBase of pcO5.pBases) {
				const pbO5 = pBase.pO5
				pBase.bChgs[m] = null
				if (pbO5.scops.isVisible) {
					const
						bords = pBase.bordss[m],
						vb = pbO5.scops[m]

					for (const pOut of pbO5.pOuts)
						if (pOut !== pbO5)
							SetBords(m, pOut, bords, pBase, isTL, vb)

					if (pBase.bChgs[m])
						covers = true
				}
			}
			return covers
		},
		CalcCuts = (m, isTL, pcO5, x) => {
			const
				pCut = pcO5.cuts[m],
				vc = pCut.scops[m]
			let cuts;
			for (const pInc of pcO5.pIncs) {
				if (pInc !== pcO5) { // && pInc.scops.isVisible) {
					const
						vi = (m !== x) ? pInc.scops[m] : pInc.cuts[m].scops[m],
						d = isTL ? vc - vi : vi - vc

					if (d > 0 && pInc.cuts[m] !== pCut) {
						pInc.cuts[m] = pCut
						cuts = true
					}
					if (d < 0 && pInc.cuts[m] === pCut) {
						const o = { p: null, d: NaN }
						for (const p of pInc.pOuts) {
							const d = isTL ? p.scops[m] - vi : vi - p.scops[m]
							if (!o.p || d > o.d)
								Object.assign(o, { p: p, d: d })
						}
						pInc.cuts[m] = o.p
						cuts = true
					}
				}
			}
			return cuts
		},
		SetBorders = (x, pcO5) => {
			for (const m of [x, opp[x]]) {// ms[0] прямой ход, ms[1] - обратный
				const
					isTL = 'TL'.includes(m),
					cuts = CalcCuts(m, isTL, pcO5, x),
					covers = CalcCovers(m, isTL, pcO5)

				if (cuts || covers) {
					for (const pBase of pcO5.pBases)
						pBase.bordss[m].sort((b1, b2) =>	 // по возрастанию						
							isTL ? (b2.scops[m] - b1.scops[m]) : (b1.scops[m] - b2.scops[m]))

					if (o5debug > 1) {
						for (const pBase of pcO5.pBases)
							console.log(
								`covers [${m}]${covers ? '::' : '  '} ${pcO5.name}->${pBase.pO5.id} = ` +
								`${pBase.bordss[m].map(b => b.name + ':' + b.scops[m]).join(', ')}`
							)
						const pAll = Array.from(wshp.PO5shp.PO5.pBody.pIncs)
						if (cuts)
							console.log(
								`  cuts [${m}]${cuts ? '::' : '  '} ` +
								`${pAll.map(p => p.name + ':' + p.cuts[m].name).join(', ')}`
							)
					}
				}
			}
		},
		GetV = (m, aX) => {	// если результат > 0 то тег вышел за пределы контейнера
			switch (m) {
				case 'T': return aX.top
				case 'L': return aX.left
				case 'R': return aX.left + aX.width
				case 'B': return aX.top + aX.height
			}
		},
		IsOut = (m, aX, v) => {	// если результат > 0 то тег вышел за пределы контейнера
			switch (m) {
				case 'T': return v - aX.top;
				case 'L': return v - aX.left;
				case 'R': return aX.left + aX.width - v;
				case 'B': return aX.top + aX.height - v;
			}
		},
		InnerCut = (m, pBase, aO5) => {

		},
		PosTags = (m, x, pBase) => {
			const
				isTL = 'TL'.includes(m),
				bords = pBase.bordss[m],
				pOut = bords[0],
				vOut = pOut.scops[m]

			let pFix, pCut

			if (pBase.bChgs[m])		 // сначала перефиксирую
				for (const aO5 of pBase.aO5s[m]) {
					const
						vO = GetV(m, aO5.posO),
						canFix =
							aO5.CanFixsOn(pOut) &&
							aO5.cls.puts.includes(m),
						dbg = {}

					pFix = aO5.IsFix(m)
					pCut = aO5.IsCut(m)

					if (o5debug)
						Object.assign(dbg, { oldFix: pFix, oldCut: pCut })

					if (m === x) {			// прямой ход и фиксация									
						if (canFix && !pCut) {
							if (
								(pFix && pOut !== pFix) ||		// очередность важна для оптимальноти
								(!pFix && (isTL ? (vO < vOut) : (vO > vOut)))
							)
								aO5.DoFix(m, pOut)
						}
						else
							if (pFix)
								aO5.DoCut(m, pOut)
					}
					else {			// обратный ход и расфиксация
						if (!pFix) continue

						let pF;
						for (pF of bords)
							if (aO5.CanFixsOn(pF))
								break

						const vF = pF.scops[m]
						if (pFix === pF) {
							if (isTL ? (vO >= vF) : (vO <= vF))
								aO5.UnFix(m)
						} else
							aO5.DoFix(m, pF)

						if (vF !== pOut && aO5.IsFix(m))
							aO5.DoCut(m, pOut)
						else
							if (aO5.IsCut(m))
								aO5.UnCut(m)
					}

					if (o5debug) {
						const newFix = aO5.IsFix(m), newCut = aO5.IsCut(m), iF = dbg.oldFix != newFix, iC = dbg.oldCut != newCut
						if (iF || iC)
							console.log(`изменения для ${aO5.a_name}: ` +
								`${iF ? '*' : ' '}fix=${dbg.oldFix ? dbg.oldFix.name : ' -  '}->${newFix ? newFix.name : ' -  '}, ` +
								`${iC ? '*' : ' '}cut=${dbg.oldCut ? dbg.oldCut.name : ' -  '}->${newCut ? newCut.name : ' -  '}`
							)
					}
				}

			if (m !== x) 				// обрезание по внутренним контейнерам			
				for (const aO5 of pBase.aO5s[m])
					if (aO5.IsFix(m))
						for (const tagIn of pBase.tagsIn)
							if (tagIn === aO5.frms.tagCut) {
								if (!tagIn.pO51)
									tagIn.pO51 = { t: 0, T: 0, L: 0, R: 0, B: 0 }
								const p = tagIn.pO51
								if (p.t !== time) {
									const x = tagIn.getBoundingClientRect()
									Object.assign(p, { t: time, T: x.top, L: x.left, R: x.right, B: x.bottom })
								}
								const
									v = p[m],
									aC = aO5.posC,
									vC = GetV(m, aC)
								if (isTL ? (vC < v) : (vC > v))
									switch (m) {
										case 'T': aC.top = v; break
										case 'L': aC.left = v; break
										case 'R': aC.left = v - aC.width; break
										case 'B': aC.top = v - aC.height; break
									}

								berak
							}

			// for (const aO5 of pBase.aO5s[m]) {
			// 	if (pChg && canFix && pFix)
			// 		aO5.DoFix(m, pOut, v)	// перефиксирую на новой границе

			// 	if (m === x && d > 0 && canFix) {
			// 		aO5.DoFix(m, pOut, v)
			// 		aO5.UnCutF(m)
			// 	}
			// 	if (m !== x && pFix && IsOut(m, aO5.posO, v) < 0) {
			// 		aO5.UnFix(m)
			// 		aO5.UnCutF(m)
			// 	}

			// 	if (pFix === aO5.IsFixs(m))  // было и осталось то-же самое Fix
			// 		if (d > 0)
			// 			aO5.DoCutF(x, m, d, v)

			// 	if (d < 0)
			// 		aO5.UnCutF(x, m, d, v)
			// }
		}

	function MakeScroll(scV, scH, pcO5, fromTest) {
		time = performance.now()
		// направление движения объектов в контейнере - обратное ползунку скроллинга	
		let xs = ''
		if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
		if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

		for (const pInc of pcO5.pIncs) 		// позиции всех вложенных контейнеров
			if (pInc !== pcO5)
				pInc.CalcScope()

		for (const pBase of pcO5.pBases)
			for (const aO5 of pBase.aAll)			// позиции всех внутренних тегов - 1 раз!
				aO5.CalcCurPos()

		for (const x of xs)
			SetBorders(x, pcO5)

		for (const x of xs)
			for (const pBase of pcO5.pBases)
				if (pBase.pO5.scops.isVisible)
					for (const m of [x, opp[x]])
						PosTags(m, x, pBase)

		for (const pBase of pcO5.pBases)
			for (const aO5 of pBase.aAll)
				if (aO5.ShouldFix())
					ScheduleShowFixed(aO5)
	}
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll, SetBorders])

})();