/* global window,  document */
/*jshint asi:true  */
/*jshint esversion: 6*/
/* eslint-disable */
(function () {              // ---------------------------------------------- o5dbg/Utils ---
	'use strict'
	const
		olga5_modul = "o5dbg",
		modulname = 'Utils',
		C = window.olga5.C,
		utils = {
			ShowBounds: (aO5s) => {
				return  // исправить! 
				// const fmt = [12, 26, 18, 12, 1],
				// 	nms = ['shp', 'asks', 'bords', ' to..bo', '',],
				// 	MyRound4 = s => { return ('' + Math.round(parseFloat(s))).padStart(4) },
				// 	Store = (blng, name) => {
				// 		const aa = [],
				// 			a2 = blng.asks.length,
				// 			Addaa = (a) => {
				// 				if (!aa[a]) aa[a] = { bb: [] }
				// 				if (!aa[a].bb[0]) aa[a].bb[0] = []
				// 			}

				// 		Addaa(0)
				// 		aa[0].bb[0][0] = name
				// 		for (let a = 0; a < a2; a++) {
				// 			const ask = blng.asks[a],
				// 				b2 = ask.bords.length // Math.max(ask.bords.length, 2)

				// 			Addaa(a)
				// 			aa[a].b2 = b2
				// 			aa[a].bb[0][1] = ask.typ + ':' + ask.cod + ':' + ask.num + (ask.fix ? 'F' : '') // rez[a][1]
				// 			for (let b = 0; b < b2; b++) {
				// 				const bord = ask.bords[b]
				// 				if (!aa[a].bb[b]) aa[a].bb[b] = []
				// 				if (bord) {
				// 					aa[a].bb[b][2] = bord.pO5.name
				// 					aa[a].bb[b][3] = '=' + MyRound4(bord.pO5.pos.top) + '..' + MyRound4(bord.pO5.pos.bottom)
				// 				}
				// 			}
				// 		}
				// 		aa[0].bb[0][4] = '  to= ' + blng.to.name.padEnd(10) + ' ' + MyRound4(blng.to.pos.top) +
				// 			',  bo= ' + blng.bo.name.padEnd(10) + ' ' + MyRound4(blng.bo.pos.bottom)

				// 		for (let a = 0; a < a2; a++) {
				// 			const b2 = aa[a].b2
				// 			for (let b = 0; b < b2; b++) {
				// 				let s = ''
				// 				for (let j = 0; j < 5; j++)
				// 					s += (aa[a].bb[b][j] || '').padEnd(fmt[j])

				// 				if (s.trim())
				// 					console.log(lognam + s)
				// 			}
				// 		}
				// 	},
				// 	AskBounds = (aO5s, checkonly) => {
				// 		let names = ''
				// 		for (const aO5 of aO5s)
				// 			if (aO5.act.dspl)
				// 				for (const blng of [aO5.ofram, aO5.owner]) {
				// 					const ish = blng === aO5.ofram,
				// 						old = ish ? aO5.old.ofram : aO5.old.owner,
				// 						name = aO5.name + (ish ? '/H' : '/L')

				// 					if (old.to != blng.to || old.bo != blng.bo) { // показывать только для изменённых
				// 						if (checkonly)
				// 							names += (names ? ', ' : '') + name
				// 						else {
				// 							old.to = blng.to
				// 							old.bo = blng.bo
				// 							Store(blng, name)
				// 						}
				// 					}
				// 				}
				// 		return names
				// 	},
				// 	names = AskBounds(aO5s, 'checkonly')

				// if (names) {
				// 	let s = '   '
				// 	for (let j = 0; j < 5; j++)
				// 		s += (' ' + nms[j]).padEnd(fmt[j])
				// 	s += ' --> ' + names + '  (t= ' + (Date.now() - datestart) + ')'
				// 	const clr = "background: beige; color: black;border: solid 1px bisque;"
				// 	console.groupCollapsed('%c%s', clr, s)
				// 	console.groupEnd()
				// }
				// else {
				// 	let s = ''
				// 	for (const aO5 of aO5s)
				// 		s += (s ? ', ' : '') + aO5.name
				// 	console.error(`Не могу определить names в ShowBounds для "${s}"`)
				// }
			},
			ShowShpBords: () => {

				const
					owners = document.getElementsByClassName('olga5-owners'),
					oframs = document.getElementsByClassName('olga5-oframs'),
					sowns = [],
					sfrms = []
			
				for (const ofram of oframs) {
					const pO5 = ofram.pO5

						let s = ''
						for (const aO5 of pO5.observ.aO5s) // {aO5: AO5, act: false}
							s += (s ? ', ' : '') + aO5.name
					

					sfrms.push({ name: ofram.pO5.name, aO5s: s })
				}

				// C.ConsoleInfo(`Контейнеры-владельцы  (owner)`, sowns.length, sowns)
				C.ConsoleInfo(`Контейнеры подвисания (ofram)`, sfrms.length, sfrms)

			}
		},
		Utils = () => {
			const errs = []

			for (const util in utils) {
				let ok = false
				for (const nam in C.Debug)
					if (nam === util) {
						C.Debug[nam] = utils[util]
						ok = true
						break
					}
				if (!ok)
					errs.push({ nam: util, err: 'нету в C.Debug' })
			}

			for (const nam in C.Debug)
				if (nam !== 'loaded') {
					let ok = false
					for (const util in utils)
						if (nam === util) {
							ok = true
							break
						}
					if (!ok)
						errs.push({ nam: nam, err: 'нету в o5dbg' })
				}

			if (errs.length > 0)
				C.ConsoleError(`Проверка взаимного соответствия ф-й o5dbg и C.Debug`, errs.length, errs)
		}

	C.ModulAddSub(olga5_modul, modulname, Utils)

})();
