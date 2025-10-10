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
		// CalcCuts = (m, isTL, pcO5, x) => {
		// 	const
		// 		pCut = pcO5.cuts[m],
		// 		vc = pCut.scops[m]
		// 	let cuts;
		// 	for (const pInc of pcO5.pIncs) {
		// 		if (pInc !== pcO5) { // && pInc.scops.isVisible) {
		// 			const
		// 				vi = (m !== x) ? pInc.scops[m] : pInc.cuts[m].scops[m],
		// 				d = isTL ? vc - vi : vi - vc

		// 			if (d > 0 && pInc.cuts[m] !== pCut) {
		// 				pInc.cuts[m] = pCut
		// 				cuts = true
		// 			}
		// 			if (d < 0 && pInc.cuts[m] === pCut) {
		// 				const o = { p: null, d: NaN }
		// 				for (const p of pInc.pOuts) {
		// 					const d = isTL ? p.scops[m] - vi : vi - p.scops[m]
		// 					if (!o.p || d > o.d)
		// 						Object.assign(o, { p: p, d: d })
		// 				}
		// 				pInc.cuts[m] = o.p
		// 				cuts = true
		// 			}
		// 		}
		// 	}
		// 	return cuts
		// },
		SetBorders = (x, pcO5) => {
			for (const m of [x, opp[x]]) {// ms[0] прямой ход, ms[1] - обратный
				const
					isTL = 'TL'.includes(m),
					// cuts = CalcCuts(m, isTL, pcO5, x),
					covers = CalcCovers(m, isTL, pcO5)

				// if (cuts || covers) {
				if (covers) {
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
					}
				}
			}
		},
		FixAllO5s = (m, x, pBase) => {
			const
				isChgm = pBase.bChgs[m] || (pBase.bChgs.time <= 0),
				bords = pBase.bordss[m],
				isTL = 'TL'.includes(m),
				pOut = bords[0],
				back = m !== x,
				dbg = {}

			for (const aO5 of pBase.aO5s[m]) {
				if (isChgm) {	 // сначала перефиксирую
					if (o5debug > 1)
						Object.assign(dbg, { fix: aO5.pFixs[m], can: aO5.canFixs[m], ext: aO5.extCuts[m] })

					let pF;
					for (pF of bords)
						if (aO5.CanFixsOn(pF))
							break

					aO5.canFixs[m] = pF
					aO5.extCuts[m] = (pF === pOut) ? null : pOut
				}

				if (aO5.act.ready && aO5.cls.puts[m]) {
					const
						vO = aO5.GetV(m, 'posO'),
						pF = aO5.canFixs[m],
						vF = pF.scops[m]

					if (back) {				// обратный ход и расфиксация
						if (aO5.pFixs[m] && (isTL ? (vO >= vF) : (vO <= vF)))
							aO5.DoFix(m, null)
					}
					else {					// прямой ход и фиксация	
						if (aO5.pFixs[m] !== pF && (isTL ? (vO < vF) : (vO > vF)))
							aO5.DoFix(m, pF)
					}

					if (o5debug>1) {
						const
							fix = aO5.pFixs[m], can = aO5.canFixs[m], ext = aO5.extCuts[m],
							iF = fix !== dbg.fix, iC = can !== dbg.can, iE = ext !== dbg.ext
						if (iF || iC || iE)
							console.log(`изменения для ${aO5.a_name}: `
								+ (iF ? '*' : ' ') + `fix=${dbg.fix ? dbg.fix.name : 'null'}->${fix ? fix.name : 'null'}, `
								+ (iC ? '*' : ' ') + `fix=${dbg.can ? dbg.can.name : 'null'}->${can ? can.name : 'null'}, `
								+ (iE ? '*' : ' ') + `fix=${dbg.ext ? dbg.ext.name : 'null'}->${ext ? ext.name : 'null'}, `
							)
					}
				}
			}

			// обрезание по внутренним контейнерам		
			for (const aO5 of pBase.aO5s[m]) {
				const couldCut = back && aO5.pFixs[x]

				if (couldCut || aO5.tagCuts[m]) {
					const pO5 = aO5.frms.tagCut.pO5

					if (pO5.scops.time !== time)
						pO5.CalcScope(time)

					const
						vC = aO5.GetV(m, 'posC'),
						v = pO5.scops[m]

					if (back) {
						if (couldCut && (isTL ? (v > vC) : (v < vC)))
							aO5.tagCuts[m] = pO5
					}
					else
						if (aO5.tagCuts[m] && (isTL ? (v <= vC) : (v >= vC)))
							aO5.tagCuts[m] = null
				}
			}
		}

	function MakeScroll(scV, scH, pcO5, fromTest) {
		time = performance.now()
		// направление движения объектов в контейнере - обратное ползунку скроллинга	
		let xs = ''
		if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
		if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

		for (const pInc of pcO5.pIncs) 		// позиции всех вложенных контейнеров
			if (pInc !== pcO5 && pInc.scops.time !== time)
				pInc.CalcScope(time)

		for (const pBase of pcO5.pBases)
			for (const aO5 of pBase.aAll)			// позиции всех внутренних тегов - 1 раз!
				aO5.CalcCurPos()

		for (const x of xs)
			SetBorders(x, pcO5)

		for (const x of xs)
			for (const pBase of pcO5.pBases)
				if (pBase.pO5.scops.isVisible) {
					for (const m of [x, opp[x]])
						FixAllO5s(m, x, pBase)

					for (const aO5 of pBase.aAll)
						if (aO5.pFixs[x])
							aO5.SetPos(x)
				}

		for (const pBase of pcO5.pBases)
			if (pBase.pO5.scops.isVisible)
				for (const aO5 of pBase.aAll)
					for (const x of 'TLRB')
						if (aO5.pFixs[x] &&
							aO5.tagCuts[opp[x]] &&
							!aO5.CutFix(opp[x]) &&
							!aO5.cls.alive
						)
							aO5.DoFix()   // расфиксирую ВСЕ


		for (const pBase of pcO5.pBases)
			if (pBase.pO5.scops.isVisible) {
				for (const aO5 of pBase.aAll)
					if (aO5.pFixs.T || aO5.pFixs.L || aO5.pFixs.R || aO5.pFixs.B)
						ScheduleShowFixed(aO5)

				pBase.bChgs.time = time
			}

	}
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll, SetBorders])

})();