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
		FindExternalFixCuts = (m, aO5, bords) => {
			let pF;
			for (pF of bords)
				if (aO5.CanFixsOn(pF))
					break
			aO5.canFixs[m] = pF
			aO5.fixCuts[m] = (pF === bords[0]) ? null : bords[0]
		},
		GetV = (m, aX) => {	// если результат > 0 то тег вышел за пределы контейнера
			switch (m) {
				case 'T': return aX.top
				case 'L': return aX.left
				case 'R': return aX.left + aX.width
				case 'B': return aX.top + aX.height
			}
		},
		SetV = (m, aX, v) => {	// если результат > 0 то тег вышел за пределы контейнера
			switch (m) {
				case 'T': aX.top = v; break
				case 'L': aX.left = v; break
				case 'R': aX.left = v - aX.width; break
				case 'B': aX.top = v - aX.height; break
			}
		},
		FixUnfix = (m, aO5, isTL, back) => {
			const
				vO = GetV(m, aO5.posO),
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
		FindInternalTagCuts = (m, x, aO5, isTL, back) => {			// обрезание по внутренним контейнерам	
			const
				pO5 = aO5.frms.tagCut.pO5,
				vC = GetV(m, aO5.posC),
				v = pO5.scops[m]

			if (back) {
				if (aO5.pFixs[x] && (isTL ? (v > vC) : (v < vC)))
					aO5.tagCuts[m] = pO5
			}
			else
				if (aO5.tagCuts[m] && (isTL ? (v <= vC) : (v >= vC)))
					aO5.tagCuts[m] = null
		},
		AttachTo = (x, aO5) => {
			const
				o = opp[x],
				level = aO5.cls.level,
				vC = GetV(o, aO5.posC),
				isTL = 'TL'.includes(x)

			for (const iO5 of aO5.aO5s[x]) {
				if (iO5.cls.level >= level || iO5.pFixs[x])
					continue

				if (!iO5.aFixs[x]) {
					const vI = GetV(x, iO5.posC)

					if (isTL ? vC > vI : vC < vI) {
						iO5.DoFix(x, aO5)
						aO5.attaches[x].push(iO5)
					}
				}
				if (iO5.aFixs[x]) {
					SetV(x, iO5.posC, vC)
					if (iO5.attaches[x].length > 0)
						AttachTo(x, iO5)
				}
			}
		},
		UnAtFrom = (x, aO5) => {
			const
				o = opp[x],
				vC = GetV(x, aO5.posC),
				atts = aO5.attaches[o],
				isTL = 'TL'.includes(o)

			let j = atts.length
			while (j-- > 0) {
				const
					iO5 = atts[j],
					vI = GetV(o, iO5.posO)

				if (isTL ? vC < vI : vC > vI) {
					iO5.DoFix(o)
					atts.splice(j, 1)

					if (iO5.attaches[o].length > 0)
						UnAtFrom(x, iO5)
				}
			}
		},
		ExternalFixCuts = (x, aO5) => {
			const
				v = aO5.pFixs[x].scops[x],
				aC = aO5.posC
			let d;
			if (aO5.fixCuts[x]) {
				switch (x) {
					case 'T': d = v - aC.top; break
					case 'L': d = v - aC.left; break
					case 'R': d = (aC.left + aC.width) - v; break
					case 'B': d = (aC.top + aC.height) - v; break
				}
			}

			switch (x) {
				case 'T': aC.top = v; break
				case 'L': aC.left = v; break
				case 'R': aC.left = v - aO5.posO.width; break
				case 'B': aC.top = v - aO5.posO.height; break
			}

			if (d > 0)
				switch (x) {
					case 'T': aC.height -= d; aO5.posS.top -= d; break
					case 'L': aC.width -= d; aO5.posS.left -= d; break
					case 'R': aC.width -= d; break
					case 'B': aC.height -= d; break
				}
		},
		InternalTagCuts = (o, aO5) => {
			const
				v = aO5.tagCuts[o].scops[o],
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

			aO5.act.hidden =  aC.height <= 0 || aC.width <= 0
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

		for (const x of xs)
			SetBorders(x, pcO5)

		for (const pBase of pcO5.pBases) {
			pBase.CalcCurPozs()
			for (const aO5 of pBase.aAll)
				for (const x of 'TLRB')
					if (aO5.pFixs[x])
						SetV(x, aO5.posC, aO5.pFixs[x].scops[x])

			for (const m of 'TLRB')  // вообще-то достаточно "for (const x of xs)" + "[x, opp[x]]"
				if (pBase.bChgs[m] || pBase.bChgs.start)
					for (const aO5 of pBase.aAll)
						FindExternalFixCuts(m, aO5, pBase.bordss[m])

			pBase.bChgs.start = false

			if (!pBase.pO5.scops.isVisible) continue

			for (const aO5 of pBase.aAll)
				if (aO5.act.ready) {
					for (const x of xs)
						if (!aO5.aFixs[x]) {
							for (const m of [x, opp[x]]) {
								const isTL = 'TL'.includes(m), back = m !== x

								if (aO5.cls.puts[m])
									FixUnfix(m, aO5, isTL, back)

								if ((back && aO5.pFixs[x]) || aO5.tagCuts[m])
									FindInternalTagCuts(m, x, aO5, isTL, back)
							}

							if (aO5.pFixs[x])
								ExternalFixCuts( x,aO5)
						}

						if (act.isfix){
for (const x of 'TLRB') {
						const o = opp[x]
						if (aO5.pFixs[x] || aO5.aFixs[x]) {
							 if ( aO5.tagCuts[o])
								InternalTagCuts(o, aO5)

						}
					}
						}

					for (const x of 'TLRB') {
						const o = opp[x]
						if (aO5.pFixs[x] || aO5.aFixs[x]) {
							 if ( aO5.tagCuts[o])
								InternalTagCuts(o, aO5)

						}
					}
							if (aO5.act.hidden && !aO5.cls.alive)
								aO5.DoFix()   // расфиксирую ВСЕ
				}

			// динамическая фиксация на зависших элементах

			for (const x of 'TLRB') {
				for (const aO5 of pBase.bO5s[x]) {
					if (aO5.pFixs[x])
						AttachTo(x, aO5)

					if (aO5.attaches[opp[x]].length > 0)
						UnAtFrom(x, aO5)
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