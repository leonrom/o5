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
		namxs = { T: 'top', L: 'left', R: 'right', B: 'bottom' },
		IsOut = (x, aX, v) => {	// если результат > 0 то тег вышел за пределы контейнера
			switch (x) {
				case 'T': return v - aX.top;
				case 'L': return v - aX.left;
				case 'R': return aX.left + aX.width - v;
				case 'B': return aX.top + aX.height - v;
			}
		},
		SetaC = (aC, x, v) => {
			if (v)
				switch (x) {
					case 'T': aC.top = v; break
					case 'L': aC.left = v; break
					case 'R': aC.left = v - aC.width; break
					case 'B': aC.top = v - aC.height; break
				}
			// else
			// 	if ('TB'.includes(x)) aC.top = aO.top
			// 	else aC.left = aO.left
		},
		CalcpCurFix = (aO5, x, pFixsx) => {
			const xtl = 'TL'.includes(x)
			let vx, px;
			for (const pFix of pFixsx) {		//  - сравниваю границы во всех где он зафиксирован
				const v = pFix.scops[x]
				if (!px || (xtl && v > vx) || (!xtl && v < vx)) {
					vx = v
					px = pFix
				}
			}
			return px
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

	function MakeScroll(scV, scH, pcO5, fromTest) {
		// направление движения объектов в контейнере - обратное ползунку скроллинга	
		let xs = ''
		if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
		if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

		for (const aO5 of pcO5.aAlls)			// позиции всех внутренних тегов - 1 раз!
			aO5.CalcCurPos()

		for (const pInc of pcO5.pIncs) {		// позиции всех вложенных контейнеров
			pInc.CalcScope()
			pInc.covers.act.isChg = false
		}

		const scops = pcO5.scops
		for (const x of xs) {
			const o = opp[x]

			// проверяю въезжание вложенных контейнеров
			let ms;
			for (const pInc of pcO5.pIncs)
				if (pInc !== pcO5) {					//	Отметка Видимости Границ (pInc, [[x, vpx], [o, vpo]], pcO5)
					if (pInc.covers.act.start) {
						ms = 'TLRB'
						pInc.covers.act.start = false
					}
					else ms = [x, o]

					for (const m of ms) {
						const
							v = pInc.scops[m],
							istl = 'TL'.includes(m),
							cover = istl ? v < scops[m] : v > scops[m]	// д.б. >=/<= чтоб сработала перефиксация			

						if (pInc.covers[m].has(pcO5) != cover) {  // д.б. '!=' т.к. сравнивать  null и false
							pInc.covers.act.isChg = true
							if (cover)
								pInc.covers[m].set(pcO5, v)

							else
								pInc.covers[m].delete(pcO5)

							let mp = null, mv = NaN;
							for (const [p, v] of pInc.covers[m])
								if (!mp ||
									(istl ? v >= mv : v > v <= mv)
								) {
									mp = p; mv = v;
								}
							Object.assign(pInc.covers.act[m], { mp, mv })
						}
					}
				}

			for (const aO5 of pcO5.aAlls) {
				const
					pOuts = aO5.base.pO5.pOuts,
					pFixso = aO5.pFixs[o],
					pf = aO5.pCurFix[x],
					vf = pf ? pf.scops[x] : NaN,
					aO = aO5.posO,
					aC = aO5.posC
				let chgo = false

				/*
					 расфиксация по 'o' 
				*/
				let j = pFixso.length
				while (j-- > 0) {
					const
						pFix = pFixso[j],
						vo = pFix.scops[o]
					if (
						(o === 'T' && vo < (pf ? (vf - aO.height) : aO.top)) ||
						(o === 'L' && vo < (pf ? (vf - aO.width) : aO.left)) ||
						(o === 'R' && vo > (pf ? (vf + aO.width) : (aO.left + aO.width))) ||
						(o === 'B' && vo > (pf ? (vf + aO.height) : (aO.top + aO.height))) ||
						false
					) {
						// if (IsOut(o, aX, pFix.scops[o]) < 0) {
						aO5.UnFix(o, pFix)
						chgo = true

						if (o5debug)
							console.log("%c%s", fmtOK, `UnFix`,
								`${aO5.id} по ${o} : всего [${Array.from(pFixso).map(p => p.name).join(', ')}] `)
					}
				}

				if (chgo && pFixso.length === 0) {
					// if ('TB'.includes(x)) { aC.top = aO.top; aC.height = aO.height }
					// else { aC.left = aO.left; aC.width = aO.width }
					aO5.pCurFix[o] = null
					if ('TB'.includes(o)) aC.top = aO.top  // здесь без разницы: 'x' или 'o'
					else aC.left = aO.left
				}
				else
					if (chgo || pFixso.find(p => p.covers.act.isChg) || fromTest)
						aO5.pCurFix[o] = CalcpCurFix(aO5, o, pFixso)

				/* 
					фиксация по 'x' 
				*/
				if (aO5.cls.puts.includes(x)) {
					const pFixsx = aO5.pFixs[x]
					let chgx = false

					for (const pOut of pOuts) {	// на которых может зафиксироваться
						const
							fx = !pFixsx.includes(pOut),
							fo = !pFixso.includes(pOut),
							fC = aO5.pCouldFixs[x].includes(pOut),
							fI = pFixso.length > 0 ?
								IsOut(x, aC, pOut.scops[x]) >= 0 :
								IsOut(x, aO, pOut.scops[x]) >= 0
						if (fx && fC && fI) { // фиксируем // && fo
							aO5.DoFix(x, pOut)
							chgx = true

							if (o5debug)
								console.log("%c%s", fmtOK, `фиксирую`,
									`${aO5.id} всего на ${pOut.name} по ${x}: [${pFixsx.map(p => p.name).join(', ')}]` +
									`,  по ${o}: [${pFixso.map(p => p.name).join(', ')}]`)
						}
					}
					if (chgx || fromTest || pFixsx.find(p => p.covers.act.isChg))
						aO5.pCurFix[x] = CalcpCurFix(aO5, x, pFixsx)
				}

				// позиционирование по границам контейнеров
				const
					vx = aO5.pCurFix[x] ? aO5.pCurFix[x].scops[x] : NaN,
					vo = aO5.pCurFix[o] ? aO5.pCurFix[o].scops[o] : NaN

				if (vx || vo) {
					SetaC(aC, x, vx)	//, aO)
					SetaC(aC, o, vo)	//, aO)
					if (vx && vo)
						switch (x) {
							case 'T': aC.height = vo - vx; aC.top = vx; break
							case 'L': aC.width = vo - vx; aC.left = vx; break
							case 'R': aC.width = vx - vo; aC.left = vo; break
							case 'B': aC.height = vx - vo; aC.top = vo; break
						}
					else if (vx)
						switch (x) {
							case 'T': break
							case 'L': break
							case 'R': break
							case 'B': break
						}
					else
						switch (x) {
							case 'T': break
							case 'L': break
							case 'R': break
							case 'B': break
						}
				}

				if (aO5.act.fixed) {
					for (const m of [x, o])
						if (aO5.pFixs[m].length) {		// уже где-то зафиксирован и подъезжает под границцу								
							const pCouldFix = aO5.pCouldFixs[m]
							for (const pOut of pOuts) 		// на которых может зафиксироваться
								if (!pCouldFix.includes(pOut)) {
									const
										v = pOut.scops[m],
										d = IsOut(m, aC, v)
									if (d > 0) {
										switch (m) {
											case 'T': aC.height -= d; aC.top = v; aO5.posS.top -= d; break
											case 'L': aC.width -= d; aC.left = v; aO5.posS.left -= d; break
											case 'R': aC.width -= d; aC.left = v - aC.width; break
											case 'B': aC.height -= d; aC.top = v - aC.height; break
										}

										if (o5debug)
											console.log("%c%s", fmtOK, `подсовую`, `${aO5.id} под ${pOut.name} по ${m}`)
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