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
						// pNew = (mis0) ? (
						// 	(!isVisi && pInc.bords[m] !== pOut) ? pOut : null
						// ) : (
						// 	(isVisi && pInc.bords[m] === pOut) ? pInc : null
						// )

						if (pNew !== pInc.bords[m]) {
							if (o5debug)
								console.log(`  pInc=${pInc.name}  'm=${m}': ${pInc.bords[m].name} => ${pNew.name}`)

							pInc.bords[m] = pNew
							pInc.bords.isChg += m
						}
					}
			}

			for (const pInc of pO5.pIncs)
				// console.log(`- pO5=${pO5.name} -> pInc=${pInc.name} ${pInc.scops.isVisible}`)
				// if (pInc.name==='#div3')
				// 	console.log()
				if (pInc.scops.isVisible)
					CalcCovers(pInc, ms)
		},
		CalcBords = pO5 => {
			for (const pInc of pO5.pIncs) 		// позиции всех вложенных контейнеров
				if (pInc.scops.isVisible) {
					pInc.CalcScope()
					pInc.bords.isChg = ''

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

		// for (const aO5 of pcO5.aO5s)			// позиции всех внутренних тегов - 1 раз!
		// 	aO5.CalcCurPos()

		CalcBords(pcO5)

		for (const pBase of pcO5.pBases)
			for (const aO5 of pBase.aO5s)			// позиции всех внутренних тегов - 1 раз!
				aO5.CalcCurPos()

		for (const x of xs)
			CalcCovers(pcO5, [x, opp[x]])

		for (const x of xs)
			for (const pBase of pcO5.pBases)
				if (pBase.pO5.scops.isVisible) {
					const bords = pBase.pO5.bords
					for (const m of [x, opp[x]]) {
						const
							isChg = bords.isChg.includes(m),
							pOut = bords[m],
							v = pOut.scops[m]

						for (const aO5 of pBase.aO5s) {
							let
								pFm = aO5.pFixs[m]

							if (pFm && isChg)
								if (aO5.pCouldFixs[m].includes(pOut)) // перефиксирую на новой границе
									pFm = aO5.pFixs[m] = pOut

							if (m === x) {
								const
									d = IsOut(m, aO5.posC, v)

								if (d > 0)
									if (aO5.pCouldFixs[m].includes(pOut))
										aO5.DoFix(m, pOut, v)
									else
										if (pFm)
											aO5.DoCut(m, d, v)
							} else
								if (pFm) {
									const
										v = pOut.scops[m],
										d = IsOut(m, aO5.posO, v)
									if (d < 0)
										aO5.UnFix(m, pFm)
									else {
										const b = IsOut(m, aO5.posC, v)
										if (b > 0)
											aO5.DoCut(m, b, v)
									}
								}
						}
					}
				}

		for (const pBase of pcO5.pBases)
			for (const aO5 of pBase.aO5s)
				for (const m of 'TLRB')
					if (aO5.pFixs[m]) {
						ScheduleShowFixed(aO5)
						break
					}
	}
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll, CalcCovers])

})();