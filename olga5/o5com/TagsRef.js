/* -global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  исправление 'src', 'data-src' и 'href' в тегах html-заголовка
 **/
//
(function () {              // ---------------------------------------------- o5com/TagRefs ---
	'use strict'
	let wshp = {}

	const
		olga5_modul = 'o5com',
		modulname = 'TagsRef',
		C = window.olga5.C,
		ReplaceTag = (tagName, change, adrName, url, errs) => {
			const addnew = document.createElement(tagName),
				regExp = new RegExp(/[\\+<>'"`=#\\/\\\\]/)
			let err = false
			for (const attr of change.attributes) {
				if (!err && attr.name.match(regExp)) {
					errs.push({ tag: tagName, ref: attr.name, txt: `cодержит кавычки или '+><=#/'` })
					err = true
				}
				else
					try {
						addnew.setAttribute(attr.name, attr.value) // здесь копирую "как есть" 
					} catch (err) {
						errs.push({ tag: tagName, ref: url, txt: (attr.name + '=' + attr.value), err:err.message })
					}
			}
			addnew.setAttribute(adrName, url)

			change.parentNode.insertBefore(addnew, change)
			change.parentNode.removeChild(change) //  ??  а вот удалять  -м.б. и не надо: для контроля

			return addnew
		},
		ConvertScripts = () => {
			// if (!(Symbol.iterator in Object(window.olga5))) return		//?

			const errs = [],
				scrs = [],
				preloads = [],
				load_snm = {},
				Orig = (obj) => {
					const origs = obj.outerHTML.match(/\s(data-)?src\s*=\s*["*'][^"']*["*']/g)
					if (origs && origs.length > 0) {
						origs.forEach(orig => {
							orig = orig.replaceAll(/["'s*]/g, '')
						})
						return origs.join(', ')
					} else
						return '-нету-'
				}

			for (const w of window.olga5)
				preloads.push({ w: w, orig: Orig(C.o5script), script: C.o5script, isset: false, })

			/*				сначала из тегов <script>, пропуская те, которые в скомпилированном			*/

			const s = C.consts.o5incls.trim(),
				incls = s ? s.split(/\s*[,;]\s*/) : [],
				match_o5 = /\bo5\w+/,  // начинаются с o5
				igns = [],
				needs = {}

			incls.forEach(incl => { if (incl) needs[incl] = 1 })
			for (const script of document.scripts) {
				// if (C.consts.o5debug > 1) console.log(`тег <script>: id= '${script.id}', src= "${script.src}"`)

				// if (script === C.o5script) // это ядро, т.е. конец скриптов (не зависимо от наличия 'o5_scripts')
				// 	break
				if (script === C.o5script) // пропускаю ядро и модуль o5inc
					continue

				if (script.dataset.o5add) continue 		// это добавленный мною скрипт		
				if (script.innerText.trim()) continue	// это встроенный скрипт

				const td = C.TagDes(script, 'src', errs)

				if (!td || !(td.modul.match(match_o5) || (td.trans && !C.consts.o5only)))
					continue

				if (incls.length > 0)
					if (needs[td.modul]) needs[td.modul] = 0
					else {
						igns.push(td.modul)
						continue
					}

				if (load_snm[td.modul])
					errs.push({ tag: td.modul, ref: td.orig, txt: 'повторная загрузка модуля' })
				load_snm[td.modul] = td.orig // перезаписываю!

				const w = window.olga5.find(w => w.modul == td.modul),
					scrpt = { modul: td.modul, orig: td.orig, act: { W: w, need: false }, script: script, }
				let dochg = ''
				if (!w || td.code == '_' || (td.trans && td.code != 'data-')) {
					dochg = !w ? 'новый  ' : 'замена '
					if (C.consts.o5debug > 1) console.log(`тег <script>: id= '${script.id}' -> в обработку (${dochg}): orig=${td.orig}`)

					scrpt.act.W = null
					let url = td.orig
					if (td.trans) {
						const wref = C.DeCodeUrl(C.urlrfs, td.orig)
						if (wref.err)
							errs.push({ tag: td.modul, ref: td.from, txt: wref.err })
						url = wref.url
					}
					if (!script.getAttribute('async') && !script.getAttribute('defer'))
						script.setAttribute('async', '')
					scrpt.script = ReplaceTag('script', script, 'src', url, errs)
				}

				C.scrpts.push(scrpt)
				scrs.push({
					modul: scrpt.modul,
					orig: scrpt.orig,
					src: scrpt.script.src,
					txt: dochg + td.from
				})
			}
			/*				дописываю те, которые в скомпилированном и отсутствуют в SCRIPT's			*/
			for (const w of window.olga5) {
				const modul = w.modul
				if (!C.scrpts.find(scrpt => scrpt.modul == modul))
					// if (!igns(modul)) {
					if (!igns.includes(modul)) {
						C.scrpts.push({ modul: modul, orig: '', act: { W: w, need: false }, script: C.o5script })
						scrs.push({ modul: modul, orig: '', src: C.o5script.src, txt: `из скомпилированного` })
					}
			}

			/* строю зависимости cкриптов (сначала идут скомпилированные) - сначала по 'o5depends'*/
			const ss = C.consts['o5depends'].split(/\s*[;]+\s*/),
				sinc = 'o5inc',
				o5inc = C.scrpts.find(scrpt => scrpt.modul == sinc)

			for (const s of ss) {
				const uu = s.trim().split(/\s*[:=]+\s*/), // split(/[:=]/), // 
					u = uu[0],
					rfs = uu[1] ? uu[1].split(/\s*,\s*/) : []
				if (u) {
					const scrpt = C.scrpts.find(scrpt => scrpt.modul == u)
					if (scrpt) {
						scrpt.depends ||= (scrpt.modul != sinc && o5inc) ? [o5inc] : []
						for (const rf of rfs)
							if (rf != sinc) { // уже и так включено
								const scr = C.scrpts.find(scrpt => scrpt.modul == rf)
								if (scr && !scrpt.depends.includes(scr))
									scrpt.depends.push(scr)
							}
					}
				}
			}

			// const depends = []
			// for (const s of ss) {
			// 	const uu = s.trim().split(/\s*[:=]+\s*/)
			// 	depends.push({ modul: uu[0], rfs: rfs })
			// }
			// for (const scrpt of C.scrpts) {
			// 	scrpt.depends ||= (scrpt.modul != sinc && o5inc) ? [o5inc] : []
			// 	for (const depend of depends)
			// 		if (depend.modul == scrpt.modul) 
			// 			for (const rf of depend.rfs)
			// 				if (!scrpt.depends.includes(rf)) // уже и так включено
			// 					scrpt.depends.push(scr)
			// }

			/* -"- тепер для остальны */
			const sdeps = [],
				cdeps = []
			for (const scrpt of C.scrpts) {
				if (!scrpt.depends)
					scrpt.depends = scrpt.script.attributes.hasOwnProperty('async') ? [] : cdeps.concat(sdeps)
				if (scrpt.orig) sdeps.push(scrpt)
				else cdeps.push(scrpt)
			}
			/* в отладочном режиме - делаю проверку*/
			if (C.consts.o5debug > 0) {
				let scrpt = null
				const list = [],
					errs = [],
					ChectForRev = (modul, depends) => {
						let ok = true
						list.push(modul)
						for (const depend of depends)
							if (depend === scrpt) {
								errs.push({ scrpt: scrpt.modul, refs: list.join('-> ') })
								ok = false
							}
						if (depends.length > 0 && ok)
							for (const depend of depends)
								ChectForRev(depend.modul, depend.depends)
						list.pop()
					}
				for (scrpt of C.scrpts)
					ChectForRev(scrpt.modul, scrpt.depends)
				if (errs.length > 0)
					C.ConsoleError(`зацикленные ссылки в зависимостях модулей`, errs.length, errs)
			}

			const errneeds = []
			for (const need in needs) {
				if (needs[need]) errneeds.push(need)
			}
			if (errneeds.length > 0)
				C.ConsoleError(`Из заданных в 'o5incls' отсутствуют модули:`, errneeds.join(', '))
			// сюда проверь!?
			if (C.consts.o5debug > 0) {
				if (scrs.length > 0) C.ConsoleInfo("Найденные olga5 SCRIPT'ы : ", scrs.length, scrs)
				else C.ConsoleInfo("Не найдены olga5 SCRIPT'ы ?")

				if (igns.length > 0)
					C.ConsoleInfo(`Проигнорированы скрипты, отсутствующие в 'o5incls': `, igns.join(', '))

				if (C.consts.o5debug > 1) { // тестирование атрибутов
					const errs = []
					for (const scrpt of C.scrpts)
						for (const attr of scrpt.script.attributes)
							if (!attr.name || attr.name.match(/['"`\+\.,;]/))
								errs.push({ 'атрибут': attr.name, 'скрипт': scrpt.script.src, })
					if (errs.length > 0)
						C.ConsoleError(`${errs.length} странных атрибутов (м.б. перепутаны кавычки?) у скрипта`, s, errs)
				}
			}
			if (errs.length > 0)
				C.ConsoleError(`Ошибки в преобразовании SCRIPT `, errs.length, errs)

			for (const scrpt of C.scrpts) {
				Object.assign(scrpt.act, { done: 0, start: 0, timeout: 0, timera: null, incls: null, })
				Object.seal(scrpt.act)
				Object.freeze(scrpt)
			}
			Object.freeze(C.scrpts)

			scrs.splice(0, scrs.length)
			errs.splice(0, errs.length)
		},
		ConvertLinks = () => {
			const links = [],
				errs = []
			for (const child of document.head.children)
				if (child.tagName.toLowerCase() == 'link') {
					const td = C.TagDes(child, 'href', errs)
					if (!td.orig) {
						C.ConsoleError(`обнаружен <link> без 'href', '_href' или 'data-href': `, child.outerHTML, null)
						continue
					}
					if (td.trans) { 									// для link'ов не надо проверять 'o5'
						const wref = C.DeCodeUrl(C.urlrfs, td.orig)
						if (wref.err)
							errs.push({ tag: td.modul, ref: td.from, txt: wref.err })

						ReplaceTag('link', child, 'href', wref.url, errs)
						links.push({ orig: td.orig, src: wref.url, txt: td.from })
					}

					wshp.o5iniready ||= child.href.match(/\/o5ini\.css$/)
				}

			if (C.consts.o5debug > 0)
				if (links.length > 0) C.ConsoleInfo("Скорректированные LINK'и : ", links.length, links)
				else C.ConsoleInfo("Скорректированных LINK'ов нет ")

			if (errs.length > 0)
				C.ConsoleError(`Ошибки в преобразовании LINK `, errs.length, errs)

			links.splice(0, links.length)
			errs.splice(0, errs.length)

		}

	wshp = C.ModulAddSub(olga5_modul, modulname, () => {
		ConvertScripts()
		ConvertLinks()
	})
})();
