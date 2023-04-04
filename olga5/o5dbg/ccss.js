/* global window, document, console */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {
	'use strict'
	const W = { modul: 'ccss' },
		timera = `}---< включено:  ${W.modul}.js и ожидается событие 'olga5_ready' `
	console.time(timera)

	let isInitiated = false
	const
		CheckCSS = () => {
			console.log(`${W.modul}: CheckCSS()` + isInitiated ? 'игнорируется' : '')
			if (isInitiated) return

			isInitiated = true
			const csss = document.styleSheets, // подгруженные классы
				errCSS = [],
				cssAlls = [], // список селекторов в подгруженных классах, наичинающихся точкой и без псевдоклассов
				CheckToAdd = function (val, vals, txt) {
					if (val.length == 0) return
					const L = vals.length
					let add = -1
					for (let i = 0;
						(i < L) && (add < 0); i++) {
						if (val == vals[i].val) add = i
					}
					if (add < 0) vals[vals.length] = { val: val, txt: txt }
				},
				CompareVals = function (v1, v2) {
					if (v1.val > v2.val) return 1
					if (v1.val < v2.val) return -1
					return 0
				}
			let errs = ""
			for (let i = 0; i < csss.length; i++) {
				const css = csss[i]
				try {
					const rules = css.cssRules || css.rules
					// rules.forEach(rule => {
					for (const rule of rules) {
						if (rule.type == 1) {
							const defs = rule.selectorText.split(',')
							for (let k = 0; k < defs.length; k++) {
								const nams = defs[k].trim().split('.')
								for (let l = 0; l < nams.length; l++) {
									const u = nams[l].trim().split(' ')[0].trim(),
										v = u.split(':')[0].trim()
									if (v.length > 0)
										CheckToAdd(v, cssAlls)
								}
							}
						}
					}
				} catch (e) {
					errs += (errs.length == 0 ? '' : ', ') + i
				}
			}

			if (errs.length > 0)
				console.error(`${W.modul} ошибка проверки cssRules в CSS'ах для i= [ ` + errs + " ]")
			cssAlls.sort(CompareVals)

			const clsNs = [], // список классов в HTML-файле
				clss = document.querySelectorAll("[class]") // тегов,использующих  классы

			for (let i = 0; i < clss.length; i++) {
				if (clss[i].tagName != 'HTML') {
					const L = 77,
						nams = clss[i].classList,
						stags = clss[i].outerHTML.substr(0, 222).split('\n')
					let stag = stags[0].substr(0, L)
					if ((stags.length > 1) || (stags[0].length > L)) stag = stag + ' ...'
					for (let j = 0; j < nams.length; j++) {
						CheckToAdd(nams[j].split(':')[0], clsNs, stag)
					}
				}
			}
			clsNs.sort(CompareVals)

			clsNs.forEach(clsN => {
				if (!cssAlls.find(cssAll => { return cssAll.val == clsN.val }))
					if (clsN.val != 'olga5_isLoading')//может отсутствовать o5ini.css
						errCSS.push({ css: clsN.val, used: clsN.txt })
			})
			const s0 = `  ==${W.modul}== конец  проверки - `
			if (errCSS.length > 0) {
				const s = s0 + "были неопределёные CSS-селекторы "
				console.groupCollapsed(s)
				for (const err of errCSS) console.log(err.css.padEnd(32), err.used);
				console.groupEnd()
			} else {
				const s = s0 + "OK"
				console.log(s)
				return true
			}
		}

	window.addEventListener('olga5_ready', CheckCSS, { once: true })
	console.timeEnd(timera)

	window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
})();
