/*jshint asi:true          */
/* global window, console, document */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
// Configure desktop -> Mouse Action -> Right-Button
(function () {              // ---------------------------------------------- o5shp/DoChgs ---
	"use strict"

	let wshp;
	let tstO5, tstId = 'shp4', tstNam = 'bottom', tstVal = 481;

	const
		olga5_modul = "o5shp",
		modulname = 'DoChgs',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmtOK = "background: cornsilk; color: black;",
		fmtErr = "background: yellow; color: black;",
		TryDoFix = (x, aO5, vx, pO5) => {
			const aC = aO5.posC
			if (!aO5.FindFix(x, pO5))
				for (const frame of aO5.frames)
					if (frame.fix && frame.pO5 === pO5)
						if (
							(x === 'T' && (aC.top <= vx)) ||
							(x === 'L' && (aC.left <= vx)) ||
							(x === 'R' && (aC.left + aC.width >= vx)) ||
							(x === 'B' && (aC.top + aC.height >= vx))
						) {
							switch (x) {
								case 'T': aC.top = vx; break
								case 'L': aC.left = vx; break
								case 'R': aC.left = vx - aC.width; break
								case 'B': aC.top = vx - aC.height; break
							}
							aO5.DoFix(x, pO5)
						}
		},
		IsOut = (xtl, v, V) => {
			if (xtl) return v < V	// 'pInc' ползет вверх и его верхний край 'v' выше чем 'V'
			else return v > V		// 'pInc' ползет вниз и его верхний край 'v' ниже чем 'V'
		},
		TT = (s1, s2) => {
			if (o5debug > 1)
				console.log("%c%s", fmtOK, s1, s2)
		},
		opp = { T: 'B', L: 'R', R: 'L', B: 'T' }

	// ---- batching ShowFix() per frame ----
	const FixUpdateQueue = new Set()
	let fixUpdateScheduled = false

	function ScheduleFixUpdate(aO5) {
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

	function MakeScroll(scV, scH, pcO5) {
		let xs = ''		// направление движения объектов в контейнере - обратное ползунку скроллинга	
		if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
		if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

		for (const aO5 of pcO5.aAlls)			// позиции всех внутренних тегов
			aO5.CalcCurPos()

		const time = performance.now()
		for (const pInc of pcO5.pIncs)			// позиции всех вложенных контейнеров
			pInc.CalcScrollScope(time)

		for (const x of xs) {
			const
				o = opp[x],
				vx = pcO5.pos.scops[x],
				vo = pcO5.pos.scops[o],
				xtl = 'TL'.includes(x),
				tb = 'TB'.includes(x),
				shift = tb ? scV : scH,
				flank = tb ? 'top' : 'left'

			for (const aO5 of pcO5.aOwns)
				if (aO5.FindFix(o, pcO5) && !aO5.FindFix(x, pcO5) && (	//  проба оторвать свои от 'o'
					(o === 'T' && aO5.posC.top <= aO5.posO.top) ||
					(o === 'B' && aO5.posC.top >= aO5.posO.top) ||
					(o === 'L' && aO5.posC.left <= aO5.posO.left) ||
					(o === 'R' && aO5.posC.left >= aO5.posO.left)
				))
					aO5.UnFix(o, pcO5)

			for (const aO5 of pcO5.aOuts)		//  проба оторвать свои от 'o' на pcO5
				if (aO5.FindFix(o, pcO5) && (
					(o === 'T' && (aO5.posO.top >= v)) ||
					(o === 'L' && (aO5.posO.left >= v)) ||
					(o === 'R' && (aO5.posO.left + aO5.posC.width <= v)) ||
					(o === 'B' && (aO5.posO.top + aO5.posC.height <= v))
				))
					aO5.UnFix(o, pcO5)

			for (const aO5 of pcO5.aOuts) 				// сдвигаем все чужие кроме уже зафиксированных
				if (!aO5.FindFix(x, pcO5)) {
					const va = aO5.posC[flank] - shift
					if (
						(tb && va < vx) ||
						(!tb && va > vx)
					) {  						// если вылезло из pcO5 - фиксирую на нём
						aO5.DoFix(x, pcO5)
						aO5.posC[flank] = vx
					}
					else						// иначе - просто сдвигаю
						aO5.posC[flank] = va
				}

			for (const aO5 of pcO5.aOuts) {
				if (aO5.FindFix(x, pcO5))
					continue

				const va = aO5.posC[flank] - shift
				if (aO5.FindFix(o, pcO5)) {   // усли зафиксирован по 'o' на pcO5
					const
						aC = aO5.posC,
						aO = aO5.posO
					let pFixo, vf;
					for (const p of aO5.pFixs[o]) {
						const v = p.pos.scops[o]
						if (
							(o === 'T' && (aO.top >= v)) ||
							(o === 'L' && (aO.left >= v)) ||
							(o === 'R' && (aO.left + aC.width <= v)) ||
							(o === 'B' && (aO.top + aC.height <= v))
						)
							aO5.UnFix(o, p)
					}
					if (aO5.pFixs[o].length) 		//  подвинуть на shft или завиксировать
						aO5.posC[flank] -= shift

					TryDoFix(x, aO5, vx, pcO5)
				}
				else {				// сдвигаем все чужие кроме уже зафиксированных
					if (
						(tb && va < vx) ||
						(!tb && va > vx)
					) {  						// если вылезло из pcO5 - фиксирую на нём
						aO5.DoFix(x, pcO5)
						aO5.posC[flank] = vx
					}
					else						// иначе - просто сдвигаю
						aO5.posC[flank] = va
				}
			}

			// обработка вложенных контейнеров		
			for (const pInc of pcO5.pIncs) {
				if (pInc === pcO5)
					continue

				// обработка во вложенных контейнерах, выползающих по ''  
				const io = pInc.overflows[o].indexOf(pcO5)
				if (io >= 0 && IsOut(xtl, pInc.pos.scops[o], vo)) {	 // противоположный край 'pInc' вылез из-под 'pcO5
					for (const aO5 of pInc.aOwns[o])
						if (aO5.FindFix(o, pcO5))
							aO5.UnFix(o, pcO5)
					pInc.overflows[o].splice(io, 1)
				}

				// обработка во вложенных контейнерах, заползающих по 'x'  
				const ix = pInc.overflows[x].indexOf(pcO5)
				if (ix < 0 && IsOut(xtl, pInc.pos.scops[x], vx)) {	// наползающий край 'pInc' влазит под 'pcO5
					for (const aO5 of pInc.aOwns[x])
						TryDoFix(x, aO5, vx, pcO5)
					pInc.overflows[x].push(pcO5)
				}
			}

			// обработка всех НЕ зафиксированных в pcO5
			for (const aO5 of pcO5.aAlls)
				if (!aO5.FindFix(x, pcO5)) {
					if (aO5.pFixs[x].length) 		//  подвинуть на shft или завиксировать
						aO5.posC[flank] -= shift

					if (aO5.pFixs[o].length) {
						const aC = aO5.posC
						let pFixo, vf;
						for (const p of aO5.pFixs[o]) {
							if (!pFixo ||
								(o === 'T' && (aC.top <= vf)) ||
								(o === 'L' && (aC.left <= vf)) ||
								(o === 'R' && (aC.left + aC.width >= vf)) ||
								(o === 'B' && (aC.top + aC.height >= vf))
							)
					}
						if (aO5.pFixs[o].length) 		//  подвинуть на shft или завиксировать
							aO5.posC[flank] -= shift

						TryDoFix(x, aO5, vx, pcO5)
					}

					// обработка только своих в pcO5, зафиксированных по 'o'
					for (const aO5 of pcO5.aOwns) 		// обработка только своих в pcO5
						if (aO5.FindFix(o, pcO5))
							if (
								(o === 'T' && aO5.posC.top <= aO5.posO.top) ||
								(o === 'B' && aO5.posC.top >= aO5.posO.top) ||
								(o === 'L' && aO5.posC.left <= aO5.posO.left) ||
								(o === 'R' && aO5.posC.left >= aO5.posO.left)
							)
								aO5.UnFix(o, pInc)

					for (const aO5 of pcO5.aOuts)		// обработка только чужих для pcO5
						if (aO5.FindFix(o, pcO5))
							if (
								(o === 'T' && aO5.posC.top <= aO5.posO.top) ||
								(o === 'B' && aO5.posC.top >= aO5.posO.top) ||
								(o === 'L' && aO5.posC.left <= aO5.posO.left) ||
								(o === 'R' && aO5.posC.left >= aO5.posO.left)
							)
								aO5.UnFix(o, pInc)


					for (const aO5 of pcO5.aAlls)
						if (aO5.act.fixed)
							ScheduleFixUpdate(aO5)
				}
		}

		wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll])

	}) ();