/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () { // ====================================================================================================
	'use strict'
	let isCheckUrl = false,
		tagnams = ''
	// ------------------------------------------------------------------------------
	const W = {  }
	const regpars = /^\s*("|')|("|')\s*$/g,
		MyTrim = (s) => { return s.split('#')[0].trim().replace(';', '') },
		ParseStr = (parse) => {
			const str = W.params[parse]
			if (str) {
				const s = str.trim()
				if (s.length > 0)
					return s
			}
			console.error('o5ref.js: отсутствует или пуст атрибут ', parse)
		},
		ParseAttrs = (str) => {
			W.tags = new Map()

			const pars = W.tags,
				ss = str.split(/(\n|;)/g)

			ss.forEach((s, i, ss) => { ss[i] = MyTrim(s) })
			for (const s of ss) {
				if (s != '') {
					const uu = s.split('='),
						nams = uu[0].toLowerCase().split(/,/g),
						vals = uu.length > 1 ? uu[1].replace(regpars, '').split(/,/g) : []

					nams.forEach((s, i, ss) => { ss[i] = MyTrim(s) })
					for (const nam of nams) {
						if (!pars.has(nam)) pars.set(nam, new Map()) // могло быть создано в предыдущих проверках

						const attrs = pars.get(nam)
						vals.forEach(val => { attrs.set(val, 0) }) // имя атрибута и счетчик использования
					}
				}
			}
		}
	// --------------------------------------------------------
	const checks = [],
		Done = (tag, ok) => {
			const check = checks.find((elt) => { return elt.tag == tag })
			if (check) {
				check.ok = ok
				check.tag = null
			}
			tag.parentNode.removeChild(tag)
			if (!checks.find((elt) => { return elt.tag })) {
				console.groupCollapsed("Справка о доступности url'ов для тегов: " + tagnams)
				console.table(checks)
				console.groupEnd()
			}
		},
		OnLoad = (e, tag) => {
			// console.log('OK ' + e.message + ':  ' + tag.src);
			Done(tag, 1)
		},
		OnError = (e, tag) => {
			// console.error('ошибочка: ' + e.message + ':  ' + tag.src);
			Done(tag, 0)
		},
		Check = (tagName, src, url, nam) => {
			const tag = document.createElement(tagName)
			checks.push({ ok: -1, url: url, nam: nam, tag: tag })
			tag[src] = url
			tag.style.display = 'none'
			tag.onerror = function (e) { OnError(e, tag) }
			if (tag.readyState) tag.onreadystatechange = function (e) { OnLoad(e, url) }
			else tag.onload = function (e) { OnLoad(e, tag) }

			try {
				document.body.appendChild(tag)
			} catch (err) {
				console.error('ошибка создания тега &lt;tag&gt;');
			}
		},
		CheckUrl = function (dom, url, tagName, attr) {
			// Для атрибутов href и src - создаётся тег с таким же типом как у тега
			// (и таким же значением этого атрибута)
			// Для остальных,- название атрибуда должно разделяться на фрагменты, разделённые '_'
			// первый из которых - атрибут источника, остальные - произвольны
			// Например:'src_1','src_onplay','src_iframe_moe',
			const nam = '<' + dom.tagName + '>' + (dom.id && dom.id.length > 0 ? dom.id : '') + (dom.className ? '.' + dom.className : '')

			let src = attr
			if (['src', 'href'].indexOf(attr) < 0) { // не стандартный атрибут
				const ss = attr.split('_')
				if (ss.length > 1) src = ss[0]
				else {
					src = 'src'
					console.log("CheckUrl: тип атрибута '" + attr + "' заменён на 'src'");
				}
			}
			Check(tagName, src, url, nam)
		},
		StartCheckUrls = (tags) => {
			const snull = 'about:blank'
			// 			for (const [nam, ] of tags){
			// 				let key = nam.get()
			// 				tagnams += (tagnams.length > 0 ? ',' : '') + nam
			// }
			for (const [nam, attrs] of tags) {
				tagnams += (tagnams.length > 0 ? ',' : '') + nam
				// tag.attrs.forEach((attr) => attr.used = 0)
				attrs.used = 0
			}

			const doms = document.querySelectorAll(tagnams)

			for (const dom of doms) {
				const tagName = dom.tagName.toLowerCase(),
					tag = tags.get(tagName)
				// tag = tags.find((tag) => {
				// 	return dom.tagName.toLowerCase() == tag.nam
				// })
				if (tag)
					tag.forEach((i, attr) => {
						if (attr && attr[0] != '_') { // с '_' - теневые URL - их проверять не надо
							const url = dom.getAttribute(attr)
							if (url && url.length > 0 && url != snull) {
								CheckUrl(dom, url, tagName, attr)
							}
						}
					})
				// for (const attr of tag.attrs) {
				// 	const url = dom.getAttribute(attr)
				// 	if (url && url.length > 0 && url != snull) {
				// 		CheckUrl(nam, url, tag.nam, attr)
				// 	}
				// }
			}
		}

	function DbgCheckUrls() {
		if (isCheckUrl) return
		isCheckUrl = true

		// const page_refs = 'page_refs', // список относительных ссылок
		// 	tag_attrs = 'tag_attrs' // список пар тег=атрибуты для которых ищется '+'


		W.params[tag_attrs] = `
			img=img_on-play,_src;
			a,img,audio=href,data-href,src,audio_for-play;
		`
		// W.params[page_refs]  = `
		// 	images=_url_olga5 + ../blog/media/image;
		// 	sounds=https://archive.org/download/clouds_20200310;
		//
		// 	iTunes-icon='images + /myMusikIT.png' # --- только для o5snd ---;
		// 	Ceza1-25=sounds+/Ceza1-25.mp3;
		//
		// 	мой-блог=http://ariturlearn.blogspot.com/2017/02; # --- только для o5shp ---;
		// 	_блог_Olga=http://turkish4dummies.blogspot.com;
		// 	`
		const s = ParseStr(tag_attrs)
		if (s) ParseAttrs(s)

		// 				s = ParseStr(page_refs)
		// if (s) ParseRefs(s)

		StartCheckUrls(W.tags)

	}

	for (const eve of ['message', 'DOMContentLoaded']) {
		window.addEventListener(eve, DbgCheckUrls)
	}
})();
