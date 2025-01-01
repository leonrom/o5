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
				puts = aO5.cls.puts
			// 	ps = [
			// 		new LRTB('T', Number.MIN_SAFE_INTEGER),
			// 		new LRTB('L', Number.MIN_SAFE_INTEGER),
			// 		new LRTB('R', Number.MAX_SAFE_INTEGER),
			// 		new LRTB('B', Number.MAX_SAFE_INTEGER)
			// 	],
			// 	GetNearestFixed = frame => {
			// 		if (!frame.pO5)
			// 			return

			// 		const
			// 			pO5 = frame.pO5,
			// 			pos = pO5.scope.pos

			// 		for (const p of ps)
			// 			if (puts[p.typ]) {
			// 				const
			// 					typ = p.typ,
			// 					val = p.val
			// 				let
			// 					v = 0,
			// 					isnear = false,
			// 					canfix = false

			// 				if ('T' === typ && val < (v = pos.top)) {
			// 					isnear = true
			// 					canfix = posC.top <= pos.top
			// 				}
			// 				else if ('L' === typ && val < (v = pos.left)) {
			// 					isnear = true
			// 					canfix = posC.left <= v
			// 				}
			// 				else if ('R' === typ && val > (v = pos.right)) {
			// 					isnear = true
			// 					canfix = posC.right >= v
			// 				}
			// 				else if ('B' === typ && val > (v = pos.bottom)) {
			// 					isnear = true
			// 					canfix = posC.bottom >= v
			// 				}

			// 				if (isnear) {
			// 					Object.assign(p, { xO5: pO5, val: v })
			// 					if (canfix && puts[typ])
			// 						Object.assign(p, { pO5: pO5, fix: frame.fix, cut: frame.cut })
			// 				}
			// 			}
			// 	}

			// for (const p of ps)
			// 	Object.assign(p, p0)

			const
				nP = {
					tF5: null, lF5: null, rF5: null, bF5: null,
					tC5: null, lC5: null, rC5: null, bC5: null,
					tB5: null, lB5: null, rB5: null, bB5: null,
				}

			Object.assign(nP, posC)
			Object.seal(nP)
			/*
			ищу где бы зафиксировать
			*/
			for (const frame of aO5.frames)   // поиск фиксации на границе, т.е. с обрезанием
				if (frame.pO5 && frame.fix) {
					const
						pO5 = frame.pO5,
						pos = pO5.scope.pos

					if (puts.T && nP.top <= pos.top) Object.assign(nP, { top: pos.top, tF5: pO5, })
					if (puts.L && nP.left <= pos.left) Object.assign(nP, { left: pos.left, lF5: pO5, })
					if (puts.R && nP.right >= pos.right) Object.assign(nP, { right: pos.right, rF5: pO5, })
					if (puts.B && nP.bottom >= pos.bottom) Object.assign(nP, { bottom: pos.bottom, bF5: pO5, })
				}
			// выравнивание после фиксации
			if (nP.tF5) nP.bottom = nP.top + nP.height
			if (nP.lF5) nP.right = nP.left + nP.width
			if (nP.rF5) nP.left = nP.right - nP.width
			if (nP.bF5) nP.top = nP.bottom - nP.height
			Object.assign(posC, { top: nP.top, left: nP.left, right: nP.right, bottom: nP.bottom, })

			const found = nP.tF5 || nP.lF5 || nP.rF5 || nP.bF5

			if (found) {
				/*
				проверяю завиксированные на поджимание с противоположной стороны
				*/
				for (const frame of aO5.frames)   // поиск фиксации на границе, т.е. с обрезанием
					if (frame.pO5 && frame.cut) {
						const
							pO5 = frame.pO5,
							pos = pO5.scope.pos

						if (nP.tF5 && nP.bottom > pos.bottom) Object.assign(nP, { bottom: pos.bottom, tC5: pO5, })
						if (nP.lF5 && nP.right > pos.right) Object.assign(nP, { right: pos.right, lC5: pO5, })
						if (nP.rF5 && nP.left < pos.left) Object.assign(nP, { left: pos.left, rC5: pO5, })
						if (nP.bF5 && nP.top < pos.top) Object.assign(nP, { top: pos.top, bC5: pO5, })
					}
				
				/*
				проверяю зафиксированный за вылезание за границы контейнеров
				*/
				let parent = aO5.parent
				do {
					const pO5 = parent.pO5,
					 pos = pO5.scope.pos

					if (nP.tF5 && pO5.ovfY && nP.top < pos.top) Object.assign(nP, { top: pos.top, tB5: pO5, })
					if (nP.lF5 && pO5.ovfX && nP.left < pos.left) Object.assign(nP, { left: pos.left, lB5: pO5, })
					if (nP.rF5 && pO5.ovfX && nP.right > pos.right) Object.assign(nP, { right: pos.right, rB5: pO5, })
					if (nP.bF5 && pO5.ovfY && nP.bottom > pos.bottom) Object.assign(nP, { bottom: pos.bottom, bB5: pO5, })
				}
				while ((parent = wshp.NextParent(parent)))

				/*
				 выравнивание после поджимания
				*/
				if (posC.top != nP.top) {
					posC.height=posC.bottom- nP.top
					posC.top = nP.top
				}
				if (posC.left != nP.left) {
					posC.width=posC.right- nP.left
					posC.left = nP.left
				}
				if (posC.right != nP.right) {
					posS.left-=posC.width- (nP.right - posC.left)
					posC.width= nP.right - posC.left
					posC.right = nP.right
				}
				if (posC.bottom != nP.bottom) {
					posS.top-=posC.height- (nP.bottom - posC.top)
					posC.height= nP.bottom - posC.top
					posC.bottom = nP.bottom
				}
			}


			/*
			let
				txt = ''
			for (const p of ps) {
				if (p.pO5) {  //	найден frame
					if (p.fix) {
						p.FixOnFrame(posC)
						// else	// обрезать только если не фиксируется на границе
						if (p.cut)
							p.CutOnFrame(posC, aO5.posS)
					}
					found ||= true
					if (o5debug > 0)
						txt += `${p.pO5.name}/${p.typ}-${p.fix ? 'fix' : 'cut'}, `
				}
			}
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

			if (found) {
				if (!aO5.IsFix()){
					aO5.DoFixV()					
					if (o5debug > 0){
						const ts=[]
						if (nP.tF5)ts.push(nP.tF5.name+'/T')  
						if (nP.lF5)ts.push(nP.lF5.name+'/L')  
					    if (nP.rF5)ts.push(nP.rF5.name+'/R')  
						if (nP.bF5)ts.push(nP.bF5.name+'/B')  
					console.log("%c%s", fmtOK, `DoFixV фиксация   '${aO5.name}'`, ts.join(', '))}
				}
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