/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5com/CEncode ---
	'use strict'
	let diva = null

	const C = window.olga5.C,
		olga5_modul = 'o5com',
		modulname = 'CPops',
		wp = { W: 0, H: 0 },
		divs = [],
		zIndex = 99999,

		SetVP = () => {
			const w = window.visualViewport,
				W = w ? w.width : window.innerWidth,
				H = w ? w.height : window.innerHeight
			Object.assign(wp, { W, H })
		},
		Resize = () => {
			SetVP()
			for (const div of divs) {
				const ao5 = div.ao5pps,
					dx = ao5.L + ao5.W - wp.W,
					dy = ao5.T + ao5.H - wp.H

				if (dx > 0) {
					const L = ao5.L - dx;
					if (L < ao5.L) {
						div.style.left = L + 'px';
						ao5.L = L
					}
				}
				if (dy > 0) {
					const T = ao5.T - dy;
					if (T < ao5.T) {
						div.style.top = T + 'px';
						ao5.T = T
					}
				}
			}
		},
		StopEvent = e => {
			e.cancelBubble = true
			e.stopPropagation()
			e.preventDefault()
		},
		MouseMove = e => {
			// console.log(`(окно): x=pageY =${parseInt(e.pageX)}, (экран): screenY =${parseInt(e.screenX)}`)
			if (!diva)
				return
			StopEvent(e)

			const div = diva,
				ao5 = div.ao5pps,
				ux = e.x - ao5.ux,
				uy = e.y - ao5.uy,
				dx = e.x + ao5.dx,
				dy = e.y + ao5.dy,
				state = ao5.state,
				old = { L: 0, T: 0, W: 0, H: 0 }

			Object.assign(old, { L: ao5.L, T: ao5.T, W: ao5.W, H: ao5.H })

			if (state.includes('M')) { ao5.L = ux; ao5.T = uy; }
			if (state.includes('R')) ao5.W = dx - ao5.L;  // именно такая очередность, чтобы не переопределяло
			if (state.includes('B')) ao5.H = dy - ao5.T;
			if (state.includes('L')) { ao5.W -= ux - ao5.L; ao5.L = ux }
			if (state.includes('T')) { ao5.H -= uy - ao5.T; ao5.T = uy }

			if (ao5.L < 0 || ao5.L + ao5.W > wp.W || ao5.d > ao5.W) Object.assign(ao5, { L: old.L, W: old.W })
			if (ao5.T < 0 || ao5.T + ao5.H > wp.H || ao5.d > ao5.H) Object.assign(ao5, { T: old.T, H: old.H })

			Object.assign(div.style, { left: ao5.L + 'px', top: ao5.T + 'px', width: ao5.W + 'px', height: ao5.H + 'px' })
		},
		SetCursors = (div, ao5) => {
			/*
					nwse-  nw-       ns- n-	      nesw- ne-
								+--------------+  
					ew-    e-   | grab grabbing|  ew-   w-   
								+--------------+ 
					nesw-  sw-       ns-  s-      nwse- se-
			*/
			let cursor = ''
			switch (div.ao5pps.state) {
				case 'M': cursor = ao5 ? 'grabbing' : 'grab'; break
				case 'L': cursor = ao5 ? 'ew-resize' : 'e-resize'; break
				case 'R': cursor = ao5 ? 'ew-resize' : 'w-resize'; break
				case 'T': cursor = ao5 ? 'ns-resize' : 'n-resize'; break
				case 'B': cursor = ao5 ? 'ns-resize' : 's-resize'; break
				case 'LT': cursor = ao5 ? 'nwse-resize' : 'nw-resize'; break
				case 'RB': cursor = ao5 ? 'nwse-resize' : 'se-resize'; break
				case 'LB': cursor = ao5 ? 'nesw-resize' : 'sw-resize'; break
				case 'RT': cursor = ao5 ? 'nesw-resize' : 'ne-resize'; break
				default: cursor = 'pointer'
			}
			div.style.cursor = cursor
			div.style.outlineWidth = ao5 ? 2 : 0
		},
		GetDivN = div => {
			let i = divs.length
			while (i-- > 0)
				if (divs[i] == div)
					return i
			return -1
		},
		ReIndex = () => {
			for (let j = 0; j < divs.length; j++)
				divs[j].style.zIndex = zIndex + j
		},
		PopO6Close = div => {
			const i = GetDivN(div)
			if (i >= 0) {
				divs[i].ao5pps.ShowAct(divs[i], false)
				divs.splice(i, 1)
			}
			div.parentNode.removeChild(div);
			ReIndex()
		},
		PopO6Create = (pos, html, ShowAct, n) => { 
			const
				EmptyAct = () => {
					// просто заглушка на случай незадани ShowAct()
				},
				DivAct = e => {
					const div = e.currentTarget,
						i = GetDivN(div)
					if (i >= 0 && i < divs.length - 1) { // если этот div не есть последний - таки ставит его в конец
						divs.splice(i, 1)
						divs.push(div)
						ReIndex()
					}
				},
				DivDown = e => {
					if (diva) return

					StopEvent(e)
					DivAct(e)

					const div = e.currentTarget

					if (div.classList.contains('cellD_2')) return

					const ao5 = div.ao5pps

					ao5.ux = e.x - ao5.L
					ao5.uy = e.y - ao5.T
					ao5.dx = ao5.L + ao5.W - e.x
					ao5.dy = ao5.T + ao5.H - e.y
					SetCursors(div, true)

					diva = div
				},
				DivMove = e => {
					if (diva) return
					StopEvent(e)

					const div = e.currentTarget,
						ao5 = div.ao5pps

					const d = ao5.d,
						isT = (e.y - ao5.T < d),
						isB = (ao5.T + ao5.H - e.y < d)

					let state = ''
					if ((e.x - ao5.L < d)) {
						if (isT) state = 'LT'; else if (isB) state = 'LB'; else state = 'L'
					} else if (ao5.L + ao5.W - e.x < d) {
						if (isT) state = 'RT'; else if (isB) state = 'RB'; else state = 'R'
					}
					else if (isT) state = 'T'
					else if (isB) state = 'B'
					else state = 'M'

					if (state != ao5.state) {
						ao5.state = state
						SetCursors(div, false)
					}
				},
				DivClose = e => {
					PopO6Close(e.currentTarget)
				}

			while (n && divs.length >= n)
				PopO6Close(divs[0])

			const div = document.createElement('div')

			div.ao5pps = {
				d: 8, state: '', new: true,
				L: pos.L, T: pos.T, W: pos.W, H: pos.H, 	//  абсолютные позиция на экране (getBoundingClientRect())
				ux: 0, uy: 0, dx: 0, dy: 0,	//  позиция мышки на div'е
				ShowAct: ShowAct || EmptyAct,
			}
			Object.seal(div.ao5pps)

			Object.assign(div.style, {
				left: pos.L + 'px', top: pos.T + 'px',
				width: pos.W + 'px', height: pos.H + 'px'
			})

			div.innerHTML = html
			div.id =  '223'

			// ShowAct(div, true)

			document.body.appendChild(div)
			divs.push(div)
			ReIndex()
			Resize()

			div.addEventListener('activate', DivAct)
			div.addEventListener('mousedown', DivDown)
			div.addEventListener('mousemove', DivMove)
			div.addEventListener('dblclick', DivClose)

			return div
		};

	C.ModulAddSub(olga5_modul, modulname, () => {

		SetVP()
		document.addEventListener('mousemove', MouseMove, { capture: true })

		document.addEventListener('mouseup', e => {
			if (diva) {
				StopEvent(e)
				SetCursors(diva, false)
				diva = null
			}
		})

		window.addEventListener('resize', Resize)

		Object.assign(C, {
			PopO6Create: PopO6Create,
			PopO6Close: PopO6Close,
		})
		return true
	})
})();
