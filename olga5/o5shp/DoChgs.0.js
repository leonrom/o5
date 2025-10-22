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
		FindFixCutExternals = (m, aO5, bords) => {
			let pF;
			for (pF of bords)
				if (aO5.CanFixsOn(pF))
					break
			aO5.canFixs[m] = pF
			aO5.extCuts[m] = (pF === bords[0]) ? null : bords[0]
		},
		FixUnfix = (m, aO5, isTL, back) => {
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
		},
		FindCutInternal = (m, x, aO5, isTL, back) => {			// обрезание по внутренним контейнерам	
			const
				pO5 = aO5.frms.tagCut.pO5,
				vC = aO5.GetV(m, 'posC'),
				v = pO5.scops[m]

			if (back) {
				if (aO5.pFixs[x] && (isTL ? (v > vC) : (v < vC)))
					aO5.tagCuts[m] = pO5
			}
			else
				if (aO5.tagCuts[m] && (isTL ? (v <= vC) : (v >= vC)))
					aO5.tagCuts[m] = null
		},
		PushThisO5 = (x, aO5) => {
			const
				aC = aO5.posC,
				level = aO5.cls.level,
				isTL = 'TL'.includes(x),
				va = aO5.GetV(opp[x], 'posC')
			let rez = 0
			for (const iO5 of aO5.aO5s[x])
				if (iO5.cls.level > level) {
					const
						vi = iO5.GetV(x, 'posO'),
						d = isTL ? va - vi : vi - va

					if (d > 0) {   //  пододвигаем !
						switch (x) {
							case 'T': aC.height -= d; this.posS.top -= d; break
							case 'L': aC.width -= d; this.posS.left -= d; break
							case 'R': aC.width -= d; break
							case 'B': aC.height -= d; break
						}

						if (aC.width <= 0 || aC.height <= 0) {
							if (!aO5.cls.alive) // расфиксирую ВСЕ
								aO5.DoFix()
							rez = -1
							break
						}
						rez = 1
					}
				}
			return rez
		},
		AttachTo = (x, aO5, isTL) => {
			const
				level = aO5.cls.level,
				vC = aO5.GetV(opp[x], 'posC')
			for (const iO5 of aO5.aO5s[x])
				if (iO5.cls.level < level && !(iO5.pFixs[x] || iO5.aFixs[x])) { // && !iO5.pAtts[x] тут надо осторожнеее с !iO5.pAtts[x]т.к.м.б. перефиксация						
					const
						vI = iO5.GetV(x, 'posO'),
						d = isTL ? vC - vI : vI - vC

					if (d > 0) {   					//  пододвигаем !
						const iC = iO5.posC
						switch (x) {
							case 'T': iC.top = vC; break
							case 'L': iC.left = vC; break
							case 'R': iC.left = vC - iC.width; break
							case 'B': iC.top = vC - iC.top; break
						}
						aO5.attaches[x].push(iO5)
						iO5.DoFix(x, aO5)
						AttachTo(x, iO5, isTL)
					}
				}
		},
		UnAtFrom = (o, aO5, isTL) => {
			const
				vC = aO5.GetV(o, 'posC')

			for (const iO5 of aO5.attaches[o]) {
				const
					vI = iO5.GetV(opp[o], 'posC'),
					d = isTL ? vC - vI : vI - vC

				if (d < 0) {   							//  раздвигаем !
					const atts = aO5.attaches[o]
					atts.splice(atts.indexOf(iO5) - 1)
					iO5.DoFix(o)
					// for (const jO5 of iO5.attaches[o])
					if (iO5.attaches[o].length > 0)
						UnAtFrom(o, iO5, isTL)
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

		for (const pBase of pcO5.pBases) {
			for (const aO5 of pBase.aAll) {			// позиции всех внутренних тегов - 1 раз!
				const pO5 = aO5.frms.tagCut.pO5
				if (pO5.scops.time !== time)
					pO5.CalcScope(time)

				aO5.CalcCurPos()
			}

			for (const aO5 of pBase.aAll)
				for (const [x, pF] of Object.entries(aO5.pFixs))
					if (pF) {
						const 
						aC = aO5.posC,
						v = pF.scops[m]
						switch (m) {
							case 'T': aC.top = v; break
							case 'L': aC.left = v; break
							case 'R': aC.left = v - aC.width; break
							case 'B': aC.top = v - aC.height; break
						}
						if( aO5.attaches[x].length>0){

						}
					}

			for (const x of 'TLRB') {		// CorrectPos
				const
					isTB = 'TB'.includes(x),
					isTL = 'TL'.includes(x),
					pos = isTB ? 'top' : 'left',
					siz = isTB ? 'height' : 'width'

				for (const aO5 of pBase.bO5s[x]) { // именно в очередности удаления от края					
					const
						xF = aO5.pFixs[x] || aO5.aFixs[x],
						aC = aO5.posC
					if (aO5.pFixs[x]) {
						aC[pos] = xF.scops[x]
						aO5.scops[x] = isTL ? aC[pos] : (aC[pos] + aC[siz])
					}
					else
						if (aO5.aFixs[x]) {
							aC[pos] = xF.scops[x]
							aO5.scops[x] = isTL ? aC[pos] : (aC[pos] + aC[siz])
						}
						else
							break
				}
			}
			// aO5.CorrectPos(x, pos)}
			// if (!aO5.CorrectPos(x))
			// 	break
		}

		for (const x of xs)
			SetBorders(x, pcO5)

		for (const pBase of pcO5.pBases) {

			for (const m of 'TLRB')  // вообще-то достаточно "for (const x of xs)" + "[x, opp[x]]"
				if (pBase.bChgs[m] || pBase.bChgs.start)
					for (const aO5 of pBase.aAll)
						FindFixCutExternals(m, aO5, pBase.bordss[m])
			pBase.bChgs.start = false

			if (!pBase.pO5.scops.isVisible) continue

			for (const aO5 of pBase.aAll)
				if (aO5.act.ready) {
					for (const x of xs) {
						for (const m of [x, opp[x]]) {
							const isTL = 'TL'.includes(m), back = m !== x

							if (aO5.cls.puts[m])
								FixUnfix(m, aO5, isTL, back)

							if ((back && aO5.pFixs[x]) || aO5.tagCuts[m])
								FindCutInternal(m, x, aO5, isTL, back)
						}

						if (aO5.pFixs[x])
							aO5.SetPos(x)
					}

					for (const x of 'TLRB')
						if (aO5.pFixs[x] &&
							aO5.tagCuts[opp[x]] &&
							!aO5.CutFix(opp[x]) &&
							!aO5.cls.alive
						)
							aO5.DoFix()   // расфиксирую ВСЕ
				}

			// динамическая фиксация на зависших элементах
			for (const x of xs) {
				const isTL = 'TL'.includes(x),
					o = opp[x]
				for (const aO5 of pBase.aAll) {
					const xF = aO5.pFixs[x] || aO5.aFixs[x]
					if (xF) 		// если aO5 зафиксирован по x - пробуем к aO5 приаттачить другие 
						AttachTo(x, aO5, xF, isTL)

					if (aO5.attaches[o].length > 0)
						UnAtFrom(o, aO5, !isTL)
				}
			}
		}

		for (const pBase of pcO5.pBases)
			if (pBase.pO5.scops.isVisible)
				for (const aO5 of pBase.aAll)
					if (aO5.act.isfix)
						ScheduleShowFixed(aO5)
	}

	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll, SetBorders])
})();