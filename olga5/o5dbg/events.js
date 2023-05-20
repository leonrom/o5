/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- Events ---
	'use strict'

	const
		C = window.olga5.C,
		olga5_modul = "o5dbg",
		modulname = 'Events',
		wshp = C.ModulAddSub(olga5_modul, modulname, () => 
		{
			const
				excls = `key*, mouse*, pointer*`.replace(/[\s\n]/g, '').split(','),
				addocevs = `DOMContentLoaded`,
				phases = ['NONE', 'CAPTURING', 'AT_TARGET', 'BUBBLING',],
				myclr = "background: aqua; color: black;",
				lognam = olga5_modul+'.'+modulname+': ',				
				// const excls = `key*, device*,pointer*, animati*,*screen*`.replace(/[\s\n]/g, '').split(','),
				docs = {},
				wins = {},
				alls = {},
				Act = (e, key) => { // сообщение о наступлении события 'e'
					if (oldT == e.timeStamp) return
					oldT = e.timeStamp
					// if (e.type == 'load')
					// console.log('1')
					const o = e.type,
						ep0 = e.target,
						id = (ep0 && ep0.id) ? ('#' + ep0.id) : '',
						name = (!ep0 || o != 'load') ? o : (o + ` (${ep0.nodeName + id})`),
						doc = document.URL.match(/\/[^\/]*$/)[0].substring(1);
					(window.opener ? window.opener : window).
						console.log('%c%s', myclr, `${lognam} ---> ` + name.padEnd(20) +

							'[ ' + (wins[o] ? 'win' : '').padEnd(3) +
							', ' + (docs[o] ? 'doc' : '').padEnd(3) + ' ] ' +
							'  ' + key.toUpperCase() + ' ' +
							' ' + e.timeStamp.toFixed(1).padEnd(6) +
							`  ${e.eventPhase}=${phases[e.eventPhase].padEnd(10)}` +
							'  ' + doc +
							``)
				},
				acts = [
					{ src: document, eves: docs, key: 'doc' },
					{ src: window, eves: wins, key: 'win' },
				]

			let mybody = null,
				i = excls.length
			while (i-- > 0)
				if (excls[i])
					excls[i] = new RegExp('\\b' + excls[i].replaceAll('*', '.*'))

			let oldT = 0
			for (const act of acts)
				for (const nam in act.src)
					if (nam.match(/^on.*/)) {

						const o = nam.substring(2).trim(),
							all = alls[o] || { win: ' - ', doc: ' - ', exl: '', }
						let ok = true

						all[act.key] = ' ' + act.key.substring(0, 1) + ' '
						for (const e of excls)
							if (e && o.match(e)) {
								all.exl = '  ---'
								ok = false
								break
							}
						alls[o] = all

						if (ok) {
							act.eves[o] = 1
							act.src.addEventListener(o, e => { Act(e, act.key) }, { capture: true })
							// document.head.addEventListener(o, e => { Act(e, act.key) }, { capture: true })
						}
					}

			addocevs.split(',').forEach(addocev => {
				const act = acts[0],
					o = addocev.trim(),
					all = alls[o] || { win: ' - ', doc: ' + ', exl: '  +++', }
				alls[o] = all
				act.eves[o] = 1
				act.src.addEventListener(o, e => { Act(e, act.key) })
			})

			const salls = Object.keys(alls).sort().reduce( // сортированный объект
				(obj, key) => {
					obj[key] = alls[key];
					return obj
				},
				{}
			)
			let s = `${'событие: '.padEnd(33)}  win doc искл.`
			console.groupCollapsed('обрабатываемые события')
			for (const nam in salls) {
				const all = salls[nam]
				console.log(`${nam.padEnd(33)}  ${all.win}  ${all.doc} ${all.exl}`)
			}
			console.groupEnd()
		})

})();
