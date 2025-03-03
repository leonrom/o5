/*jshint asi:true          */
/* global window, console, document */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoScroll ---
	"use strict"

	let wshp, nPxs, aO5xs, timeStamp = 0, oldScroll = false

	const
		olga5_modul = "o5shp",
		modulname = 'DoScroll',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmtOK = "background: cornsilk; color: black;",

		// исправить попадание вниз
		// перед ChFixeds проверять видимость для вытолкнутых

		ReorderFrames = (pO5base, x) => {
			/*
			упорядочиваю контейнеры по вложенности
			*/
			const
				pO5s = pO5base.pO5s,
				nPs = [],
				Push = (nP, z) => {
					let left = 0,
						right = nPs.length

					while (left < right) {  // Бинарный поиск правильной позиции
						const
							mid = Math.floor((left + right) / 2),
							d = nPs[mid].val - nP.val

						if (d < 0 && !z || d >= 0 && z)
							left = mid + 1
						else
							right = mid
					}

					nPs.splice(left, 0, nP)
				}

			const
				de = document.documentElement,
				w = de.clientWidth,
				h = de.clientHeight

			for (const pO5 of pO5s) {
				const val =
					x === 'T' ? pO5.scope.top : (
						x === 'L' ? pO5.scope.left : (
							x === 'R' ? pO5.scope.right :
								pO5.scope.bottom
						)
					)
				// вношу только те, что в пределах экрана
				if (((x === 'T' || x === 'L') && val >= 0) ||
					(x === 'R' && val <= w) ||
					(x === 'B' && val <= h)
				)
					Push({ val: val, pO5: pO5 }, (x === 'T' || x === 'L'))
			}

			return nPs
		},
		ChFixeds = (aO5, x) => {
			/*
			ищу первый (для aO5) фиксирующий контейнер
			*/
			const
				pO5base = aO5.act.pO5base,
				aC = aO5.posC
//  сортирую границы в nPs, котрые сохраняю в nPxs
			let nPs = nPxs.get([pO5base.name, x])
			if (!nPs) {
				nPs = ReorderFrames(pO5base, x)
				nPxs.set([pO5base.name, x], nPs)

				if (o5debug > 0)
					console.log("%c%s", fmtOK, `ChFixeds ${aO5.name}`, ` контейнеры (${x}):`,
						nPs.map(nP => nP.pO5.name + '/' + nP.val).join('; '))
			}
			for (const nP of nPs)
				for (const frame of aO5.frames)
					if (frame.fix && frame.pO5 === nP.pO5) {
						// сначала пробую снять hiddet
						// для тех, который
						switch (x) {
							case 'T': if (aC.top <= nP.val) Object.assign(aC, { top: nP.val, bottom: nP.val + aC.height }); break
							case 'L': if (aC.left <= nP.val) Object.assign(aC, { left: nP.val, right: nP.val - aC.width, }); break
							case 'R': if (aC.right >= nP.val) Object.assign(aC, { right: nP.val, left: nP.val - aC.width, }); break
							case 'B': if (aC.bottom >= nP.val) 
								Object.assign(aC, { bottom: nP.val, top: nP.val - aC.height }); 
							break
						}

						// if (o5debug > 0)
						// 	console.log(`ChFixeds на границе ${nP.pO5.name} :  ${x}= ${nP.val.toFixed().padStart(5)}`)

						return nP.pO5
					}


			// for (const frame of aO5.frames) {
			// 	if (!frame.fix || !frame.pO5)
			// 		continue

			// 	const
			// 		nP = { val: 0, pO5: null },
			// 		pO5 = frame.pO5,
			// 		pos = pO5.scope

			// 	switch (x) {
			// 		case 'T': if (aC.top <= pos.top) Object.assign(nP, { val: pos.top, pO5: pO5 }); break
			// 		case 'L': if (aC.left <= pos.left) Object.assign(nP, { val: pos.left, pO5: pO5 }); break
			// 		case 'R': if (aC.right >= pos.right) Object.assign(nP, { val: pos.right, pO5: pO5 }); break
			// 		case 'B': if (aC.bottom >= pos.bottom) Object.assign(nP, { val: pos.bottom, pO5: pO5 }); break
			// 	}
			// 	if (nP.pO5) {
			// 		switch (x) {
			// 			case 'T': Object.assign(aC, { top: nP.val, bottom: nP.val + aC.height }); break
			// 			case 'L': Object.assign(aC, { left: nP.val, right: nP.val - aC.width, }); break
			// 			case 'R': Object.assign(aC, { right: nP.val, left: nP.val - aC.width, }); break
			// 			case 'B': Object.assign(aC, { bottom: nP.val, top: nP.val - aC.height }); break
			// 		}
			// 		if (o5debug > 0)
			// 			console.log("%c%s", fmtOK, `ChFixeds`, ` ${aO5.name}`, ` на границе ${nP.pO5.name} :  ${x}= ${nP.val.toFixed().padStart(5)}`)

			// 		return true
			// 	}
			// }
		},
		ChSticks = (aO5, x) => {
			/* 
				проверяю на прилипания к предыдущим fO5
				выборка делается по обратной упорядоченности
			*/
			const
				aC = aO5.posC,
				aO5s = aO5xs[x]
			let
				i = aO5s.indexOf(aO5)

			while (i-- > 0) {
				const
					fO5 = aO5s[i],
					act = fO5.act,
					fC = fO5.posC

				if (!act.hiddet[x] &&
					aO5.cls.level < fO5.cls.level &&
					aC.left < fC.right && aC.right > fC.left
				) {
					let st;
					switch (x) {
						case 'T': if (aC.top <= fC.bottom) { st = true, aC.top = fC.bottom, aC.bottom = aC.top + aC.height }; break
						case 'L': if (aC.left <= fC.right) { st = true, aC.left = fC.right, aC.right = aC.left + aC.width }; break
						case 'R': if (aC.right >= fC.left) { st = true, aC.right = fC.left, aC.left = aC.right - aC.width }; break
						case 'B': if (aC.bottom >= fC.top) { st = true, aC.bottom = fC.top, aC.top = aC.bottom - aC.height }; break
					}
					const
						stxs = fO5.act.sO5s[x],
						j = stxs.indexOf(aO5)
					if (st) {   // aO5 sticked (прижимается) к fO5		
						if (j < 0) {
							if (o5debug > 0)
								console.log("%c%s", fmtOK, `ChSticks`, `${aO5.name}`, ` на границе-${x}`, `${fO5.name} `)

							stxs.push(aO5)
							break
						}
					}
					else {
						if (j >= 0)
							stxs.splice(j, 1);
					}
				}
			}
			if (o5debug > 1) aO5.TestShowFix(x)
		},
		ChNudget = (aO5, x) => {
			/* 
				проверяю на сжатия предыдущих fO5
				выборка делается по обратной упорядоченности
			*/
			const
				aC = aO5.posC,
				aO5s = aO5xs[x]
			let
				i = aO5s.indexOf(aO5)

			while (i-- > 0) {
				const
					fO5 = aO5s[i],
					fC = fO5.posC,
					fS = fO5.posS,
					act = fO5.act

				if (!act.hiddet[x] &&
					aO5.cls.level > fO5.cls.level &&
					aC.left < fC.right && aC.right > fC.left
				) {
					let nu, d;
					switch (x) {
						case 'T': if ((d = aC.top - fC.bottom) <= 0) { nu = x, fC.bottom = aC.top, fC.height += d, fS.top += d }; break
						case 'L': if ((d = aC.left - fC.right) <= 0) { nu = x, fC.right = aC.left, fC.width += d, fS.left += d }; break
						case 'R': if ((d = aC.right - fC.left) >= 0) { nu = x, fC.left = aC.right, fC.width -= d }; break
						case 'B': if ((d = aC.bottom - fC.top) >= 0) { nu = x, fC.top = aC.bottom, fC.height -= d }; break
					}

					if (nu) {
						if (o5debug > 1) fO5.TestShowFix(x)

						const stxs = fO5.act.sO5s[x]

						if (o5debug > 0) {
							let s = ''
							for (const sO5 of stxs) s += (s ? ', ' : '') + sO5.name
							console.log("%c%s", fmtOK, `ChNudget`, `${aO5.name}`, ` сжимает по ${x}`, `${fO5.name} переопределю: ${s}`)
						}
						fO5.act.nudget[x] = aO5

						for (const sO5 of stxs) {
							Object.assign(sO5.posC, sO5.posO)
							ChSticks(sO5, x)
						}
					} else {
						fO5.act.nudget[x] = null
						/*								
						// переделать дав "освоюождение"  | переделать дав "освоюождение"  | переделать дав "освоюождение"  | переделать дав "освоюождение"
						*/
						break
					}
				}
			}
			if (o5debug > 1) aO5.TestShowFix(x)
		},
		TryToFix = (aO5, x, pO5) => {
			/*
			отработка фиксации
			*/
			if (o5debug > 0) {
				let s = ''
				for (const nam in aO5.posC)
					if (aO5.posC[nam] !== aO5.posO[nam])
						s += (s ? ', ' : '') + `${nam}(${aO5.posO[nam]}->${aO5.posC[nam]})`
				if (s)
					console.log("%c%s", fmtOK, `TryToFix`, `для DoFix  ${aO5.name}`, ` по ${x} изменено: "${s}"`)
			}

			const
				// X = {T:'B', L:'R', R:'L', B:'T', },
				changed = aO5.Changed(x),
				isfixed = aO5.IsFixed(x),
				hiddet = aO5.act.hiddet

			if (!aO5.cls.alive) {
				if (x === 'T' || x === 'B') hiddet.T = hiddet.B = aO5.posC.height <= 0
				if (x === 'L' || x === 'R') hiddet.L = hiddet.R = aO5.posC.width <= 0
			}
			if (isfixed && !changed)
				aO5.UnFix(x)
			else
				if (!isfixed && changed)
					aO5.DoFix(x, pO5)

			if (o5debug > 1) aO5.TestShowFix(x)

			return changed
		},
		CutFixed = (aO5, x) => {
			/*
			перебираются все контейнеры-владельцы (т.е. 'cut') и проверяются на 
			ПОДЖАТИЕ с противоположной от 'x' сторона
			*/
			const
				aC = aO5.posC,
				aS = aO5.posS,
				frames = aO5.frames

			let pO5s = null
			for (const frame of frames)
				if (frame.cut) { // поиск фиксации на границе, т.е. с обрезанием
					const
						pO5 = frame.pO5,
						sc = pO5.scope
					let d = 0;
					switch (x) {
						case 'T': if ((d = aC.bottom - sc.bottom) > 0) { aC.bottom -= d, aC.height -= d, aS.top -= d }; break
						case 'L': if ((d = aC.right - sc.right) > 0) { aC.right -= d, aC.width -= d, aS.left -= d }; break
						case 'R': if ((d = sc.left - aC.left) > 0) { aC.left += d, aC.width -= d }; break
						case 'B': if ((d = sc.top - aC.top) > 0) { aC.top += d, aC.height -= d }; break
					}

					if (!pO5s)
						pO5s = frame.pO5.pO5s	// самый дальний (для aO5) 'обрезающий' контейнер
				}
		},
		TrunkFix = aO5 => {
			/*
			перебираю все дальние (после крайнего) контейнеры
			и ОБРЕЗАЮТСЯ все вылезающие части зафиксированых тегов
			*/
			const
				aC = aO5.posC,
				aS = aO5.posS,
				frames = aO5.frames

			let f;
			for (const frame of frames)
				if (frame.cut) {
					f = frame  // первый frame - это самый удалённый контейнер с обрезанием
					break
				}

			const
				pO5s = f ? f.pO5.pO5s : null
			if (pO5s && !pO5s[0].final) {
				let i = 0, d;
				while (i++ < pO5s.length) {	// для i==0 отработало в CutFixed 
					const pO5 = pO5s[i],
						sc = pO5.scope

					if ((d = aC.top - sc.top) < 0) { aC.top = sc.top, aC.height -= d }
					if ((d = aC.left - sc.left) < 0) { aC.left = sc.left, aC.width -= d }
					if ((d = aC.right - sc.right) > 0) { aC.right = sc.right, aC.width -= d }
					if ((d = aC.bottom - sc.bottom) > 0) { aC.bottom = sc.bottom, aC.height -= d }

					if (pO5.final)
						break
				}
			}

			if (o5debug > 1) aO5.TestShowFix('TLRB')
			return true
		},
		PrepScroll = aO5s => {

			for (const aO5 of aO5s) {
				const p = aO5.act.shdw.getBoundingClientRect()
				Object.assign(aO5.posC, { top: p.top, left: p.left, right: p.right, bottom: p.bottom, height: p.height, width: p.width, })
				Object.assign(aO5.posS, { top: 0, left: 0, })
				Object.assign(aO5.posO, aO5.posC)

				Object.assign(aO5.act.nudget, { T: null, L: null, R: null, B: null })
			}

			nPxs.clear()

			// const
			// 	pO5bases = []
			// for (const aO5 of aO5s) {
			// 	const pO5base = aO5.act.pO5base
			// 	if (!pO5bases.includes(pO5base))
			// 		pO5bases.push(pO5base)
			// }
			/*
			подсчет координат всех 'активных' pO5
			*/
			const pO5bases = new Set()
			for (const aO5 of aO5s)
				pO5bases.add(aO5.act.pO5base)

			for (const pO5base of pO5bases) {
				const pO5s = pO5base.pO5s
				for (const pO5 of pO5s) {
					if (pO5.scope.time === timeStamp) // этот и последующие уже определены
						break

					pO5.scope.time = timeStamp
					pO5.CalcScrollScope()

					if (pO5.body) break
				}
			}

			/*
			для каждого pO5base подсчет внутреннего и внешнего периметров охватывающих его вреймов
			а также внутреннего периметра контейнеров, охватывающих все вреймы
			*/


			// // для DoNudges
			// const
			// 	puts = aO5.cls.puts,
			// 	posC = aO5.posC

			// Object.assign(aO5.nP, {
			// 	pT: null, pL: null, pR: null, pB: null,
			// 	top: posC.top, left: posC.left, right: posC.right, bottom: posC.bottom,
			// 	height: posC.height, width: posC.width,
			// })

			// Object.assign(aO5.posF, { top: posC.top, left: posC.left, right: posC.right, bottom: posC.bottom, })

			// Object.assign(aO5.act.movto, {
			// 	ifV: (scV > 0 && puts.B || scV < 0 && puts.T),
			// 	ifH: (scH > 0 && puts.R || scH < 0 && puts.L),
			// })
		},
		Scroll = (time, scV, scH, tag) => {
			timeStamp = time
			aO5xs = tag.pO5 ? tag.pO5.aO5xs : body.pO5.aO5xs

			PrepScroll(aO5xs.T)

			let xs = []
			if (scV) xs.push(...['T', 'B'])
			if (scH) xs.push(...['L', 'R'])

			if (o5debug > 1) {
				let s = ''
				for (const x of xs)
					s += `${x}: ${aO5xs[x].map(a => a.name).join(', ')}; `
				console.log(`Scroll'ы: ${s}`)
			}

			for (const x of xs) {
				let
					i = 0,
					ifixes = false

				if (o5debug > 0)
					console.log("%c%s", fmtOK, ` (${x}):`, `-------------------------------------------------------`)

				for (const aO5 of aO5xs[x]) {
					if (!aO5.cls.nofx &&					// не зажан как "неподвисающий"
						aO5.cls.puts[x] &&
						!aO5.act.hiddet[x] &&
						(aO5.act.uScroll || aO5.act.fixeds[x])
					) {
						// TryUnHid(aO5, x)
						const 
						pO5=ChFixeds(aO5, x)

					if (pO5) ifixes = true	//	признак что ВООБЩЕ уже есть зафиксированные
						if (ifixes && i++ > 0) {	// т.е. для первого зафиксированного ЭТО не проверять
							ChSticks(aO5, x)
							ChNudget(aO5, x)
						}

						if (TryToFix(aO5, x, pO5)) {
// если убрать 'if' то похабно обрезает shp0							
							TryToFix(aO5, x, pO5)
							CutFixed(aO5)
							TrunkFix(aO5)
						}
						else
							break
					}
				}
			}

			for (const aO5 of aO5xs.T)		// делать отдельно, т.к. перерисовать надо всех!
				if (aO5.IsFixed())
					aO5.ShowFix()
		},
		Throttle = (Fun, limit, dy0, dx0) => {
			const
				dym = dy0,
				dxm = dx0
			let lastCall = 0, // Время последнего вызова
				lastLeft = 0,
				lastTop = 0

			return function (...args) {
				const
					now = performance.now(), // Date.now(),
					tag = args[0].srcElement,
					scV = tag.scrollTop - lastTop,	// был верт. скроллинг				
					scH = tag.scrollLeft - lastLeft,	// был гориз. скроллинг				
					need = now - lastCall >= limit || Math.abs(scV) > dym || Math.abs(scH) > dxm

				lastLeft = tag.scrollLeft
				lastTop = tag.scrollTop

				if (need) {
					lastCall = now
					Fun(now, scV, scH, tag)
				}
			}
		},
		ThrottledOnScroll = Throttle(Scroll, 100, 3, 3),
		Activation = (isScroll, txt) => {
			if (oldScroll === isScroll)
				return

			oldScroll = isScroll

			if (o5debug > 0)
				C.ConsoleInfo(`DoScroll  ${isScroll ? 'START' : 'stop '} `, txt)

			if (isScroll) {
				window.addEventListener('scroll', ThrottledOnScroll, true);
				Scroll(performance.now(), 1, 1, { id: `после DoScroll(${isScroll}, ${txt})` })   // давать именно здесь (иначе скачет источник скроллинга)! 
			}
			else
				window.removeEventListener('scroll', ThrottledOnScroll, true);
		}

	wshp = C.AddModuleSub(olga5_modul, modulname, [Activation, Scroll])
	nPxs = new wshp.Map()
})();