/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () { // ====================================================================================================
	'use strict'
	let isCheckUrl = false,
		tagnams = ''
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
		Check = (tag, ref, url, nam) => {
			checks.push({ ok: -1, url: url, nam: nam, tag: tag })
			tag[ref] = url
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
		tups = [
			{ typ: 'img', attr: '', ref: 'src', txt:'' },
			{ typ: 'img', attr: '', ref: 'src', txt:'' },
		],
		CheckUrl = function (nam, url, typ, attr) {
			const tup = tups.find((tup) => { return tup.typ == typ && tup.attr == attr })
			if (tup) {
				const tag = document.createElement(tup.typ),
					check = checks.find((elt) => { return elt.url == url })
				if (check) check.nam += ', ' + nam
				else
					Check(tag, tup.ref, url, nam)
			} else {
				console.error("Для '" + nam + "' типа <" + typ + "> НЕ определен атрибут '" + attr + "' (url=" + url + ")");
			}
		},
		StartCheckUrls = (tags) => {
			const snull = 'about:blank'
			for (const tag of tags)
				tagnams += (tagnams.length > 0 ? ',' : '') + tag.nam

			const doms = document.querySelectorAll(tagnams)

			for (const dom of doms) { //  аналогично сделать в o5ref.js ?!!!!!!!!!!!!!!!!!!!!!!!!!!!
				const nam = '<' + dom.tagName + '>' + (dom.id && dom.id.length > 0 ? dom.id : '') + (dom.className ? '.' + dom.className : ''),
					tag = tags.find((tag) => { return dom.tagName.toLowerCase() == tag.nam })
				if (tag)
					for (const attr of tag.attrs) {
						const url = dom.getAttribute(attr)
						if (url && url.length > 0 && url != snull){
							CheckUrl(nam, url, tag.nam, attr)
						}
					}
			}
		}

	function DbgCheckUrls() {
		if (isCheckUrl) return
		isCheckUrl = true

		// CheckUrl('x1', 'http://second/play1.png')
		// CheckUrl('x2', 'https://second/play2.png')
		// CheckUrl('x3', 'https://second/play2.png')
		// CheckUrl('x3', 'https://second/play2.pn')
		// CheckUrl('x4', 'https://rombase.h1n.ru/o5/2020/media/image/play.png')
		// CheckUrl('x5', 'https://rombase.h1n.ru/o5/2020/media/image/play.png')
		// CheckUrl('x6', 'https://rombase.h1n.ru/o5/2020/media/image/playX.png')

		StartCheckUrls([
			{ nam: 'a', attrs: ['hred', 'data-src', 'audio_for-play'] },
			{ nam: 'b', attrs: ['audio_for-play'] },
			{ nam: 'img', attrs: ['src', 'data-src', 'audio_for-play', 'img_on-play'] },
		])
	}

	for (const eve of ['message', 'DOMContentLoaded']) {
		window.addEventListener(eve, DbgCheckUrls)
	}
})();
