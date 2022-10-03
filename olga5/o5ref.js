/* global document, window, console, Object, Map*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/*eslint no-useless-escape: 0*/
(function () {              // ---------------------------------------------- o5ref ---
	'use strict';
	let C = null
	const
		W = {
			modul: 'o5ref',
			Init: RefInit,
			// src: document.currentScript.src,
			consts: 'o5tag_attrs=,',
			urlrfs: '',
		},
		ParseTagAttrs = (params) => {
			const errs = [],
				mtags = {}
			for (const nam in params) {
				const param = params[nam]
				if (!param)
					errs.push({ 'где': `nam='${nam}'`, err: `пустой параметр` })
				else {
					const regexp = /\s*,\s*/g,
						tags = nam.split(regexp),
						attrs = param.split(regexp)

					for (const attr of attrs)
						if (attr && attr.match(/\s+/)) {
							errs.push({ par: `в значении '${nam}=${attr}'`, err: `пробелы заменены ','` })
							attr.replace(/\s+/g, ',')
						}

					for (const tag of tags) {
						if (!tag) {
							errs.push({ par: `nam='${nam}'`, err: `пустой 'тег' в параметре` })
							continue
						}
						if (!mtags[tag]) mtags[tag] = {}
						for (const attr of attrs) {
							if (attr)
								if (!mtags[tag][attr]) mtags[tag][attr] = 0// счетчик использования
						}
					}
				}
			}
			if (errs.length > 0)
				C.ConsoleError(`Ошибки в параметрах`, 'o5tag_attrs', errs)
			return mtags
		},
		ConvertUrls = function (mtags) {
			let tagnams = ''
			for (const nam in mtags)
				tagnams += (tagnams ? ',' : '') + nam

			const tags = C.GetTagsByTagName(tagnams, W.modul),
				undefs = [],
				rez = []

			for (const tag of tags) {
				const nam = C.MakeObjName(tag),
					attrs = mtags[(tag.tagName.toLowerCase())],
					o5attrs = C.GetAttrs(tag.attributes)

				for (const attr in attrs)
					if (attr) {
						const tagattr = tag.attributes[attr]
						if (tagattr) {
							const ori = tagattr.nodeValue,
								wref = C.DeCodeUrl(W.urlrfs, ori, o5attrs)
								
							if (wref.err)
								undefs.push({ 'имя (refs)': nam, 'атрибут': attr, 'адрес': ori, 'непонятно': wref.err })
// 1?							else
								if (wref.url && ori != wref.url) {
									const a = (attr[0] == '_') ? attr.substring(1) : attr // (attr == '_src') ? 'src' : ((attr == '_href') ? 'href' : attr)
									if (a != attr)     	// если обработано без ошибок, то удаляю - чтоб другие модули не повторяли
										tag.removeAttribute(attr)

									tag.setAttribute(a, wref.url)

									rez.push({ nam: nam, attr: (attr + (a != attr ? ` (${a})` : ``)), src: ori, rez: wref.url })
									attrs[attr]++
								}
						}
					}
			}

			if (rez.length < 1) C.ConsoleError(`${W.modul}: не выполнено ни одной подстановки?`)
			else C.ConsoleInfo(`${W.modul}: выполнено подстановок для тегов:`, rez.length, rez)

			if (undefs.length > 0)
				C.ConsoleAlert(`${W.modul}: неопределённые адреса: `, undefs.length, undefs)
			// if (unreal.length > 0) C.ConsoleAlert(`${W.modul}: непонятные адреса: `, unreal.length, unreal)
		}
	// --------------------------------------------------------	
	let no_o5tag_attrs = false
	function RefInit(c) {
		C = c
		const o5tag_attrs = 'o5tag_attrs',
			timera = '                                                                <   инициирован ' + W.modul
		console.time(timera)

		if (C.consts.o5debug > 1)
			console.log(` __________________________________________\n   начало  иниц.:   ${W.modul}`)

		c.ParamsFill(W)

		const s = W.consts[o5tag_attrs]

		if (s) {
			const params = C.SplitParams(s, o5tag_attrs),
				mtags = ParseTagAttrs(params)
			C.ConsoleInfo(`Модуль ${W.modul} : обрабатываемые атрибуты тегов`, o5tag_attrs, mtags)
			ConvertUrls(mtags)
		}
		else if (!no_o5tag_attrs) {
			no_o5tag_attrs = true
			C.ConsoleError(`${W.modul}.js: неопределено значение атрибута '${o5tag_attrs}'`)
		}

		console.timeEnd(timera)
		window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
	}

	if (!window.olga5) window.olga5 = []
	if (!window.olga5.find(w => w.modul == W.modul)) {
		window.olga5.push(W)
		console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error(`Повтор загрузки '${W.modul}`)
})();
