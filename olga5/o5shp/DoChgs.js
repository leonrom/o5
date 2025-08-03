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
		opp = { T: 'B', L: 'R', R: 'L', B: 'T' },
		IsOut = (x, aX, v) => {	// если результат > 0 то тег вышел за пределы контейнера
			switch (x) {
				case 'T': return v - aX.top;
				case 'L': return v - aX.left;
				case 'R': return aX.left + aX.width - v;
				case 'B': return aX.top + aX.height - v;
			}
		}
	// ОтметкаВидимостиГраниц = (p, avx, pO5) => {
	// 	for (const av of avx) {
	// 		const
	// 			x = av[0],
	// 			vx = av[1],
	// 			v = p.pos.scops[x],
	// 			tl = 'TL'.includes(x),
	// 			visi = tl ? v >= vx : v <= vx,	// д.б. >=/<= чтоб сработала перефиксация
	// 			vp = p.visis[x].get(pO5)

	// 		if (vp !== visi) {
	// 			p.visis[x].set(pO5, visi)
	// 			p.act.visiChg = true
	// 		}
	// 	}
	// }

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

	function MakeScroll(scV, scH, pcO5, fromTest) {
		// направление движения объектов в контейнере - обратное ползунку скроллинга	
		let xs = ''
		if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
		if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

		for (const aO5 of pcO5.aAlls)			// позиции всех внутренних тегов - 1 раз!
			aO5.CalcCurPos()

		for (const pInc of pcO5.pIncs) {		// позиции всех вложенных контейнеров
			pInc.CalcScrollScope()
			pInc.act.visiChg = false
		}

		const scops = pcO5.pos.scops
		for (const x of xs) {
			const o = opp[x]

			// проверяю въезжание вложенных контейнеров
			for (const m of [x, o]) {
				const mv = scops[m]
				for (const p of pcO5.pIncs)
					if (p !== pcO5) {					//	Отметка Видимости Границ (p, [[x, vpx], [o, vpo]], pcO5)
						const
							v = p.pos.scops[m],
							visi = 'TL'.includes(m) ? v >= mv : v <= mv,	// д.б. >=/<= чтоб сработала перефиксация
							vp = p.visis[m].get(pcO5)

						if (vp !== visi) {
							p.visis[m].set(pcO5, visi)
							p.act.visiChg = true
						}
					}
			}

			for (const aO5 of pcO5.aAlls) {
				const
					pFixs = aO5.pFixs,
					posO = aO5.posO,
					aC = aO5.posC

				// расфиксация по 'o' 
				let chgo = fromTest || false
				for (const p of pFixs[o])
					if (IsOut(o, posO, p.pos.scops[o]) <= 0) {
						aO5.UnFix(o, p)
						chgo = true

						if (o5debug)
							console.log("%c%s", fmtOK, `UnFix`,
								`${aO5.id} по ${o} : всего [${Array.from(pFixs[o]).map(p => p.name).join(', ')}] `)
					}

				if (pFixs[o].length) {
					if (!chgo)
						for (const p of pFixs[o])
							if (p.act.visiChg) { chgo = true; break }
					if (chgo)
						aO5.OnNearestFix(o)
				}

				// фиксация по 'x' 

				const pOuts= aO5.base.pbase.pO5.pOuts
				let chgx = fromTest || false

				for (const p of pOuts) 		// на которых может зафиксироваться
					if (
						!pFixs[x].includes(p) &&
						!pFixs[o].includes(p) &&
						aO5.pCouldFixs[x].includes(p) &&
						IsOut(x, posO, p.pos.scops[x]) >= 0
					) { // фиксируем
						aO5.DoFix(x, p)
						chgx = true

						if (o5debug)
							console.log("%c%s", fmtOK, `фиксирую`,
								`${aO5.id} всего на ${p.name} по ${x}: [${pFixs[x].map(p => p.name).join(', ')}]` +
								`,  по ${o}: [${pFixs[o].map(p => p.name).join(', ')}]`)
					}

				if (pFixs[x].length) {
					if (!chgx)
						for (const p of pFixs[x])
							if (p.act.visiChg) { chgx = true; break }
					if (chgx)
						aO5.OnNearestFix(x)
				}

				if (aO5.act.fixed) {
					if (
						!chgo &&
						!chgx &&
						!aO5.PutOnBoard(x, aO5.pAct) &&
						!aO5.PutOnBoard(o, aO5.pAct)
					) {
						if ('TB'.includes(x)) aC.top -= scV
						else aC.left -= scH

						if (o5debug > 1)
							console.log("%c%s", fmtOK, `сдвиг`,
								`${aO5.id} по ${x} для ${'TB'.includes(x) ? ('top на ' + scV) : ('left на ' + scH)} `)
					}

					for (const m of [x, o])
						if (pFixs[m].length) {		// уже где-то зафиксирован и подъезжает под границцу								
							const pCouldFix = aO5.pCouldFixs[m]
							for (const p of pOuts) 		// на которых может зафиксироваться
								if (!pCouldFix.includes(p)) {
									const
										v = p.pos.scops[m],
										d = IsOut(m, aC, v)
									if (d > 0) {
										switch (m) {
											case 'T': aC.height -= d; aC.top = v; aO5.posS.top -= d; break
											case 'L': aC.width -= d; aC.left = v; aO5.posS.left -= d; break
											case 'R': aC.width -= d; aC.left = v - aC.width; break
											case 'B': aC.height -= d; aC.top = v - aC.height; break
										}

										if (o5debug)
											console.log("%c%s", fmtOK, `подсовую`, `${aO5.id} под ${p.name} по ${m}`)
									}
								}
						}

					ScheduleShowFixed(aO5)
				}
			}
		}
	}
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll])

})();