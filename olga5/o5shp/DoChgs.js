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
		ОтметкаВидимостиГраниц = (p, avx, pO5) => {
			for (const av of avx) {
				const
					x = av[0],
					vx = av[1],
					v = p.pos.scops[x],
					tl = 'TL'.includes(x),
					visi = tl ? v >= vx : v <= vx,	// д.б. >=/<= чтоб сработала перефиксация
					vp = p.visis[x].get(pO5)

				if (vp !== visi) {
					p.visis[x].set(pO5, visi)
					p.act.visiChg = true
				}
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
			const vpx = scops[x], vpo = scops[o]
			for (const p of pcO5.pIncs)
				if (p !== pcO5)
					ОтметкаВидимостиГраниц(p, [[x, vpx], [o, vpo]], pcO5)

			for (const aO5 of pcO5.aAlls) {
				const pFixs = aO5.pFixs, posO = aO5.posO

				// расфиксация по 'o' 
				let chgo = fromTest||false
				for (const p of pFixs[o])
					if (
						!ПересекаетКонтейнер(o, posO, p.pos.scops[o])
					) {
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
				let chgx = fromTest||false
				for (const p of aO5.pCouldFixs[x]) 		// на которых может зафиксироваться
					if (
						!pFixs[x].includes(p) &&
						!pFixs[o].includes(p) &&
						ПересекаетКонтейнер(x, posO, p.pos.scops[x])
					) {
						aO5.DoFix(x, p)
						chgx = true

						if (o5debug)
							console.log("%c%s", fmtOK, `DoFix`,
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
					){
						switch (x) {
							case 'T': aO5.posC.top -= scV; break
							case 'B': aO5.posC.top -= scV; break
							case 'L': aO5.posC.left -= scH; break
							case 'R': aO5.posC.left -= scH; break
						}

						if (o5debug>1)
							console.log("%c%s", fmtOK, `сдвиг`,
								`${aO5.id} по ${x} для ${'TB'.includes(x)?('top на '+scV):('left на '+scH)} `)
					}

					ScheduleShowFixed(aO5)
				}
			}
		}
	}
	wshp = C.AddModuleSub(olga5_modul, modulname, [MakeScroll])

})();