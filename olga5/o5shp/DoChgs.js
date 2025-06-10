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
		coordVH = { V: ['height', 'top', 'bottom'], H: ['width', 'left', 'right'] },

		CheckHidden = (aO5, x) => {
			// обработка скрытых тегов
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
		CurrAO5pos = aO5 => {
			const p = aO5.act.shdw.getBoundingClientRect()

			Object.assign(aO5.posO, { top: p.top, left: p.left, right: p.right, bottom: p.bottom, height: p.height, width: p.width })

			Object.assign(aO5.posC, { width: p.width, height: p.height })
			if (!aO5.pFixs.L && !aO5.pFixs.R) aO5.posC.left = p.left
			if (!aO5.pFixs.T && !aO5.pFixs.B) aO5.posC.top = p.top

			Object.assign(aO5.posS, { top: 0, left: 0 })
		},
		PutOnBound = (aO5, x) => {
			if (o5debug > 2)
				console.log(`Подключение Границе Фрейма для aO5=${aO5.id} по ${x}`)

			const c = Object.assign({}, aO5.posO)
			let pFix = null
			for (const frame of aO5.frames)
				if (frame.fix) {
					const
						pO5 = frame.act.pO5,
						v = pO5.scops[x]	// pO5.visis[x].v	//v = pO5.scops[x]

					switch (x) {
						case 'T': if (c.top <= v) { pFix = pO5; c.top = v }; break
						case 'L': if (c.left <= v) { pFix = pO5; c.left = v }; break
						case 'R': if (c.left + c.width >= v) { pFix = pO5; c.left = v - c.width }; break
						case 'B': if (c.top + c.height >= v) { pFix = pO5; c.top = v - c.height }; break
					}
				}

			if (pFix) {
				const v = pFix.scops[x],
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
				v = pO5.visis[x].v,
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
		MakeScroll = (scV, scH, tag, doschgs) => {
			const
				pO5scroll = tag.pO5 ? tag.pO5 : document.body.pO5,
				aAlls = pO5scroll.aAlls,
				ОбрезаниеПротивоположнойСтороны = (aO5, y) => {
					if (o5debug > 2)
						console.log(`Обрезание с Противоположной Стороны для aO5=${aO5.id} по ${x}`)
					const
						o = opp[y],
						c = aO5.posC,
						itl = 'TL'.includes(o),
						pO5 = aO5.base.pO5,
						r = { p: pO5, v: pO5.scops[o] }

					for (const frame of aO5.frames)
						if (frame.cut) {
							const
								p = frame.act.pO5,
								v = p.visis[o]	// pO5.visis[x].v	//v = pO5.scops[x]

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
					const
						pbase = aO5.base.pbase,
						iO5s = pbase.baO5s

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
				}

			let xs = ''
			if (scV > 0) xs += 'T'; else if (scV < 0) xs += 'B'
			if (scH > 0) xs += 'L'; else if (scH < 0) xs += 'R'

			for (const x of xs)
				wshp.Boards.CalcBoards(tag.pO5.pIncs, x)

			for (const aO5 of aAlls)
				CurrAO5pos(aO5)

			for (const aO5 of aAlls)
				for (const x of xs)
					if (aO5.hidden[x])
						CheckHidden(aO5, x)

			for (const aO5 of aAlls)
				if (aO5.act.wasFull)     // проверять не все, а только частично невидимые????	
					for (const x of xs)
						if (aO5.pFixs[x])
							НаБлижнемТеге(aO5, x)

			for (const aO5 of aAlls)
				if (aO5.act.wasFull)     // проверять не все, а только частично невидимые????	
					for (const x of xs) {
						const o = opp[x]

						if (!aO5.pFixs[o] && (!aO5.pFixs[x] || aO5.pFixs[x].schgs[x] || doschgs))
							PutOnBound(aO5, x)

						if (!aO5.pFixs[x] && aO5.pFixs[o])
							PutOnBound(aO5, o)

						const ps = []
						for (const y of [x, o])
							if (aO5.pFixs[y])
								ps[x] = ОбрезаниеПротивоположнойСтороны(aO5, y)

						for (const y of [x, o])
							OverlapByFrames(aO5, y, ps[y] || aO5.base.pO5)
					}

			for (const aO5 of aAlls)
				if (aO5.pFixs.fixed)
					aO5.ShowFix()
		},
		Throttle = (Fun, limit, dy0, dx0) => {
			const dym = dy0, dxm = dx0
			let olddir;

			return function (...args) {
				const
					event = args[0],
					src = event.srcElement,
					doc = src.scrollingElement,
					tag = doc ? document.body : src

				if (!tag.pO5)
					return

				const
					actScroll = tag.pO5.actScroll,
					old = actScroll.timcall,
					now = performance.now(),
					screl = doc ? doc : tag,
					scV = screl.scrollTop - actScroll.top,	// был верт. скроллинг				
					scH = screl.scrollLeft - actScroll.left	// был гориз. скроллинг				

				if (o5debug > 2) {
					const
						dir = scV > scH ? 'V' : 'H',
						s = `V=${scV}, H=${scH},- sT=${screl.scrollTop}, aT=${actScroll.top}, sL=${screl.scrollLeft}, aL=${actScroll.left}, `

					if (scV > 0 && scH > 0)
						console.log("%c%s", fmtErr, `scroll__`, ` ${tag.id}:  ${s}`)
					else
						if (olddir !== dir) {
							olddir = dir
							console.log("%c%s", fmtOK, `scroll_${dir}`, ` ${tag.id}:  ${s}`)
						}
						else
							console.log(`scroll_${dir}`, ` ${tag.id}:  ${s}`)
				}

				if (Math.abs(scV) >= dym || Math.abs(scH) >= dxm || (now - old) >= limit) {
					Object.assign(actScroll, { top: screl.scrollTop, left: screl.scrollLeft, timcall: now })
					Fun(scV, scH, tag)
				}
			}
		},
		ThrottledOnScroll = Throttle(MakeScroll, 100, 2, 2),
		EveScroll = e => {
			ThrottledOnScroll(e)
		},
		isResize = { act: false, time: 0 },
		Resize = async e => {
			const time = e.timeStamp

			if (!body.pO5 || !body.pO5.aAlls || (isResize.act && (time - isResize.time) < 66))
				return

			Object.assign(isResize, { act: true, time: time })

			const aAlls = document.body.pO5.aAlls
			for (const aO5 of aAlls)
				wshp.Boards.FindBords(aO5)

			MakeScroll(0.1, 0.1, body)

			isResize.act = false
		},
		OnResize = async e => {
			const name = await Resize(e)
		},
		Debounce = (func, delay) => {  // Функция для дебаунса    // function debounce(func, delay) {
			let timeout
			return function (...args) {
				clearTimeout(timeout)
				timeout = setTimeout(() => {// Вызываем функцию через задержку                    
					func(...args) // при "стрелочной" декларации, а в общем =>  func.apply(this, args); 
				}, delay)
			}
		},
		DebouncedResize = Debounce(OnResize, 66),
		iScroll = { act: false, eve: 'scroll', Fun: EveScroll, pars: { couldRepeat: true, capture: true } },
		ActListener = act => {
			if (act !== iScroll.act) {
				// if (act)
				// 	C.E.AddEventListener(iScroll.eve, iScroll.Fun, iScroll.pars)
				// else
				// 	C.E.RemoveEventListener(iScroll.eve, iScroll.Fun, iScroll.pars)

				C.E[(act ? 'Add' : 'Remove') + 'EventListener'](iScroll.eve, iScroll.Fun, iScroll.pars)
				iScroll.act = act

				if (o5debug)
					console.log("%c%s", fmtOK, `скроллинг`, act ? 'ЗАПУЩЕН' : 'остановлен')
			}
		}

	wshp = C.AddModuleSub(olga5_modul, modulname, [ActListener, MakeScroll])

	// window.addEventListener('resize', DebouncedResize, true)
	document.addEventListener('resize', DebouncedResize, true)
})();