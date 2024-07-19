/* -global window, console, document */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5dbg/Utils ---
	'use strict'
	const
		olga5_modul = "o5dbg",
		modulname = 'Utils',
		C = window.olga5.C,
		DebugShowBounds = (aO5s) => {
			const fmt = [12, 26, 18, 12, 1],
				nms = ['shp', 'asks', 'bords', ' to..bo', '',],
				MyRound4 = s => { return ('' + Math.round(parseFloat(s))).padStart(4) },
				Store = (blng, name) => {
					const aa = [],
						a2 = blng.asks.length,
						Addaa = (a) => {
							if (!aa[a]) aa[a] = { bb: [] }
							if (!aa[a].bb[0]) aa[a].bb[0] = []
						}

					Addaa(0)
					aa[0].bb[0][0] = name
					for (let a = 0; a < a2; a++) {
						const ask = blng.asks[a],
							b2 = ask.bords.length // Math.max(ask.bords.length, 2)

						Addaa(a)
						aa[a].b2 = b2
						aa[a].bb[0][1] = ask.typ + ':' + ask.cod + ':' + ask.num + (ask.fix ? 'F' : '') // rez[a][1]
						for (let b = 0; b < b2; b++) {
							const bord = ask.bords[b]
							if (!aa[a].bb[b]) aa[a].bb[b] = []
							if (bord) {
								aa[a].bb[b][2] = bord.pO5.name
								aa[a].bb[b][3] = '=' + MyRound4(bord.pO5.pos.top) + '..' + MyRound4(bord.pO5.pos.bottom)
							}
						}
					}
					aa[0].bb[0][4] = '  to= ' + blng.to.name.padEnd(10) + ' ' + MyRound4(blng.to.pos.top) +
						',  bo= ' + blng.bo.name.padEnd(10) + ' ' + MyRound4(blng.bo.pos.bottom)

					for (let a = 0; a < a2; a++) {
						const b2 = aa[a].b2
						for (let b = 0; b < b2; b++) {
							let s = ''
							for (let j = 0; j < 5; j++)
								s += (aa[a].bb[b][j] || '').padEnd(fmt[j])

							if (s.trim())
								console.log(lognam + s)
						}
					}
				},
				ShowBounds = (aO5s, checkonly) => {
					let names = ''
					for (const aO5 of aO5s)
						if (aO5.act.dspl)
							for (const blng of [aO5.hovered, aO5.located]) {
								const ish = blng === aO5.hovered,
									old = ish ? aO5.old.hovered : aO5.old.located,
									name = aO5.name + (ish ? '/H' : '/L')

								if (old.to != blng.to || old.bo != blng.bo) { // показывать только для изменённых
									if (checkonly)
										names += (names ? ', ' : '') + name
									else {
										old.to = blng.to
										old.bo = blng.bo
										Store(blng, name)
									}
								}
							}
					return names
				}

			const names = ShowBounds(aO5s, 'checkonly')

			if (names) {
				let s = '   '
				for (let j = 0; j < 5; j++)
					s += (' ' + nms[j]).padEnd(fmt[j])
				s += ' --> ' + names + '  (t= ' + (Date.now() - datestart) + ')'
				const clr = "background: beige; color: black;border: solid 1px bisque;"
				console.groupCollapsed('%c%s', clr, s)
				ShowBounds(aO5s)
				console.groupEnd()
			}
		}
		    // function P(txt) {
    //     const shp1 = document.getElementById('shp1'),        
    //         shp2 = document.getElementById('shp2'),
    //         shpC = document.getElementById('shp1_clon'),
    //         posC = shp1 ? shp1.aO5shp.posC : { top: -1, left: -1, height: -1, width: -1, },
    //         pos1 = shp1 ? shp1.getBoundingClientRect() : { top: -1, left: -1, height: -1, width: -1, },
    //         pos2 = shp2 ? shp2.getBoundingClientRect() : { top: -2, left: -2, height: -2, width: -2, },
    //         clon = shpC ? shpC.getBoundingClientRect() : { top: -2, left: -2, height: -2, width: -2, }
    //     console.log(txt)
    //     console.log(`shp1: `, pos1.top,pos1.left,pos1.height,pos1.width)
    //     console.log(`shp2: `, pos2.top,pos2.left,pos2.height,pos2.width)
    //     console.log(`posC: `, posC.top,posC.left,posC.height,posC.width)
    //     console.log(`clon: `, clon.top,clon.left,clon.height,clon.width)
    // }


	C.ModulAddSub(olga5_modul, modulname, () => {
		window.olga5.o5dbg = { DebugShowBounds: DebugShowBounds, }
	})

})();
