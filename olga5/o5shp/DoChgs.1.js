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
				if (aO5.pFixs[m])
					aO5.pFixs[m] = cF
				aO5.canFixs[m] = cF
				aO5.fixCuts[m] = bords[0]	//	(cF === bords[0]) ? null : bords[0]
				if (o5debug > 1) console.log(`${aO5.name} :  ` +
					`canFixs[${m}] = ${cF ? cF.name : ' -  '},   ` +
					`fixCuts[${m}] = ${aO5.fixCuts[m] ? aO5.fixCuts[m].name : ' -  '}`)
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
					InternalTagCuts(opp[x], iO5)

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
				v = aO5.fixCuts[x].scops[x],
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
		vv = {
			vO: NaN, pF: null, vF: NaN,
			Set: (m, aO5) => {
				if (vv.pF = aO5.canFixs[m]) {
					vv.vO = GetV(m, aO5.posO)
					vv.vF = vv.pF.scops[m]
					return true
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

		for (const x of xs)
			wshp.PBases.PBase.SetBorders(x, pcO5)

		for (const pBase of pcO5.pBases) {
			pBase.CalcCurPozs()

			for (const aO5 of pBase.aAll) {
				for (const x of 'TLRB') {
					aO5.hidden[x] = 0
					if (aO5.pFixs[x])
						SetV(x, aO5.posC, aO5.pFixs[x].scops[x])
					// if (aO5.aFixs[x]) 	   // тут д.б.б. рекурсия
					// 	SetV(x, aO5.posC, aO5.aFixs[x].scops[opp[x]])
				}
			}

			for (const tagCut of pBase.tagCuts)
				if (tagCut.pO5.scops.time !== time)
					tagCut.pO5.CalcScope(time)

			for (const m of 'TLRB')  // вообще-то достаточно "for (const x of xs)" + "[x, opp[x]]"
				if (pBase.bChgs[m] || pBase.bChgs.start || fromTest)
					FindExternalFixCuts(m, pBase)

			pBase.bChgs.start = false

			if (!pBase.pO5.scops.isVisible) continue

			// for (const aO5 of pBase.bO5s[x]) {
			for (const aO5 of pBase.aAll) {
				if (!aO5.act.ready)					
					continue

				const aC = aO5.posC
				for (const x of xs) {
					// прямой ход и фиксация	по 'x' 
					if (aO5.cls.puts[x] && !aO5.aFixs[x])
						if (
							vv.Set(x, aO5) &&
							aO5.pFixs[x] !== vv.pF &&
							('TL'.includes(x) ? (vv.vO < vv.vF) : (vv.vO > vv.vF))
						)
							aO5.DoFix(x, vv.pF)

					if (aO5.aFixs[x])
						SetPos(x, aO5.pFixs[x].scops[x], aC, aO5.posO)

					// расфиксация по 'opp[x]
					const o = opp[x]
					if (aO5.pFixs[o])
						if (
							vv.Set(o, aO5) &&
							aO5.pFixs[o] === vv.pF &&
							('TL'.includes(o) ? (vv.vO >= vv.vF) : (vv.vO <= vv.vF))
						)
							aO5.DoFix(o, null)
						else
							SetPos(o, aO5.pFixs[o].scops[o], aC, aO5.posO)
				}
			
				// обрезание контейнерами			
				if (aO5.act.isfix) {
					for (const x of 'TLRB') {
						if (aO5.pFixs[x])
							InternalTagCuts(opp[x], aO5)
						if (aO5.fixCuts[x] && !aO5.aFixs[x])
							ExternalFixCuts(x, aO5)
					}

					const s = (aC.height > 0 ? '' : 'TB') + (aC.width > 0 ? '' : 'LR')
					for (const x of s) {
						aO5.hidden[x] = 1
						if (!aO5.cls.alive && aO5.pFixs[x])
							aO5.DoFix(x, null)
					}
				}
			}

			// динамическая фиксация остальных на зависших элементах
			for (const x of 'TLRB')
				for (const aO5 of pBase.bO5s[x]) {
					// if (aO5.hidden[x]) {

					// } 
					// else {
					if (aO5.pFixs[x]) // НЕ надо еще и "|| aO5.aFixs[x]"
						AttachTo(x, aO5)

					if (aO5.attaches[opp[x]].length > 0)
						UnAtFrom(x, aO5)
					// }
				}

			// отображение зафиксированых
			for (const aO5 of pBase.aAll)
				if (aO5.act.isfix)
					ScheduleShowFixed(aO5)
		}

	}

	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll])
})();


			for (const x of xs) {
				// прямой ход и фиксация	по 'x' 
				for (const aO5 of pBase.bO5s[x]) {
					if (!aO5.act.ready) continue
					if (!TryToFix (x, aO5))
						break

					if (aO5.cls.puts[x] && !aO5.aFixs[x])
						if (vv.Set(x, aO5) &&
							aO5.pFixs[x] !== vv.pF &&
							('TL'.includes(x) ? (vv.vO < vv.vF) : (vv.vO > vv.vF))
						)
							aO5.DoFix(x, vv.pF)

					if (aO5.pFixs[x])
						SetPos(x, aO5.pFixs[x].scops[x], aO5.posC, aO5.posO)
					else
						break
				}

				// расфиксация по 'opp[x]
				const o = opp[x]
				for (const aO5 of pBase.bO5s[o])
					if (aO5.act.ready && aO5.pFixs[o]) {
						if (vv.Set(o, aO5) &&
							aO5.pFixs[o] === vv.pF &&
							('TL'.includes(o) ? (vv.vO >= vv.vF) : (vv.vO <= vv.vF))
						) {	//	тут не надо расфиксировать приаттаченные - они "отъехали" раньше
							aO5.DoFix(o, null)
							break
						}
						else
							SetPos(o, aO5.pFixs[o].scops[o], aO5.posC, aO5.posO)
					}
			}
