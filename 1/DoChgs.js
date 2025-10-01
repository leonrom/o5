/*jshint asi:true          */
/* global window, console, document */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
// Configure desktop -> Mouse Action -> Right-Button
(function () {              // ---------------------------------------------- o5shp/DoChgs ---
	"use strict"

	let wshp, start;
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
		CalcCovers = (pO5, ms) => {	//  пересчет въезжания вложенных контейнеров
			for (const m of ms) {  // ms[0] прямой ход, ms[1] - обратный
				const
					// mis0 = m === ms[0],
					isTL = 'TL'.includes(m)

				for (const pInc of pO5.pIncs)
					if (pO5.scops.isVisible) {
						const
							pOut = pO5.bords[m],
							isVisi = isTL ?
								pInc.scops[m] >= pOut.scops[m] :
								pInc.scops[m] < pOut.scops[m],
							pNew = isVisi ? pInc : pOut

						if (pNew !== pInc.bords[m]) {
							if (o5debug)
								console.log(`  pInc=${pInc.name}  'm=${m}': ${pInc.bords[m].name} => ${pNew.name}`)

							pInc.bords[m] = pNew
							pInc.bChgs[m] = true
						}
					}
			}

			for (const pInc of pO5.pIncs)
				if (pInc.scops.isVisible)
					CalcCovers(pInc, ms)
		},
		CalcBords = pO5 => {
			for (const pInc of pO5.pIncs) 		// позиции всех вложенных контейнеров
				if (pInc.scops.isVisible) {
					pInc.CalcScope()
					for (const m of 'TLRB')
						pInc.bChgs[m] = false

					CalcBords(pInc)
				}
		},
		IsOut = (m, aX, v) => {	// если результат > 0 то тег вышел за пределы контейнера
			switch (m) {
				case 'T': return v - aX.top;
				case 'L': return v - aX.left;
				case 'R': return aX.left + aX.width - v;
				case 'B': return aX.top + aX.height - v;
			}
		}

	function MakeScroll(scV, scH, pcO5, fromTest) {
		// направление движения объектов в контейнере - обратное ползунку скроллинга	
		let xs = ''
		if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
		if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

		CalcBords(pcO5)

		for (const pBase of pcO5.pBases)
			for (const aO5 of pBase.aO5s.T)			// позиции всех внутренних тегов - 1 раз!
				aO5.CalcCurPos()

		for (const x of xs)
			CalcCovers(pcO5, [x, opp[x]])

		for (const x of xs)
			for (const pBase of pcO5.pBases) {
				const pO5 = pBase.pO5
				if (pO5.scops.isVisible) {
					for (const m of [x, opp[x]]) {
						const
							isChg = pO5.bChgs[m],
							pOut = pO5.bords[m],
							v = pOut.scops[m]
						// почему div4  попал в  pO5.bords
						// if (isChg)
						// 	console.log()

						for (const aO5 of pBase.aO5s[m]) {
							const
								canFix = !aO5.IsCut(m) &&
									aO5.cls.puts.includes(m) &&
									aO5.CanFixsOn(pOut),
									
								d = IsOut(m, aO5.posC, v),
								pFix = aO5.IsFix(m)

							if (isChg && canFix && pFix)
								aO5.DoFix(m, pOut, v)	// перефиксирую на новой границе

							if (m === x && d > 0 && canFix) {
								aO5.DoFix(m, pOut, v)
								aO5.UnCut(m)
							}
							if (m !== x && pFix && IsOut(m, aO5.posO, v) < 0) {
								aO5.UnFix(m)
								aO5.UnCut(m)
							}

							// if (pFix && pFix === aO5.IsFix(m)) // было и осталось то-же самое Fix
							if (pFix === aO5.IsFix(m)) // было и осталось то-же самое Fix
								if (d > 0)
									aO5.DoCut(m, d, v)
								else
									aO5.UnCut(m)
						}
					}
				}
			}

		for (const pBase of pcO5.pBases)
			for (const aO5 of pBase.aO5s.T)
				for (const m of 'TLRB')
					if (aO5.IsFix(m)) {
						ScheduleShowFixed(aO5)
						break
					}
	}
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll, CalcCovers])

})();