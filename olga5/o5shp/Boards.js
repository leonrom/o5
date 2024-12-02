
/* global window, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/Boards ---11
	"use strict"

	const
		olga5_modul = "o5shp",
		// modulname = 'Boards',
		C = window.olga5.C,
		o5debug = C.consts.o5debug,
		fmtOK = "background: cornsilk; color: black;",
		// fmtErr = "background: lightgoldenrodyellow; color: black;",
		MarkVisible = (pO5, visi) => {
            if (pO5.scope.isVisi !== visi) {
                pO5.scope.isVisi = visi
                for (const aO5 of pO5.observ.aO5s) {
                    if (visi)
                        pO5.observ.observe(aO5.shp)
                    else
                        pO5.observ.unobserve(aO5.shp)
                    aO5.CheckIsVisi()
                }
            }
        },
		ObserveM = entries => {
			/*
			запуск-останов скроллинга 
			Запуск делаем если 
				  - хоть один (из видимых) oframes содержит aO5.cat.xFixed и aO5.ads.cart.style.display !== 'none'
				- хоть один (из видимых) owners имеет  pO5.IsCuts()
			иначе - делаем останов
			*/
			if (o5debug > 1)
				console.log("%c%s", fmtOK, `ObserveM - задание скроллинга`)

			for (const entry of entries) 	// вкл-откл обсервации на невидимих контейнерах
				MarkVisible(entry.target.pO5, entry.isIntersecting)			

			let
				nc = 0,
				nf = 0,
				s = ''
			for (const pO5 of wshp.pO5s)
				if (pO5.IsVisi()) {
					if (pO5.scope.observ.HasVisibleFixed()) {
						nf++
						s += '+'
					}
					else
						if (pO5.IsCuts()) {
							nc++
							s += '*'
						}
						else
							s += '-'
					s += pO5.name + ', '
				}

			wshp.DoScroll(nf > 0 || nc > 0, `видимость bord'ов [${s}] (+- наличие fixed)`)

			if (o5debug > 2) {
				if (wshp.aO5s.length > 0)
					C.Debug.ShowBounds(wshp.aO5s)
				else
					console.log('нету подвисабельных')
			}
		},
		bords = [],
		Boards = aO5 => {
			// const
			// 	MaxZIndex = bords => {
			// 		let cIndex = 1
			// 		for (const bord of bords) {
			// 			const pO5 = bord.tag.pO5
			// 			if (pO5.scope.scroll.zIndex < 0) {
			// 				let maxZIndex = 0
			// 				for (const child of pO5.current.children) {
			// 					const zIndex = parseInt(child.style.zIndex) || 0
			// 					if (!isNaN(zIndex) && zIndex >= maxZIndex)
			// 						maxZIndex = zIndex
			// 				}
			// 				pO5.scope.scroll.zIndex = maxZIndex
			// 			}
			// 			if (cIndex < pO5.scope.scroll.zIndex)
			// 				cIndex = pO5.scope.scroll.zIndex
			// 		}
			// 		return cIndex
			// 	}

			// if (o5debug > 1)
			// 	console.log("%c%s", fmtOK,
			// 		`Bords: добавляю ${aO5.name} `)

			// aO5.act.cIndex += MaxZIndex(aO5.ofram.bords) + 1

			for (const bord of aO5.ofram.bords)
				if (!bords.includes(bord)) {
					bords.push(bord)
					obsrvM.observe(bord.tag)
				}
		},
		obsrvM = new IntersectionObserver(ObserveM, {
			root: null,
			rootMargin: '10px',
			threshold: [0.01],
		}),
		wshp = C.ModulAddSub(olga5_modul, Boards)

})();

