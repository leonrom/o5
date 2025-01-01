/*jshint asi:true          */
/* global window, console, document */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoScroll ---
	"use strict"

	class LRTB {
		pO5 = null	// самый дальний контейнер для подвисания
		xO5 = null 	// ближаший -"- - чтобы потом, если не найду pO5, не перебирать до конца
		fix = false // фиксировать на ПОЛЕ, без обрезания границ
		cut = false // обрезать на границе 
		end = false	// при поиске пересечения дошли до дельнейшего из bords - дальше не ищем
		constructor(typ, v0) {
			this.typ = typ
			this.val = v0
		}
		FixOnFrame = posC => {
			const pos = this.pO5.scope.pos
			switch (this.typ) {
				case 'T': Object.assign(posC, { top: pos.top, bottom: pos.top + posC.height, }); break
				case 'L': Object.assign(posC, { left: pos.left, right: pos.left + posC.width, }); break
				case 'R': Object.assign(posC, { left: pos.right - posC.width, right: pos.right, }); break
				case 'B': Object.assign(posC, { top: pos.bottom - posC.height, bottom: pos.bottom, });
			}
		}
		CutOnFrame = (posC, posS) => {
			let d = 0, h = 0, w = 0
			const pos = this.pO5.scope.pos
			switch (this.typ) {
				case 'T':
					const top = pos.top
					d = top - posC.top
					h = posC.height - d
					Object.assign(posC, { top: top, height: h, bottom: top + h })
					posS.top = -d
					break
				case 'L':
					const left = pos.left
					d = left - posC.left
					w = posC.width - d
					Object.assign(posC, { left: left, width: w, right: left + w })
					posS.left = -d
					break
				case 'R':
					const right = pos.right
					d = posC.right - right
					w = posC.width - d
					Object.assign(posC, { width: w, right: posC.left + w })
					posS.left = 0
					break
				case 'B':
					const bottom = pos.bottom
					d = posC.bottom - bottom
					h = posC.height - d
					Object.assign(posC, { height: h, bottom: posC.top + h })
					posS.top = 0
			}
		}
	}

	const
		olga5_modul = "o5shp",
		// modulname = 'DoScroll',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmtOK = "background: cornsilk; color: black;",
		CheckFixes = aO5 => {
			// let p = null
			const
				p0 = { pO5: null, xO5: null, fix: false, end: false, },
				posC = aO5.posC,
				puts = aO5.cls.puts,
				ps = [
					new LRTB('T', Number.MIN_SAFE_INTEGER),
					new LRTB('L', Number.MIN_SAFE_INTEGER),
					new LRTB('R', Number.MAX_SAFE_INTEGER),
					new LRTB('B', Number.MAX_SAFE_INTEGER)
				],
				GetNearestFrames = frame => {
					if (!frame.pO5)
						return

					const
						pO5 = frame.pO5,
						pos = pO5.scope.pos
					// LT = (x, val) => {
					// 	if (p.val < val)
					// 		if (x > val) Object.assign(p, { xO5: pO5, val: val })
					// 		else
					// 			Object.assign(p, { pO5: pO5, val: val, fix: frame.fix, cut: frame.cut })
					// },
					// GT = (x, val) => {
					// 	if (p.val > val)
					// 		if (x < val) Object.assign(p, { xO5: pO5, val: val })
					// 		else
					// 			Object.assign(p, { pO5: pO5, val: val, fix: frame.fix, cut: frame.cut })
					// }

					for (const p of ps) {
						const
							typ = p.typ,
							val = p.val
						let
							v = 0,
							isnear = false,
							canfix = false

						if ('T' === typ && val < (v = pos.top)) {
							isnear = true
							canfix = posC.top <= pos.top
						}
						else if ('L' === typ && val < (v = pos.left)) {
							isnear = true
							canfix = posC.left <= v
						}
						else if ('R' === typ && val > (v = pos.right)) {
							isnear = true
							canfix = posC.right >= v
						}
						else if ('B' === typ && val > (v = pos.bottom)) {
							isnear = true
							canfix = posC.bottom >= v
						}

						if (isnear) {
							Object.assign(p, { xO5: pO5, val: v })
							if (canfix && puts[typ])
								Object.assign(p, { pO5: pO5, fix: frame.fix, cut: frame.cut })
						}
					}

					// switch (p.typ) {
					// 	case 'T': // LT(posC.top, pos.top); 
					// 		if (p.val < (val = pos.top)) {
					// 			Object.assign(p, { xO5: pO5, val: val })
					// 			if (posC.top <= val && puts[p.typ])
					// 				Object.assign(p, { pO5: pO5, val: val, fix: frame.fix, cut: frame.cut })
					// 		} break
					// 	case 'L': // LT(posC.left, pos.left); 
					// 		if (p.val < (val = pos.left)) {
					// 			Object.assign(p, { xO5: pO5, val: val })
					// 			if (posC.left <= val && puts[p.typ])
					// 				Object.assign(p, { pO5: pO5, val: val, fix: frame.fix, cut: frame.cut })
					// 		} break
					// 	case 'R': //GT(posC.right, pos.right); 
					// 		if (p.val > (val = pos.right)) {
					// 			Object.assign(p, { xO5: pO5, val: val })
					// 			if (posC.top >= val && puts[p.typ])
					// 				Object.assign(p, { pO5: pO5, val: val, fix: frame.fix, cut: frame.cut })
					// 		} break
					// 	case 'B': //GT(posC.bottom, pos.bottom); 
					// 		if (p.val > (val = pos.right)) {
					// 			Object.assign(p, { xO5: pO5, val: val })
					// 			if (posC.top >= val && puts[p.typ])
					// 				Object.assign(p, { pO5: pO5, val: val, fix: frame.fix, cut: frame.cut })
					// 		}
					// }
				}

			for (const p of ps)
				Object.assign(p, p0)

			for (const frame of aO5.frames)   // поиск фиксации на границе, т.е. с обрезанием
				if (frame.pO5)
					GetNearestFrames(frame)

			let found = false,
				txt = ''
			for (const p of ps) {
				if (p.pO5) {  //	найден frame
					if (p.fix){
						p.FixOnFrame(posC)
					// else	// обрезать только если не фиксируется на границе
						if (p.cut)
							p.CutOnFrame(posC, aO5.posS)}
					found = true
					if (o5debug > 0)
						txt += `${p.pO5.name}/${p.typ}-${p.fix ? 'fix' : 'cut'}, `
				}
			}
/*
			if (!found) {  // если нигде не зацепился,- ищу необходимость фиксации при пересечении границ
				let pO5 = null
				for (const p of ps) {
					let parent = aO5.parent
					do {
						pO5 = parent.pO5
						const pos = pO5.scope.pos
						found ||=
							(p.typ === 'T' && posC.top < pos.top && pO5.overflowY !== 'visible') ||
							(p.typ === 'L' && posC.left < pos.left && pO5.overflowX !== 'visible') ||
							(p.typ === 'R' && posC.right > pos.right && pO5.overflowX !== 'visible') ||
							(p.typ === 'B' && posC.bottom > pos.bottom && pO5.overflowY !== 'visible')
					}
					while (!found && p.pO5 !== pO5 && (parent = wshp.NextParent(parent)))
					if (found)
						break
				}
			}
*/
			// if (p.fix || p.cut) {
			// 	const pos = p.pO5.scope.pos
			// 	if (p.fix) {
			// 		if (p.typ === 'T') Object.assign(posC, { top: pos.top, bottom: pos.top + posC.height, })
			// 		if (p.typ === 'L') Object.assign(posC, { left: pos.left, right: pos.left + posC.width, })
			// 		if (p.typ === 'R') Object.assign(posC, { left: pos.right - posC.width, right: pos.right, })
			// 		if (p.typ === 'B') Object.assign(posC, { top: pos.bottom - posC.height, bottom: pos.bottom, })
			// 	}
			// 	else if (p.cut || pO5.overflowY !== 'visible') {
			// 		if (p.typ === 'T') found ||= p.FixOnHole(pO5, pos.top, true, posC.top)
			// 		if (p.typ === 'L') found ||= p.FixOnHole(pO5, pos.left, true, posC.left)
			// 		if (p.typ === 'R') found ||= p.FixOnHole(pO5, pos.right, false, posC.right)
			// 		if (p.typ === 'B') found ||= p.FixOnHole(pO5, pos.bottom, false, posC.bottom)
			// 	}
			// 	found = true
			// 	Object.assign(tfixs[p.typ], { pO5: p.pO5, fix: p.fix, cut: p.cut })
			// 	txt += `${p.pO5}/${p.typ}, `
			// }
			// else
			// 	Object.assign(tfixs[p.typ], { pO5: null, fix: false, cut: false })

			if (found) {
				if (!aO5.IsFix())
					aO5.DoFixV(txt)
			}
			else
				if (aO5.IsFix())
					aO5.UnFixV()
		},

		Adhereds = (aO5, tfixs) => {
			/*
			поиск натыкающихся на 'aO5' - только среди тех, 
			которые тоже подвисают на тех же, на которых подвис первый 'aO5'
			*/
			return

			const
				posC = aO5.posC,
				totop = aO5.cls.putV === 'T',
				aO5s = tfixs.aO5s,		// ??????????????????????????????????
				n = aO5s.length,
				SetPosTH = (pos, top, height) => {
					Object.assign(pos, { top: top, height: height, bottom: top + height, })
				}

			for (let i = 0; i < n; i++) {
				const
					iO5 = aO5s[totop ? i : n - i - 1],
					iO5act = iO5.act

				if (!iO5act.uScroll || iO5act.IsFix())
					return

				const
					iO5pos = iO5.posC,		// iO5.posW,
					dlevel = aO5.cls.level - iO5.cls.level,
					d = totop ? posC.bottom - iO5pos.top : iO5pos.bottom - posC.top

				if (
					d <= 0 ||
					dlevel === 0 ||
					// iO5act.isFix ||
					iO5.IsFix() ||
					iO5pos.left > posC.right ||
					iO5pos.right < posC.left
				)
					continue

				let topf = false

				if (totop) {
					if (posC.top < iO5pos.top) {
						if (dlevel < 0)
							topf = posC.bottom
						else
							switch (iO5.cls.pitch) {
								case 'P': SetPosTH(posC, posC.top, 0); break
								case 'S': SetPosTH(posC, posC.top, posC.height - d); aO5.posS.top = -d; break
								case 'C': SetPosTH(posC, posC.top, posC.height - d); break
								case 'O': break
							}
					}
					else
						SetPosTH(posC, posC.top, 0)
				}
				else {
					if (posC.bottom > iO5pos.top + iO5pos.height) {
						if (dlevel < 0)
							topf = posC.top - iO5.posC.height
						else
							switch (iO5.cls.pitch) {
								case 'P': SetPosTH(posC, posC.top + posC.height, 0); break
								case 'S': SetPosTH(posC, posC.top + d, posC.height - d); break
								case 'C': SetPosTH(posC, posC.top + d, posC.height - d); aO5.posS.top = -d; break
								case 'O': break
							}
					}
					else
						SetPosTH(posC, posC.top, 0)
				}

				if (topf !== false) {// прижимаюсь и фиксируюсь
					// Object.assign(iO5.posC, iO5pos, { top: topf })
					SetPosTH(iO5.posC, topf, iO5.posC.height)
					iO5.DoFixV(aO5, false)

					Adhereds(iO5, tfixs)
				}
				if (aO5.act.tfixs.length > 0 && posC.height == 0) {	//  && origH > 0
					if (aO5.cls.alive)
						aO5.act.iO5hid = iO5
					else
						aO5.UnFixV()
				}

				break
			}
		},
		Scroll = e => {
			const target = (e.o5scroll || e.target === document) ? document.body : e.target,
				pO5 = target.pO5
			if (!pO5)
				return

			wshp.timeStamp = e.timeStamp
			if (o5debug > 2)
				console.log("%c%s", fmtOK, `Scroll на '${pO5.name}' t=${wshp.timeStamp.toFixed(1).padStart(8)} ------------------- `)

			const aO5s = wshp.aO5s

			for (const aO5 of aO5s)
				if (aO5.act.uScroll) {
					const p = aO5.act.shdw.getBoundingClientRect()
					Object.assign(aO5.posC, { height: p.height, width: p.width, top: p.top, left: p.left, right: p.right, bottom: p.bottom, }) // нелья сразу - не всё!
					// Object.assign(aO5.posW, { height: p.height, width: p.width, })
					Object.assign(aO5.posS, { top: 0, left: 0, })
				}

			for (const aO5 of aO5s)
				if (aO5.act.iO5hid) {
					const
						iO5hid = aO5.act.iO5hid,
						iO5 = aO5s.find(iO5 => iO5 === iO5hid)
					if (iO5) {
						if (iO5.act.tfixs.length > 0)	// ???????????????????
							aO5.act.iO5hid = null
						break
					}
				}

			for (const aO5 of aO5s)  	// д.б. отдельно, после пересчета всех
				if (aO5.act.uScroll) {
					// aO5.CalcParentsLocates() // пересчитываются размеры всех предков-контейнеров        
					wshp.CalcParentsLocates(aO5)
					if (!aO5.cls.none)
						CheckFixes(aO5)
				}

			for (const aO5 of aO5s) { // подвисания снизу
				const
					act = aO5.act
				if (act.uScroll)
					if (aO5.IsFix() && !act.iO5hid)
						if (act.tfixs.length > 0)
							Adhereds(aO5, act.tfixs) 	 // с передачей ссылки на общий для всех контейнер									
			}
			for (const aO5 of wshp.aO5s)	// отображение зафиксированного				
				if (aO5.IsFix())
					aO5.ShowFix()
		},
		DoScroll = (isScroll, txt) => {
			if (wshp.isScroll !== isScroll) {

				if (o5debug > 0)
					console.log("%c%s", fmtOK, `DoScroll  ${isScroll ? 'START' : 'stop '} `, txt)

				const
					args = { nam: 'scroll', fun: Scroll, arg: true },
					start = isScroll && wshp.firstScroll

				wshp.isScroll = isScroll

				if (isScroll) {
					wshp.firstScroll = false
					window.addEventListener(args.nam, args.fun, args.arg)
					Scroll({ timeStamp: Date.now() + Math.random(), o5scroll: true })   // давать именно здесь (иначе скачет источник скроллинга)! 
				}
				else
					window.removeEventListener(args.nam, args.fun, args.arg)

				let eventScroll = new CustomEvent('o5_onScroll', { detail: { isScroll: isScroll, start: start } })
				window.dispatchEvent(eventScroll)
				eventScroll = null
				// DispatchEvent({ isScroll: isScroll, })
			}
		},
		wshp = C.ModulAddSub(olga5_modul, DoScroll)

	Object.assign(wshp, {
		isScroll: false,
		firstScroll: true,
		timeStamp: 0,
		Scroll: Scroll
	})
})();