/* global document, window, console*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5snd ---
	'use strict';
	let o5debug = 0,
		C = null,
		wshp = null,
		timera = ''

	const
		W = {
			modul: 'o5snd',
			Init: WndInit,
			// src: document.currentScript.src,
			class: 'olga5_snd',
			consts: `		
				o5shift_speed=0.5 # при Shift - замедлять вдвое;
				o5return_time=0.3 # при возобновлении "отмотать" 0.3 сек ;
			`,
			urlrfs: 'btn_play="", btn_stop=',
		},

		currentScript = document.currentScript,
		urlattrs = [],
		errs = [],
		TryEncode = (ori, tag) => {
			const wref = C.DeCodeUrl(W.urlrfs, ori.url, tag ? tag.aO5snd.o5attrs : '')
			if (wref.err.length > 0)
				errs.Add(C.MakeObjName(tag), ori.url, "декодир. ссылки", ori.atr, wref.err)
			return wref.url
		},
		setClass = {
			stop: 'stop', play: 'play', pause: 'pause',
			SetC: (aO5, state) => {
				if (o5debug > 1) console.log(`--> setClass.SetC (${aO5.name}, '${state}')`)
				const classList = (aO5.image.play ? aO5.image.play : aO5.snd).classList
				if (state == setClass.play) {
					const image = aO5.image
					if (image.play) {
						image.stop.style.display = 'none'
						image.play.style.display = aO5.modis.dspl
					}
					classList.add(wshp.CSS._clsPlay)
					classList.remove(wshp.CSS._clsPause)
				}
				else if (state == setClass.pause) {
					classList.remove(wshp.CSS._clsPlay)
					classList.add(wshp.CSS._clsPause)
				}
				else if (state == setClass.stop) {
					classList.remove(wshp.CSS._clsPlay)
					classList.remove(wshp.CSS._clsPause)
				}
				else alert(`setClass.SetC: state='${state}'`)
				aO5.sound.state = state
			}
		},
		StopSound = aO5 => {
			if (o5debug > 1) console.log(`--> StopSound (${aO5.name})`)
			wshp.actaudio = null

			const image = aO5.image,
				audio = aO5.audio ? aO5.audio : aO5.sound.audio

			audio.pause()
			audio.currentTime = 0
			aO5.sound.state = setClass.stop

			if (image && image.play) {
				image.play.style.display = 'none'
				image.stop.style.display = aO5.modis.dspl
			}

			if (audio !== aO5.audio)
				setClass.SetC(aO5, setClass.stop)
		},
		StopSoundOnPage = e => {
			if (wshp.actaudio)
				StopSound(wshp.actaudio.aO5snd)
		},
		OriForTag = (tag, ref, atnam) => {
			const ori = { url: '', atr: '' },
				attr = atnam ? C.GetAttribute(tag.aO5snd.o5attrs, atnam) : ''
			if (attr)
				Object.assign(ori, { url: attr.value, atr: atnam })
			else
				if (ref) {
					const td = C.TagDes(tag, ref)
					if (td)
						Object.assign(ori, { url: td.orig, atr: td.from })
				}
			return ori
		},
		PrepareAudios = () => {
			const audios = C.GetTagsByTagName('audio', W.modul),
				efirsts = ['mouseenter', 'focusin'],
				OnPlay = (audio) => {
					const a = wshp.actaudio
					if (a && a != audio)
						StopSound(a.aO5snd)

					wshp.actaudio = audio
				},
				OnEnter = (e) => {
					const audio = e.target
					audio.setAttribute('src', audio.aO5snd.url)
					efirsts.forEach(efirst => audio.removeEventListener(efirst, OnEnter))
				}

			for (const audio of audios) {
				const aO5 = audio.aO5snd = {
					url: '',
					audio: audio,
					sound: { state: setClass.stop, },
					name: C.MakeObjName(audio),
					o5attrs: C.GetAttrs(audio.attributes),
				}

				const name = C.MakeObjName(audio),
					ori = OriForTag(audio, 'src', 'audio_play')

				if (ori.url) {
					const url = TryEncode(ori, audio),
						src = audio.getAttribute('src')
					if (ori.url != src) {
						aO5.url = url
						efirsts.forEach(efirst => audio.addEventListener(efirst, OnEnter))
					}
					if (url != src)
						urlattrs.push({ snd: name, atr: 'src', url: url, 'ориг.': ori.url })

					audio.addEventListener('play', e => { OnPlay(e.target) })
				}
				else
					errs.Add(name, 'PrepUrlsAudio()', `тег 'audio'`, '', `Нет 'audio_play', 
						${'data-' + aO5.srcAtr}, ${'_' + aO5.srcAtr}, ${aO5.srcAtr}`)
			}
		},
		PrepareSnds = function (mtags) {
			const btns = { stop: '', play: '' },
				DecodeAttrs = (mtag) => {
					const snd = mtag.tag,
						scls = snd.className,
						aO5 = snd.aO5snd,
						modis = aO5.modis,
						ers = []
					// if (aO5.name == "#05")
					// 	console.log('')
					if (!snd.classList) snd.classList = wshp.CSS.NewClassList(snd) // да... и такое бывает - в IE после Blogger		
					for (const qual of mtag.quals) {
						const c = qual.substring(0, 1).toUpperCase()

						if ('AOLFN'.indexOf(c) >= 0)
							switch (c) {
								case 'A': modis.alive = true
									break
								case 'O': modis.over = true
									break
								case 'L': modis.loop = true
									break
								case 'F': if (!snd.classList.contains(wshp.CSS.o5freeimg))
									snd.classList.add(wshp.CSS.o5freeimg)
									break
								case 'N': modis.none = true
									break
								default: ers.push(qual)
							}
						else
							modis.aplay = qual.replace(/^[`'"]?\s*|\s*[`'"]?$/g, '')
					}

					if (ers.length > 0)
						errs.Add(aO5.name, scls, 'квалиф. класса', ers.join(', '), "ошибочные квалиф.")

					// if (modis.alive && aO5.snd.tagName.toUpperCase() == 'A')
					// 	errs.Add(aO5.name, scls, `тег <A>`, 'трудности с остановкой звука', "не рекомендуется 'Alive'")

					if (!modis.aplay && !modis.none)
						errs.Add(aO5.name, scls, `игнор остальных квалиф.`, 'audio_play', "отсутствие квалиф.")

					if (aO5.modis.none) snd.classList.add(wshp.CSS._clsNone)

					if (!snd.alt || (snd.alt.trim() == '')) snd.alt = snd.title.trim()
				},
				PrepOther = aO5 => {
					const snd = aO5.snd,
						srcAtr = aO5.srcAtr,
						ori = OriForTag(snd, srcAtr, '')

					if (ori.url) {
						const url = TryEncode(ori, snd)
						if (url != snd[srcAtr]) {
							snd.setAttribute(srcAtr, url)
							urlattrs.push({ snd: aO5.name, atr: srcAtr, url: url, 'ориг.': ori.url })
						}
					}
					else
						errs.Add(aO5.name, 'PrepUrlsAudio()', `тег <${aO5.tagName}>`, '', `Нет ${'data-' + srcAtr}, ${'_' + srcAtr} или ${srcAtr}`)

					if (ori.atr == 'data-' + srcAtr || ori.atr == '_' + srcAtr)
						snd.removeAttribute(ori.atr)	// чтоб другие модули не повторяли

				},
				GetBtnUrl = (atr) => {
					const ori = { url: W.urlrfs[atr], atr: atr }

					if (ori.url) {
						const url = TryEncode(ori, null)
						if (url != ori.url)
							urlattrs.push({ snd: atr, atr: ori.atr, url: url, 'ориг.': ori.url })
						return url
					}
				}

			for (const mtag of mtags) {
				const snd = mtag.tag,
					tagName = snd.tagName.toLowerCase()

				if (snd.tagName.match(/audio/i)) continue

				const aO5 = wshp.AO5snd(snd, C)

				if (mtag.quals && mtag.quals.length > 0) {
					DecodeAttrs(mtag)

					const ori = { url: aO5.modis.aplay, atr: 'audio_play' }
					if (ori.url) {
						const url = TryEncode(ori, snd)
						aO5.parms.audio_play = url
						urlattrs.push({ snd: aO5.name, atr: ori.atr, url: url, 'ориг.': ori.url })
					}
				}
				else // if (!aO5.modis.none)
					errs.Add(aO5.name, 'PrepUrlsSnd()', `для тега <${aO5.tagName}> '${aO5.name}' `, '', `нет 'audio_play' или иных атрибутов url'а`)

				if (aO5.image.stop) {
					if (!wshp.imgs) {
						wshp.imgs = wshp.Imgs(C)
						btns.stop = GetBtnUrl('btn_stop') || ''
						btns.play = GetBtnUrl('btn_play') || ''
					}
					const urlatr = wshp.imgs.prepImage(aO5, btns, TryEncode)
					if (urlatr.snd)
						urlattrs.push(urlatr)

					if (snd.src) wshp.imgs.regiBySrc(snd)
				}
				else
					if (aO5.srcAtr) // если есть адрес - пробую перекодировать
						PrepOther(aO5)

				aO5.waitActivate(snd)

				Object.freeze(aO5.modis)
				Object.freeze(aO5.parms)
			}

			for (const eve of ['blur', 'pagehide', 'dblclick'])
				document.addEventListener(eve, StopSoundOnPage)
		},
		IncludedInit = function () {
			C.ParamsFill(W, wshp.CSS(W.class))

			const mtags = C.GetTagsByClassName(W.class, W.modul)
			PrepareSnds(mtags)
			PrepareAudios()

			if (urlattrs.length > 0) C.ConsoleInfo(`Всего выполнено подстановок snd/audio`, urlattrs.length, urlattrs)

			if (errs.length > 0)
				C.ConsoleError(`${W.modul}: ошибки перекодировки тегов с ${W.class}`, errs.length, errs)

			console.timeEnd(timera)
			window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		}

	function WndInit(c) {
		C = c
		o5debug = C.consts.o5debug
		timera = '                                                                <   инициирован ' + W.modul
		console.time(timera)
		if (o5debug > 1)
			console.log(` __________________________________________\n   начало  иниц.:   ${W.modul}`)

		const W2 = {
			modul: W.modul,
			names: ['CSS', 'AO5snd', 'Imgs'],
			actscript: currentScript,
			iniFun: IncludedInit,
			args: []
		}
		Object.freeze(W2)

		if (!window.olga5[W.modul]) window.olga5[W.modul] = {}
		wshp = window.olga5[W.modul]
		wshp.StopSound = StopSound
		wshp.OriForTag = OriForTag
		wshp.setClass = setClass

		C.IncludeScripts(W2)
	}

	errs.Add = function (name, url, txt, atr, err) {
		this.push({ snd: name, 'источник': url, 'пояснение': txt, val: atr, 'ошибка': err })
	}

	if (!window.olga5) window.olga5 = []
	if (!window.olga5.find(w => w.modul == W.modul)) {
		window.olga5.push(W)
		console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error(`Повтор загрузки '${W.modul}`)
	// -------------- o5snd
})();
