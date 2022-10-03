/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5com/CApi ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CApi'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	let o5owners = null
	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		Modul = function (owner, modul) {
			return owner.modules.length == 0 || !modul || owner.modules.find(m => { return m == modul })
		},
		TagsByClassName = (start, cls) => {
			const smatch = new RegExp(`\\b` + cls + `(\\s*:\\s*(([\`'"])(.*?)\\3|[^\`'":\\s]*))*`, 'i'),
				sels = start.querySelectorAll("[class *= '" + cls + "']"),
				tags = []

			for (const tag of sels) {
				// if (tag.id == 'i3ee')
				// 	console.log()
				const ms = tag.className.match(smatch)
				if (ms) {
					const quals = [],
						m = ms[0],
						ss = m.match(/:\s*(([`'"])(.*?)\2|[^`'":]*)/gm)

					tag.className = tag.className.replace(m, cls)// ВСЕГДА убираю квалификаторы (остальные в ms - не трогать!)
					if (ss)
						for (const s of ss)
							quals.push(s.replace(/^\s*:\s*|\s*$/g, '')) // кавычки пока оставляю
					if (C.consts.o5debug > 2)
						console.log(`TagsByClassName: id='${tag.id}',  '${m}', \n\t${quals}`)
					tags.push({ tag: tag, quals: quals, origcls: m.trim() })
				}
			}
			return tags
		},
		QuerySelectorInit = () => {
			o5owners = []
			const mtags = TagsByClassName(document, C.olga5_Start)
			if (mtags.length == 0)
				mtags.push({ tag: document, quals: [] })
			for (const mtag of mtags) {
				const modules = []
				for (const modul of mtag.quals)
					modules.push(modul)
				o5owners.push({ start: mtag.tag, modules: modules }) // , Modul: Modul })
			}
		}

	wshp[modulname] = () => {
		// if (C.consts.o5debug > 0) console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)
		Object.assign(C, {
			olga5_Start: 'olga5_Start',
			scrpts: [],
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
			ClearOwners: function () { // эт чтоб переситыать по-новому
				o5owners = null
			},
			GetTagsByQuery: function (query, modul) {
				if (o5owners === null) QuerySelectorInit()
				const nodes = []
				for (const owner of o5owners)
					if (Modul(owner, modul)) {
						const tags = owner.start.querySelectorAll(query)
						if (tags && tags.length > 0)
							for (const tag of tags)
								nodes.push(tag)
					}
				return nodes;
			},
			GetTagById: function (id, modul) {
				if (o5owners === null) QuerySelectorInit()
				for (const owner of o5owners) {
					// const tt =  owner.start.querySelector('#' + id)
					const start = owner.start,
						tag = start.getElementById ? start.getElementById(id) : start.querySelector('#' + id)
					if (tag && Modul(owner, modul))
						return tag
				}
			},
			GetTagsByClassName: function (classname, modul) {
				if (o5owners === null) QuerySelectorInit()
				const mtags = []
				for (const owner of o5owners) {
					const tags = TagsByClassName(owner.start, classname)
					if (tags && tags.length > 0 && Modul(owner, modul))
						mtags.push(...tags)
				}
				return mtags
			},
			GetTagsByTagName: function (tagname, modul) {
				if (o5owners === null) QuerySelectorInit()
				const list = [],
					tagnams = tagname.split(',')
				for (const owner of o5owners)
					if (Modul(owner, modul))
						for (const tagnam of tagnams) {
							const tags = owner.start.getElementsByTagName(tagnam.trim())
							if (tags && tags.length > 0)
								list.push(...tags)
						}
				return list
			}
		})
		return true
	}
	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();
