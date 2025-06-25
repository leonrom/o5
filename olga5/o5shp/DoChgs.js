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
		xbord = { T: 'top', L: 'left', R: 'right', B: 'bottom' },
		coordVH = { V: ['height', 'top', 'bottom'], H: ['width', 'left', 'right'] },

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

							if ((itl && r.v > v) || (!itl && r.v < v)) {
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
					let i, len, aO5s, k, cO5;		//??????????????????????

					aO5.CalcCurPos(time)
					const
						pbase = aO5.base.pbase,
						iO5s = pbase.aO5s

					for (const iO5 of iO5s)
						if (!iO5.pFixs[x]) {
							//????????????????????							

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
							!fO5.hidden[x] &&
							!fO5.zeroed[smode] &&
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
							if (nfx.p) {					// smode  ?????????????????
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
				opp = { T: 'B', L: 'R', R: 'L', B: 'T' },
				bdef = { T: {}, L: {}, R: {}, B: {} }

			// направление движения объектов в контейнере - обратное ползунку скроллинга	
			let xs = ''
			if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
			if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

			for (const x of xs) {
				const tb = x === 'T' || x === 'B'
				Object.assign(bdef[x], {
					rido: (x === 'T' || x === 'L'),
					flank: tb ? 'top' : 'left',
					shift: tb ? scV : scH,
					v: pcO5.pos.scops[x],
					p: pcO5,
					x: x,
				})
			}
			Object.freeze(bdef)

			const
				СдвигФиксированныхВложенныхКонтейнерах = (pO5, bord, os) => {
					for (const iO5 of pO5.pIncs) {
						if (iO5 === pO5)
							continue

						for (const o of os) {
							const v = iO5.pos.scops[o]
							for (const aO5 of iO5.aFixs[o])
								if (aO5.pFixs[o].at(-1) == iO5)   // т.е. iO5 - это последний
									switch (o) {
										case 'T': aO5.posC.top = v; break
										case 'L': aO5.posC.left = v; break
										case 'R': aO5.posC.left = v - aO5.posC.width; break
										case 'B': aO5.posC.top = v - aO5.posC.height; break
									}
						}
						СдвигФиксированныхВложенныхКонтейнерах(iO5, bord, os)
					}
				},
				НоваяФиксацияНаГранице = (aO5, bx) => { // x, v, pO5) => {  НоваяФиксацияНаГранице(aO5, xvi.x, xvi.v, iO5)
					const
						c = aO5.posC,
						o = aO5.posO,
						v = bx.v
					let p;
					for (const frame of aO5.frames)
						if (frame.fix && frame.pO5 === bx.p) {
							switch (bx.x) {
								case 'T': if (o.top <= v) { c.top = v; p = 1 }; break
								case 'L': if (o.left <= v) { c.left = v; p = 1 }; break
								case 'R': if (o.left + c.width >= v) { c.left = v - c.width; p = 1 }; break
								case 'B': if (o.top + c.height >= v) { c.top = v - c.height; p = 1 }; break
							}

							if (p) {
								if (bx.p !== aO5.pFixs[bx.x].at(-1))
									aO5.DoFix(bx.p, bx.x)
							}
							break
						}
				},
				// ФиксацииВложенныхКонтейнерах = (pO5, x) => {
				// 	const v = pO5.pos.scops[x]
				// 	for (const iO5 of pO5.pIncs)
				// 		if (iO5 !== pO5) {
				// 			if (
				// 				((x === 'T' || x === 'L') && iO5.pos.scops[x] <= v) ||
				// 				((x === 'R' || x === 'B') && iO5.pos.scops[x] >= v)
				// 			) {
				// 				for (const aO5 of iO5.aOwns)
				// 					НоваяФиксацияНаГранице(aO5, x, v, pO5)

				// 				ФиксацииВложенныхКонтейнерах(iO5, x)
				// 			}
				// 			else   // если этот не пересёк, то и остальным пофиг
				// 				break
				// 		}
				// },
				ПересчетГраницКонтейнеров = pO5 => {
					for (const iO5 of pO5.pIncs)
						if (iO5 !== pO5) {
							iO5.CalcScrollScope(time)
							ПересчетГраницКонтейнеров(iO5)
						}
				},
				ПоказФиксированных = pO5 => {
					const
						ShowFix = aOwns => {
							for (const aO5 of aOwns)
								if (aO5.act.fixed)
									aO5.ShowFix()
						}

					if (pO5 === pcO5) ShowFix(pcO5.aOwns)

					for (const iO5 of pO5.pIncs)
						if (iO5 !== pO5) {
							ShowFix(iO5.aOwns)
							ПоказФиксированных(iO5)
						}
				},
				ФиксацияВоВложенных = (pO5, bx) => {
					for (const iO5 of pO5.pIncs)
						if (iO5 !== pO5) {
							const
								v = iO5.pos.scops[bx.x],
								inside = (bx.rido && v > bx.v) || (!bx.rido && v < bx.v)

							for (const aO5 of iO5.aOwns) {
								aO5.CalcCurPos(time)

								if (inside)
									aO5.posC[bx.flank] -= bx.shift
								else
									НоваяФиксацияНаГранице(aO5, bx)
							}
							ФиксацияВоВложенных(iO5, bx)
						}
				},
				РасфиксВоВложенных = (pO5, bx) => {
					for (const iO5 of pO5.pIncs)
						if (iO5 !== pO5) {
							for (const aO5 of pcO5.aOwns[o])
								if (aO5.pFixs[o].at(-1) === pcO5) {

								}
							РасфиксВоВложенных(iO5, bx)
						}
				}

			ПересчетГраницКонтейнеров(pcO5)

			/*
				Обработка основного контейнера
			*/
			for (const aO5 of pcO5.aOwns)
				aO5.CalcCurPos(time)

			for (const x of xs) {
				// Расфиксация на Противоположном конце
				const o = opp[x]
				// v = pcO5.pos. scops[o]

				for (const aO5 of pcO5.aOwns[o])
					if (aO5.pFixs[o].at(-1) === pcO5) {  // зафиксированные объекты в этом контейнере
						const aC = aO5.posC, aO = aO5.posO
						// 					if ( 							//  Если вышло за shdw - расфиксирую
						// 	(o === 'T' && aC.top > v) ||
						// 	(o === 'B' && aC.top+aC.height < v) ||
						// 	(o === 'L' && aC.left >v) ||
						// 	(o === 'R' && aC.left+aC.width <v)
						// )
						if ( 							//  Если вышло за shdw - расфиксирую
							(o === 'T' && aC.top <= aO.top) ||
							(o === 'B' && aC.top >= aO.top) ||
							(o === 'L' && aC.left <= aO.left) ||
							(o === 'R' && aC.left >= aO.left)
						)
							aO5.UnFix(o, pcO5)
					}

				// Фиксация незафиксированных				
				for (const aO5 of pcO5.aOwns)
					if (!aO5.pFixs[x].length && !aO5.pFixs[o].length) {
						aO5.CalcCurPos(time)
						НоваяФиксацияНаГранице(aO5, bdef[x])
					}
			}

			/*
					Обработка вложенных контейнеров
			*/
			for (const x of xs) {
				ФиксацияВоВложенных(pcO5, bdef[x])
				РасфиксВоВложенных(pcO5, bdef[x])
			}

			ПоказФиксированных(pcO5)
		}

	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll])

})();