/* -global document, window*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/*eslint no-useless-escape: 0*/
(function () {              // 3---------------------------------------------- o5ref ---
	'use strict';

	const
		C = window.olga5.C,
		currentScript = document.currentScript,
		W = {
			modul: 'o5ref',
			Init: RefInit,
			consts: 'o5tag_attrs=;',
			urlrfs: '',
		},
		ParseTagAttrs = params => {
			const errs = [],
				otags = {}
			// aa=onYouTubeIframeAPIReady
			for (const pnam in params) {
				const param = params[pnam]
				if (!param)
					errs.push({ 'где': `nam='${pnam}'`, err: `пустой параметр` })
				else {
					const regexp = /\s*[,;]+\s*/g,
						nams = pnam.split(regexp),
						attrs = param.split(regexp)

					for (const attr of attrs)
						if (attr && attr.match(/\s+/)) {
							errs.push({ par: `в значении '${pnam}=${attr}'`, err: `пробелы заменены ','` })
							attr.replace(/\s+/g, ',')
						}

					for (const nam of nams) {
						if (!nam) {
							errs.push({ par: `nam='${nam}'`, err: `пустой 'тег' в параметре` })
							continue
						}
						if (!otags[nam]) otags[nam] = {}
						for (const attr of attrs) {
							if (attr)
								if (!otags[nam][attr]) otags[nam][attr] = 0// счетчик использования
						}
					}
				}
			}
			if (errs.length > 0)
				C.ConsoleError(`Ошибки в параметрах`, 'o5tag_attrs', errs)
			return otags
		},
		ConvertUrls = otags => {
			let tagnams = ''
			for (const nam in otags)
				tagnams += (tagnams ? ',' : '') + nam

			const tags = C.GetTagsByTagNames(tagnams, W.modul),
				undefs = [],
				rez = []

			for (const tag of tags) {
				const nam = C.MakeObjName(tag),
					attrs = otags[(tag.tagName.toLowerCase())],
					o5attrs = C.GetAttrs(tag.attributes)

				for (const attr in attrs)
					if (attr) {
						const tagattr = tag.attributes[attr]
						if (tagattr) {
							const ori = tagattr.nodeValue,
								wref = C.DeCodeUrl(W.urlrfs, ori, o5attrs),
								anew = attr.replace(/(data-)|(_)/, '')
							// anew = (attr[0] == '_') ? attr.substring(1) : attr

							if (wref.err)
								undefs.push({ 'имя (refs)': nam, 'атрибут': attr, 'адрес': ori, 'непонятно': wref.err })

							if (wref.url && (ori != wref.url || attr != anew)) {
								if (attr != anew)     	// если обработано без ошибок, то удаляю - чтоб другие модули не повторяли
									tag.removeAttribute(attr)

								tag.setAttribute(anew, wref.url)

								rez.push({ nam: nam, attr: (attr + (anew != attr ? ` (${anew})` : ``)), src: ori, rez: wref.url })
								attrs[attr]++
							}
						}
					}
			}

			if (rez.length < 1) C.ConsoleError(`${W.modul}: не выполнено ни одной подстановки?`)
			else
				if (C.consts.o5debug > 0) C.ConsoleInfo(`${W.modul}: выполнено подстановок для тегов:`, rez.length, rez)

			if (undefs.length > 0)
				C.ConsoleError(`${W.modul}: неопределённые адреса: `, undefs.length, undefs)
			// if (unreal.length > 0) C.ConsoleAlert(`${W.modul}: непонятные адреса: `, unreal.length, unreal)
		},
		PrepTubes = () => {
			let YT = null
			const sel = 'o5youtube',
				tags = C.GetTagsByQueryes('[' + sel + ']'),
				onPlayerReady = e => {
					const aO5 = e.target.g.aO5
					if (!aO5.ready) { // при первой установке статуса удаляю фон чтоб не выглядывал
						aO5.ready = true
						aO5.tag.removeAttribute('style')
						if (aO5.style)
							aO5.tag.setAttribute('style', aO5.style)
					}
					// console.log(1)
				},
				onPlayerStateChange = e => {
					const act = e.target.getPlayerState(),
						aO5 = e.target.g.aO5
					if (C.consts.o5debug > 0) {
						let s = ''
						switch (act) {
							case 0: s = 'воспроизведение видео завершено'; break
							case 1: s = 'воспроизведение'; break
							case 2: s = 'пауза'; break
							case 3: s = 'буферизация'; break
							case 5: s = 'видео находится в очереди'; break
							default: s = 'воспроизведение видео не началось'
						}
						console.log(aO5.tag.id, 2, act, s)
					}
					if (act == 1) {
						window.dispatchEvent(new CustomEvent('olga5_stopPlay', { detail: { tag: aO5.tag, type: 'yt', } }))
					}
				},
				onYtReady = () => {	//	
					YT = window.YT
					// console.log(4)
				},
				AddFrame = e => {
					if (YT === null) {
						YT = 0
						const script = document.createElement('script')
						script.src = "https://www.youtube.com/iframe_api"

						script.onload = function () {
							window.YT.ready(onYtReady)
						}
						script.onerror = function () {
							C.ConsoleError("ошибка загрузки YouTube API ", this.src)
						}

						// var firstScriptTag = document.getElementsByTagName('script')[0]
						// firstScriptTag.parentNode.insertBefore(script, firstScriptTag)
						currentScript.parentNode.insertBefore(script, currentScript)
					}

					const tag = e.target,
						aO5 = tag.aO5yt

					if (YT && YT.loaded) {
						const x = document.createElement('div'),	// кандидат на намену через iFrame
							div = tag.appendChild(x)

						if (aO5.chkmove) {
							if (aO5.chkmove == 'wait')
								tag.removeEventListener('mousemove', AddFrame)
							tag.aO5yt.chkmove = ''
						}

						aO5.player = new window.YT.Player(div, {
							height: 'inherit',
							width: 'inherit',
							videoId: aO5.videoId,
							events: {
								'onReady': onPlayerReady,
								'onStateChange': onPlayerStateChange
							}
						})
						aO5.iframe = aO5.player.getIframe()
						aO5.iframe.aO5 = aO5

						// tag.addEventListener('olga5_stopPlay', e => {
						// 	// console.log(aO5.tag.id, 5)
						// 	e.target.aO5yt.player.playVideo()
						// })
						window.addEventListener('olga5_stopPlay', e => {
							const act = e.detail.tag
							for (const tag of tags)
								if (tag !== act && tag.aO5yt.player)
									tag.aO5yt.player.stopVideo()
							// console.log(act.id, 5, e.detail)
						})
					}
					else
						if (aO5.chkmove == 'ask') {
							aO5.chkmove = 'wait'
							tag.addEventListener('mousemove', AddFrame)
						}
				}

			for (const tag of tags) {
				const videoId = tag.attributes[sel].nodeValue,
					style = tag.getAttribute('style') || ''

				if (style)
					tag.removeAttribute('style')
				tag.setAttribute('style', style + `background: url(//img.youtube.com/vi/${videoId}/hqdefault.jpg) 0% 0% / contain no-repeat;background-position: center;`)
				tag.aO5yt = { player: null, videoId: videoId, chkmove: 'ask', tag: tag, style: style, ready: false }

				tag.addEventListener('mouseover', AddFrame, { once: true })
				// tag.addEventListener('olga5_stopPlay', e => {
				// 	if (this !== e.detail.tag)
				// 		this.aO5yt.player.stopVideo()
				// 	// console.log(act.id, 5, e.detail)
				// })
			}
		}

	function RefInit() {

		C.ParamsFill(W)

		const o5tag_attrs = 'o5tag_attrs',
			s = W.consts[o5tag_attrs]

		if (s) {
			const params = C.SplitParams(s, o5tag_attrs, ';\n'),
				otags = ParseTagAttrs(params)
			if (C.consts.o5debug > 0) C.ConsoleInfo(`${W.modul}: обрабатываемые атрибуты тегов`, o5tag_attrs, otags)
			ConvertUrls(otags)
		}

		PrepTubes()
		// PrepTables()

		// window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		C.E.DispatchEvent('olga5_sinit', W.modul)

		// InitRPos()
	}

	C.ModulAdd(W)
})();
