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
		IsOut = (xtl, v, V) => {
			if (xtl) return v < V	// 'pInc' ползет вверх и его верхний край 'v' выше чем 'V'
			else return v > V		// 'pInc' ползет вниз и его верхний край 'v' ниже чем 'V'
		},
		TT = (s1, s2) => {
			if (o5debug > 1)
				console.log("%c%s", fmtOK, s1, s2)
		},
		opp = { T: 'B', L: 'R', R: 'L', B: 'T' },
		xbord = { T: 'top', L: 'left', R: 'right', B: 'bottom' }

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

	/**
	 * @typedef {Object} ScrollContext
	 * @property {string} x - Текущее направление прокрутки ('T', 'B', 'L', 'R').
	 * @property {string} o - Противоположное направление.
	 * @property {boolean} tb - Вертикальное направление.т.
	 * @property {number} shift - Сдвиг.
	 * @property {string} flank - Имя координатного поля ('top' или 'left').
	 * @property {Object} pcO5 - Родительский контейнер.
	 */

	function MakeScroll(scV, scH, pcO5) {
		// направление движения объектов в контейнере - обратное ползунку скроллинга	
		let xs = ''
		if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
		if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

		for (const aO5 of pcO5.aAlls)			// позиции всех внутренних тегов
			aO5.CalcCurPos()

		const time = performance.now()
		for (const pInc of pcO5.pIncs)			// позиции всех вложенных контейнеров
			pInc.CalcScrollScope(time)

		for (const x of xs) {
			const o = opp[x]

			// обработка вложенных контейнеров
			const
				tb = 'TB'.includes(x),
				shift = tb ? scV : scH,
				flank = tb ? 'top' : 'left',
				xtl = (x === 'T') || (x === 'L')

			// for (const pInc of pcO5.pIncs)
			// 	for (const aO5 of pInc.aOwns) {

			for (const aO5 of pcO5.aAlls) {
				const
					aC = aO5.posC,
					aO = aO5.posO,
					pOuts = aO5.base.pO5.pOuts,
					ao = aO5.pFixs[o].length ? aC : aO,
					vx = aO5.pAct[x].v
				// ax = aO5.pFixs[x].length ? aC : aO

				// расфиксация по 'o' (противоположных)
				// const pFixso = aO5.pFixs[o]
				// for (const p of pOuts)
				// 	if (pFixso.includes(p)) 
				for (const p of aO5.pFixs[o])
					if (p === pcO5) {
						const v = p.pos.scops[o]

						if (isNaN(vx) ?
							(
								(o === 'T' && (aO.top > v)) ||
								(o === 'L' && (aO.left > v)) ||
								(o === 'R' && (aO.left + aO.width < v)) ||
								(o === 'B' && (aO.top + aO.height < v))
							) : (
								(o === 'T' && (vx - aO.height > v)) ||
								(o === 'L' && (vx - aO.width > v)) ||
								(o === 'R' && (vx < v)) ||
								(o === 'B' && (vx < v))
							)
						)
							aO5.UnFix(o, p)

						// if (aO5.pAct[x].p) {
						// 	if (
						// 		(o === 'T' && (vx- aO.height > v)) ||
						// 		(o === 'L' && (vx-aO.width > v)) ||
						// 		(o === 'R' && (vx < v)) ||
						// 		(o === 'B' && (vx < v))
						// 	)
						// 		aO5.UnFix(o, p)
						// }
						// else {
						// 	if (
						// 		(o === 'T' && (aO.top > v)) ||
						// 		(o === 'L' && (aO.left > v)) ||
						// 		(o === 'R' && (aO.left + aO.width < v)) ||
						// 		(o === 'B' && (aO.top + aO.height < v))
						// 	)
						// 		aO5.UnFix(o, p)
						// }

						aO5.OnNearestFix(o)
					}
					else
						switch (o) {
							case 'T':
							case 'B': aC.top += scV; break
							case 'L':
							case 'R': aC.left += scH; break
						}

				// фиксация по 'x' 
				const pFixsx = aO5.pFixs[x], pCFixsx = aO5.pCouldFixs[x]
				for (const p of pOuts)
					if (!pFixsx.includes(p) && pCFixsx.includes(p)) {
						const v = p.pos.scops[x]
						if (
							(x === 'T' && (ao.top <= v)) ||
							(x === 'L' && (ao.left <= v)) ||
							(x === 'R' && (ao.left + aC.width >= v)) ||
							(x === 'B' && (ao.top + aC.height >= v))
						)
							aO5.DoFix(x, p)
					}

				aO5.OnNearestFix(x)
			}

			for (const aO5 of pcO5.aAlls)
				if (aO5.act.fixed)
					ScheduleFixUpdate(aO5)
		}
	}
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll])

})();