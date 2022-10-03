/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () { // ====================================================================================================
	'use strict'
	// ------------------------------------------------------------------------------
	const W = {}
	const regpars = /^\s*("|')|("|')\s*$/g,
		MyTrim = (s) => { return s.split('#')[0].trim().replace(';', '') },
		ParseStr = (parse) => {
			const str = W.params[parse]
			if (str) {
				const s = str.trim()
				if (s.length > 0) return s
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
		},
		// --------------------------------------------------------
		
		isCheckUrl = {n:0},
		CheckUrls = (tags, t) => {
			if (isCheckUrl.n++ > 1) return

			let tagnams = '',
				timer = null

			const head = '(?) доступность url: ',
				checks = [],
				MakeObjName = (dom) => {
					return dom.id && dom.id.length > 0 ? ("'" + dom.id + "'") : ('~' + dom.tagName + '.' + dom.className)
				},
				Finish = (txt) => {
					if (timer) window.clearTimeout(timer)

					const err = (checks.find((elt) => { return elt.ok <= 0 })) ? ',- есть ОШИБКИ' : ''
					console.groupCollapsed(head + " для '" + tagnams + "',- " + txt + err)
					console.table(checks)
					console.groupEnd()
					checks.splice(0, checks.length)
				},
				Done = (tag, ok) => {
					const rezOK = 'ДА',
						rezErr = 'ошибка'
					if (checks.length == 0) { // это если не успел "в основное время"
						console.log(head + tag.src + ' ' + (ok ? rezOK : rezErr))
						return
					}
					const check = checks.find((elt) => { return elt.tag == tag })
					if (check) check.ok = ok > 0 ? rezOK : rezErr

					tag.parentNode.removeChild(tag)
					if (!checks.find((elt) => {return elt.ok == -1})) Finish('проверены ВСЕ')
				},
				OnLoad = (e, tag) => {
					Done(tag, 1)
				},
				OnError = (e, tag) => {
					console.log(e.target.currentSrc);
					Done(tag, 0)
				},
				Check = (tagname, attr, url, nam) => {
					try {
						const tag = document.createElement(tagname),
							onLoad = tag.readyState ? 'onreadystatechange' : 'onload',
							onError = 'onerror'
						checks.push({ nam: nam, ok: -1, url: url, attr: attr, tag: tag })

						tag[onLoad] = function (e) { OnLoad(e, tag) }
						tag[onError] = function (e) { OnError(e, tag) }
						tag.src = url
						tag.style.display = 'none'
						document.body.appendChild(tag)
					} catch (err) {
						console.error(head + "ошибка создания тега &lt;tag&gt; для тега='" +
							tagname + "',  attr='" + attr + "' и url='" + url + "'")
					}
				},
				CheckUrl = function (dom, url, attr) {
					const nam = MakeObjName(dom)

					let tagname = dom.tagName.toLowerCase()
					if (attr == 'href')
						tagname = 'iframe'
					else
					if (attr != 'src' && attr.indexOf('_') > 0) { // подменяю 'tagname' только если есть 2 и более слов
						tagname = attr.split('_')[0].toLowerCase()
						console.log(head + "для атрибута '" + attr + "' создан тег '" + tagname + "' для " + nam + "' и url='" + url + "'");
					}
					Check(tagname, attr, url, nam)
				}

			for (const [nam] of tags)
				tagnams += (tagnams.length > 0 ? ',' : '') + nam

			if (t) timer = window.setTimeout(() => { Finish('проверки НЕ завершены за ' + t + 'c.') }, t * 1000)

			const snull = 'about:blank',
				doms = document.querySelectorAll(tagnams)
			for (const dom of doms) {
				const tag = tags.get(dom.tagName.toLowerCase())
				tag.forEach((i, attr) => {
					if (attr && attr[0] != '_') { // с '_' - теневые URL - их проверять не надо
						const url = dom.getAttribute(attr)
						if (url && url.length > 0 && url != snull)
							CheckUrl(dom, url, attr)
					}
				})
			}
		}

	function DbgCheckUrls() {

		const tag_attrs = 'tag_attrs' // список пар тег=атрибуты для которых ищется '+'

		W.params[tag_attrs] = `
			img=img_on-play,_src;
			a,img,audio=href,data-href,src,audio_for-play;
		`
		const s = ParseStr(tag_attrs)
		if (s) ParseAttrs(s)

		CheckUrls(W.tags, 1)
	}

	for (const eve of ['message', 'DOMContentLoaded']) {
		window.addEventListener(eve, DbgCheckUrls)
	}
})();
