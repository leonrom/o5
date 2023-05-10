/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5com/CApi --- 111
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CApi',
		wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		Match = scls => new RegExp(`\\b` + scls + `(\\s*[,:+]\\s*((([\`'"\\(\[])(.*?)\\4)|[^\\s\`'":,+]*))*(\\s*|$)`),
		mquals = /\s*[:,]\s*/,
		GetTagsBy = (modul, fun, ask) => {
			const list = [],
				errs = [],
				nams = ask.split(ask.match(/;/) ? /\s*;\s*/ : /\s*,\s*/)
			for (const owner of C.owners)
				if (owner.modules.length == 0 || !modul ||
					owner.modules.find(m => { return m == modul })) {
					const Fun = owner.start[fun]
					if (Fun)
						for (const nam of nams) {
							const tags = Fun.call(owner.start, nam)
							if (tags)
								for (const tag of tags)
									if (!list.includes(tag))
										list.push(tag)
						}
					else
						errs.push({ tag: C.MakeObjName(owner.start), Fun: fun })
				}
			if (errs.length > 0)
				C.ConsoleError(`Ошибочные запросы функций для тегов`, errs.length, errs)
			return list
		}

	wshp[modulname] = () => {
		Object.assign(C, {
			owners: [],
			scrpts: [],
			Match: Match,
			MakeObjName: function (obj, len) { // моё формирование имени объекта
				if (obj) {
					const nam = Object.is(obj, window) ? '#window' : (
						Object.is(obj, document) ? '#document' : (
							(obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
								('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
								'.' + (obj.className ? obj.className : '?')
							)
						))
					return nam.padEnd(len ? len : 0);
				}
				else
					return 'null';
			},
			GetTagsByQueryes: (queryes, modul) => {
				return GetTagsBy(modul, 'querySelectorAll', queryes)
			},
			GetTagsByIds: (ids, modul) => {
				const nams = ids.split(/\s*,\s*/)
				nams.forEach((nam, i, nams) => { nams[i] = '#' + nam });
				return GetTagsBy(modul, 'querySelectorAll', nams.join(','))
			},
			GetTagsByClassNames: (classnams, modul) => {
				const tags = GetTagsBy(modul, 'getElementsByClassName', classnams),
					rez = []
				for (const tag of tags)
					if (!tag.classList.contains(C.olga5ignore))
						rez.push(tag)
				return rez
			},
			GetTagsByTagNames: (tagnams, modul) => {
				return GetTagsBy(modul, 'getElementsByTagName', tagnams)
			},
			SelectByClassName: (classnam, modul, do_not_replace_class) => {
				const tags = GetTagsBy(modul, 'querySelectorAll', '[class *=' + classnam + ']'),
					match = Match(classnam),
					rez = []
				for (const tag of tags)
					if (!tag.classList.contains(C.olga5ignore)) {
						const ms = tag.className.match(match)
						if (ms) {
							const quals = [],
								m = ms[0].trim(),
								ss = m.split(mquals)

							if (!do_not_replace_class)  // кромк IniScript-теста ВСЕГДА убираю квалификаторы
								tag.className = tag.className.replace(m, classnam + ' ')

							for (let j = 1; j < ss.length; j++)
								quals.push(ss[j].trim())
							rez.push({ tag: tag, quals: quals, origcls: ms.input })
						}
					}
				return rez
			},
			QuerySelectorInit: (starts, scls) => {
				C.owners.splice(0, C.owners.length)

				const match = Match(scls),
					errs = []
				if (!starts || starts.length == 0)
					C.owners.push({ start: document.body, modules: [], origcls: 'document' }) // специально чуть по-иному
				else
					for (const tag of starts) {
						const quals = [],
							ms = tag.className.match(match),
							m = ms[0].trim()
						if (ms) {
							tag.className = tag.className.replace(m, scls)// ВСЕГДА убираю квалификаторы (остальные в ms - не трогать!)

							const ss = m.split(mquals)
							for (let j = 1; j < ss.length; j++) {
								const modul = ss[j]

								if (C.scrpts.find(scrpt => scrpt.modul == modul)) quals.push(modul)
								else errs.push(modul)
							}
						}
						C.owners.push({ start: tag, modules: quals, origcls: m }) // специально чуть по-иному
						if (C.consts.o5debug > 2)
							console.log(`${olga5_modul}/${modulname} QuerySelectorInit: id='${tag.id}',  '${m}', \n\t${quals}`)
					}
				if (errs.length > 0)
					C.ConsoleError(`Неопределены квалификаторы для '${scls}': `, errs.join(', '))
			}
		})
		return true
	}
	
	C.MsgAddSub(olga5_modul, modulname)	
})();
