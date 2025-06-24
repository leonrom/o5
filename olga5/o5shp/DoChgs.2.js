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
		xbord = { T: 'top', L: 'left', R: 'right', B: 'bottom' },
		coordVH = { V: ['height', 'top', 'bottom'], H: ['width', 'left', 'right'] },

		CheckHidden = (aO5, x) => {
			// обработка скрытых тегов
			aO5.CalcCurPos(time)		//????????????????????
			const
				aC = aO5.posC,
				v = aO5.nears.out[x].v
			let partV, fullV;
			switch (x) {
				case 'T': if (aC.top > v) fullV = 1; else if (aC.bottom > v) partV = 1; break
				case 'L': if (aC.left > v) fullV = 1; else if (aC.right > v) partV = 1; break
				case 'R': if (aC.right < v) fullV = 1; else if (aC.left < v) partV = 1; break
				case 'B': if (aC.bottom < v) fullV = 1; else if (aC.top < v) partV = 1; break
			}
			if (fullV) 						// видимый полностью
				aO5.hidden[x] = false
			else
				if (aO5.nears.out[x].p) {
					switch (x) {
						case 'T': aC.top = v; if (partV) aC.height = aC.bottom - v; else aC.height = 0; break
						case 'L': aC.left = v; if (partV) aC.width = aC.right - v; else aC.width = 0; break
						case 'R': aC.right = v; if (partV) aC.width = v - aC.left; else aC.width = 0; break
						case 'B': aC.bottom = v; if (partV) aC.height = v - aC.top; else aC.height = 0; break
					}
					if (partV)
						switch (x) {
							case 'T': aO5.posS.top = aC.height - aO5.posO.height; break
							case 'L': aO5.posS.left = aC.width - aO5.posO.width; break
						}
				}
		},
		PutOnBound = (aO5, x) => {
			if (o5debug > 2)
				console.log(`Подключение Границе Фрейма для aO5=${aO5.id} по ${x}`)

			aO5.CalcCurPos(time)		//????????????????????

			const c = Object.assign({}, aO5.posO)
			let pFix = null
			for (const frame of aO5.frames)
				if (frame.fix) {
					const
						pO5 = frame.pO5,
						v = pO5.pos.scops[x]	// pO5.pos.visis[x].v	//v = pO5.pos.scops[x]

					switch (x) {
						case 'T': if (c.top <= v) { pFix = pO5; c.top = v }; break
						case 'L': if (c.left <= v) { pFix = pO5; c.left = v }; break
						case 'R': if (c.left + c.width >= v) { pFix = pO5; c.left = v - c.width }; break
						case 'B': if (c.top + c.height >= v) { pFix = pO5; c.top = v - c.height }; break
					}
				}

			if (pFix) {
				const v = pFix.pos.scops[x],
					c = aO5.posC
				switch (x) {
					case 'T': c.top = v; break
					case 'L': c.left = v; break
					case 'R': c.left = v - c.width; break
					case 'B': c.top = v - c.height; break
				}

				if (pFix !== aO5.pFixs[x])
					aO5.DoFix(pFix, x)
			}
			else {
				if (aO5.pFixs[x])
					aO5.UnFix(x)
			}
		},
		OverlapByFrames = (aO5, x, pO5) => {
			const
				itl = 'TL'.includes(x),
				v = pO5.pos.visis[x].v,
				c = aO5.posC,
				q = x === 'R' ? (c.left + c.width) : (
					x === 'B' ? (c.top + c.height) : (
						x === 'T' ? c.top : c.left
					)
				),
				d = q - v

			if ((d < 0 && itl) || (d > 0 && !itl))
				switch (x) {
					case 'T': c.top = v; c.height += d; aO5.posS.top += d; break
					case 'L': c.left = v; c.width += d; aO5.posS.left += d; break
					case 'R': c.width -= d; break
					case 'B': c.height -= d; break
				}
		},
		MakeScroll = (scV, scH, pcO5) => {  // , doschgs
			const
				time = performance.now(),
				ОбрезаниеПротивоположнойСтороны = (aO5, y) => {
					if (o5debug > 2)
						console.log(`Обрезание с Противоположной Стороны для aO5=${aO5.id} по ${x}`)
					const
						o = opp[y],
						c = aO5.posC,
						itl = 'TL'.includes(o),
						pO5 = aO5.base.pO5,
						r = { p: pO5, v: pO5.pos.scops[o] }

					for (const frame of aO5.frames)
						if (frame.cut) {
							const
								p = frame.pO5,
								v = p.pos.visis[o]	// pO5.pos.visis[x].v	//v = pO5.pos.scops[x]

							if ((r.v > v && itl) || (r.v < v && !itl)) {
								r.p = p; r.v = v
							}
						}
					const d = (() => {
						switch (o) {
							case 'T': return r.v - c.top
							case 'L': return r.v - c.left
							case 'R': return c.width - (r.v - c.left)
							case 'B': return c.height - (r.v - c.top)
						}
					})()
					if (d > 0)
						switch (o) {
							case 'T': c.height -= d; c.top += d; break
							case 'L': c.width -= d; c.left += d; break
							case 'R': c.width -= d; aO5.posS.left -= d; break
							case 'B': c.height -= d; aO5.posS.top -= d; break
						}
					return r.p
				},
				НаБлижнемТеге = (aO5, x) => {
					aO5.CalcCurPos(time)		//????????????????????
					const
						pbase = aO5.base.pbase,
						iO5s = pbase.aO5s

					for (const iO5 of iO5s)
						if (!iO5.pFixs[x]) {

						}

					while (++i < len) {
						const fO5 = aO5s[i]
						if (aO5.cls.level < fO5.cls.level &&
							ПрилипаниекFO5(aO5, fO5, x)
						) {
							cO5 = fO5
							break
						}
					}

					// фиксация на границе
					i = k
					while (++i < len) {
						const fO5 = aO5s[i]
						if (fO5 === cO5) break

						if (aO5.cls.level > fO5.cls.level &&
							fO5.tryFix[x] &&
							!fO5.hidden[x] && !fO5.zeroed[smode] &&
							ЕстьСтыковка(aO5, fO5, x)
						) {
							const
								aC = aO5.posC,
								fC = fO5.posC,
								fF = fC		// fO5.posCf

							switch (x) {
								case 'T': fC.bottom = aC.top, fC.height = fF.bottom - fC.top; break
								case 'L': fC.right = aC.left, fC.width = fF.right - fC.left; break
								case 'R': fC.left = aC.right, fC.width = fF.right - fC.left; break
								case 'B': fC.top = aC.bottom, fC.height = fF.bottom - fC.top; break
							}
							switch (x) {
								case 'T': fO5.posS.top -= fO5.posO.height - fC.height; break
								case 'L': fO5.posS.left -= fO5.posO.width - fC.width; break
							}

							const nfx = aO5.nears.fix[x]
							if (nfx.p) {
								const v = nfx.v
								fO5.zeroed[smode] ||= fC[coordVH[smode][0]] <= 0   // тут [0] = это height или width
								if (fO5.zeroed[smode]) {
									switch (x) {
										case 'T': fC.top = fC.bottom = v; fC.height = 0; break
										case 'L': fC.left = fC.right = v; fC.width = 0; break
										case 'R': fC.right = fC.left = v; fC.width = 0; break
										case 'B': fC.bottom = fC.top = v; fC.height = 0; break
									}
									if (!fO5.cls.alive) {
										fO5.hidden[x] = true
										fO5.isFull[smode] = false
									}
								}
							}

							for (const sO5 of fO5.shrunks[x])
								if (sO5.cls.level < fO5.cls.level) {
									Object.assign(sO5.posC, sO5.posO)
									sO5.tryFix[x] = false

									ПрилипаниекFO5(sO5, fO5, x)
									НаБлижнемФрейме(sO5, x)
								}
						}
					}
				},
				opp = { T: 'B', L: 'R', R: 'L', B: 'T' }
			// CalcBoards = (pIncs, x0) => {
			// 	const rez = []
			// 	let pT, visis, n = 0
			// 	for (const pO5 of pIncs) {
			// 		if (!visis) {// первый пропускаю, т.к. это сам "первый" контейнер
			// 			visis = pO5.pos.visis
			// 			pT = pO5
			// 			continue
			// 		}

			// 		 //  pO5.CalcScrollScope()

			// 		let chg = ''
			// 		for (const x of [x0, opp[x0]]) {
			// 			const
			// 				v = pO5.pos.scops[x],
			// 				vT = visis[x].v,
			// 				itl = 'TL'.includes(x)

			// 			if ((vT > v && itl) || (vT < v && !itl)) {
			// 				Object.assign(pO5.pos.visis[x], { p: pT, v: vT })

			// 				if (o5debug)
			// 					chg += `${pT.name}:${x}=${vT}, `
			// 			}
			// 		}
			// 		visis = pO5.pos.visis

			// 		if (o5debug) {
			// 			rez.push({ pO5: pO5.name, chg: chg })
			// 			if (chg) n++
			// 		}
			// 	}
			// 	if (o5debug && n)
			// 		C.ConsoleInfo(`Изменил ${n} границ`, ` по '${x0 + opp[x0]}' в контейнере ${pT.name}`, rez)
			// }

			// направление движения объектов в контейнере - обратное ползунку скроллинга	
			let xs = ''
			if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
			if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

			const
				СдвигФиксированныхВложенныхКонтейнерах = (pO5, bord, v) => {
					for (const iO5 of pO5.pIncs)
						if (iO5 !== pO5) {
							for (const aO5 of iO5.aAlls)
								if (aO5.pFixs.fixed)   // зафиксированные объекты в этом контейнере
									aO5.posC[bord] -= v
							// сдвиг фиксированных в pcO5 и вложенных, 
							// но если НЕ зафиксировано по pcO5[x]									

							СдвигФиксированныхВложенныхКонтейнерах(iO5, bord, v)
						}
				},
				РасфиксацияПротивоположных = o => {
					for (const aO5 of pcO5.aAlls)
						if (aO5.pFixs[o] === pcO5) {  // зафиксированные объекты в этом контейнере
							const
								aC = aO5.posC,
								aO = aO5.posO
							aO5.CalcCurPos(time)

							if ( 		//  Если вышло за shdw - расфиксирую
								(o === 'T' && aC.top <= aO.top) ||
								(o === 'B' && aC.top >= aO.top) ||
								(o === 'L' && aC.left <= aO.left) ||
								(o === 'R' && aC.left >= aO.left)
							)
								aO5.UnFix(o)

							if (o5debug > 1)
								console.log(`проверка расфиксации ${aO5.id} по ${o} `, !aO5.pFixs[o] ? '- расфиксировал!' : '')
						}
				},
				НоваяФиксацияНаГранице = (aO5, x, v, pO5) => {
					const
						c = aO5.posC,
						o = aO5.posO
					aO5.CalcCurPos(time)

					let p;
					for (const frame of aO5.frames)
						if (frame.pO5 === pO5 && frame.fix) {
							switch (x) {
								case 'T': if (o.top <= v) { c.top = v; p = pO5 }; break
								case 'L': if (o.left <= v) { c.left = v; p = pO5 }; break
								case 'R': if (o.left + c.width >= v) { c.left = v - c.width; p = pO5 }; break
								case 'B': if (o.top + c.height >= v) { c.top = v - c.height; p = pO5 }; break
							}

							if (o5debug > 1)
								console.log(`проверка фиксации ${aO5.id} по ${x} `,
									p ? `- зафиксировал posC= ${c[xbord[x]]}  posO= ${o[xbord[x]]}  !` : '')

							if (p) {
								if (p !== aO5.pFixs[x])
									aO5.DoFix(p, x)
								return p
							}
						}
				},
				ФиксацииВложенныхКонтейнерах = (pO5, x) => {
					const v = pO5.pos.scops[x]
					for (const iO5 of pO5.pIncs)
						if (iO5 !== pO5) {

							iO5.CalcScrollScope(time)	// определение текущих позиций								

							if (
								((x === 'T' || x === 'L') && iO5.pos.scops[x] <= v) ||
								((x === 'R' || x === 'B') && iO5.pos.scops[x] >= v)
							) {
								for (const aO5 of iO5.aAlls)
									// if (!aO5.pFixs[x] && !aO5.pFixs[opp[x]])
									НоваяФиксацияНаГранице(aO5, x, v, pO5)

								ФиксацииВложенныхКонтейнерах(iO5, x)
							}
							else   // если этот не пересёк, то и остальным пофиг
								break
						}
				},
				ФиксацииЭтомКонтейнере = x => {
					const v = pcO5.pos.scops[x]
					for (const aO5 of pcO5.aAlls)
						if (!aO5.pFixs[x] && !aO5.pFixs[opp[x]])
							НоваяФиксацияНаГранице(aO5, x, v, pcO5)
				}

			for (const x of xs) {
				РасфиксацияПротивоположных(opp[x])
				const isTB = 'TB'.includes(x)
				СдвигФиксированныхВложенныхКонтейнерах(pcO5, isTB ? 'top' : 'left', isTB ? scV : scH)
			}
			// for (const x of xs)
			// CalcBoards(pO5.pIncs, x)


			// // фиксации не-зафиксированных объектов в этом контейнере.
			// for (const x of xs) {
			// 	const v = pO5.pos.scops[x]
			// 	for (const aO5 of pO5.aAlls)
			// 		if (!aO5.pFixs[x] && !aO5.pFixs[opp[x]])
			// 			НоваяФиксацияНаГранице(aO5, x, v, pO5)
			// }

			// фиксации не-зафиксированных объектов в этом контейнере.
			for (const x of xs)
				ФиксацииЭтомКонтейнере(x)

			// фиксации не-зафиксированных объектов в этом и в остальных вложенных контейнерах.
			for (const x of xs)
				ФиксацииВложенныхКонтейнерах(pcO5, x)


			// for (const x of xs) {
			// 	for (const aO5 of aAlls)
			// 		if (!aO5.pFixs[x]) {  // зафиксированные объекты в этом контейнере
			// 			const aC = aO5.posC
			// 			switch (o) {
			// 				case 'T': aC.top -= scV; aC.bottom -= scV; break
			// 				case 'L': aC.left -= scH; aC.right -= scH; break
			// 				case 'R': aC.right -= scH; aC.left -= scH; break
			// 				case 'B': aC.bottom -= scV; aC.top -= scV; break
			// 			}

			// 		}
			// }


			// for (const x of xs)
			// 	CalcBoards(pO5.pIncs, x)

			// for (const aO5 of aAlls)
			// 	CurrAO5pos(aO5)

			// for (const aO5 of aAlls)
			// 	for (const x of xs)
			// 		if (aO5.hidden[x])
			// 			CheckHidden(aO5, x)

			// for (const aO5 of aAlls)
			// 	if (aO5.act.wasFull)     // проверять не все, а только частично невидимые????	
			// 		for (const x of xs)
			// 			if (aO5.pFixs[x])
			// 				НаБлижнемТеге(aO5, x)

			// for (const aO5 of aAlls)
			// 	if (aO5.act.wasFull)     // проверять не все, а только частично невидимые????	
			// 		for (const x of xs) {
			// 			const o = opp[x]

			// 			if (!aO5.pFixs[o] && (!aO5.pFixs[x] || aO5.pFixs[x].pos.schgs[x] || doschgs))
			// 				PutOnBound(aO5, x)

			// 			if (!aO5.pFixs[x] && aO5.pFixs[o])
			// 				PutOnBound(aO5, o)

			// 			const ps = []
			// 			for (const y of [x, o])
			// 				if (aO5.pFixs[y])
			// 					ps[x] = ОбрезаниеПротивоположнойСтороны(aO5, y)

			// 			for (const y of [x, o])
			// 				OverlapByFrames(aO5, y, ps[y] || aO5.base.pO5)
			// 		}

			for (const pInc of pcO5.pIncs)
				for (const aO5 of pInc.aAlls)
					if (aO5.pFixs.fixed)
						aO5.ShowFix()
		}

	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll])

})();