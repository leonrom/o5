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

	const
		/**
				* @param {Object} aO5
				* @param {ScrollContext} я
			*/
		СдвигЗафиксированного = (aO5, x, pO5, vx, tb, flank, shift) => {
			const va = aO5.posC[flank] - shift
			if (	// если вылезло из pcO5 - фиксирую еще и на нём
				(tb && va < vx) ||
				(!tb && va > vx)
			)
				aO5.DoFix(x, pO5)
			else						// иначе - просто сдвигаю
				aO5.posC[flank] = va
		},
		/**
				* @param {Object} aO5
				* @param {ScrollContext} я
			*/
		ПопыткаЗафиксировать = (aO5, x, pO5, vx) => {
			const aC = aO5.posC
			if (aO5.CanFrameFixOn(pO5)
				(x === 'T' && (aC.top <= vx)) ||
				(x === 'L' && (aC.left <= vx)) ||
				(x === 'R' && (aC.left + aC.width >= vx)) ||
				(x === 'B' && (aC.top + aC.height >= vx))
			)
				aO5.DoFix(x, pO5)

		}

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
			const
				o = opp[x],
				vx = pcO5.pos.scops[x]

			for (const aO5 of pcO5.aOwns) {
				const
					aC = aO5.posC,
					aO = aO5.posO

				for (const p of pcO5.pOuts) {
					// обработка по 'o'
					if (aO5.pFixs[o].includes(p)) {
						const vo = p.pos.scops[o]
						if (
							(o === 'T' && aO.top >= vo) ||
							(o === 'B' && aO.top >= vo) ||
							(o === 'L' && aO.left + aC.width <= vo) ||
							(o === 'R' && aO.left + aC.height <= vo)
						)
							aO5.UnFix(o, p)
					}

					// обработка по 'x'
					if (aO5.CanFrameFixOn(p)) {
						const vx = p.pos.scops[x]
						if (
							(x === 'T' && (aC.top <= vx)) ||
							(x === 'L' && (aC.left <= vx)) ||
							(x === 'R' && (aC.left + aC.width >= vx)) ||
							(x === 'B' && (aC.top + aC.height >= vx))
						)
							aO5.DoFix(x, p)
					}
				}
				// if (aO5.FindFix(o, pcO5)) {	//  расфикация сзади,- проба оторвать свои от 'o'
				// 	if (
				// 		(o === 'T' && aC.top <= aO.top) ||
				// 		(o === 'B' && aC.top >= aO.top) ||
				// 		(o === 'L' && aC.left <= aO.left) ||
				// 		(o === 'R' && aC.left >= aO.left)
				// 	)
				// 		aO5.UnFix(o, pcO5)
				// 	// else
				// 	// 	СдвигЗафиксированного(aO5, x, pcO5, tb, flank, shift)
				// }
				// else			//  фикация впереди,- проба прилепить к 'x'

			}

			// обработка вложенных контейнеров
			const
				tb = 'TB'.includes(x),
				shift = tb ? scV : scH,
				flank = tb ? 'top' : 'left',
				xtl = (x === 'T') || (x === 'L')

			for (const pInc of pcO5.pIncs)
				if (pInc !== pcO5)
					for (const aO5 of pInc.aOwns) {
						// расфиксация по 'o' (противоположных)
						let vF = NaN
						for (const p of aO5.pFixs[o]) {
							const v = p.pos.scops[o]
							if (
								(o === 'T' && (aO5.posO.top >= v)) ||
								(o === 'L' && (aO5.posO.left >= v)) ||
								(o === 'R' && (aO5.posO.left + aO5.posC.width <= v)) ||
								(o === 'B' && (aO5.posO.top + aO5.posC.height <= v))
							)
								aO5.UnFix(o, p)
							else
								if (isNaN(vF) || (xtl && v < vF) || (!xtl && v > vF))
									vF = v
						}

						if (!isNaN(vF))   // остались нерасфиксированные
							aO5.SetPosC(x, vx)
						
						// 	aO5.posC[flank] = vF
						// else
						// 	if (aO5.pFixs[x].length || aO5.pFixs[o].length)
						// 		СдвигЗафиксированного(aO5, x, pcO5, vx, tb, flank, shift)
						// 	else
						// 		ПопыткаЗафиксировать(aO5, x, pcO5, vx)

						// фиксация по 'x' 
						if (aO5.CanFrameFixOn(p)) {
							const vx = p.pos.scops[x]
							if (
								(x === 'T' && (aC.top <= vx)) ||
								(x === 'L' && (aC.left <= vx)) ||
								(x === 'R' && (aC.left + aC.width >= vx)) ||
								(x === 'B' && (aC.top + aC.height >= vx))
							)
								aO5.DoFix(x, p)
						}

					}
			for (const aO5 of pcO5.aAlls)
				if (aO5.act.fixed)
					ScheduleFixUpdate(aO5)
		}
	}
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll])

})();