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
		/**
		 * bordss[m] массив из bords по каждому направлению
		 * bords[0] - ближайшая 'обрезающая' границы,
		 * а bords[bords.length-1] - сам  этот pBase.pO5 (этот контейнер)
		 */
		SetBords = (m, pOut, bords, pBase, isTL, vb) => {
			const
				v = pOut.scops[m],
				iOut = bords.indexOf(pOut),
				inside = isTL ? vb < v : vb >= v //	граница 'vb' у pBase внутри pOut

			if (iOut >= 0) {
				if (!inside) {	// было пересечение а теперь стало внутри
					bords.splice(iOut, 1)
					pBase.bChgs[m] = -1
				}
			}
			else
				if (inside) {	// пересечения не было а вышло из внутри
					let i = bords.length
					while (i-- > 0)
						if (isTL ? bords[i].scops[m] >= v : bords[i].scops[m] < v)
							break

					bords.splice(i, 0, pOut)
					pBase.bChgs[m] = 1
				}
		},
		CalcCovers = (m, pcO5) => {	//  пересчет въезжания вложенных контейнеров
			const isTL = 'TL'.includes(m)
			let covers;
			for (const pBase of pcO5.pBases) {
				const pbO5 = pBase.pO5
				pBase.bChgs[m] = 0
				if (pbO5.scops.isVisible) {
					const
						bords = pBase.bordss[m],
						vb = pbO5.scops[m]

					for (const pOut of pbO5.pOuts)
						if (pOut !== pbO5)
							SetBords(m, pOut, bords, pBase, isTL, vb)

					if (pBase.bChgs[m] !== 0)
						covers = true
				}
			}
			return covers
		},
		CalcCuts = (m, pcO5, back) => {
			const
				isTL = 'TL'.includes(m),
				pCut = pcO5.cuts[m],
				vc = pCut.scops[m]
			let cuts;
			for (const pInc of pcO5.pIncs) {
				if (pInc !== pcO5) { // && pInc.scops.isVisible) {
					const
						vi = back ? pInc.scops[m] : pInc.cuts[m].scops[m],
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
					cuts = CalcCuts(m, pcO5, m !== x),
					covers = CalcCovers(m, pcO5)

				if (cuts || covers) {
					for (const pBase of pcO5.pBases)
						pBase.bordss[m].sort((b1, b2) => b2.scops[m] - b1.scops[m]) // по возрастанию						

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

		for (const pInc of pcO5.pIncs) 		// позиции всех вложенных контейнеров
			if (pInc !== pcO5)
				pInc.CalcScope()

		for (const pBase of pcO5.pBases)
			for (const aO5 of pBase.aO5s.T)			// позиции всех внутренних тегов - 1 раз!
				aO5.CalcCurPos()

		// const chgs = {}
		// for (const x of xs)
		// 	if (CalcCovers(pcO5, [x, opp[x]]))
		// 		chgs[x] = true

		for (const x of xs)
			SetBorders(x, pcO5)

		// if (Object.keys(chgs).length > 0)
		// 	for (const x of xs)
		// 		if (chgs[x])
		// 			for (const aO5 of pBase.aO5s[x]) {
		// 				const
		// 					pOuts = aO5.base.pBase.pO5.pOuts,
		// 					aC = aO5.posC,
		// 					near = { px, vx }

		// 				for (const pOut of pOuts)
		// 					if (aO5.CanFixsOn(pOut)) {
		// 						const v = IsOut(m, aC, pOut.scops[m])
		// 						if (!px || vx < v)
		// 							Object.assign(near, { vx: v, px: pOut })
		// 					}
		// 			}

		for (const x of xs)
			for (const pBase of pcO5.pBases) {
				const pO5 = pBase.pO5
				if (pO5.scops.isVisible) {
					for (const m of [x, opp[x]]) {
						const
							pOut = pBase.bordss[m][0],
							isChg = pBase.bChgs[m] !== 0,
							v = pOut.scops[m]

						for (const aO5 of pBase.aO5s[m]) {
							const
								canFix = !aO5.IsCutF(m) &&
									aO5.cls.puts.includes(m) &&
									aO5.CanFixsOn(pOut),

								d = IsOut(m, aO5.posC, v),
								pFix = aO5.IsFix(m)

							if (isChg && canFix && pFix)
								aO5.DoFix(m, pOut, v)	// перефиксирую на новой границе

							if (m === x && d > 0 && canFix) {
								aO5.DoFix(m, pOut, v)
								aO5.UnCutF(m)
							}
							if (m !== x && pFix && IsOut(m, aO5.posO, v) < 0) {
								aO5.UnFix(m)
								aO5.UnCutF(m)
							}

							if (pFix === aO5.IsFix(m)) { // было и осталось то-же самое Fix
								if (d > 0)
									aO5.DoCutF(x, m, d, v)
								// if (d < 0 && aO5.IsCutF(m))
								// 	aO5.DoCutF(x, m, d, v)
								// 	// aO5.UnCutF(m, d)
							}
								if (d < 0)
									aO5.UnCutF(m, d)

							// 							if (pFix && pFix === aO5.IsFix(m)){ // было и осталось то-же самое Fix
							// if (o5debug && d !== 0)
							// 	console.log(`${d>0?'DoCutF':'UnCutF'}: d=${d}, v=${v} для ${pFix.id}[${m}]`)
							// 								if (d > 0)
							// 									aO5.DoCutF(m, d, v, false)
							// 								if (d < 0)
							// 									aO5.UnCutF(m)}

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
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll, SetBorders])

})();