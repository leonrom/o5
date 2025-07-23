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
		xbord = { T: 'top', L: 'left', R: 'right', B: 'bottom' },
		ПересекаетКонтейнер = (x, posX, v) => {
			return (x === 'T' && (posX.top < v)) ||
				(x === 'L' && (posX.left < v)) ||
				(x === 'R' && (posX.left + posX.width > v)) ||
				(x === 'B' && (posX.top + posX.height > v))
		},
		ОтметкаВидимостиГраниц = (p, x, vx, pO5) => {
			const
				v = p.pos.scops[x],
				tl = 'TL'.includes(x),
				visi = tl ? v >= vx : v <= vx,	// д.б. >=/<= чтоб сработала перефиксация
				vp = p.visis[x].get(pO5)

			if (vp !== visi) {
				p.visis[x].set(pO5, visi)
				p.act.visiChg = true
			}
		}

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

		for (const pInc of pcO5.pIncs) {		// позиции всех вложенных контейнеров
			pInc.CalcScrollScope()
			pInc.act.visiChg = false
		}

		for (const x of xs) {
			const
				o = opp[x],
				vpx = pcO5.pos.scops[x],
				vpo = pcO5.pos.scops[o]

			// проверяю въезжание вложенных контейнеров
			for (const p of pcO5.pIncs)
				if (p !== pcO5) {
					ОтметкаВидимостиГраниц(p, x, vpx, pcO5)
					ОтметкаВидимостиГраниц(p, o, vpo, pcO5)
				}

			for (const aO5 of pcO5.aAlls) {
				const
					aC = aO5.posC,
					aO = aO5.posO,
					// pOuts = aO5.base.pO5.pOuts,
					// ao = aO5.pFixs[o].length ? aC : aO,
					// ax = aO5.pFixs[x].length ? aC : aO,
					vx = aO5.pAct[x] ? aO5.pAct[x].pos.scops[x] : NaN

				let chgo = false
				for (const p of aO5.pFixs[o]) {
					if (p.act.visiChg)
						chgo = true

					const v = p.pos.scops[o]
					if (isNaN(vx) ? !ПересекаетКонтейнер(o, aO, v) : (
						(o === 'T' && (vx - aO.height >= v)) ||
						(o === 'L' && (vx - aO.width >= v)) ||
						(o === 'R' && (vx <= v)) ||
						(o === 'B' && (vx <= v))
					)) {
						aO5.UnFix(o, p)
						chgo = true
					}
				}
				if (chgo && aO5.pFixs[o].length)
					aO5.OnNearestFix(o)

				// фиксация по 'x' 

				let chgx = false
				for (const p of aO5.pCouldFixs[x]) {		// на которых может зафиксироваться
					if (p.act.visiChg)
						chgx = true

					const v = p.pos.scops[x]

					// if (aO5.pFixs[x].includes(p)) {		// на которых зафиксировано
					// 	if (ПересекаетКонтейнер(x, aC, v))
					// 		chgx = true
					// }
					// else {

					if (!aO5.pFixs[x].includes(p)) {		// на которых зафиксировано
						if (ПересекаетКонтейнер(x, aO, v)) {
							aO5.DoFix(x, p)
							chgx = true

							if (o5debug)
								console.log("%c%s", fmtOK, `DoFix`,
									`${aO5.id} всего на ${p.name} по ${x}: [${aO5.pFixs[x].map(p => p.name).join(', ')}]` +
									`,  по ${o}: [${aO5.pFixs[o].map(p => p.name).join(', ')}]`)
						}
					}
				}

				if (chgx && aO5.pFixs[x].length)
					aO5.OnNearestFix(x)

				if (aO5.act.fixed) {
					if (!chgo && !chgx)
						if (!aO5.PutOnBoard(x, aO5.pAct)
							&& !aO5.PutOnBoard(o, aO5.pAct)
						)
							switch (x) {
								case 'T': aC.top -= scV; break
								case 'B': aC.top -= scV; break
								case 'L': aC.left -= scH; break
								case 'R': aC.left -= scH; break
							}

					// if (!chgo && !chgx
					// 	&& aO5.pAct[x].p != pcO5
					// 	&& aO5.pAct[o].p != pcO5

					// 	// && !aO5.pFixs[o].length
					// )
					// 	switch (x) {
					// 		case 'T': aC.top -= scV; break
					// 		case 'B': aC.top -= scV; break
					// 		case 'L': aC.left -= scH; break
					// 		case 'R': aC.left -= scH; break
					// 	}

					ScheduleShowFixed(aO5)
				}
				// if (aO5.act.fixed && !chgo && !chgx
				// 	&& aO5.pFixs[x].length === 0
				// 	&& aO5.pAct[o].p !== pcO5
				// 	// aO5.pAct[x].p !== pcO5 && aO5.pAct[o].p !== pcO5
				// 	// aO5.pAct[x].p!==pcO5 && aO5.pFixs[o].length===0
				// )
				// 	switch (x) {
				// 		case 'T': aC.top -= scV; break
				// 		case 'B': aC.top -= scV; break
				// 		case 'L': aC.left -= scH; break
				// 		case 'R': aC.left -= scH; break
				// 	}
			}

			// for (const aO5 of pcO5.aAlls)
			// 	if (aO5.act.fixed)
			// 		ScheduleShowFixed(aO5)
		}
	}
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll])

})();