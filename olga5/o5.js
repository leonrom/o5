/* global document, window, console, Object, Map*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/*eslint no-useless-escape: 0*/
(function () {              // ---------------------------------------------- o5ref --- 111
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
							else
								if (ori != wref.url) {
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
/* global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5snd/AO5snd ---
    "use strict"
    const olga5_modul = 'o5snd'

    if (!window.olga5) window.olga5 = []
    if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

    function AO5snd(snd, C) {
        let isNotAllowedError = false
        const wshp = window.olga5[olga5_modul],
            ss = wshp.setClass,
            _clsError = wshp.CSS._clsError,
            W = window.olga5.find(w => w.modul == olga5_modul), // так делать во всех подмодулях 
            o5debug = W.consts.o5debug,
            o5shift_speed = W.consts.o5shift_speed < 0.2 ? 0.2 : W.consts.o5shift_speed,

            SetTitle = (aO5, txt) => {
                aO5.snd.title = txt
                if (aO5.image.play)
                    aO5.image.play.title = aO5.snd.title
            },
            setVolume = {
                step: 0.1,
                vmin: 0.2,
                vmax: 1.0,
                SetV: (aO5, add) => {
                    if (add == 0) SetTitle(aO5, ``)
                    else {
                        const audio = aO5.sound.audio,
                            v = audio.volume + add * setVolume.step,
                            txt = `громкость=${parseInt(v * 100)}%`

                        audio.volume = v > setVolume.vmax ? setVolume.vmax : (v < setVolume.vmin ? setVolume.vmin : v)
                        SetTitle(aO5, txt)
                        if (o5debug > 1)
                            console.log(`Изменено: ${txt} для '${aO5.name}' }`)
                    }
                }
            },
            errTypes = {
                'неАктивир.': 'звук не проигрывалтся (автоматически) т.к. не активирована страница',
                'неЗагружен': `ошибка в 'audio' (если еще не загружено - повторите)`,
                'неРазрешен': 'прежде проигрывать - активируйтесь на странице (это требование браузера)',
                'ошибкаКода': 'ошибка в коде',
                'естьОшибка': 'ошибка проигрывания',
                SetT: (aO5, mrk, err) => {
                    aO5.sound.errIs[mrk] = err
                    const t = aO5.title
                    SetTitle(aO5, err ? `Для тега ${t ? ("'" + t + "'") : ''} ошибка: ${errTypes[mrk]}` : t)
                },
                AddError: (aO5, mrk, txt) => {
                    if (!aO5.sound.errIs[mrk]) {
                        errTypes.SetT(aO5, mrk, true)
                        C.ConsoleError(`"${errTypes[mrk]}" (${mrk})` + (txt ? (` (${txt})`) : '') + ` для '${aO5.name}'`)

                        aO5.sound.errIs.errs = true
                        if (!aO5.snd.classList.contains(_clsError))
                            aO5.snd.classList.add(_clsError)
                    }
                },
                RemError: (aO5, mrk) => {
                    if (aO5.sound.errIs[mrk]) {
                        errTypes.SetT(aO5, mrk, false)
                        console.log(`Устранена ошибка: errTypes.${mrk}`)

                        const errIs = aO5.sound.errIs
                        for (const erri in errIs)
                            if (erri != 'errs' && errIs[erri])
                                return

                        aO5.sound.errIs.errs = false
                        if (aO5.snd.classList.contains(_clsError))
                            aO5.snd.classList.remove(_clsError)
                    }
                }
            },
            StartSound = (aO5) => {
                const sound = aO5.sound,
                    audio = sound.audio,
                    Play = (aO5) => {
                        if (o5debug > 1) console.log(`  > Play()`)

                        if (aO5.modis.over && !C.cstate.activated)
                            errTypes.AddError(aO5, 'неАктивир.')

                        if (sound.ison) { // если курсор не ушел
                            if (o5debug > 1) console.log(`--> Play OK`)
                            try {
                                const audio = sound.audio
                                // audio.volume = aO5.sound.volume
                                audio.playbackRate = sound.shiftKey != 0 ? o5shift_speed : 1.0
                                if (sound.state != ss.pause) audio.currentTime = 0 // т.е. если перезапуск старого музона	
                                else audio.currentTime = Math.max(audio.currentTime - W.consts.o5return_time, 0)

                                audio.play()
                            }
                            catch (e) {
                                console.error(`ошибка воспроизведения:`, e)
                            }
                        }
                        else
                            wshp.StopSound(aO5)
                    }

                if (o5debug > 1) console.log(`--> StartSound() из '${aO5.sound.state}'`)

                if (wshp.actaudio && wshp.actaudio != audio)
                    wshp.StopSound(wshp.actaudio.aO5snd)

                if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA)
                    Play(aO5)
                else {
                    wshp.setClass.SetC(aO5, wshp.setClass.pause)
                    audio.addEventListener('canplay', () => Play(aO5), { capture: true, once: true })
                }
                // }
            },
            GetTargetObj = e => {
                let obj = e.target
                while (obj && !obj.aO5snd) obj = obj.parentElement
                if (obj && obj.aO5snd) return obj
            },
            /*
+ mouseleave  когда курсор манипулятора (обычно мыши) перемещается за границы элемента.
- mouseout    когда курсор покидает границы элемента или одного из его дочерних элементов
+ mouseenter  не отправляется никаким потомкам, когда указатель перемещается из пространства 
- mouseover   отправляется в самый глубокий элемент дерева DOM, затем оно всплывает в иерархии
            */
            eFocus = ['mouseenter', 'focus'],
            Activate = e => {
                const snd = GetTargetObj(e),
                    aO5 = snd.aO5snd,
                    PlayError = (aO5, e) => {
                        if (o5debug > 0) console.error(`--> PlayError ${aO5.name}`, e)
                        if (e.name == 'TypeError') errTypes.AddError(aO5, 'ошибкаКода')
                        else if (e.name == 'NotAllowedError') errTypes.AddError(aO5, 'неРазрешен')
                        else if (e.code != 20) errTypes.AddError(aO5, 'естьОшибка',
                            `e.type='${e.type}'` + e.code ? `\n\tcode= '${e.code}': ${e.message}` : ``)
                    },
                    eAudios = [
                        {
                            type: 'error', Act: (snd, e) => {
                                const aO5 = snd.aO5snd
                                errTypes.AddError(aO5, 'неЗагружен',
                                    `\n"${e.target.src}" \n(т.е. это при audio_play= '${aO5.parms.audio_play}', attrs.aplay= '${aO5.modis.aplay}') `)
                            }
                        },
                        {
                            type: ss.play, Act: snd => {
                                const aO5 = snd.aO5snd,
                                    sound = aO5.sound,
                                    errIs = sound.errIs
                                if (aO5.sound.errIs.errs)
                                    for (const mrk in errTypes)
                                        if (typeof mrk === 'string' && errIs[mrk])
                                            errTypes.RemError(aO5, mrk)

                                wshp.setClass.SetC(aO5, wshp.setClass.play)
                                wshp.actaudio = sound.audio
                                C.cstate.activated = true
                            }
                        },
                        {
                            type: 'ended', Act: snd => {
                                const aO5 = snd.aO5snd
                                if (aO5.modis.loop) {
                                    const audio = aO5.sound.audio
                                    audio.currentTime = 0
                                    audio.play()
                                } else
                                    wshp.StopSound(aO5)
                            }
                        },
                        { type: 'loadstart', Act: snd => snd.classList.add(wshp.CSS._clsLoad) },
                        { type: 'loadeddata', Act: snd => snd.classList.remove(wshp.CSS._clsLoad) },
                        { type: 'abort', Act: (snd, e) => PlayError(snd.aO5snd, e) },
                        { type: 'stalled', Act: (snd, e) => PlayError(snd.aO5snd, e) },
                    ],
                    OnPlayAct = (e, eacts, txt) => {
                        const type = e.type,
                            snd = GetTargetObj(e),
                            aO5 = snd.aO5snd

                        if (o5debug > 1) console.log(`--> OnPlayAct.${txt}  ${('' + e.timeStamp).padStart(8)}` +
                            ` для ${aO5.name} '${type}' при isOny= ${aO5.sound.ison}`)

                        eacts.find(eact => eact.type == type).Act(snd, e)
                    },
                    OnPlayActAudios = e => { OnPlayAct(e, eAudios, 'audio') },
                    StopBubble = e => {
                        e.stopPropagation()  // 
                        e.preventDefault()
                        e.cancelBubble = true
                        return false
                    },
                    CallStartSound = e => {
                        const snd = GetTargetObj(e),
                            aO5 = snd.aO5snd,
                            sound = aO5.sound

                        if (o5debug > 1) console.log(`--> CallStartSound() ${aO5.name} '${aO5.sound.state}'  e.type= '${e.type}'`)
                        Object.assign(aO5.sound, { ison: true, shiftKey: e.shiftKey ? (e.location == 2 ? 1 : -1) : 0 })

                        if (e.type == 'mouseenter')
                            switch (sound.state) {
                                case ss.pause: sound.audio.play()
                                    break
                                case ss.stop: if (aO5.modis.over) StartSound(aO5)
                                    break
                                default: return
                            }
                        else if (e.type == 'click') {
                            const isA = snd.tagName.toUpperCase() == 'A'
                            switch (sound.state) {
                                case ss.pause: 
                                    if (isA) {
                                        wshp.StopSound(aO5)
                                        return // чтобы избежать StopBubble(e)
                                    }
                                    else sound.audio.play()
                                    break
                                case ss.stop: StartSound(aO5)
                                    break
                                case ss.play:
                                    sound.audio.pause()
                                    wshp.setClass.SetC(aO5, wshp.setClass.pause)
                            }

                            if (isA)
                                return StopBubble(e)
                        }
                    },
                    CallStopSound = e => {
                        const snd = GetTargetObj(e),
                            aO5 = snd.aO5snd

                        if (e.type == 'mouseleave') {
                            aO5.sound.ison = false
                        }
                        if (aO5.sound.state != ss.stop &&
                            snd.style.display != 'none' &&
                            (!aO5.modis.alive || aO5.sound.audio.paused)) {

                            wshp.StopSound(aO5)

                            SetTitle(aO5, '')
                            if (e.type == 'click') // для любых тегов - только лишь остановить музон
                                return StopBubble(e)
                        }
                    },
                    DoKeyDown = e => {
                        const snd = GetTargetObj(e),
                            aO5 = snd.aO5snd,
                            sound = aO5.sound,
                            key = e.key.match(/ArrowUp|ArrowRight/) ? 1 :
                                (e.key.match(/ArrowDown|ArrowLeft/) ? -1 : 0)
                        if (sound.ison && sound.audio.played && key != 0) {
                            setVolume.SetV(aO5, key)
                            return StopBubble(e)
                        }
                    },
                    SetEventListeners = snd => {
                        snd.addEventListener('mouseleave', CallStopSound, { capture: true })
                        snd.addEventListener('keydown', DoKeyDown, { capture: true })
                        snd.addEventListener('click', CallStartSound, { capture: true })
                        if (snd.aO5snd.modis.over)
                            StartSound(aO5)
                    },
                    audio = aO5.sound.audio = new Audio() // ocument.createElement('audio'),

                if (o5debug > 1) console.log(`-- Activate ${aO5.name} '${e.type}'`)

                setVolume.SetV(aO5, 0)

                for (const eWait of eFocus) // убрал оба чтоб не срабатывали
                    snd.removeEventListener(eWait, Activate, { capture: true })

                Object.assign(audio, { aO5snd: aO5, src: aO5.parms.audio_play, autoplay: false, controls: false, muted: false, loop: false, crossorigin: "" })
                audio.load()

                for (const eAudio of eAudios)
                    audio.addEventListener(eAudio.type, OnPlayActAudios, { capture: true })

                Object.assign(aO5.sound, { ison: true, shiftKey: e.shiftKey ? (e.location == 2 ? 1 : -1) : 0 })
                if (!aO5.image.play)
                    if (aO5.parms.image_play)
                        wshp.imgs.makeImgPlay(aO5, SetEventListeners)  // StartSound, 
                    else
                        aO5.image.play = aO5.image.stop

                snd.addEventListener('mouseenter', CallStartSound, { capture: true })
                SetEventListeners(snd)

            },
            WaitActivate = snd => {
                if (snd.aO5snd.modis.none) return

                if (o5debug > 2) console.log(`-- WaitActivate ${snd.id}`)
                for (const eWait of eFocus)
                    snd.addEventListener(eWait, Activate, { capture: true })
            }

        class AO5snd {
            constructor(snd) {
                const aO5 = this
                aO5.snd = snd
                aO5.title = snd.title
                aO5.name = C.MakeObjName(snd)
                aO5.o5attrs = C.GetAttrs(snd.attributes)
                aO5.srcAtr = snd.hasAttribute('href') ? 'href' : (snd.hasAttribute('src') ? 'src' : '')

                for (const errType in errTypes)
                    if (typeof errType === 'string') aO5.sound.errIs[errType] = false

                Object.seal(aO5.attrs)  // freeze() дам в PrepareSnds
                Object.seal(aO5.parms)  // -"-
                Object.seal(aO5.sound)	// не замораживается 
                Object.seal(aO5.image)	// -"-
                Object.freeze(aO5)

                if (snd.tagName.match(/img/i))
                    aO5.image.stop = snd

                snd.aO5snd = aO5
            }

            snd = null; title = ''; name = ''; o5attrs = null; srcAtr = null;

            modis = { over: false, alive: false, loop: snd.getAttribute('loop'), aplay: '', dspl: snd.style.display, none: false }
            sound = { audio: null, errIs: { errs: false, }, state: ss.stop, eventsAreSet: false, ison: false, shiftKey: 0 }
            parms = { audio_play: '', image_play: '' }
            image = { stop: null, play: null }

            // для доступа из o5snd
            waitActivate = snd => WaitActivate(snd)
        }
        return new AO5snd(snd)
    }

    window.olga5[olga5_modul].AO5snd = AO5snd
    console.log(`}---< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/AO5snd.js`)
})();
/* global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5snd/CSS ---
    "use strict"
    const olga5_modul = 'o5snd'

    if (!window.olga5) window.olga5 = []
    if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

    const wshp = window.olga5[olga5_modul],
        css = { _clsError: `_error`, _clsLoad: `_load`, _clsPause: `_pause`, _clsPlay: `_play`, _clsNone: `_none`, _clsFreeImg: `_freeimg`, }

    function CSS(olga5_class) {
        return `
.${olga5_class}:not(.${css._clsNone}) {
    cursor: pointer;
}
.${olga5_class}.${css._clsPlay} {
    cursor: progress;
    animation: olga5_viewTextWash 5s infinite linear;
}
.${olga5_class}.${css._clsPause} {
    cursor: wait;
    animation: none;
}
.${olga5_class}.${css._clsError} {
    opacity: 0.5;
    outline: 2px dotted black;
    cursor: help;
}
.${olga5_class}.${css._clsLoad} {
    opacity: 0.5;
    outline: 1px dotted black;
    cursor: wait;
}
img.${olga5_class}:not(.${css._clsFreeImg}) {
    background-color: transparent;
    position: inherit;
    padding: 0 !important;
    vertical-align: bottom;
    border-radius: 50%;
    box-shadow: none !important;
    animation: none;
    max-height: 28px;
    max-width:  28px;
}
img.${olga5_class}.${css._clsPlay} {
    animation: olga5_sndImgSwing 2s infinite linear;
}
@keyframes olga5_viewTextWash {
    100%,0% {background-color: white;color: aqua;}
    75%,25% {background-color: gold;}
    50% {background-color: coral;color: blue;    }
}
@keyframes olga5_sndImgSwing {
    100%,50%,0% {transform: rotateZ(0deg);}
    25% {transform: rotateZ(33deg);}
    75% {transform: rotateZ(-33deg);}
}
`
    }

    wshp.CSS = CSS
    Object.assign(wshp.CSS, css)
    wshp.CSS.NewClassList = function (snd) { // искусственное создание classList'а
        const cls = [],
            ss = snd.className.split(' ')
        for (const si of ss) {
            const s = si.trim()
            if (s.length > 0) cls.push(s)
        }
        cls.snd = snd
        cls.contains = function (nam) {
            return this.includes(nam)
        }
        cls.remove = function (nam) {
            const k = this.indexOf(nam)
            if (k >= 0) {
                this.splice(k, 1)
                this.snd.className = this.join('')
            }
        }
        cls.add = function (nam) {
            if (!this.includes(nam) ) {
                this.push(nam)
                this.snd.className = this.join('')
            }
        }
        return cls
    }
    console.log(`}---< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/CSS.js`)
})();
/* global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5snd/Imgs ---
    "use strict"
    const olga5_modul = 'o5snd'

    if (!window.olga5) window.olga5 = []
    if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

    function Imgs(c) {
        let imgs = null
        const C = c,
            wshp = window.olga5[olga5_modul],
            a = document.createElement('a'),
            FullUrl = (url) => {
                if (url.match(/https?:/i)) return url
                else {
                    a.href = url
                    return a.href
                }
            },
            GetImgForRef = (ref) => new Promise((Resolve, Reject) => {
                if (!ref)
                    Reject(`Неопределённая 'ref'-ссылка`)

                const url = FullUrl(ref),
                    maps = imgs.maps,
                    map = maps.get(url)

                if (map) Resolve({ img: map.img, new: false })
                else {
                    /*	https://codeengineered.com/blog/09/12/performance-comparison-documentcreateelementimg-vs-new-image/
                    For now I’m going to continue to use document.createElement('img'). 
                    Not only is this the w3c recommendation but it’s the faster method in IE8, the version users are slowly starting to adopt.
                    */
                    if (C.consts.o5debug > 2)
                        console.log(`olga5_Imgs создание нового для url=${url}`)

                    const nimg = document.createElement('img')
                    Object.assign(nimg, { src: url, importance: 'high', loading: 'eager', crossOrigin: null })
                    maps.set(url, { img: nimg, err: '' })

                    nimg.addEventListener('load', () => {
                        if (C.consts.o5debug > 0)
                            C.ConsoleInfo(`GetImgForRef: загружен url= ${url}`)
                        if (url.trim() == '')
                            alert('url=?')

                        Resolve({ img: nimg, new: true })
                    }, { once: true })

                    nimg.addEventListener('error', e => {
                        Reject(`GetImgForRef: для url=${url}- ошибка ${e.message ? e.message : 'не определен (?)'}`)
                    }, { once: true })
                }
            }),
            RegiBySrc = (maps, img) => new Promise((Resolve, Reject) => {
                if (img && img.src) {
                    const src = img.src,
                        url = FullUrl(src),
                        s = url == src ? '' : `(src=${src})`,
                        isinmap = maps.get(url)

                    if (!isinmap)
                        maps.set(url, { img: img.cloneNode(true), err: '' })
                    if (C.consts.o5debug > 1)
                        console.log(`olga5_Imgs ${isinmap ? 'повтор' : 'добавлен'} url=${url} для img.id='${img.id}' ${s}`)
                }
                else
                    console.error(`olga5_Imgs : попытка добавить` + (img ? ` пустой src для img.id='${img.id}'` : ` пустой  <img>`))
            }),
            CopyStyle = (img, newimg) => {
                newimg.className = img.className
                if (img.attributes.style) {
                    if (!newimg.attributes.style)
                        newimg.setAttribute('style', {})
                    newimg.attributes.style.nodeValue += img.attributes.style.nodeValue
                }
            },
            MakeImgPlay = (aO5, SetEventListeners) => { //  StartSound, 
                GetImgForRef(aO5.parms.image_play).then(nimg => {
                    console.log(`MakeImgPlay.GetImgForRef.then() для ='${aO5.name}' с image_play=${aO5.parms.image_play}`)
                    const img = aO5.image.stop,
                        newimg = nimg.new ? nimg.img : nimg.img.cloneNode(false)

                    Object.assign(newimg, {
                        id: (img.aO5snd.id ? img.aO5snd.id : C.MakeObjName(img.aO5snd)).replace('_stop', '') + '_play',
                        aO5snd: img.aO5snd, // тут НЕ делать новый, в создавать ссылку
                        title: img.aO5snd.title,
                    })
                    CopyStyle(img, newimg)
                    aO5.image.play = newimg

                    SetEventListeners(newimg)

                    newimg.style.display = 'none'
                    img.parentNode.insertBefore(newimg, img.nextSibling)
                    if (aO5.sound.state != 'stop') {
                        aO5.image.stop.style.display = 'none'
                        aO5.image.play.style.display = aO5.modis.dspl
                    }
                    // if (aO5.modis.over)
                    //     StartSound(aO5)
                }).
                    catch(err => {
                        C.ConsoleError(`MakeImgPlay.${err}`)
                    })
            },
            SetImgByRef = (img, ref) => { // подставить новый nimg вместо img с 'недествительным' src	
                GetImgForRef(ref).then(nimg => {
                    const newimg = nimg.new ? nimg.img : nimg.img.cloneNode(true)
                    Object.assign(newimg, {
                        // id: (img.id ? img.id : img.aO5snd.name) + '_stop',
                        id: img.id, // оставляю тот же id
                        aO5snd: Object.assign({}, img.aO5snd), // тут - НОВЫЙ aO5
                        title: img.aO5snd.title,
                    })
                    newimg.name = C.MakeObjName()
                    const aO5 = newimg.aO5snd

                    Object.assign(aO5, { snd: newimg, id: newimg.id })
                    CopyStyle(img, newimg)
                    aO5.image.stop = newimg

                    aO5.waitActivate(newimg)

                    img.parentNode.insertBefore(newimg, img.nextSibling)
                    img.parentNode.removeChild(img)
                    img = null
                }).catch(err => {
                    C.ConsoleError(`SetImgByRef.${err}`)
                })
            },
            PrepImage = (aO5, btns, TryEncode) => {
                const urlatr = {},
                    snd = aO5.snd,
                    iatr = 'image_play',
                    ori = wshp.OriForTag(snd, '', iatr)

                if (ori.url) {
                    const url = TryEncode(ori, snd)
                    aO5.parms.image_play = url // а сам aO5.image.play будет (при задании 'image_play') создан лишь при обращении
                }
                else {
                    const iplay = snd.getAttribute(iatr)
                    if (iplay) {
                        const url = TryEncode({ atr: iatr, url: iplay }, snd)
                        aO5.parms.image_play = url
                    }
                    else
                        if (btns.play)
                            aO5.parms.image_play = btns.play
                }

                Object.assign(ori, wshp.OriForTag(snd, 'src', ''))

                if (ori.url) {
                    const url = TryEncode(ori, snd),
                        src = snd.getAttribute('src')

                    if (url && src != url) {
                        SetImgByRef(aO5.snd, url)
                        Object.assign(urlatr, { snd: aO5.name, atr: 'src', url: url, 'ориг.': ori.url })

                    } else
                        aO5.waitActivate(aO5.image.stop)
                }
                else
                    if (btns.stop) SetImgByRef(aO5.snd, btns.stop)
                    else
                        errs.Add(aO5.name, 'PrepImage()', `тег <img>`, '', `Нет вариантов url'а и отсутствует 'btn_stop'`)

                if (ori.atr == 'data-src' || ori.atr == '_src')
                    snd.removeAttribute(ori.atr)	// чтоб другие модули не повторяли

                return urlatr
            }

        class Imgs {
            constructor() { this.maps = new Map() }
            makeImgPlay = (aO5, StartSound, CallStartSound, CallStopSound) => MakeImgPlay(aO5, StartSound, CallStartSound, CallStopSound)
            regiBySrc = img => RegiBySrc(this.maps, img)
            prepImage = (aO5, btns, TryEncode) => PrepImage(aO5, btns, TryEncode)
        }
        imgs = new Imgs()
        return imgs
    }

    window.olga5[olga5_modul].Imgs = Imgs
    console.log(`}---< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/Imgs.js`)
})();
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
				audio.aO5snd = {
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
						audio.aO5snd.url = url
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
								case 'F': if (!snd.classList.contains(wshp.CSS._clsFreeImg))
									snd.classList.add(wshp.CSS._clsFreeImg)
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
/* global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/AO5shp ---
    "use strict"
    const olga5_modul = "o5shp"

    if (!window.olga5) window.olga5 = []
    if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

    let C = null,
        debugids = ['shp_text', 'shp_1÷4']
    const wshp = window.olga5[olga5_modul],
        W = window.olga5.find(w => w.modul == olga5_modul), // так делать во всех подмодулях 
        MyRound = (s) => { return Math.round(parseFloat(s)) },
        SetClick = (aO5, clk, next) => {
            if (next) aO5.act.underClick = clk
            else {
                aO5.act.wasClick = clk
                aO5.fix.iO5up = clk ? aO5.fix.iO5 : null
                aO5.cart.style.zIndex = clk ? aO5.cls.minIndex : aO5.cls.zIndex
            }
            for (const iO5 of aO5.aO5s) {
                iO5.act.underClick = clk
                SetClick(iO5, clk, true)
            }
            window.olga5.o5shp.DoScroll(aO5.cls.aO5o, Date.now() + Math.random())
        },
        Show = (aO5) => {
            aO5.act.dspl = true
            aO5.cart.style.display = ''
        },
        Hide = (aO5) => {
            aO5.act.dspl = false
            aO5.cart.style.display = 'none'
            for (const iO5 of aO5.aO5s) Hide(iO5)
        },
        DoFixV = (aO5, iO5) => {
            const posC = aO5.posC,
                putV = aO5.cls.putV,
                hovered = aO5.hovered

            if (putV == 'T') {
                if (iO5) posC.top = iO5.posC.top + iO5.posC.height
                else posC.top = hovered.to.pos.top
            } else {
                const bottom = iO5 ? iO5.posC.top : hovered.to.pos.bottom
                if (iO5) posC.top = iO5.posC.top + iO5.posC.height
                else posC.top = bottom - posC.height
            }
            Object.assign(aO5.fix, { putV: putV, iO5: iO5 })
        }

    const clones = [],
        eClone = new window.Event('olga5_cloned'),
        DoShpClick = function (e) {
            const
                MarkClick = (aO5) => {
                    if (aO5.fix.putV == '') {
                        const m = aO5.parents.length,
                            lastParent = m > 0 ? aO5.parents[m - 1] : null
                        if (lastParent && lastParent.aO5shp)
                            MarkClick(lastParent.aO5shp)
                    } else
                        aO5.SetClick(true)
                }

            let shp = e.target
            while (shp && !shp.aO5shp) shp = shp.parentElement

            if (shp && shp.aO5shp) {
                if (shp.onclick) shp.onclick(e)
                MarkClick(shp.aO5shp)
            }
        },
        ChangeIDshdw = (aO5) => {
            const nam = '_shdw',
                ids = aO5.shdw.querySelectorAll("[id]")
            ids.forEach(id => {
                id.setAttribute('id', id.id + nam)
            })
            // очистка shdw от библиотечных классов
            // ? что тут с классами?            
            if (o5classes == null) {
                o5classes = []
                for (const scrpt of C.scrpts)
                    if (scrpt.act.W && scrpt.act.W.class) // если скрипт уже подгружен (т.е. он - перед o5shp.js)
                        o5classes.push(scrpt.act.W.class)
            }
            const classList = aO5.shdw.classList
            for (const c of classList)
                if (o5classes.includes(c.split(':')[0]))
                    classList.remove(c)
        },
        SetClasses = (aO5) => {
            for (const nam of ['cart', 'gask', 'shdw']) {
                const obj = aO5[nam]

                // if (nam != 'shdw')
                obj.classList.remove(wshp.class)
                obj.classList.add(wshp.class + '_' + nam)

                obj.id = aO5.shp.id + '_' + nam
                obj.aO5shp = aO5 // чтобы найти при обработке клика
            }
            if (isStart < 0) {
                const cs = document.getElementsByClassName(C.olga5_Start)
                isStart = (cs && cs.length > 0) ? 1 : 0
            }
            if (isStart > 0) {
                aO5.gask.classList.add(C.olga5_Start)
                C.ClearOwners()
            }
        },
        ReplaceProps = (aO5) => {
            const shp = aO5.shp,
                shdw = aO5.shdw,
                gask = aO5.gask,
                cart = aO5.cart,
                nst = aO5.nst

            aO5.addSize = (() => {
                const GPV = nam => { return MyRound(nst.getPropertyValue(nam)) },
                    pW = GPV('padding-left') + GPV('padding-right'),
                    pH = GPV('padding-top') + GPV('padding-bottom'),
                    bW = GPV('border-left-width') + GPV('border-right-width'),
                    bH = GPV('border-top-width') + GPV('border-bottom-width')
                return { w: pW + bW, h: pH + bH }
            })()

            if (aO5.cls.dirV == 'D') shdw.style.height = '0.1px' // на экране НЕ должно занимать месо
            // const overflowY = nst.getPropertyValue('overflow-y'),
            //     overflowX = nst.getPropertyValue('overflow-x') 
            gask.style.overflowY = 'visible'
            gask.style.overflowX = 'visible'
            cart.style.overflowY = (shp.style.overflowY != '') ? shp.style.overflowY : 'hidden'// (overflowY && overflowY!='auto'?overflowY:'hidden')
            cart.style.overflowX = (shp.style.overflowX != '') ? shp.style.overflowX : 'hidden'// (overflowX && overflowX!='auto'?overflowX:'hidden')

            // shdw.style.opacity = 0

            for (const excl of [// тут НЕ должно быть сокращений типа margin='0, 0, 0, 0'!
                // { nam: 'cursor', val: '' },
                { nam: 'position', val: 'absolute' },
                // { nam: 'height', val: '-webkit-fill-available' },
                // { nam: 'width', val: '-webkit-fill-available' },
                { nam: 'left', val: '0px' },
                { nam: 'top', val: '0px' },
                { nam: 'margin-top', val: '0px' },
                { nam: 'margin-right', val: '0px' },
                { nam: 'margin-bottom', val: '0px' },
                { nam: 'margin-left', val: '0px' },
                { nam: 'margin', val: '0' },
                { nam: 'bottom', val: '' }, { nam: 'right', val: '' }, { nam: 'opacity', val: '1' },
            ])
                shp.style[excl.nam] = excl.val

            shp.style.display = 'block'

            const props = ['outline-color', 'outline-offset', 'outline-style', 'outline-width', 'zoom', 'transform']
            for (const prop of props) { // перестановка свойств в контейнер
                const wi = nst.getPropertyValue(prop)
                if (wi && wi.length > 0) {
                    shp.style[prop] = ''
                    cart.style[prop] = wi
                }
            }

            const posC = aO5.shdw.getBoundingClientRect()
            Object.assign(cart.style, {
                width: (posC.width) + 'px',
                height: (posC.height) + 'px',
                left: (posC.left) + 'px',
                top: (posC.top) + 'px',
                display: '',
            })
        },
        Clone = function (aO5) {
            const shp = aO5.shp

            clones.push({ shp: shp, ready: false })
            aO5.shdw = shp.cloneNode(true) // клонирую с внутренностями ?!
            ChangeIDshdw(aO5)

            aO5.gask = document.createElement('div') // чтобы создать требуемое (для shp) позиционирование
            aO5.cart = document.createElement('div')
            aO5.cart.pO5 = null

            aO5.shdw.style.opacity = 1 // после первого OnScroll или OnResize все будут = 0
            // aO5.cart.style.opacity = 0 // после первого OnScroll или OnResize все будут = 1

            SetClasses(aO5)
            // ChangeIDshdw(aO5)

            ReplaceProps(aO5)

            aO5.shp.parentNode.replaceChild(aO5.shdw, aO5.shp)  // д.б. после ReplaceProps(aO5)
            aO5.gask.appendChild(aO5.shp)

            aO5.cart.appendChild(aO5.gask)
            C.AppendChild(document.body, aO5.cart)

            Object.seal(aO5.cart)
            Object.seal(aO5.gask)
            Object.seal(aO5.posW)
            Object.seal(aO5.posC)
            Object.seal(aO5.posS)

            Object.freeze(aO5)

            if (W.consts.o5debug > 2)
                console.log('----------------- aO5 ----  ' + aO5.name)
            aO5.shp.addEventListener('dblclick', DoShpClick, { capture: true, passive: true })
            aO5.shp.addEventListener(eClone.type, IsCloned, { once: true })

            eClone.aO5shp = aO5
            aO5.shp.dispatchEvent(eClone)
        },
        IsCloned = e => {
            const aO5 = e.aO5shp
            clones.find(clone => clone.shp === aO5.shp).ready = true

            wshp.CloneAO5s(aO5.aO5s)
        }

    class AO5shp {
        constructor(shp, cls) {
            this.name = window.olga5.C.MakeObjName(shp)
            this.id = shp.id
            this.shp = shp
            this.prev = shp.parentElement
            this.nst = window.getComputedStyle(shp)
            Object.assign(this.cls, cls)

            Object.seal(this.cls)
            Object.seal(this.old)
            Object.seal(this.addSize)
            Object.seal(this.act)
            Object.seal(this.fix)
            Object.seal(this.hovered)
            Object.seal(this.located)
            Object.seal(this.posW)
            Object.seal(this.posC)
            Object.seal(this.posS)
            Object.seal(this)
        }
        name = '' // повтор - чтобы было 1-м в отладчике
        aO5s = [] // перечень включенных в этот aO5
        cls = { kill: false, dirV: '', putV: 'T', alive: false, nest: -2, level: 0, zIndex: 0, minIndex: 0, aO5o: [], pitch: 'S', }
        old = { hovered: { to: null, located: { to: null } }, located: { to: null } } //  для отладки: зраненеие предыдущих контейнеров
        addSize = { w: 0, h: 0 }
        act = { dspl: true, wasKilled: false, wasClick: false, underClick: false, pushedBy: null, }
        fix = { putV: '', iO5: null, iO5up: null }
        hovered = { act: 'hovered', attr: '', asks: [], to: null, le: null, ri: null, bo: null }
        located = { act: 'located', attr: '', asks: [], to: null, le: null, ri: null, bo: null }
        posW = { top: 0, left: 0, height: 0, width: 0 }
        posS = { top: 0, left: 0, height: 0, width: 0 }
        posC = { top: 0, left: 0, height: 0, width: 0, z: 1, zheight: 0, zwidth: 0 } // добален z==zoom

        cart = null
        gask = null
        shdw = null

        Show = () => Show(this)
        Hide = () => Hide(this)
        Clone = () => Clone(this)
        DoFixV = (iO5) => DoFixV(this, iO5)
        SetClick = (clk) => SetClick(this, clk)
    }

    // --------------------------------------------------------------------- //    
    let o5classes = null,
        isStart = -1
    Object.assign(wshp, {
        AO5shp: () => {  // просто д.б. функция с именем модуля!- иначе будет пытаться подгружать этот скрипт 
            console.log('----------------- aO5 ----  ' + aO5.name)
        },
        MakeAO5: (shp, cls, PO5) => {
            C = window.olga5.C
            shp.aO5shp = new AO5shp(shp, cls)
            const aO5 = shp.aO5shp
            let pO5 = aO5.prev.pO5
            if (!pO5) {
                // console.log('--++ ' + C.MakeObjName(aO5.prev))
                aO5.prev.pO5 = new PO5(aO5.prev, aO5)
                pO5 = aO5.prev.pO5
            }
            else if (W.consts.o5debug > 0)
                pO5.PutBords(pO5, "FillBords: взял для '" + aO5.name + "' => ")
            pO5.aO5s.push(aO5)

            const prevs = pO5.prevs,
                parent = prevs.find(parent => parent.aO5shp),
                own = parent ? parent.aO5shp : null
            if (own)
                for (const parent of prevs) {
                    const hasown = parent.pO5.owns.own
                    parent.pO5.owns.own = own
                    if (parent.aO5shp || hasown) break
                }

            (own || wshp).aO5s.push(aO5)

            const tagnama = ['img'],
                tagnams = tagnama.join(','),
                tag1 = Array.from(shp.querySelectorAll(tagnams)),
                tag2 = tagnama.includes(shp.tagName.toLowerCase()) ? [shp] : [],
                tags = tag1.concat(tag2),
                errs = [],
                TagLoad = (e) => {
                    // console.log('tagnama 3', e.target)
                    window.dispatchEvent(new window.Event('olga5_update'))
                }
            for (const tag of tags) {
                // console.log('tagnama 1', tag.id)
                if (!(tag.complete && tag.naturalHeight !== 0)) {
                    const td = C.TagDes(tag, 'src', errs)
                    if (td) {
                        if (td.trans) { // !url.match(/[\/\.+]/)) {
                            const wref = C.DeCodeUrl(C.urlrfs, td.orig)
                            if (wref.err) {
                                errs.push({ tag: C.MakeObjName(tag), ref: td.orig, txt: wref.err })
                                // C.ConsoleError(`Неопределён '${td.orig}' в теге ${nam}`)
                                continue
                            } else
                                tag.setAttribute('src', wref.url)
                        }
                        tag.addEventListener('load', TagLoad)
                    }
                }
            }
            if (errs.length > 0)
                C.ConsoleError(`AO5shp: ошибки в тегах `, errs.length, errs)
        },
        CloneAO5s: aO5s => {
            C = window.olga5.C
            for (const aO5 of aO5s)
                aO5.Clone()

            if (!clones.find(clone => !clone.ready)) {
                if (W.consts.o5debug > 2)
                    console.log(`----------------- CloneAO5s: all  done -----------`)
            }
        }
    })

    console.log(`}---< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/AO5shp.js`)
})();
/* global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {              // ---------------------------------------------- o5shp/DoInit ---
    "use strict"
    const olga5_modul = "o5shp"

    if (!window.olga5) window.olga5 = []
    if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

    let C = null,
        o5debug = 0,
        debugids = []  // 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'        

    const wshp = window.olga5[olga5_modul],
        W = window.olga5.find(w => w.modul == olga5_modul), // так делать во всех подмодулях 
        IsFloat001 = (s) => { return Math.abs(parseFloat(s) > 0.01) },
        prevsPO5 = {},
        MyJoinO5s = (aO5s) => {
            let s = ''
            for (const aO5 of aO5s) s += (s ? ', ' : '') + aO5.name
            return s
        },
        FillBords = (pO5, strt) => { // РЕКУРСИЯ !
            if (pO5.prevs.length > 0)
                return

            pO5.prevs.push(pO5.current)
            if (pO5.isBody || pO5.current.aO5shp) {
                if (o5debug > 1) console.log("FillBords:  " + strt + " == конец")
                Object.assign(pO5.cdif, { ct: true, cl: true, cr: true, cb: true })
            }
            else {
                const prev = pO5.current.parentElement // не надо ...aO5shp.shdw т.к. ещё не было клонирования
                if (o5debug > 2) console.log("FillBords:  " + strt + " += " + C.MakeObjName(prev))

                if (!prev.pO5) {
                    prev.pO5 = new PO5(prev)
                    FillBords(prev.pO5, strt)
                }
                for (const parent of prev.pO5.prevs)
                    pO5.prevs.push(parent)

                const cc = pO5.colors,
                    cd = pO5.cdif,
                    c = prev.pO5.colors.c

                if (!cd.ct) cd.ct = cc.t != c && cc.t != '#000000'
                if (!cd.ct) cd.ct = cc.b != c && cc.b != '#000000'
                if (!cd.ct) cd.ct = cc.l != c && cc.l != '#000000'
                if (!cd.ct) cd.ct = cc.r != c && cc.r != '#000000'
            }

            if (o5debug > 0) pO5.PutBords(pO5, "FillBords:  " + strt + " +> ")
        }

    class PO5 {
        constructor(current, aO5) {
            this.current = current
            this.id = current.id
            this.name = C.MakeObjName(current)
            this.isBody = current == document.body || current.nodeName == 'BODY'
            this.isDIV = current.tagName == "DIV"
            if (o5debug > 2)
                console.log("создаётся pO5 для '" + this.name + "'")
            FillBords(this, 'pO5=' + this.name + (aO5 ? (' для aO5=' + aO5.name) : ''))
            Object.seal(this.prevs);

            this.PO5Colors(0);

            Object.seal(this.pos);
            Object.seal(this.located);
            Object.seal(this.colors);
            Object.seal(this.scroll);
            Object.seal(this.act);
            Object.seal(this.cdif);
            Object.freeze(this);
        }
        add = { top: 0, left: 0, right: 0, bottom: 0 }
        owns = { own: null }
        aO5s = []
        prevs = []; // всегда содержит самого себя
        located = { to: null, le: null, ri: null, bo: null, timeStamp: 0 } // для тех которые в aO5.hovered
        cdif = { tim: 0, ct: false, cl: false, cr: false, cb: false }
        pos = { tim: 0, top: 0, left: 0, right: 0, bottom: 0, } // пересчитывается при Scroll
        colors = { c: 0, t: 0, l: 0, r: 0, b: 0, }
        scroll = { tim: 0, yesV: false, yesH: false } // пересчитывается при Resize
        PO5Colors = (timeStamp) => {
            const pO5 = this,
                cc = pO5.colors,
                current = pO5.current,
                nst = window.getComputedStyle(current),
                cd = {
                    ct: IsFloat001(nst.borderTopWidth),
                    cl: IsFloat001(nst.borderLeftWidth),
                    cr: IsFloat001(nst.borderRightWidth),
                    cb: IsFloat001(nst.borderBottomWidth),
                },
                CN = (nst, nam) => {
                    const color = nst.getPropertyValue(nam + '-color'),
                        rgb = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i),
                        GRGB = (i) => { return ("0" + parseInt(rgb[i], 10).toString(16)).slice(-2) }
                    return (rgb && rgb.length === 4) ? "#" + GRGB(1) + GRGB(2) + GRGB(3) : ''
                },
                c = CN(nst, 'background')
            for (const bord of ['top', 'left', 'right', 'bottom'])
                pO5.add[bord] = parseFloat(nst.getPropertyValue('border-' + bord + '-width'))
            Object.assign(cc, {
                // tim: timeStamp,
                c: c,
                t: cd.ct ? CN(nst, 'border-top') : c,
                l: cd.cl ? CN(nst, 'border-left') : c,
                r: cd.cr ? CN(nst, 'border-right') : c,
                b: cd.cb ? CN(nst, 'border-bottom') : c,
            })
            Object.seal(cc)
            Object.assign(pO5.cdif, {
                ct: cd.ct ? cc.t != c : false,
                cl: cd.cl ? cc.l != c : false,
                cr: cd.cr ? cc.r != c : false,
                cb: cd.cb ? cc.b != c : false,
            })
        }
        PutBords = (pO5, txt) => {
            let s = '',
                j = pO5.prevs.length
            while (j-- > 0) {
                const bord = pO5.prevs[j],
                    name = bord.pO5 ? bord.pO5.name : C.MakeObjName(bord) // для того pO5 еще только создаётся
                s += (s ? ', ' : '') + name
            }
            if (o5debug > 2)
                console.log(txt + s)
            if (!prevsPO5[pO5.name]) prevsPO5[pO5.name] = s
        }
    }

    Object.assign(wshp, {
        wini: {},
        aO5s: [],
        aO5str: '', // строка рез. вложенности (для демок  и отладки)
        TestCC3a: function (pO5) { // для теста CC3a в alltst.js
            pO5.PO5Colors(0)
            FillBords(pO5, 'pO5=' + C.MakeObjName(pO5.current))
        },
        Finish: () => {
            if (!wshp.wini.finish) {
                const hash = C.save.hash
                if (hash) { // делать именно когда загружен документ (например - тут)
                    const tag = document.getElementById(hash)
                    if (tag) tag.scrollIntoView({ alignToTop: true, block: 'start', behavior: "auto" })
                    else
                        C.ConsoleError(`Неопределён hash= '${hash}' в адресной строке`)
                }
                wshp.wini.finish = true
                console.timeEnd(wshp.timera)
                window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: olga5_modul } }))
            }
        },
        DoInit: function ([E, clasn, timera]) { // тут 'E' не используется
            C = window.olga5.C
            o5debug = W.consts.o5debug
            wshp.timera = timera
            const timeInit = Date.now() + Math.random(),
                // HideShdws = (aO5s) => {
                //     if (!wshp.wini.hide) {
                //         for (const aO5 of aO5s) {
                //             console.log('opacidy for id= ' + aO5.id)
                //             aO5.shdw.style.opacity = 0
                //             HideShdws(aO5.aO5s)
                //         }
                //     }
                //     wshp.wini.hide = true
                // },
                OnScroll = function (e) {
                    // HideShdws(wshp.aO5s)
                    if (wshp.wasResize) { //  && !wshp.extraInit) {
                        const pO5 = (e.target == document ? document.body : e.target).pO5
                        if (pO5) {
                            const aO5s = (pO5.owns.own ? pO5.owns.own : wshp).aO5s
                            wshp.DoScroll(aO5s, e.timeStamp)
                        }
                    }
                },
                OnReSize = function (e) {
                    // HideShdws(wshp.aO5s)
                    wshp.DoResize(wshp.aO5s, e)
                },
                errs = [],
                MakeAO5s = (mtags) => {
                    const
                        DecodeType = (quals) => {
                            const cls = { level: 0, kill: false, pitch: 'S', alive: false, dirV: '', putV: 'T' }
                            const errs = []
                            for (const qual of quals) {
                                const tt = qual.replaceAll(/-/g, '=').split('='),
                                    c = tt[0].substr(0, 1).toUpperCase()
                                if (c != '' && !isNaN(c)) cls.level = Number(c)
                                else if (c == 'N') cls.none = true
                                else if (c == 'K') cls.kill = true
                                else if (c == 'P') cls.pitch = 'P' // сталкивает предыдущий
                                else if (c == 'S') cls.pitch = 'S' // сдвигает предыдущий
                                else if (c == 'O') cls.pitch = 'O' // наезжает на предыдущий
                                else if (c == 'A') cls.alive = true
                                else if (c == 'D' || c == 'U') cls.dirV = c
                                else if (c == 'B' || c == 'T') cls.putV = c
                                else errs.push(`'${c}'`)
                            }
                            if (!cls.dirV && !cls.kill) cls.dirV = 'U'
                            return { cls: cls, err: errs.length ? (`неопр. коды: ` + errs.join(', ')) : '' }
                        },
                        ClearO5s = (aO5s) => { // рекурсия
                            if (aO5s && aO5s.length > 0) {
                                for (const aO5 of aO5s)
                                    ClearO5s(aO5.aO5s)
                                aO5s.splice(0, aO5s.length)
                            }
                        }

                    wshp.aO5str = ''
                    ClearO5s(wshp.aO5s)

                    for (const mtag of mtags) {
                        const dt = DecodeType(mtag.quals),
                            shp = mtag.tag

                        if (dt.err) errs.push({ shp: C.MakeObjName(shp), className: mtag.origcls, err: dt.err })

                        // shp.classList.remove(mtag.origcls)// ВСЕГДА убираю квалификаторы из наименования класса
                        // shp.classList.add(clasn)
                        if (!dt.cls.none)
                            wshp.MakeAO5(shp, dt.cls, PO5)
                    }

                    if (errs.length > 0) C.ConsoleError("Ошибки классов подвисабельных объектов", errs.length, errs)

                    errs.splice(0, errs.length)
                    mtags.splice(0, mtags.length)
                },
                SetLevelsAll = (aO5s) => { // сортировки и формирование
                    let aO5str = ''
                    const
                        SetLevels = (aO5s, nest) => {
                            if (typeof wshp.nests[nest] === 'undefined') wshp.nests[nest] = []
                            if (o5debug > 2) console.log('  >> SetLevels (' + nest + '): aO5s=' + MyJoinO5s(aO5s));
                            for (const aO5 of aO5s) {
                                aO5.cls.nest = nest // только для показа в тестах
                                wshp.nests[nest].push(aO5)
                            }
                            aO5s.nest = nest
                            const slevel = ''.padEnd(nest * 4),
                                pr1 = '[(<\\',
                                pr2 = '])>/'
                            aO5str += (nest > 3 ? '|' : pr1[nest]) + nest + ' '
                            for (const aO5 of aO5s) {
                                aO5str += aO5.name + (aO5.aO5s.length > 0 ? ':' : ' ')
                                if (aO5.aO5s.length > 0) SetLevels(aO5.aO5s, nest + 1)
                            }
                            aO5str += (nest > 3 ? '|' : pr2[nest]) + ' '
                        }

                    SetLevels(aO5s, 0)

                    if (o5debug > 1) console.log("\t\t  >> DoResize " + ('' + Date.now()).substr(-6) + ", вложенности объектов: " + aO5str + "")
                    return aO5str
                },
                DoShps = () => {
                    const mtags = C.GetTagsByClassName(wshp.class, olga5_modul)
                    if (W.consts.o5debug > 0) {
                        const sels = []
                        for (const mtag of mtags)
                            sels.push({ id: mtag.tag.id, class: mtag.tag.className, tag: mtag.tag.tagName, })
                        if (sels.length > 0) C.ConsoleInfo(`o5shp: найдены селекторы:`, sels.length, sels)
                        else C.ConsoleError(`o5shp: НЕ найдены селекторы с '${wshp.class}'`)
                    }

                    MakeAO5s(mtags)
                    wshp.nests = []
                    wshp.aO5str = SetLevelsAll(wshp.aO5s)

                    if (wshp.aO5s.length > 0)
                        wshp.CloneAO5s(wshp.aO5s)
                    else
                        wshp.Finish()

                    window.setTimeout(() => {
                        wshp.DoResize(wshp.aO5s)
                    }, 1)
                }

            document.addEventListener('resize', OnReSize)
            document.addEventListener('scroll', OnScroll, true)

            Object.assign(wshp.wini, { finish: false, hide: false })

            if (o5debug) {
                let etimeStamp = 0
                document.addEventListener('click', (e) => { // для отладки  !!!!!!!!!!!!!!!!!!
                    if (e.timeStamp > etimeStamp + 0.1)
                        if (!e.target.classList.contains('olga5_shp')) OnReSize()
                    etimeStamp = e.timeStamp
                })
            }
            window.setTimeout(DoShps, 1)
        }
    })

    window.addEventListener('o5first_scroll', (e) => {
        if (o5debug) {
            const rez = [],
                ResultInfo = (aO5s, tab) => { //подготовка итоговой сводки
                    for (const aO5 of aO5s) {
                        const pO5 = aO5.prev.pO5
                        let s = '',
                            j = pO5.prevs.length
                        while (j-- > 0) {
                            if (!pO5.prevs[j].pO5)
                                alert('!pO5.prevs[j].pO5 ?')
                            s += (s ? ', ' : '') + pO5.prevs[j].pO5.name
                        }
                        rez.push({ aO5: tab + aO5.name, pO5: pO5.name, prevs: s })
                        if (aO5.aO5s.length > 0)
                            ResultInfo(aO5.aO5s, tab + '+---')
                    }
                }

            ResultInfo(wshp.aO5s, '')

            if (rez.length > 0) C.ConsoleInfo('Вложенности объектов: ' + wshp.aO5str + ' ', rez.length, rez)
            else C.ConsoleError('Нет ссылок `shp`, т.е. нет тегов с классом : ', wshp.class)
            if (prevsPO5.length > 0)
                C.ConsoleInfo('Вложенности prevs-контейнеров ', null, prevsPO5)
        }
        wshp.Finish()
    }, { once: true, capture: true })

    window.addEventListener('olga5_update', (e) => {
        wshp.DoResize(wshp.aO5s)
    }, { once: true, capture: true })

    console.log(`}---< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/DoInit.js`)
})();

/* global window, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoResize ---
    "use strict"
    const olga5_modul = "o5shp"

    if (!window.olga5) window.olga5 = []
    if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

    let C = null,
        o5debug = 0,
        debugids = ['head_32']  //  shp_5÷8 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'
    const wshp = window.olga5[olga5_modul],
        errs = [],
        MyRound = (s) => { return Math.round(parseFloat(s)) },
        IsInClass = (classList, clss) => {
            for (const cls of clss)
                if (cls != '' && !classList.contains(cls)) return false
            return true
        },
        MyJoinO5s = (aO5s) => {
            let s = ''
            for (const aO5 of aO5s) s += (s ? ', ' : '') + aO5.name
            return s
        },
        ReadAttrsAll = (aO5s, showerr) => {
            let Error = C.ConsoleError
            const 
                atribs = [
                    { atr: 'olga5_frames', cod: 'hovered', def: 's' },
                    { atr: 'olga5_owners', cod: 'located', def: 'b' }],
                AddNew = (asks, ask) => {
                    const a = Object.assign({}, ask);
                    Object.seal(a);
                    asks.push(a);
                },
                ChecksReadAttrs = (aO5, code, attr, errs) => {
                    const typs = 'CINSB',
                        blng = aO5[code],
                        ss = attr ? attr.split(/[,;]/g) : ['']
                    if (debugids.includes(aO5.name))
                        if (debugids);
                    blng.asks.splice(0, blng.asks.length)
                    blng.attr = attr

                    let i = ss.length
                    while (--i >= 0) {
                        const s = ss[i].trim()
                        if (s.length > 0) {
                            const C = window.olga5.C,
                                cc = s.split(':'),
                                u = cc[0].trim(),
                                t = u.length > 0 ? u[0].toUpperCase() : '?'
                            if (!typs.includes(t))
                                errs.push({ name: aO5.name, str: s, err: "тип ссылки не начинается одним из '" + typs + "'" })
                            else {
                                const cod = cc.length > 1 ? cc[1].trim() : '',
                                    num = cc.length > 2 ? MyRound(cc[2]) : 1,
                                    fix = cc.length > 2 ? cc[2].toUpperCase() == 'F' : false

                                AddNew(blng.asks, { typ: t, cod: cod, num: num, nY: num, ok: false, fix: fix, bords: [] })
                            }
                        }
                    }
                },
                ReadAttrs = (aO5s, atrib) => {
                    // if (o5debug > 1) console.log('  >> ReadAttrs (' + atrib.cod + ') для объектов [' + MyJoinO5s(aO5s) + ']');
                    let prevN = '' // значене этого атрибута у предыдущего тега

                    for (const aO5 of aO5s) { // определение вложенностей shp's друг в друга
                        // if (!aO5.shp.attribute) 
                        // console.log()
                        const shp = aO5.shp,
                            atrX = shp.getAttribute(atrib.atr),
                            atrN = atrX || (shp.attributes['olga5_repeat'] ? prevN : ''),
                            attr = atrN.length > 0 ? atrN : atrib.def

                        if (atrN) prevN = atrN
                        ChecksReadAttrs(aO5, atrib.cod, attr, errs)

                        if (aO5[atrib.cod].asks.length == 0) {
                            AddNew(aO5[atrib.cod].asks, { typ: atrib.def.toUpperCase(), cod: '', num: 1, nY: 1, ok: false, fix: false, bords: [] })
                            errs.push({ name: aO5.name, str: attr, err: "нету [id, класс, тип, к-во]" })
                            Error = C.ConsoleAlert
                        }

                        if (aO5.aO5s.length > 0) ReadAttrs(aO5.aO5s, atrib)
                    }
                }

            for (const atrib of atribs) {
                ReadAttrs(aO5s, atrib)
            }
            if (errs.length > 0 && showerr)
                Error("Ошибки в атрибутах  для тегов", errs.length, errs)
        },
        SortAll = (aO5s) => { // сортировка и индексация
            let aO5str = ''
            const
                SortLevel = (aO5s) => {
                    const nest = aO5s.nest
                    if (o5debug > 2) console.log('  >> SortLevels (' + nest + '): aO5s=' + MyJoinO5s(aO5s));
                    for (const aO5 of aO5s) {
                        const pos = aO5.shdw.getBoundingClientRect()
                        Object.assign(aO5.posW, { top: pos.top, left: pos.left, width: pos.width, height: pos.height })
                    }
                    aO5s.sort((a1, a2) => { // для вызовов (для работы)
                        const i1 = Math.round(parseFloat(a1.posW.top)),
                            i2 = Math.round(parseFloat(a2.posW.top))
                        return (i1 != i2) ? (i1 - i2) : (a1.cls.level - a2.cls.level)
                    })

                    let minIndex = 10000 + (nest + 1) * 100,
                        z = minIndex
                    for (const aO5 of aO5s) {
                        aO5.cart.style.zIndex = ++z
                        Object.assign(aO5.cls, { minIndex: minIndex, zIndex: z, aO5o: aO5s })
                    }
                    if (aO5s.length > 0)
                        for (const aO5 of aO5s) SortLevel(aO5.aO5s)
                }

            SortLevel(aO5s)

            if (o5debug > 2) console.log("\t\t  >> DoResize " + ('' + Date.now()).substr(-6) + ", вложенности объектов: " + aO5str + "")
        },

        FillBlngsAll = function (aO5s, showerr, e, timeStamp) {
            const errs = [],            
                o5blog = window.olga5.find(w => w.modul == 'o5blog'),
                AskScrolls = (pO5) => {
                    const minScrollW = 3,
                        current = pO5.current,
                        nst = window.getComputedStyle(current),
                        dw = minScrollW + MyRound(nst.borderLeftWidth) + MyRound(nst.borderRightWidth) + MyRound(nst.paddingLeft) + MyRound(nst.paddingRight),
                        dh = MyRound(nst.borderTopWidth) + MyRound(nst.borderBottomWidth) + MyRound(nst.paddingTop) + MyRound(nst.paddingBottom)
                    Object.assign(pO5.scroll, {
                        tim: timeStamp,
                        yesV: current.offsetWidth > (current.clientWidth + dw),
                        yesH: current.offsetHeight > (current.clientHeight + dh),
                    })
                },
                FillBlngs = function (aO5s) {
                    const
                        FillAsk = function (aO5, ask, act) {
                            const t = ask.typ,
                                c = (ask.cod || '').trim(),
                                cu = c.toUpperCase(),
                                clss = c.split(/[.,]/),
                                parents = aO5.prev.pO5.prevs,
                                k2 = parents.length

                            if (debugids.includes(aO5.name))
                                if (debugids);
                            for (let k = 0; k < k2; k++) {
                                const parent = parents[k],
                                    pO5 = parent.pO5,
                                    final = pO5.isBody || (!ask.fix && pO5.current.aO5shp)

                                if (t == 'S' && pO5.scroll.tim != timeStamp)
                                    AskScrolls(pO5)

                                ask.ok =
                                    (t == 'I' && pO5.id == c && ask.nY-- <= 1) ||
                                    (t == 'N' && (cu == '' ? final : (parent.nodeName == cu && ask.nY-- <= 1))) ||
                                    (t == 'C' && IsInClass(parent.classList, clss) && ask.nY-- <= 1) ||
                                    (t == 'S' && (final || pO5.scroll.yesV || parent.pO5ext)) || // pO5ext м.б. добавлено из o5blog.js
                                    (t == 'B' && (final || (aO5.cls.dirV != 'D' && pO5.cdif.ct) || (aO5.cls.dirV != 'U' && pO5.cdif.cb)))
                                    // (t == 'B' && (final || (aO5.cls.dirV == 'U' && pO5.cdif.ct) || (aO5.cls.dirV == 'D' && pO5.cdif.cb)))

                                if (ask.ok)
                                    ask.bords.push(...parents.slice(k, ask.fix ? k + 1 : k2))

                                if (ask.ok || final) break
                            }

                            let err = '',
                                rez = ''
                            if (ask.bords.length == 0) {
                                const subst = parents[k2 - 1],
                                    nam = window.olga5.C.MakeObjName(subst),
                                    i = ask.bords.indexOf(nam)
                                if (c != 'olga5_Start_hr' || o5blog)// там определена 'olga5_Start_hr'
                                    errs.push({ aO5: aO5.name, 'для типа': act, 'не найден': (t + ':' + c), 'подставлен': (i < 0 ? '+ ' : '= ') + nam })
                                if (i < 0)
                                    ask.bords.push(subst)
                            }
                        }
                    if (o5debug > 2) console.log('  >> FillBlngs: aO5s=' + MyJoinO5s(aO5s))
                    for (const aO5 of aO5s) {
                        for (const blng of [aO5.hovered, aO5.located]) {
                            for (const ask of blng.asks) {
                                ask.bords.splice(0, ask.bords.length)
                                Object.assign(ask, { nY: ask.num, ok: false })
                            }
                            // if (aO5.id=='shp1' && blng === aO5.located)
                            // console.log('')
                            for (const ask of blng.asks)
                                FillAsk(aO5, ask, blng.act)
                        }
                        if (aO5.aO5s.length > 0) FillBlngs(aO5.aO5s)
                    }
                }

            FillBlngs(aO5s)
            if (errs.length > 0 && showerr)
                C.ConsoleError("При старте " + (e ? ("в '" + e.type + "' для " + e.target) : "(в  'DoResize')") +
                    ": не опр. ссылки на контейнеры ", errs.length, errs)
        }

    let showerr = true
    wshp.DoResize = function (aO5sx, e) { //фактически - д.б. 1 раз. но для отладки - может вызываться повторно
        const timeStamp = Date.now() + Math.random(),
            aO5s = aO5sx || this.aO5s // window.olga5.o5shp.aO5s,

        C = window.olga5.C
        o5debug = o5debug

        ReadAttrsAll(aO5s, showerr)
        SortAll(aO5s)
        FillBlngsAll(aO5s, showerr, e, timeStamp)
        showerr = false

        wshp.wasResize = true
        wshp.DoScroll(wshp.aO5s, timeStamp)
    }
    console.log(`}---< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/DoResize.js`)
})();
/*jshint asi:true  */
/* global window, console */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoScroll ---
    "use strict"
    const olga5_modul = "o5shp"

    if (!window.olga5) window.olga5 = []
    if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

    let C = null,
        timeStamp = 0,
        debugids = ['shp1'] // , 'shp_text' shp1 shp_1÷4 shp_5÷8 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'

    const wshp = window.olga5[olga5_modul],
        W = window.olga5.find(w => w.modul == olga5_modul), // так делать во всех подмодулях 
        datestart = Date.now(),
        CalcParentLocate = (pO5) => {
            if (pO5.isBody) {
                const doc = document.documentElement
                Object.assign(pO5.pos,
                    { tim: timeStamp, top: 0, bottom: doc.clientHeight, left: 0, right: doc.clientWidth })
            }
            else {
                const current = pO5.current,
                    isO5 = current.aO5shp,
                    p = isO5 ? current.aO5shp.posC : current.getBoundingClientRect(),
                    right1 = isO5 ? p.left + p.width : p.right,
                    bottom1 = isO5 ? p.top + p.height : p.bottom,
                    right = isO5 ? p.left + p.width : p.left + current.clientWidth + pO5.add.left,
                    bottom = isO5 ? p.top + p.height : p.top + current.clientHeight + pO5.add.top
                Object.assign(pO5.pos,
                    { tim: timeStamp, top: p.top + pO5.add.top, bottom: bottom, left: p.left + pO5.add.left, right: right })
            }
        },
        CalcParentsLocates = (aO5) => { // пересчитываются размеры всех предков-контейнеров        
            for (const blng of [aO5.hovered, aO5.located])
                for (const ask of blng.asks)
                    for (const parent of ask.bords)
                        if (parent.pO5.pos.tim == timeStamp) break
                        else
                            CalcParentLocate(parent.pO5)
        },
        PrepareBords = (aO5) => {
            const a = { to: null, le: null, ri: null, bo: null },
                Located = (bords, a) => {
                    for (const bord of bords) {
                        const pO5 = bord.pO5,
                            pos = pO5.pos
                        Object.assign(a, {
                            to: ((a.to && a.to.pos.top > pos.top) ? a.to : pO5),
                            le: ((a.le && a.le.pos.left > pos.left) ? a.le : pO5),
                            ri: ((a.ri && a.ri.pos.right < pos.right) ? a.ri : pO5),
                            bo: ((a.bo && a.bo.pos.bottom < pos.bottom) ? a.bo : pO5),
                        })
                    }
                },
                Located1 = (bords, a) => {
                    for (const bord of bords) {
                        const pO5 = bord.pO5,
                            pos = pO5.pos
                        Object.assign(a, {
                            to: ((a.to && a.to.pos.top < pos.top) ? a.to : pO5),
                            le: ((a.le && a.le.pos.left < pos.left) ? a.le : pO5),
                            ri: ((a.ri && a.ri.pos.right > pos.right) ? a.ri : pO5),
                            bo: ((a.bo && a.bo.pos.bottom > pos.bottom) ? a.bo : pO5),
                        })
                    }
                }
            for (const ask of aO5.hovered.asks)
                Located([ask.bords[0]], a)
            Object.assign(aO5.hovered, a)

            Object.assign(a, { to: null, le: null, ri: null, bo: null })

            for (const ask of aO5.located.asks)
                Located(ask.bords, a)
            Object.assign(aO5.located, a)

            for (const hoverMarks of ['to', 'le', 'ri', 'bo']) {
                const pO5 = aO5.hovered[hoverMarks]
                if (pO5.located.timeStamp != timeStamp) { // чтобы не повторяться для одинаковых
                    Located(pO5.prevs, pO5.located)
                    pO5.located.timeStamp = timeStamp
                }
            }
        },
        FixSet = (aO5) => {
            const dirV = aO5.cls.dirV
            if (!dirV) return // это м.б. у kill

            const posW = aO5.posW,
                act = aO5.act
            if (!(act.wasClick || act.underClick || act.pushedBy || act.wasKilled) &&
                (
                    (dirV == 'U' && posW.top < aO5.hovered.to.pos.top && aO5.located.to.pos.top <= aO5.hovered.to.pos.top) ||
                    (dirV == 'D' && posW.top + posW.height < aO5.hovered.bo.pos.bottom)
                )
            ) aO5.DoFixV()
        },
        CheckIsUp = function (k, aO5s) {
            const aO5 = aO5s[k],
                cls = aO5.cls,
                act = aO5.act

            if (!cls.dirV || !act.dspl ||
                act.wasClick || act.underClick || act.pushedBy || act.wasKilled) return

            const posC = aO5.posC,
                posW = aO5.posW,
                minIndex = aO5s[0].cls.zIndex - 1,
                HideByO5 = (iO5) => {
                    iO5.Hide()  // iO5.act.dspl = false
                    iO5.act.pushedBy = aO5
                    iO5.cart.style.zIndex = minIndex
                }
            let i = k
            while (--i >= 0) {
                const iO5 = aO5s[i],
                    iposC = iO5.posC,
                    iposS = iO5.posS
                if (iO5.fix.putV == '' || cls.putV != iO5.cls.putV || posC.left + posC.width < iposC.left || posC.left > iposC.left + iposC.width || !iO5.act.dspl) continue
                if (cls.putV == 'T') {
                    const d = iO5.posC.top + iO5.posC.height - posC.top
                    if (cls.dirV == 'U') { //только при движении вверх
                        if (d > 0) {
                            if (cls.level <= iO5.cls.level) {
                                if (cls.pitch == 'P' || iposC.height <= d) HideByO5(iO5)
                                else
                                    if (cls.pitch == 'S') {
                                        iposC.height -= d
                                        iposS.top = -d
                                    }
                            } else aO5.DoFixV(iO5)
                        }
                    } else
                        if (cls.dirV == 'D') // никаких просто else - всегда проверять!
                            if (posC.top + posC.height > aO5.located.bo.pos.bottom) {
                                if (cls.level <= iO5.cls.level) iO5.Hide()  // iO5.act.dspl = false
                                else aO5.DoFixV(iO5)
                            }
                } else {//                    if (cls.putV == 'B') { // можно и не проверять,
                    if (cls.dirV == 'U' && posW.top < aO5.hovered.to.pos.top) {
                        if (cls.level <= iO5.cls.level) HideByO5(iO5)
                        else aO5.DoFixV(iO5)
                    } else {
                        const b = aO5.hovered.bo.pos.bottom
                        if (cls.dirV == 'D' && posW.top < b) {
                            if (cls.pitch == 'P' || posW.top + posW.height <= 1 + b) HideByO5(iO5)
                            else {
                                if (cls.pitch == 'S') {
                                    iposC.height = iO5.posW.height - (b - posW.top)
                                    if (iposC.height <= 1) iO5.Hide()  // iO5.act.dspl = false
                                } else
                                    if (posW.top + posW.height <= b) aO5.DoFixV(iO5)
                            }
                        }
                    }
                }
            }
        },
        CutBounds = (aO5) => {
            const putV = aO5.cls.putV,
                act = aO5.act,
                posC = aO5.posC,
                top = aO5.located.to.pos.top,
                bT = (putV == 'T') ? Math.max(aO5.hovered.to.located.to.pos.top, top) : top,
                bot = aO5.located.bo.pos.bottom,
                bB = (putV == 'B') ? Math.min(aO5.hovered.bo.located.bo.pos.bottom, bot) : bot,
                bL = aO5.located.le.pos.left, // эти два - без выпендрёжа
                bR = aO5.located.ri.pos.right

            if (debugids.includes(aO5.id))
                if (debugids); // контрольный останов
            if (bT > bB || bL >= bR) {
                if (act.wasClick && act.dspl)
                    aO5.SetClick(false)
                aO5.Hide()
            } else {
                // if (aO5.fix.putV) 
                {
                    if (posC.top < bT) {
                        const d = bT - posC.top
                        if (posC.height <= d) aO5.Hide()
                        else {
                            posC.top = bT
                            posC.height -= d
                            aO5.posS.top -= d
                        }
                    }
                    if (act.dspl && posC.top + posC.height > bB) {
                        if (posC.top >= bB) aO5.Hide()
                        else posC.height -= posC.top + posC.height - bB
                    }
                }
                if (act.dspl && bL > posC.left) {
                    const d = bL - posC.left
                    if (d >= posC.width) aO5.Hide()
                    else {
                        posC.left = bL
                        posC.width -= d
                        aO5.posS.left -= d
                    }
                }
                if (posC.left + posC.width > bR) {
                    if (posC.left >= bR) hide = true
                    else
                        posC.width -= (posC.left + posC.width - bR)
                }
            }
        },
        SavePos = (aO5) => {
            if (aO5.act.dspl) { //  вообще-то тут два вариантта: либо после сталкивания пропадает совсем, либо попадает на своё место, но уже под верхний                  
                const isFix = 'isFix',
                    shp = aO5.shp,
                    posC = aO5.posC,
                    posS = aO5.posS,
                    cart = aO5.cart
                Object.assign(cart.style, {
                    width: (posC.width) + 'px',
                    height: (posC.height) + 'px',
                    left: (posC.left) + 'px',
                    top: (posC.top) + 'px',
                    display: '',
                })
                Object.assign(shp.style, {
                    width: (posS.width - aO5.addSize.w) + 'px', // именно! Если 'offset' то вылезут бордюры,
                    height: (posS.height - aO5.addSize.h) + 'px', // aO5.clientHeight + 'px',
                    top: (posS.top) + 'px',
                    left: (posS.left) + 'px',
                })
                if (aO5.fix.putV) cart.classList.add(isFix)
                else cart.classList.remove(isFix)
                // const isput = aO5.fix.putV
                // const isput = aO5.fix.putV,
                //     isfix = cart.classList.contains(isFix)
                // if ((isput && !isfix) || (!isput && isfix)) cart.classList.add(isFix)
            }
        },
        DebugShowBounds = (aO5s) => {
            const fmt = [12, 26, 18, 12, 1],
                nms = ['shp', 'asks', 'bords', ' to..bo', '',],
                MyRound4 = (s) => { return ('' + Math.round(parseFloat(s))).padStart(4) },
                Store = (blng, name) => {
                    const aa = [],
                        a2 = blng.asks.length,
                        Addaa = (a) => {
                            if (!aa[a]) aa[a] = { bb: [] }
                            if (!aa[a].bb[0]) aa[a].bb[0] = []
                        }

                    Addaa(0)
                    aa[0].bb[0][0] = name
                    for (let a = 0; a < a2; a++) {
                        const ask = blng.asks[a],
                            b2 = ask.bords.length // Math.max(ask.bords.length, 2)

                        Addaa(a)
                        aa[a].b2 = b2
                        aa[a].bb[0][1] = ask.typ + ':' + ask.cod + ':' + ask.num + (ask.fix ? 'F' : '') // rez[a][1]
                        for (let b = 0; b < b2; b++) {
                            const bord = ask.bords[b]
                            if (!aa[a].bb[b]) aa[a].bb[b] = []
                            if (bord) {
                                aa[a].bb[b][2] = bord.pO5.name
                                aa[a].bb[b][3] = '=' + MyRound4(bord.pO5.pos.top) + '..' + MyRound4(bord.pO5.pos.bottom)
                            }
                        }
                    }
                    aa[0].bb[0][4] = '  to= ' + blng.to.name.padEnd(10) + ' ' + MyRound4(blng.to.pos.top) +
                        ',  bo= ' + blng.bo.name.padEnd(10) + ' ' + MyRound4(blng.bo.pos.bottom)

                    for (let a = 0; a < a2; a++) {
                        const b2 = aa[a].b2
                        for (let b = 0; b < b2; b++) {
                            let s = ''
                            for (let j = 0; j < 5; j++)
                                s += (aa[a].bb[b][j] || '').padEnd(fmt[j])

                            if (s.trim())
                                console.log(s)
                        }
                    }
                },
                ShowBounds = (aO5s, checkonly) => {
                    let names = ''
                    for (const aO5 of aO5s)
                        if (aO5.act.dspl)
                            for (const blng of [aO5.hovered, aO5.located]) {
                                const ish = blng === aO5.hovered,
                                    old = ish ? aO5.old.hovered : aO5.old.located,
                                    name = aO5.name + (ish ? '/H' : '/L')

                                if (old.to != blng.to || old.bo != blng.bo) { // показывать только для изменённых
                                    if (checkonly)
                                        names += (names ? ', ' : '') + name
                                    else {
                                        old.to = blng.to
                                        old.bo = blng.bo
                                        Store(blng, name)
                                    }
                                }
                            }
                    return names
                }

            const names = ShowBounds(aO5s, 'checkonly')

            if (names) {
                let s = '   '
                for (let j = 0; j < 5; j++)
                    s += (' ' + nms[j]).padEnd(fmt[j])
                s += ' --> ' + names + '  (t= ' + (Date.now() - datestart) + ')'
                const clr = "background: beige; color: black;border: solid 1px bisque;"
                console.groupCollapsed('%c%s', clr, s)
                ShowBounds(aO5s)
                console.groupEnd()
            }
        },
        Scroll = (aO5s) => {
            if (W.consts.o5debug > 2)
                console.log("Scroll для '" + (() => {
                    let s = ''
                    aO5s.forEach(aO5 => { s += (s ? ', ' : '') + aO5.name })
                    return s
                })() + "'")
            let k2 = -1,
                onscr = true
            for (const [k, aO5] of aO5s.entries()) {
                if (onscr) {
                    CalcParentsLocates(aO5)
                    PrepareBords(aO5)

                    const W = aO5.shdw.getBoundingClientRect()
                    Object.assign(aO5.posW, { top: W.top, left: W.left, height: W.height, width: W.width })
                    Object.assign(aO5.posC, { top: W.top, left: W.left, height: W.height, width: W.width })
                    Object.assign(aO5.posS, { top: 0, left: 0, height: W.height, width: W.width })
                    onscr = aO5.posW.top < aO5.located.bo.pos.bottom //aO5.act.first.pO5.pos.bottom) {
                }
                // k2=k
                if (onscr) {
                    k2 = k
                    aO5.Show()
                } else {//тут не давать 'break' - пусть попрячет остальные !
                    aO5.Hide()
                    aO5.act.wasKilled = false
                }
                // console.log('opacity for id= ' + aO5.id)
                aO5.shdw.style.opacity = 0
            }

            let killevel = -1
            for (let k = k2; k >= 0; k--) {
                const aO5 = aO5s[k],
                    act = aO5.act,
                    cls = aO5.cls,
                    posW = aO5.posW,
                    hovered = aO5.hovered

                if (act.pushedBy && (cls.alive || posW.top > hovered.to.pos.top) && act.pushedBy.posW.top > hovered.to.pos.top) {
                    act.pushedBy = null
                    aO5.cart.style.zIndex = aO5.cls.zIndex
                }
                if (killevel >= 0 && killevel <= aO5.cls.level)
                    act.wasKilled = true
                else if (cls.alive ||
                    (cls.dirV == 'U' && posW.top > hovered.to.pos.top) ||
                    (cls.dirV == 'D' && posW.top > hovered.bo.pos.bottom)
                )
                    act.wasKilled = false

                if (cls.kill)
                    killevel = killevel < 0 ? cls.level : Math.min(killevel, cls.level)
            }

            for (let k = 0; k <= k2; k++) { // '<=' - чтобы захватить всплытие 'киллера'
                const aO5 = aO5s[k]
                Object.assign(aO5.fix, { putV: '', iO5: null })
                if (aO5.cls.dirV != '') {
                    if (!aO5.act.wasKilled) {
                        FixSet(aO5)
                        if (k > 0) CheckIsUp(k, aO5s)
                    }
                }
                CutBounds(aO5)
            }

            for (let k = 0; k <= k2; k++) { // эту часть проверок делать "после" чтобы определились координаты iO5
                const aO5 = aO5s[k],
                    posW = aO5.posW

                if (aO5.act.wasClick && posW.top > aO5.hovered.to.pos.top) {
                    const dir = aO5.cls.dirV,
                        iO5 = aO5.fix.iO5 || aO5.fix.iO5up

                    if (dir == 'D' ? (posW.top > aO5.hovered.bo.pos.bottom) :
                        (iO5 ? posW.top > iO5.posC.top + iO5.posC.height : (dir == 'U')))
                        aO5.SetClick(false)
                }
            }

            for (const aO5 of aO5s)  // д.б. отдельно от CutBounds, т.к. м.б. пересчитаны размеры
                SavePos(aO5)

            if (W.consts.o5debug > 2)
                DebugShowBounds(aO5s)

            for (const aO5 of aO5s)
                Scroll(aO5.aO5s)
        },
        DoScrollEnd = () => {
            if (!olga5_first_scroll) {
                olga5_first_scroll = new window.Event('o5first_scroll')
                document.dispatchEvent(olga5_first_scroll)
            }
            if (!olga5_shp_scroll)
                olga5_shp_scroll = new window.Event('o5shp_scroll')
            document.dispatchEvent(olga5_shp_scroll)
        }

    let // isfirst = true,
        olga5_shp_scroll = null,
        olga5_first_scroll = null

    wshp.DoScroll = function (aO5s, etimeStamp) {
        C = window.olga5.C
        if (etimeStamp) timeStamp = etimeStamp

        if (aO5s.length > 0) {
            if (timeStamp && W.consts.o5debug > 2) {
                console.groupCollapsed("  старт Scroll для '" + (() => {
                    let s = ''
                    // if (!aO5s.forEach)
                    //     console.log()
                    aO5s.forEach(aO5 => { s += (s ? ', ' : '') + aO5.name })
                    return s
                })() + "'" + ' (t=' + (Date.now() - datestart) + ')')
                console.trace("трассировка вызовов ")
                console.groupEnd()
            }

            Scroll(aO5s)
        }
        DoScrollEnd()
    }

    console.log(`}---< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/DoScroll.js`)
})();
﻿/* global document, window, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {              // ---------------------------------------------- o5shp ---
	"use strict";
	let C = null

	const
		W = {
			modul: 'o5shp',
			Init: ShpInit,
			class: 'olga5_shp', consts: `o5shp_dummy=0.123 # просто так, для проверок в all0_.html`,
		},
		actscript = document.currentScript,
		o5css = `
.${W.class} {
    // pointer-events: auto;
}
.${W.class}_gask{
	left : 0;
	top : 0;
	position : absolute;
	height : 100%;
	width : 100%;
}
/* .${W.class}_shdw {    opacity: 0.0; }  - вбивать конкретно в STYLE*/
.${W.class}_cart {
    opacity: 1.0;
    background-color:transparent;
    // cursor: pointer;
    direction : ltr; // эти 4 д.б. тут чтобы "перебить" из shp
    position : fixed;
	// position : absolute;
    display : block;
    z-index : 0;
    padding : 0;
    margin : 0;
    border:none;
    overflow: hidden;
    // pointer-events: none; // не обрабатывать события    - ПРОВЕРИТЬ в браузерах !!!!!!!!!!!!!!!!!
}
.${W.class}_cart.isFix {
	cursor: pointer;
}`,
		timera = '                                                                <   инициирован ' + W.modul,
		IncludedInit = function (args) {
			const wshp = window.olga5[W.modul]
			if (wshp && wshp.DoInit) wshp.DoInit(args) // там будет и console.timeEnd(timera)
			else {
				console.error(`Для ${W.modul}.js не загружен модуль 'DoInit' ??`)
				// if (C.consts.o5debug > 0)
				console.timeEnd(timera)
			}
		}

	function ShpInit(c) {
		console.time(timera)
		if (C && (!c || c == C))  // чтобы не задавать при повторных (тестовых) инициализациях
			window.olga5[W.modul].DoInit([null, W.class, timera])
		else {
			C = c
			if (C.consts.o5debug > 1)
				console.log(` __________________________________________\n   начало  иниц.:   ${W.modul}`)
			const W2 = {
				modul: W.modul,
				names: ['DoScroll', 'DoResize', 'AO5shp', 'DoInit'],
				actscript: actscript,
				iniFun: IncludedInit,
				args: [null, W.class, timera]
			}
			Object.freeze(W2)

			c.ParamsFill(W, o5css)
			C.IncludeScripts(W2)
		}
	}

	if (!window.olga5) window.olga5 = []

	if (!window.olga5[W.modul]) window.olga5[W.modul] = {}
	Object.assign(window.olga5[W.modul], {
		class: W.class,
		// events: {
		// 	shp_scroll: 'olga5_shp_scroll', // только для тестов в 'alltst.js'
		// 	first_scroll: 'olga5_first_scroll', // для повторной инициализации
		// }
	})

	if (!window.olga5.find(w => w.modul == W.modul)) {
		window.olga5.push(W)
		console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
		// _console.log(`}---< загружен:  ${W.modul}.js`)
		window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
	} else
		console.error(`Повтор загрузки '${W.modul}`)
})();
/* global document, window, console  */
/* exported olga5_menuPopDn_Click    */
/* jshint asi:true                   */
/* jshint esversion: 6               */
(function () {              // ---------------------------------------------- o5pop ---
    const o5callp = 'window.olga5.PopUp'

    if (!window.olga5) window.olga5 = []

    let timeStamp = 0,
        closedTag = null,
        o5debug = 0

    const phases = ['NONE', 'CAPTURING_PHASE', 'AT_TARGET', 'BUBBLING_PHASE'],
        PopUp = function (e, args) {
            const m2 = 3,
                tag = e.currentTarget,
                n = args.length

            if (o5debug > 1) console.log(`${W.modul}: PopUp`.padEnd(22) +
                `${C.MakeObjName(tag)}`.padEnd(22) +
                `${e.type} ${e.eventPhase}=${phases[e.eventPhase]}` +
                ` ${tag.aO5pop ? 'опр.' : 'НЕопр.'},   ${e.timeStamp} ${timeStamp == e.timeStamp ? ' > повтор события!' : ''}`)

            if (timeStamp == e.timeStamp) return
            if (closedTag == tag) {
                closedTag = null
                return
            }
            closedTag = null
            timeStamp = e.timeStamp

            if (n < 1 || n > m2) {
                SetTagError(tag, `Ошибочное количество '${n}' аргументов`, `у  PopUp() к-во аргументов ${n} д.б. от 1 до ${m2}`)
                return
            }

            const
                popUp = {
                    tag0: null,
                    GetTag: function () {
                        if (!popUp.tag0)
                            try {
                                popUp.tag0 = document.createElement('span')
                                popUp.tag0.style.display = 'none'
                                popUp.tag0.id = 'o5pop_commonTag'
                                if (o5debug > 0)
                                    console.log(`Создан (без добавления) невидимый тег всплытия  <${popUp.tag0.nodeName}> с id='${popUp.tag0.id}'`)
                            } catch (e) {
                                console.error(`Ошибка создания невидимого тега: "${e.message}"`)
                            }
                        return popUp.tag0
                    },
                },
                x = n < m2 ? '' : args[0],
                act = !x ? popUp.GetTag() : (x.attributes ? x : document.getElementById(x))

            e.aO5popup = true
            e.cancelBubble = true

            ShowWin(tag, act, e.type)
        }
    window.olga5.PopUp = function () {
        PopUp(arguments.callee.caller.arguments[0], arguments)
    }
    window.olga5.PopShow = function () { //  устарешая обёртка  ---- nam, width, height, url
        const e = arguments.callee.caller.arguments[0],
            tag = e.currentTarget,
            attr = `on` + e.type,
            n = (arguments.length > 3) ? 1 : 0,
            nam = n > 0 ? arguments[0] : '',
            width = arguments[n + 0],
            height = arguments[n + 1],
            url = arguments[n + 2],
            pars = `width=${width},height=${height}`  // --------------------------------------------------------------------

        tag.removeAttribute(attr)
        tag.setAttribute(attr, `${o5callp}('${nam}', '${url}', '${pars}')`)

        PopUp(e, [nam, url, pars])
    }

    'use strict'
    const pard = window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/)

    // только в автономном режиме ? с ключом o5auto ?    
    let C = {                // заменитель библиотечного
        consts: {
            o5debug: (pard ? (pard[0].match(/=/) ? parseInt(pard[0].match(/\s*\d+/) || 1) : 1) : 2)
        },
        ConsoleError: (msg, name, errs) => {
            const txt = `ОШИБКА:: ` + msg + (name ? '  >' + name + '<' : '')
            if (errs && errs.length > 0) {
                console.groupCollapsed(txt)
                console.table(errs)
                console.trace("трассировка вызовов :")
                console.groupEnd()
            } else
                console.error(txt)
        },
        // MakeObjName: tag => tag.nodeName + '.' + tag.id + '.' + tag.className,        
        MakeObjName: obj =>
            (obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
                ('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
                '.' + (obj.className ? obj.className : '?')),
        GetTagsByQuery: query => document.querySelectorAll(query), // второй аргумент - игнорится
        // GetTagById: id => document.getElementById(id)
    }
    // if (o5debug > 1) console.log('}---> читаю `o5pop.js`')

    const repQuotes = /^\s*['"`]?\s*|\s*['"`]?\s*$/g, // /^['"`\s()]+|['"`\s()]+$/g,
        defid = 'defid',
        click = 'click',
        o5popup = 'o5popup',
        onclick = 'on' + click,
        aclicks = ['click', 'keyup', 'keydown', 'keypress']

    const wopens = [], // window.olga5.PopUpwopens // массив открытых окон
        W = {
            modul: 'o5pop',
            Init: Popups,
            class: 'olga5_popup',
            consts: `		
                o5nocss=0;  // 0 - подключаются CSS'ы
                o5noclick=0
                o5timer=0.7 // интервал мигания ;
                o5params=''  // умалчиваемые для mos, sizs, wins
			`,
        },
        dflt = {
            moes: { text: '', defid: '', group: '', head: '', },
            sizs: { width: 588, height: 345, top: 11, left: -22, },
            wins: {
                alwaysRaised: 1, alwaysOnTop: 1, menubar: 0, toolbar: 0, status: 0, resizable: 1, scrollbars: 0,
                innerwidth: '', innerheight: '', screenx: '', screeny: ''
            },
        },
        attrs = document.currentScript.attributes,
        timerms = 1000 * ((attrs && attrs.o5timer) ? parseFloat(attrs.o5timer.value) : 2.1),
        cls_Act = W.class + '_Act',
        cls_PopUp = W.class + '_PopUp',
        cls_errArg = W.class + '_errArg',
        namo5css = W.class + '_internal',
        o5css = `
.${W.class},
.${W.class + 'C'},
.${cls_Act} {
    cursor: pointer;
}        
.${W.class}{    
	cursor: pointer;
	color: black;
	background-color: lavender;
	border-radius: 4px;
	border: 1px dashed gray;
}
b.${W.class},
i.${W.class},
u.${W.class},
span.${W.class},
 .${W.class} {
    padding-left: 4px;				
    padding-right: 3px;
}
img.${W.class} {
    border: none;
    background-color: transparent;
    position: relative;
}
.${cls_errArg} {
    opacity:0.5;
}
    /*  мигание вызвавшего тега
    */
.${cls_Act} {
    outline-offset: 2x;
    animation: blink ${timerms}ms infinite linear;
}
@keyframes blink {
    99% {outline: 2px dashed  black;outline-offset: 2x;}
    66% {outline: 3px dashed  white;}
    33% {outline: 2px dashed  black;}
    0% {outline: 3px dashed white;outline-offset: -2x;}
}
`,
        SetTagError = (tag, txt, add) => {  // добавление и протоколирование НОВЫХ ошибок для тегов
            const err = '? ' + txt + (add ? ' (' + add + ')' : ''),
                isnew = tag.title.indexOf(err) < 0,
                first = tag.title.trim().indexOf('?') != 0

            if (first) tag.title = err
            else if (isnew) tag.title = tag.title + '; ' + err

            if (isnew) C.ConsoleError(`Для тега '${C.MakeObjName(tag)}' ${txt}: `, add || '')
            tag.classList.add(cls_errArg)
        },
        CloseAddPop = e => {
            const act = e.currentTarget,
                wopen = act.aO5pop_wopen
            if (o5debug > 1) console.log(`${W.modul}: CloseAddPop`.padEnd(22) +
                `${C.MakeObjName(act)}`.padEnd(22))
            ClosePop(wopen)
        },
        ClosePop = wopen => {
            if (o5debug > 1) console.log(`${W.modul}: ClosePop`.padEnd(22) +
                `${wopen.name}`.padEnd(22))
            if (wopen.time + 444 > (new Date()).getTime()) return
            const pop = wopen.pop


            if (pop.act != pop.tag) {
                delete pop.act.aO5pop_wopen
                pop.act.removeEventListener(click, CloseAddPop)
            }

            const tg = pop.act || pop.tag
            if (wopen.text)
                tg[tg.value ? 'value' : 'innerHTML'] = wopen.text
            tg.classList.remove(cls_Act)

            if (wopen.win.window && !wopen.win.window.closed) {
                wopen.win.close()
            }

            const i = wopens.indexOf(wopen)
            if (i > -1) {
                wopens.splice(i, 1)
                if (wopens.length == 0) {
                    window.clearInterval(wopens.tBlink)
                    wopens.tBlink = 0
                }
            }
        },
        DoBlinks = isnew => {
            for (const wopen of wopens) {
                if (!isnew && (!wopen.win.window || wopen.win.window.closed)) // окно 'само' закрылось
                    ClosePop(wopen)
                else
                    if (!wopen.noact && wopen.head !== '') {
                        try { // тут м.б. ошибку по доступу из другого домена
                            const doc = wopen.win.document
                            if (doc) { // окно наконец-то загрузилось
                                const title = doc.title.trim()
                                if (!wopen.titlD && title) {
                                    if (o5debug > 1) console.log(`${W.modul}: DoBlinks загрузилось`)
                                    wopen.titlD = title
                                    wopen.titlB = wopen.head ? wopen.head : title.replaceAll(/./g, '*') + '*'
                                }
                                doc.title = wopen.titlD == title ? wopen.titlB : wopen.titlD
                            }
                        } catch (e) {
                            wopen.noact = e.message
                            C.ConsoleError('DoBlink: прекращено по причине: "' + e.message + '"')
                        }
                    }
            }
            if (wopens.length > 0)
                wopens.tBlink = window.setTimeout(DoBlinks, timerms)
        },
        AddMissing = (ppars, ipars) => {
            for (const ipar in ipars)
                if (typeof ppars[ipar] === 'undefined') ppars[ipar] = ipars[ipar]
        },
        CalcOpts = (pop, str) => {
            const ss = (str || '').replace(repQuotes, '').split(/[,;]/)

            ss.forEach(s => {
                const uu = s.split(/=|:/)
                let nam = uu[0].trim().toLowerCase()
                if (uu[1] && nam.length == 1) {
                    if (nam == 'w') nam = 'width'
                    if (nam == 'h') nam = 'height'
                    if (nam == 't') nam = 'top'
                    if (nam == 'l') nam = 'left'
                }

                if (nam)
                    if (typeof uu[1] !== 'undefined') {
                        const val = uu[1].replace(repQuotes, '')

                        if (dflt.moes.hasOwnProperty(nam)) pop.moes[nam] = val
                        else if (dflt.sizs.hasOwnProperty(nam)) pop.sizs[nam] = val // тут не надо parseInt из-за возм. '%'
                        else if (dflt.wins.hasOwnProperty(nam)) pop.wins[nam] = parseInt(val)
                        else
                            errs.push(`неопределённый параметр '${nam}' для события '${event}'`)
                    }
                    else
                        if (!pop.moes[defid]) pop.moes[defid] = nam
                        else
                            errs.push(`лишний параметр '${nam}' с 'пустым' знфчением для события '${event}'`)
            })
            // if (typeof dflt.moes.css !== 'undefined') pop.moes.css = true
        },
        ConvToValue = (nam, u) => {
            const percentMatch = /\d\s*%\s*$/,
                val = parseFloat(u)
            if (val !== u && u.match(percentMatch))  // тут д.б. именно '!=='
                return val * 0.01 * window.screen[['left', 'width'].includes(nam) ? 'width' : 'height']
            else
                return val
        },
        GetCSS = () => {
            const chs = document.head.children
            for (const ch of chs)
                if (ch.nodeName == "STYLE" && ch.id == namo5css)
                    return ch
        },
        IncludeCSS = () => {// подключение CSS'ов, встроенных в скрипт  (копия из o5common.js)                
            let css = GetCSS()
            if (!css) {
                if (o5debug > 0)
                    console.log(`>>  СОЗДАНИЕ CSS   ${W.class} (для модуля ${W.modul})`)
                const styl = document.createElement('style')
                styl.setAttribute('type', 'text/css')
                styl.id = namo5css
                css = document.head.appendChild(styl)
            } else
                if (o5debug > 0)
                    console.error(`>>  ИНЗМЕНЕНИЕ CSS   ${W.class} (для модуля ${W.modul}) `)
            css.innerHTML = o5css.replace(/(\/\/.*($|\n))|(\s*($|\n))/g, '\n')
        },
        CorrectDefaults = (parms) => {
            const ss = parms ? parms.replace(repQuotes, '').split(/[,;]/) : []
            ss.forEach(s => {
                const uu = s.split(/=|:/),
                    nam = uu[0].trim().toLowerCase(),
                    u = uu[1] ? uu[1].trim() : ''
                if (u) {
                    if (typeof dflt.moes[nam] != 'undefined') dflt.moes[nam] = u
                    else if (typeof dflt.sizs[nam] != 'undefined') dflt.sizs[nam] = ConvToValue(nam, u)
                    else if (typeof dflt.wins[nam] != 'undefined') dflt.wins[nam] = parseInt(u)
                    else
                        C.ConsoleError(`неопределённый параметр окна '${nam}' у сриптового атрибута 'o5params'`)
                }
            })
        },
        remo5 = {
            removed: false,
            Rem: (tag, nam) => {
                const ap = tag.getAttribute(nam)
                if (ap) {
                    const ac = tag.getAttribute(onclick)
                    if (ac) C.ConsoleError(`у тега ${C.MakeObjName(tag)} одновременно атрибуты: ${onclick} и ${o5popup}`)
                    else { // если есть OnClick то o5popup игнорируется
                        const i = ap.indexOf(';'),
                            url = i < 0 ? '' : ap.substring(0, i).replace(repQuotes, ''),
                            str = i < 0 ? ap : ap.substring(i + 1),
                            ss = str.split(/[,;]/)
                        let pars = ''

                        ss.forEach(s => {
                            const uu = s.split(/=|:/),
                                nam = uu[0].trim().toLowerCase(),
                                u = uu.length == 1 ? '' : (':' + uu[1].replace(repQuotes, ''))

                            pars += (pars.length > 0 ? ',' : '') + nam + u
                        })

                        tag.setAttribute(onclick, `${o5callp}(this, '${url}', '${pars.trim()}')`) // это меняю на потом
                        if (i >= 0)
                            tag.classList.add(cls_PopUp)
                        if (url && (nam == 'o5popup') && !tag.classList.contains(W.class))
                            tag.classList.add(W.class)
                    }
                    tag.removeAttribute(nam)
                    return true
                }
            },
            RemAll: (e, doremove) => {
                if (!remo5.removed || doremove) {
                    let n = 0
                    for (const nam of ['o5popup', 'o5popupC', 'o5popupc']) {
                        const tags = C.GetTagsByQuery('[' + nam + ']')
                        for (const tag of tags)
                            if (remo5.Rem(tag, nam)) n++
                    }
                    if (n && o5debug > 0)
                        console.log(`${W.modul} для '${e.type}': все ${n} атрибутов o5popup(C) заменеы вызовами PopUp`)
                    return n
                }
                remo5.removed = true
            }
        },
        focusAll = {
            tFocus: 0,
            F: wopen => {
                if (o5debug > 1)
                    console.log(`${W.modul}: DoFocus ${wopen.name} (${wopen.win.aO5pop ? wopen.win.aO5pop.name : 'недоступно'})`)
                wopen.win.focus()
            },
            DoFocus: () => {
                let i = 0
                for (const wopen of wopens)
                    if (wopen.win)
                        // window.setTimeout(focusAll.F, 44 + ++i * 22, wopen) // wopen.win.window.focus
                        wopen.win.focus()
            },
            Focus: (e) => {
                if (focusAll.tFocus) {
                    window.clearInterval(focusAll.tFocus)
                    focusAll.tFocus = 0
                }
                if (wopens.length > 0) {
                    // e.cancelBubble = true
                    focusAll.tFocus = window.setTimeout(focusAll.DoFocus, 33)
                    if (o5debug > 1)
                        console.log(`${W.modul}: Focus для ${wopens.length} тегов (${e.eventPhase}, ${e.isTrusted ? 'T' : 'f'}, ${e.timeStamp}, ${e.type})`)
                    // focusAll.DoFocus(e)
                }
            }
        },
        DocClickCapt = e => {
            if (o5debug > 1) console.log(`${W.modul}: DocClick`.padEnd(22) +
                `${C.MakeObjName(e.target)}`.padEnd(22) +
                `${e.type} ${e.eventPhase}=${phases[e.eventPhase]}` +
                ` ${e.timeStamp}`)
            let pop = null,
                tag = e.target     //  всплытие окна на первом  'o5popup'  при 'click' всплытие будет по PopUp
            do {
                if (tag.getAttribute(onclick)) {
                    pop = tag
                    break
                }
                tag = tag.parentElement
            } while (tag && tag.nodeName &&
                !['body', 'html', '#document'].includes(tag.nodeName.toLowerCase()))

            if (wopens.find(wopen => wopen.pop.tag == tag &&
                (!wopen.pop.moes.group || !wopen.pop.moes.group == 0)
            ))
                closedTag = tag

            remo5.RemAll({ type: 'DocumentClick' }) // выполнилоась замена на 'onClick'

            const n = ClosePops(0)    // закрыть анонимные 
            if (n > 0 && !pop) e.cancelBubble = true // при 'pop' это  'cancelBubble' будет сделано в обработчике PopUp
        }

    function ShowWin(tag, act, eve) {
        if (o5debug > 1) console.log(`${W.modul}: ShowWin`.padEnd(22) +
            `${C.MakeObjName(tag)}`.padEnd(22) +
            `${C.MakeObjName(act)}, '${eve}') `)

        const errs = [],
            tags = [],
            CalcAllEves = (tg) => {
                if (o5debug > 1) console.log(`${W.modul}: CalcAllEves`.padEnd(22) +
                    `${C.MakeObjName(tg)}`.padEnd(22) +
                    ` ${tg.aO5pop ? 'повт.' : 'определение-Eve'}`)
                if (tags.includes(tg)) {
                    let s = ''
                    tags.forEach(t => s += t.aO5pop.name + '-> ')
                    C.ConsoleError(`Циклические ссылки на тег: ${s}`)
                    return
                }
                tags.push(tg)

                if (tg.aO5pop)
                    return tg.aO5pop

                tg.aO5pop = { name: C.MakeObjName(tg), tag: tg, pops: {} }
                Object.freeze(tg.aO5pop)

                const aO5 = tg.aO5pop
                for (const attr of tg.attributes) {
                    const name = attr.name.toLowerCase()
                    if (!(name.match(/on\w+/i) && attr.value.match(/window\.olga5\.Pop(Up|Show|Work)\s*\(/i)))
                        continue

                    const ev = name.substring(2)
                    if (!ev || tg.aO5pop[ev]) continue

                    const
                        s = attr.value.replace(/^.*\bPopUp\s*\(\s*|\)$/ig, ''),
                        ss = s.split(/[,;]\s*[`'"]/),
                        n = ss.length,
                        url = ((n < 3 ? ss[0] : ss[1]) || '').replace(repQuotes, ''),
                        pars = n < 2 ? '' : ((n < 3 ? ss[1] : ss[2]) || '').replace(repQuotes, ''),
                        pop = {
                            tag: null,   // должно определяться при вызове
                            act: null,   // -"-
                            eve: ev,
                            url: url,  // м.б. изменится после декодирования
                            pars: '',
                            key: aO5.name + '(' + ev + ')',  // наименование окна
                            moes: {}, sizs: {}, wins: {}, s: '', wopen: null, fixed: false,
                        }
                    Object.seal(pop)
                    if (n != 3)
                        console.log()

                    CalcOpts(pop, pars)

                    for (const moe in pop.moes) {
                        const id = moe == defid ? pop.moes[defid].toLowerCase() : ''
                        if (id && !dflt.moes[id]) {   //  && !['head', 'text', 'group', 'defid'].includes(id)
                            const ref = document.getElementById(id)
                            if (ref) {
                                CalcAllEves(ref)
                                tags.pop()
                                const iO5 = ref.aO5pop
                                for (const ive in iO5.pops) { // собираем недостающее со всех событий
                                    const iop = iO5.pops[ive]
                                    for (const nam in dflt)
                                        AddMissing(pop[nam], iop[nam])
                                }
                            }
                            else
                                errs.push(`для '${ev}' не найден ссылочный id='${id}'`)
                        }
                    }
                    if (!aO5.pops[ev]) aO5.pops[ev] = pop
                    else
                        C.ConsoleError(`Дубль события '${ev}' у тега '${aO5.name}' (оставил первое)`)
                }
                return aO5
            },
            FillParams = (pop) => {
                const screen = window.screen
                let s = ''
                for (const nam in pop.sizs) {
                    let val = ConvToValue(nam, pop.sizs[nam])
                    if (val > -1) {
                        if (nam == 'left') val = screen.availLeft + val
                        else if (nam == 'top') val = screen.availTop + val
                    }
                    else
                        if (nam == 'left') val = screen.availLeft + val + screen.availWidth - pop.sizs.width - 4
                        else if (nam == 'top') val = screen.availTop + val + screen.availHeight - pop.sizs.height - 4
                        else val = -val

                    s += nam + '=' + val + ','
                }
                pop.pars = s + pop.s
            },
            ShowTestRez = () => {
                const tags = C.GetTagsByQuery("*[id]", W.modul)
                tags.forEach(tag => {
                    const xO5 = tag.aO5pop
                    if (xO5 && xO5.newtst) {
                        xO5.newtst = false

                        for (const eve in xO5.pops) {
                            console.log(''.padEnd(6) + ' tag=' + xO5.name + ' eve=' + eve)
                            const pop = xO5.pops[eve]
                            for (const nam in dflt) {
                                const pps = pop[nam]
                                let s = ''
                                for (const pp in pps)
                                    s += pp.padEnd(6) + ': ' + ((typeof pps[pp] === 'undefined' ? '' : pps[pp]) + ', ').padEnd(4)
                                if (s)
                                    console.log(''.padEnd(11) + nam + '=>  ' + s)
                            }
                        }
                    }
                })
            },
            IsUrlNam = u => { return !!(u.trim() && !u.match(/[\/.\\#]/)) }, // копия из CEncode.js
            aO5 = CalcAllEves(tag),
            pop = aO5.pops[eve]

        Object.assign(pop, { tag: tag, act: act })
        if (aclicks.includes(eve)) {//   закрытие только последнего с данного тега
            let j = wopens.length
            while (j-- > 0) {
                const wopen = wopens[j]
                if (wopen.pop.tag == tag) {
                    ClosePop(wopen)
                    return
                }
            }
        }
        if (wopens.find(wopen => wopen.pop.tag == tag && wopen.pop.eve == eve)) //   повтор активного события
            return

        ClosePops(pop.moes.group)

        if (!pop.url) { // параметры считаны - можне удалять обработчик!
            tag.removeAttribute('on' + eve)
            return
        }

        if (!pop.fixed) {
            pop.fixed = true
            for (const nam in dflt)
                AddMissing(pop[nam], dflt[nam])

            if (C.DeCodeUrl) {
                const o5attrs = tag ? C.GetAttrs(tag.attributes) : '',
                    ori = (pop.url || '').replace(repQuotes, ''),
                    url = IsUrlNam(ori) ? (document.URL + '?o5nomnu#' + ori) : ori,
                    wref = C.DeCodeUrl(W.urlrfs, url, o5attrs)

                if (wref.err)
                    errs.push(`Ошибка перекодирования url='${pop.url}':  ${wref.err}`)
                pop.url = wref.url
            }
        }

        pop.s = ''
        for (const win in pop.wins)
            if (pop.wins[win] !== '') pop.s += win + '=' + pop.wins[win] + ','

        if (errs.length > 0)
            SetTagError(tag, `Ошибки в декодировании опций`, errs)

        FillParams(pop)
        const win = window.open(pop.url, pop.key, pop.pars)
        if (win) {
            try {
                win.aO5pop = { name: aO5.name, aO5: aO5 }

                if (o5debug > 1)
                    win.onfocus = function () {
                        console.log(`win.onfocus: FoFocus ${win.aO5pop.name}`)
                    }
            } catch (e) {
                console.error(`Параметры нового окна недостуны - иной домен!`)
            }
            pop.wopen = {
                pop: pop,
                win: win, head: pop.moes.head, text: '', titlD: '', titlB: '', noact: '', name: aO5.name,
                time: (new Date()).getTime()  // отстройка от "дребезжания"
            }
            const act = pop.act

            if (pop.moes.text) { // для анонимных - не менять текст
                pop.wopen.text = act.value ? act.value : act.innerHTML
                act[act.value ? 'value' : 'innerHTML'] = pop.moes.text
            }

            // focusAll.Focus()
            wopens.push(pop.wopen)

            if (act != tag) {  // теперь закрытие м.б. по обоим тегам
                act.aO5pop_wopen = pop.wopen
                act.addEventListener(click, CloseAddPop)
            }
            if (timerms > 99 && (tag.classList.contains(W.class) || tag.classList.contains(cls_PopUp))) {
                act.classList.add(cls_Act)
                if (wopens.tBlink)
                    window.clearInterval(wopens.tBlink)
                DoBlinks(true)
            }
        }
        else
            if (!aclicks.includes(eve))
                SetTagError(tag, `Ошибка создания окна по событию ${eve}`, `вероятно следует снять запрет на всплытие окон в браузере`)

        if (o5debug > 1) ShowTestRez()
    }

    function ClosePops(group) {
        let j = wopens.length,
            n = 0
        while (j-- > 0) {
            const wopen = wopens[j],
                mgroup = wopen.pop.moes.group
            if (group == null || !mgroup || mgroup == 0 || mgroup == group) {
                ClosePop(wopen)
                n++
            }
        }
        return n
    }

    const nocss = attrs && attrs.o5nocss && attrs.o5nocss.value,
        SetEvents = Fun => {
            for (const eve of ['click', 'focus', 'resize', 'scroll'])
                Fun(eve, remo5.RemAll, { once: true })

            Fun('click', DocClickCapt, { capture: true, once: false })
            Fun('visibilitychange', e => {
                let j = wopens.length
                if (o5debug > 1)
                    console.log(`${W.modul}: закрыть ${j} окон по ${e ? 'event=' + e.type : 'команда от IniSrips'}`)
                if (j > 0)
                    ClosePops(null)
            }, { capture: false })

            for (const eve of ['selectstart', 'focus', 'resize', 'scroll'])
                Fun(eve, focusAll.Focus)
        }

    function Popups(c) {
        const timera = '                                                                <   инициирован ' + W.modul
        console.log(` __________________________________________\n   начало  иниц.:   ${W.modul}`)

        SetEvents(document.removeEventListener)
        SetEvents(document.addEventListener)

        if (attrs.o5noclick && attrs.o5noclick.value && attrs.o5noclick.value != 0) // не закрывть окно
            document.addEventListener('click', e => { e.cancelBubble = true }, { capture: false, once: false })

        if (c) {
            C = c
            console.time(timera)
            if (nocss || GetCSS()) c.ParamsFill(W)             // CSS сохранилось после автономного создания
            else                            // иначе - никак, т.к. не известно, кто раньше загрузится
                c.ParamsFill(W, o5css)      // CSS пересоздаётся (для Blogger'а)
            o5debug = W.consts.o5debug
        }

        remo5.RemAll({ type: 'Popups(c)' }, true)  // всегда делать при инициализации

        console.timeEnd(timera)
        window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
    }

    if (!nocss)  // т.е. если явно НЕ запрещено    
        IncludeCSS()

    if (attrs && attrs.o5params)
        CorrectDefaults(attrs.o5params.value.trim())

    SetEvents(document.addEventListener)

    if (!window.olga5.find(w => w.modul == W.modul)) {
        window.olga5.push(W)
        console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
        window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
    } else
        console.error(`Повтор загрузки '${W.modul}`)
    // -------------- o5pop
})();
/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 * расширение логирования
 */
(function () {              // ---------------------------------------------- o5com/CConsole ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CConsole'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		padd = "padding-left:0.5rem;",
		clrtypes = {
			'A': "background: yellow; color: black;border: solid 3px blue;",
			'E': "background: yellow; color: black;border: solid 1px gold;",
			'S': "background: blue;   color: white;border: solid 1px bisque;",
			'I': "background: beige;  color: black;border: solid 1px bisque;",
		},
		ConsoleMsg = (styp, txts, add, tab) => {
			const txt = (txts && txts[txts.length - 1] != '') ? txts + ' ' : txts,
				type = styp.substr(0, 1).toUpperCase(),
				clr1 = clrtypes[type],
				clr2 = "margin-left:0.4rem; background: white; color: black; border: solid " +
					(tab ? "1px gray;" : "1px bisque;"),
				Is_debug = () => { return (C && C.consts && C.consts.o5debug != undefined) ? C.consts.o5debug : false }
			if (type != 'A' && type != 'E' && Is_debug() <= 0) // когда НЕ выдаётся сообщение
				return

			if (add === null || typeof add === 'undefined' || add === '') console.groupCollapsed('%c%s', (padd + clr1), txt)
			else
				if (Number.isInteger(add)) console.groupCollapsed('%c%s%c%s', (padd + clr1), txt, (padd), add + ' ')
				else console.groupCollapsed('%c%s%c%s', (padd + clr1), txt, (padd + clr2), add + ' ')
			// console.group(txt)

			const tt = []
			if (tab) {
				if (tab instanceof Array)
					tab.forEach((v, nam) => {
						let t = {}
						const ss = [],
							O = (o) => {
								const uu = []
								if (o instanceof NamedNodeMap) {
									for (const atr of o) uu.push(atr.name + '=' + atr.value)
									return uu.join(',')
								} else if (o instanceof Object) {
									for (const x in o) uu.push(x + '=' + o[x])
									return uu.join(',')
								}
								else return (typeof o === 'undefined') ? ' `undef`' : (o == null ? '`null`' : o.toString())
							}
						let s = ''
						if (v instanceof Map) {
							v.forEach((x, nam) => s += (s == '' ? '' : ', ') + nam + ':' + x.toString())
							t[nam].val = '{' + s + '}'
						} else if (v instanceof Array) {
							v.forEach(x => s += (s == '' ? '' : ', ') + x)
							t[nam].val = '{' + s + '}'
						} else if (v instanceof Object) {
							for (const x in v)
								t[x] = O(v[x])
						} else
							t = v //t[nam] = v
						tt.push(t)
					})
				else if (tab instanceof Map)
					tab.forEach((v, nam) => {
						const t = { nam: nam }
						let s = ''
						if (v instanceof Map) {
							v.forEach((x, nam) => s += (s == '' ? '' : ', ') + nam + ':' + x.toString())
							t.val = '{' + s + '}'
						} else if (v instanceof Array) {
							v.forEach(x => s += (s == '' ? '' : ', ') + x)
							t.val = '{' + s + '}'
						} else if (v instanceof Object) {
							for (const x in v) s += (s == '' ? '' : ', ') + x + ':' + v[x]
							t.val = '{' + s + '}'
						} else
							t.val = v
						tt.push(t)
					})
				else for (const t in tab) {
					const v = tab[t]
					if (!t.match(/^\d*$/) && typeof v !== 'function')
						if (typeof v !== 'object') tt.push({ nam: t, val: v })
						else {
							const r = { nam: t }
							if (Array.isArray(v))
								for (let i = 0; i < v.length; i++)
									r['№-' + i] = v[i]
							else
								for (const x in v)
									r[x] = v[x]

							tt.push(r)
						}
				}
				if (tt.length > 0) {
					// tt.push({})    // иначе Chromium проглатывает последний элемент массива
					console.table(tt)
				}
			}
			console.table()
			console.groupCollapsed(` ... трассировка вызовов :`)
			console.trace()
			console.groupEnd()
			console.groupEnd()

			// console.log('-------- groupEnd()')
			// console.groupEnd()
			// console.groupEnd()
			// console.groupEnd()
			// console.groupEnd()
		}

	wshp[modulname] = () => {
		// if (C.consts.o5debug > 0) console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)
		Object.assign(C, {
			ConsoleMsg: ConsoleMsg,
			ConsoleAlert: function (txt, add, tab) {
				ConsoleMsg('alert', txt, add, tab);
				// window.setTimeout(ConsoleMsg, 1, 'alert', txt, add, tab)
			},
			ConsoleError: function (txt, add, tab) {
				ConsoleMsg('error', txt, add, tab);
				// window.setTimeout(ConsoleMsg, 1, 'error', txt, add, tab)
			},
			ConsoleSign: function (txt, add, tab) {
				ConsoleMsg('sign', txt, add, tab);
				// window.setTimeout(ConsoleMsg, 1, 'sign', txt, add, tab)
			},
			ConsoleInfo: function (txt, add, tab) {
				ConsoleMsg('info', txt, add, tab)
				// window.setTimeout(ConsoleMsg, 1, 'info', txt, add, tab)
			},
		})
		return true
	}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();
/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5com/CEncode ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CEncode'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		DelBacks = (s0) => {
			// const s00 = s0
			let n = 0
			const mrkN = '\n',
				mrk2 = '..'
			do {
				let l = s0.length,
					m = s0.match(/\.\.[^\/]/)
				if (m) s0 = s0.substr(0, m.index + 2) + '/' + s0.substr(m.index + 2)
				m = s0.match(/[^\/]\.\./)
				if (m) s0 = s0.substr(0, m.index + 1) + '/' + s0.substr(m.index + 1)
				if (l == s0.length) break
			} while (n++ < 99)

			const s2s = s0.split('/'),
				tt = []
			for (let i = 0; i < s2s.length; i++)
				if (s2s[i] == mrk2) {
					let j = i
					while (j-- > 0)
						if (s2s[j] != mrkN && s2s[j] != mrk2 && s2s[j] != '') {
							s2s[j] = mrkN
							s2s[i] = ''
							break
						}
				}

			let i = s2s.length
			while (i-- > 0)
				if (s2s[i] == mrkN || (i > 0 && s2s[i] == '' && s2s[i - 1] == ''))
					s2s.splice(i, 1)

			let s = s2s.join('/').replaceAll(/\/\.\//g, '/')
			return s.replaceAll(/[^:]\/\/+/g, (u) => { return u.substr(0, 2) })
		},
		IsUrlNam = u => { return !!(u.trim() && !u.match(/[\/.\\#]/)) },
		DeCodeUrl = function (urlrfs, url, o5attrs = null) { // старое DeCodeUrl
			if (url.match(/^\s*data:/)) {
				return { url: url.trim(), err: '', num: 0 }
			}
			const errs = [],
				parts = [],
				Replace4320 = u =>
					u.replaceAll(/(&#43;)/g, '+').replaceAll(/(%20|&nbsp;)/g, ' ').trim(), // давать в такой очерёдностии, иначе снова вернёт %20 !,
				IsCompaund = orig => orig && (orig.includes('+') || IsUrlNam(orig)),
				SplitRefs = (s, refs = null) => {
					s.split('+').forEach(sprt => {
						const prt = sprt.trim(),
							isnam = IsUrlNam(prt),
							ref = isnam ? C.Repname(prt) : prt
						// if (prt == 'btnSound' || prt == 'btnsound')
						// 	console.log()

						if (isnam) parts.num++
						if (refs && refs.find(r => ref == r))
							errs.push(`цикл. ссылки ${refs.join('->')}=>${att};`)
						else {
							// let attr = null
							// if (isnam && o5attrs) {
							// 	attr=C.GetAttribute(o5attrs, ref)
							// 	if (!attr && (ref=='href' || ref=='src'))	
							// 	attr=C.GetAttribute(o5attrs, '_'+ref)
							// }							
							const attr = (isnam && o5attrs) ? C.GetAttribute(o5attrs, ref) : null

							if (attr) {
								if (!refs) refs = []
								refs.push(ref)
								// if (!attr.value)
								// console.log(2)
								SplitRefs(attr, refs)
							}
							else if (isnam) {
								if (urlrfs[ref]) SplitRefs(urlrfs[ref], refs)
								else
									errs.push(`неопр.: '${prt}` + (prt != ref ? ` (т.е. '${ref})` : ''))
							}
							else
								parts.push(ref)
						}
					})
				},
				ss = url.split('?'),
				orig = Replace4320(ss[0].trim()),
				ret = { url: url, err: '', num: 0 }

			if (IsCompaund(orig)) {
				Object.assign(parts, { num: 0, rght: ss[1] ? ('?' + ss[1]) : '' })

				SplitRefs(orig)

				let urld = ''
				for (const part of parts)
					if (urld && part && urld[urld.length - 1] != '/' && part[0] != '/') urld = urld + '/' + part
					else urld = ((urld ? urld : '') + (part ? part : ''))

				if (urld) {
					if (!urld.match(/https?:/)) {
						if (parts[0] == '') urld = C.urlrfs._url_olga5 + urld
						else urld = C.urlrfs._url_html + urld
						if (!urld.match(/https?:/)) {  // если всё еще нету
							const hr = new window.URL(window.location).href
							urld = hr.substring(0, hr.lastIndexOf('/') + 1) + urld
						}
					}
					urld = DelBacks(urld) + parts.rght
				}
				Object.assign(ret, {
					url: urld,
					err: errs.length > 0 ? errs.join(', ') : (urld ? '' : `пустой 'url'`),
					num: parts.num
				})
			}
			return ret
		},
		TagDes = (tag, ref, errs = null) => {
			for (const code of ['data-', '_', '']) {
				const from = code + ref,
					attr = tag.attributes[from]
				if (attr) {
					const orig = attr.nodeValue,
						regExp1 = new RegExp('((.*\\/|\\+)\\s*)|(!*\\.js\\s*$)', 'g'),
						regExp2 = new RegExp('(\\s*\\+\\s*)+', 'g')

					return {
						code: code,
						from: from,
						modul: orig.replace(regExp1, ''),
						orig: orig,
						trans: !!(orig.match(regExp2) || IsUrlNam(orig)),
					}
				}
			}
			if (errs)
				errs.push({ tag: C.MakeObjName(tag), ref: ref, txt: 'не определены атрибуты' })
		}

	wshp[modulname] = () => {
		// if (C.consts.o5debug > 0) console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)
		Object.assign(C, {
			DelBacks: DelBacks,
			DeCodeUrl: DeCodeUrl,
			TagDes: TagDes,
		})
		return true
	}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();
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
/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  Общий модуль, обязательный при подключении одного (ли несколиких)   моулей библиотеки
 *
 * параметры могут дублироваться командной строкой вызова страницы
 **/

(function () {              // ---------------------------------------------- o5com/CParams ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'CParams'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		csslist = {}, // перечень наименований создаваемых классо
		// repQuotes = /^['"`\s]+|['"`\s]+$/g,
		SplitParams = (s, parnam, delims = ';') => {
			const errs = [],
				params = {},
				regexp = new RegExp('\\s*[' + delims + ']\\s*', 'g'),
				regcomments = /(\s+\/\/|#).*?(\n|$|;)/g,
				x = s.replace(/\/\*(.|\n)*?\*\//g, '').
					replace(regcomments, ';'),		 // убрал оба типа коментов
				spairs = x.trim().split(regexp)

			if (C.consts.o5debug > 0) {
				const comments = s.match(regcomments)
				if (comments)
					comments.forEach(comment => {
						if (comment.match(/[^=]=[^=]/))
							errs.push({ par: comment, err: `в комменте подозрительный одиночный '='` })
					})
			}

			for (const spair of spairs)
				if (spair) {
					const pair = spair.split('=')
					if (pair.length > 1) {
						const nam = C.Repname(pair[0].trim()),
							val = (pair[1] || '').replace(C.repQuotes, '')

						if (nam) params[nam] = C.TryToDigit(val)
						else
							if (val.length > 1)
								errs.push({ par: spair, err: `у параметра (с val='${val}') нет имени` })
					}
					else
						errs.push({ par: spair, err: `отсутствие '='` })
				}

			if (errs.length > 0)
				C.ConsoleError(`Разбор  параметров `, parnam, errs)

			return params
		},
		DeCodeUrlRfs = (urlrfs, modul) => {
			const urlerrs = [],
				urlsets = []

			for (const nam in urlrfs) {
				const val = urlrfs[nam]
				if (val != null && typeof val !== 'undefined') {
					if (!val.replace)
						alert('значение URL - не строка')
					const url = val.replace(C.repQuotes, ''),
						wref = C.DeCodeUrl(urlrfs, url)

					if (wref.err.length > 0)
						urlerrs.push({ ori: nam, err: wref.err, url: url })
					urlsets.push({ nam: nam, url: wref.url, 'ориг.': (wref.url != url) ? url : '-"-' })
					urlrfs[nam] = wref.url
				} else
					urlerrs.push({ ori: nam, err: `не определено`, url: '' })
			}

			if (C.consts.o5debug > 0 && urlsets.length == 0)
				C.ConsoleInfo(`${modul}: именованные ссылки отсутствуют`, '   ?')

			if (urlerrs.length > 0)
				C.ConsoleError(`${modul}: недоопределённые ссылки`, urlerrs.length, urlerrs)
		},
		CopyVals = (xs, c, type) => {
			for (const nam in c) {
				const x = xs.find(x => x.nam == nam)
				if (x) Object.assign(x, { val: c[nam], source: type })
				else xs.push({ nam: nam, val: c[nam], source: type })
			}
		},
		InitCSS = (W, o5css) => {
			const chs = document.head.children,
				id = W.class + '_internal',
				csso = csslist[W.class]
			let err = ''

			if (typeof csso === 'undefined') {
				for (const ch of chs)
					if (ch.nodeName == "STYLE" && ch.id == id) {
						err = `Стиль id='${id}' (модуль: '${W.modul}', класс: '${W.class}) уже определён в документе`
						break
					}
			} else
				if (csso != W.modul) err = `Класс '${W.class}' повторяется в модулях '${csso}' и '${modul}. '`

			if (err) C.ConsoleError('>>  создание CSS  ' + err, 'InitCSS')
			else {
				if (C.consts.o5debug > 0)
					console.log(`>>  СОЗДАНИЕ CSS   ${W.class} (для модуля ${W.modul}) с id='${id}'`)
				csslist[W.class] = W.modul

				const styl = document.createElement('style')
				styl.setAttribute('type', 'text/css')
				styl.id = id

				const moeCSS = document.head.appendChild(styl)
				moeCSS.innerHTML = o5css.replace(/(\/\/.*($|\n))|(\s*($|\n))/g, '\n')
				// (\/\/.*$)           мои коменты '//' до конца строки
				// (\/\*(.|\s)*?\*\/)  стандартные коменты (проверить!!! поему-то переносит строки правил)
				// (\s*$)              пустое до конца строки       
			}
		},
		PrintParams = (modul, xs, p, n1) => {
			if (C.consts.o5debug > 0) {
				let n2 = 0
				for (const nam in xs) n2++
				C.ConsoleInfo(`${modul}: все константы '${p}' `, `${('' + n2).padStart(2)} (своих=${('' + n1).padStart(2)})`, xs)
			}
		},
		ParamsFill = function (W, o5css) {
			if (W.isReady)
				return

			const scrpt = C.scrpts.find(scrpt => scrpt.modul == W.modul)

			if (!scrpt) {
				C.ConsoleError(`? В 'C.scrpts' не наден модуль `, W.modul)
				return
			}

			if (o5css) InitCSS(W, o5css)

			const isnew = !!scrpt.script,
				attrs = isnew ? C.GetAttrs(scrpt.script.attributes) : C.o5attrs

			for (const p of ['consts', 'urlrfs']) {
				const xs = {} // временное хранилилище для считываемых параметров
				
				let askps = {}
				if (W[p])   // т.е. если параметр был передан отдельно. Если еще не обрабатывался - SplitParams
					askps = (typeof W[p] === 'object') ? W[p] : SplitParams(W[p], p, ';,')

				for (const nam in C[p]) {
					const source = C.constsurl.hasOwnProperty(nam) ? C.save.urlName : `ядро`
					if (!xs.hasOwnProperty(nam)) xs[nam] = { val: C[p][nam], source: source }
				}
				if (isnew) {
					W[p] = {}	// преобразовываю в объект
					const n1 = C.ParamsFillFromScript(xs, askps, attrs, p)

					if (p == 'urlrfs') {
						const urls = {}
						for (const nam in xs) urls[nam] = xs[nam].val
						DeCodeUrlRfs(urls, `${W.modul}: `)
						for (const nam in xs) xs[nam].url = urls[nam]
					}
					else
						for (const nam in C.constsurl)
							if (xs[nam].source != C.save.urlName)
								Object.assign(xs[nam], { val: C.constsurl[nam], source: `${C.save.urlName}(восстановил)` })

					for (const nam in xs)
						W[p][nam] = xs[nam].val

					PrintParams(W.modul, xs, p, n1)
				}
				else
					C.ConsoleInfo(`${W.modul}: параметры и ссылки берутся только из скрипта ядра библиотеки`)
			}
		}

	wshp[modulname] = url_olga5 => {
		C.urlrfs._url_olga5 = url_olga5

		Object.assign(C, {
			ParamsFill: ParamsFill,
			SplitParams: SplitParams,
		})

		PrintParams(C.consts, C.save.xs, C.save.p, C.save.n1)

		const p = 'urlrfs',
			xs = {}, // временное хранилилище для считываемых параметров
			defs = C[p]

		const n1 = C.ParamsFillFromScript(xs, defs, C.o5attrs, p)
		for (const nam in xs) defs[nam] = xs[nam].val

		DeCodeUrlRfs(defs, C.save.libName)

		for (const nam in defs) { xs[nam].url = defs[nam] }
		PrintParams(C.save.libName, xs, p, n1)

		// delete C.save
		Object.freeze(C)
		return true
	}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();
/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  исправление 'src', 'data-src' и 'href' в тегах html-заголовка
 **/
//
(function () {              // ---------------------------------------------- o5com/TagRefs ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'TagsRef'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}
	let trn = 0
	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		// regExp = /[^\/\s+]+$/
		// olga5_script = document.currentScript,
		ReplaceTag = (tagName, change, adrName, url, errs) => {
			const addnew = document.createElement(tagName),
				regExp = new RegExp(/[\\+<>'"`=#\\/\\\\]/)
			let err = false
			for (const attr of change.attributes) {
				if (attr.name.match(regExp)) {
					errs.push({ tag: tagName, ref: attr.name, txt: `cодержит кавычки или '+><=#/'` })
					err = true
				}
				else
					try {
						addnew.setAttribute(attr.name, attr.value) // здесь копирую "как есть" 
					} catch (err) {
						errs.push({ tag: tagName, ref: url, txt: (attr.name + '=' + attr.value) })
					}
			}
			addnew.setAttribute(adrName, url)
			// change.dataset.o5_old = 1 // это нужно, если не удалять оригинал
			if (err || C.consts.o5debug > 1)
				console.log(`добавляю тег <${tagName}> с атрибутом ${adrName}=${url} ${err ? ' с ошибками' : ''}`)

			// if (trn>=7)
			// 	console.log()
			// if (addnew.tagName== "SCRIPT")	
			// console.log(trn++, addnew.src, change.src)
			// if (addnew.tagName== "LINK")	
			// console.log(trn++, addnew.href, change.href)
			change.parentNode.insertBefore(addnew, change)
			change.parentNode.removeChild(change) //  ??  а вот удалять  -м.б. и не надо: для контроля

			return addnew
		},
		ConvertScripts = () => {
			const errs = [],
				scrs = [],
				preloads = [],
				load_snm = {},
				Orig = (obj) => {
					const origs = obj.outerHTML.match(/\s(data-)?src\s*=\s*["*'][^"']*["*']/g)
					if (origs && origs.length > 0) {
						origs.forEach((orig) => {
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

			incls.forEach(incl => needs[incl] = 1)
			for (const script of document.scripts) {
				// if (C.consts.o5debug > 1) console.log(`тег <script>: id= '${script.id}', src= "${script.src}"`)

				if (script === C.o5script) // это ядро, т.е. конец скриптов (не зависимо от наличия 'o5_scripts')
					break

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

				// if (needs[td.modul])needs[td.modul]=0
				// else (if )
				// if (Igns(td.modul)) {
				// 	if (C.consts.is_debug > 1) console.log(`   -"-    игнорируется: orig=${td.orig}`)
				// 	continue
				// }

				if (load_snm[td.modul])
					errs.push({ tag: td.modul, ref: td.orig, txt: 'повторная загрузка модуля' })
				load_snm[td.modul] = td.orig // перезаписываю!

				const w = window.olga5.find(w => w.modul == td.modul),
					scrpt = { modul: td.modul, orig: td.orig, act: { W: w }, script: script, }
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
						// scrpt.script = ReplaceTag('script', script, 'src', wref.url, errs)
					}
					scrpt.script = ReplaceTag('script', script, 'src', url, errs)
				}

				C.scrpts.push(scrpt)	//	{ modul: td.modul, orig: td.orig, act: { W: null }, script: replace, })
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
						C.scrpts.push({ modul: modul, orig: '', act: { W: w }, script: C.o5script })
						scrs.push({ modul: modul, orig: '', src: C.o5script.src, txt: `из скомпилированного` })
					}
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
						C.ConsoleError(`${errs.length} странных атрибутов (м.б. перепутаны кавычки?) у скрипта`, scrpt.modul + '.js', errs)
				}
			}
			if (errs.length > 0)
				C.ConsoleError(`Ошибки в преобразовании SCRIPT `, errs.length, errs)

			for (const scrpt of C.scrpts) {
				Object.assign(scrpt.act, { done: 0, strt: 0, timeout: 0 })
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

	wshp[modulname] = () => {
		// тут еще не определен 'C.consts'                if (C.consts.o5debug > 0) 
		// console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)

		ConvertScripts()
		ConvertLinks()

	}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();
/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  загрузка (при необходимости) и инициализация подключаемых скриптов
 **/
//
(function () {              // ---------------------------------------------- o5com/IniScripts ---
	'use strict'
	const olga5_modul = 'o5com',
		modulname = 'IniScripts'
	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}
	let cc = null
	const wshp = window.olga5[olga5_modul],
		C = window.olga5.C,
		completeState = "complete",
		myclr = "background: blue; color: white;border: none;",
		HasStart = doc =>
			doc.URL.match(/\bolga5-tests\b/i) || doc.querySelector('.olga5_Start'),
		page = {
			cls: 'olga5_isLoading',
			errs: { load: 0, url: 0 },
			def: { url: '', start: 0, timera: '', timToFinish: 0, timInit: 0, loaded: false, isInitScript: false },
			pact: {},
			childs: [],
			dones: [],
			winits: ['olga5_sload', 'olga5_sinit'],
			initList: [],
			InitDoc: e => {
				const proc = `--- InitDoc (${e ? e.type : 'из InitScripts'}): `
				if (e) {
					if (!e.detail || !e.detail.modul) {
						C.ConsoleError(`${proc} для события '${e.type}' НЕ указан 'detail' или 'detail.modul'`)
						return
					}
					const modul = e.detail.modul.trim(),
						t = e.type == 'olga5_sinit' ? 'i' : 'L'
					if (cc.o5debug > 1) console.log(`${proc}: ${modul}  -> '` + t + `'`)
					if (t == 'i') {
						if (modul) {
							const scrpt = C.scrpts.find(scrpt => scrpt.modul == modul)
							if (scrpt)
								scrpt.act.done = scrpt.act.strt
							else C.ConsoleError(`${proc} для события '${e.type}' указан несуществующий модуль '${modul}'`)
						}
						else C.ConsoleError(`${proc} в событии '${e.type}' не задан атрибут 'modul'`)
					}
					page.initList.push(modul + '/' + t)
				}
				else
					if (cc.o5debug > 2) console.log(`${proc}: отработка после InitScript`)
				// в блоге сюда попадает при еще не инициализированной странице
				// 'o5menu' переделать на ....
				window.clearTimeout(page.pact.timInit)
				if (page.initList.length > 0) {
					if (!page.pact.isInitScript) {
						page.pact.timInit = window.setTimeout(InitScripts, 11, 'init/Load')
						if (cc.o5debug > 2) console.log(`${proc} setTimeout ${page.pact.timInit}`)
					}
				}
				else {
					const start = page.pact.start
					if (!C.scrpts.find(scrpt => scrpt.act.done != start)) {
						if (cc.o5debug > 1) console.log(`${proc}:  закончена инициализация`)
						page.Finish()
					}
					else if (cc.o5debug > 1) {
						let s = ''
						C.scrpts.forEach(scrpt => {
							if (scrpt.act.done != start) s += scrpt.modul + ', '
						})
						console.log(`${proc}:  не закончена инициализация:    ${s}`)
					}
				}
			},
			Unload: function (url) { // -"-"
				const n0 = this.childs.length
				if (n0 > 0) {
					if (cc.o5debug > 0) console.log('}=====< Unload: закрытие открытых (n= ' + n0 + ')')
					let n = n0
					while (n-- > 0) {
						const child = this.childs[n],
							owner = child.aO5_pageOwner
						for (const item of owner.children)
							if (item == child) {

								item.remove()
								break
							}
					}
					this.childs.splice(0, n0);
				}
				if (this.pact.loaded) {
					C.scrpts.forEach(scrpt => {
						const act = scrpt.act
						if (act && act.W && act.W.Done)
							act.W.Done()
					})
				}
				this.pact.url = url
				this.pact.loaded = false
				// document.dispatchEvent(new window.Event('visibilitychange')) // для PopUp в Блоггере
				document.dispatchEvent(new CustomEvent('visibilitychange', { detail: { unload: true } }))// для PopUp в Блоггере
				// Object.assign(this.pact, this.def)
			},
			Start: function (url) {
				const timera = `}====<<<   ОБРАБОТАНА СТРАНИЦА ${url}`,
					NotFinished = () => {
						const errs = []
						let prev = ''
						for (const scrpt of C.scrpts) {
							const act = scrpt.act
							let err = ''
							if (!err) {
								if (!act.W) err = "не загружен файл "
								else if (act.strt == 0) err = "инициализация не начиналась?"
								else if (act.strt != act.done) err = "инициализация не закончилась"
							}
							if (err) errs.push({ class: scrpt.modul, err: err })
						}
						if (errs.length == 0) errs.push({ err: "какого-то хрена слетела на 'NotFinished()'" })

						page.Finish(errs)
					},
					ActScripts = (scriptDone) => {
						const scrs = C.GetTagsByTagName('script'),
							m = new RegExp('\\bdocument\\.currentScript\\.setAttribute\\s*\\(\\s*[\'`"]' + scriptDone + '.*?(;|\\n|$)', 'i')

						for (const scr of scrs) {
							const matchs = scr.innerText.match(m)
							if (matchs) {
								const atr = scr.attributes[scriptDone]
								if (!atr || atr.value != 1) {
									const s = scr.innerText.replace(matchs[0], '')
									if (C.consts.o5debug > 0)
										console.log(`Выполняется скрипт: \n${s}`)
									eval(s)
									scr.setAttribute(scriptDone, 1)
								}
							}
						}
					}
				console.time(timera)

				C.ClearOwners() //  чтобы пересчитало область определения

				this.dones.splice(0, this.dones.length)
				Object.assign(this.pact, this.def,
					{ url: url, timera: timera, start: Number(new Date()) + Math.random() })

				if (cc.o5timload) {
					if (this.pact.timToFinish > 0) window.clearTimeout(page.pact.timToFinish)
					this.pact.timToFinish = window.setTimeout(NotFinished, 1000 * cc.o5timload)
				}

				if (!document.body.classList.contains(this.cls))
					document.body.classList.add(this.cls) // это если есть такой класс

				// тут "olga5_sload" и: "olga5_sinit"
				this.winits.forEach(eve => window.addEventListener(eve, this.InitDoc))

				if (C.consts.o5doscr)
					ActScripts(C.consts.o5doscr)

				if (cc.o5debug > 0)
					console.log('%c%s', myclr, "}--------<<  старт обработки страницы ", url)

				if (cc.o5debug > 0) {
					const o5inc = C.scrpts.find(scrpt => scrpt.modul == 'o5inc'),
						o5include = document.querySelector('[o5include]')
					if (o5inc && !o5include) C.ConsoleError(`Задан скрипт 'o5inc.js' но отсутствует тег с атрибутом 'o5include'`)
					if (!o5inc && o5include) C.ConsoleAlert(`Имеется тег с атрибутом 'o5include' но отсутствует  скрипт 'o5inc.js'`)
				}
			},
			Finish: function (errs) {
				if (page.pact.timToFinish > 0) window.clearTimeout(page.pact.timToFinish)
				if (!errs)
					window.dispatchEvent(new window.Event('olga5_ready'))

				// Object.assign(this.pact, this.def)

				if (document.body.classList.contains(this.cls))
					document.body.classList.remove(this.cls)

				this.pact.loaded = true
				if (errs)
					C.ConsoleError(`Скрипты не завершились по таймауту ${cc.o5timload} сек.`, errs.length, errs)
				else {
					this.winits.forEach(eve => window.removeEventListener(eve, this.InitDoc))

					if (cc.o5debug > 2)
						console.log('%c%s', myclr, "}===< КОНЕЦ  обработки страницы ", page.pact.url)
				}
				if (this.pact.timera) {
					console.timeEnd(this.pact.timera)
					this.pact.timera = ''
				}
				if (cc.o5debug > 0)
					console.log('                           ')
			}
		},
		InitScripts = txt => {
			page.pact.isInitScript = true
			const start = page.pact.start,
				l = page.initList.length,
				proc = `InitScripts: ${txt} `

			page.initList.splice(0, l)
			if (!start) {
				if (cc.o5debug > 1)
					console.log(`${proc}: страница еще не загружена - пропускаю  ------------------`)
				return
			} else
				if (cc.o5debug > 1)
					console.log(`--> ${proc}: ` + (l > 0 ? page.initList.join(',') : '') + `   ----------------------------------------`)

			for (const scrpt of C.scrpts) {
				const act = scrpt.act
				/* проверка загруженности этого скрипта */
				if (!act.W) {
					act.W = window.olga5.find(w => w.modul == scrpt.modul)
					if (!act.W)
						continue	// такой скрипт еще не подгружен. ожидаем-с
				}

				const modul = act.W.modul
				/* проверка инициализированности этого скрипта */
				if (start == act.done || !act.W.Init)  // уже инициирован или не требует инициализации (Object.assign(act, { strt: start, done: strt }))
					continue

				/* проверка инициализированности необходимых скриптов */
				let shallini = start != act.strt
				if (shallini) {
					const mods = C.depends[modul]
					if (!mods) {
						for (const scrpt of C.scrpts) {
							if (modul == scrpt.modul) break
							if (start != scrpt.act.done) {
								shallini = false
								break
							}
						}
					}
					else if (mods.length > 0)
						for (const mod of mods) {
							const scrpt = C.scrpts.find(scrpt => mod == scrpt.modul)
							if (scrpt && start != scrpt.act.done) { // скрипт подключен, но его иниц. еще не закончена (или не начиналась)
								shallini = false
								break
							}
						}
				}
				/* проверка инициализация не начиналась и (в отладочном)  - не было ли повтора*/
				if (shallini) {
					if (cc.o5debug > 1) {
						console.log(`    ${proc}:  иниц. '${modul}' `)
						const im = page.dones.find(im => im.modul == modul && !im.shown)
						if (im) {
							C.ConsoleError(`Повтор инициализациии модуля '${modul}' - игнорируется (м.б. заменить 'src' на 'data-src'?)`)
							im.shown = true
						}
						else
							page.dones.push({ modul: modul, shown: false })
					}
					act.strt = start
					act.W.Init(C)
				}
			}

			if (cc.o5debug > 2) console.log(`--< ${proc}`)

			page.pact.isInitScript = false
			window.setTimeout(page.InitDoc, 1)

		},
		WinOnLoad = (url, txt) => {
			const proc = `WinOnLoad (${txt})`,
				newurl = page.pact.url != url

			if (C.scrpts.length <= 0 && page.errs.load++ == 0)
				C.ConsoleError(`${proc}: вообще нет скриптов для обработки`)

			if (!url && page.errs.url++ == 0)
				C.ConsoleError(`${proc}: невозможно определить url`)

			if (C.consts.o5debug > 0)
				console.log(`${proc}:  readyState=${document.readyState}, ` +
					`errs=${(page.errs.load > 0 || page.errs.url > 0) ? true : false}, url=${url}` +
					` (url->${(newurl ? 'новый' : 'старый')})`
				)
			// if (document.readyState != 'complete' || !newurl || page.errs.load > 0 || page.errs.url > 0) return
			// if (document.readyState == 'loading' || !newurl || page.errs.load > 0 || page.errs.url > 0) return
			if (!newurl || page.errs.load > 0 || page.errs.url > 0) return

			const match_html = /\.html([?&#]|$)/

			if (page.pact.url && page.pact.url.match(match_html)) { // закрываем старую страницу
				page.Unload(url)
			}
			if (url.match(match_html)) {
				page.Start(url)
				InitScripts(txt)
			}
		},
		EventUrl = doc => {
			return doc ? doc.URL.match(/[^?&#]*/)[0].trim() : ''
		},
		init_events = {
			tim: 0,
			txt: '',
			typ: '',
			Act: e => {
				const txt = e.currentTarget === document ? 'doc' : 'win',
					isold = e.timeStamp == init_events.tim && e.type == init_events.typ,
					doc = e.target.ownerDocument || e.target.document || e.target,
					isdel = init_events.txt != txt,
					url = EventUrl(doc)
				if (cc.o5debug > 0) {
					const src = e.srcElement,
						phases = ['NONE', 'CAPTURING', 'AT_TARGET', 'BUBBLING'],
						name = src.nodeName + (src.id ? '#' + src.id : '') + (src.className ? ('.' + src.className.replace(/\s+/g, '.')) : ''),
						doc = document.URL.match(/\/[^\/]*$/)[0].substring(1),
						fmt = "background: PaleGreen; color: black;",
						ep = e.eventPhase,
						add = e.type == 'message' ? (e.origin + '(' + e.data + ')') :
							(e.type == 'transitionstart' ? (e.propertyName ? `(${e.propertyName})` : '') : '')
					console.log('%c%s', fmt, `${txt}: ${e.type.padEnd(18)} ${('' + e.timeStamp).padEnd(8)}  ${ep}=${phases[ep]}, ${doc} (${document.readyState})`,
						(name.match('undefined') ? 'W' : name) + ' ' + add + ' ' + (isold ? ' - игнорю' : '') + (isold && isdel ? ' и удаляю' : ''))
					// if (name.match('undefined'))
					// console.log('')
				}
				if (isold) { // удалить "лишний" из обработчиков
					if (isdel)
						(txt == 'doc' ? document : window).removeEventListener(e.type, init_events.Act)
					return
				}

				Object.assign(init_events, { tim: e.timeStamp, txt: txt, typ: e.type })
				if (document.readyState == completeState && HasStart(document))
					if (url == document.URL.match(/[^?&#]*/)[0] && page.pact.url != url)
						WinOnLoad(url, `событие '${e.type}'`)
			}
		}

	Object.assign(page.pact, page.def)
	Object.seal(page.pact)
	Object.freeze(page.def)
	Object.freeze(page)

	C.AppendChild = function (owner, child) { // не делать через => чтобы м.б. this
		child.aO5_pageOwner = owner
		owner.appendChild(child)
		page.childs.push(child)
	}
	C.InsertBefore = function (owner, child, reference) { // не делать через => чтобы м.б. this
		child.aO5_pageOwner = owner
		owner.insertBefore(child, reference)
		page.childs.push(child)
	}
	let nbody = 0
	if (!wshp[modulname])
		wshp[modulname] = () => {
			cc = C.consts
			if (cc.o5debug > 0) console.log(`}===  инициализация ${olga5_modul}/${modulname}.js`)

			if (cc.o5nomnu > 0)
				document.body.classList.add('o5nomnu')

			if (cc.o5noact > 0) {
				((C && cc.o5debug > 0) ? C.ConsoleError : console.log)
					("}---> загружено `o5common.js`, но инициализация ОТКЛЮЧЕНА по o5noact= '" + cc.o5noact + "'")
				return
			}

			const depends = {},
				ss = (cc['o5depends'] || C.depends.spisok).split(/[,;]/)
			ss.forEach(s => {
				const uu = s.trim().split(/\s*[\s:=]+\s*/),
					u = uu[0]
				if (u)
					depends[u] = (depends[u] || []).concat(uu.slice(1))
			})
			Object.assign(C.depends, depends)

			for (const doc of [document, window]){ // отработка загрузки документа
			const eves=cc.o5init_events.trim().split(/\s*[,;]\s*/) || []
			eves.forEach(eve => doc.addEventListener(eve, init_events.Act))
}
			if (document.readyState == completeState && HasStart(document))
				WinOnLoad(EventUrl(document), "готовность документа (сразу)")

			window.addEventListener('beforeunload', e => {
				page.Unload('')
			}, { capture: true })

			if (cc.o5debug > 0)
				console.log(`}---> ядро библиотеки ожидает события:  [${cc.o5init_events}]`)

			InitScripts(`ядро библиотеки`)

			return true
		}

	if (window.location.search.match(/(\&|\?|\s)is(-|_)debug\s*(\s|$|\?|#|&|=\s*\d*)/))
		console.log(`}---> подключен ${olga5_modul}/${modulname}.js`)
})();/* global document, window, console, Map*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/**
 *  сборщик модулей ядра библиотеки
**/
//
(function () {              // ---------------------------------------------- o5com ---
	'use strict'
	const olga5_modul = "o5com",
		// modulname= 'o5com',
		timera = '                                                                <   инициирован ' + olga5_modul

	if (!window.olga5) window.olga5 = []
	if (!window.olga5.C) window.olga5.C = {}
	if (!window.olga5[olga5_modul]) window.olga5[olga5_modul] = {}

	const C = window.olga5.C

	const wshp = window.olga5[olga5_modul],
		modnames = ['CConsole', 'CEncode', 'CApi', 'CParams', 'TagsRef', 'IniScripts'],

		IncludeScripts = ({ modul = '', names = [], actscript = C.o5script, iniFun = {}, args = [] }) => {
			const nams = {},
				o5timload = C.o5script.attributes['o5timload'] || 3,
				load = { is_set: false, timeout: 0, path: '' },
				actpath = actscript.src.match(/\S*\//)[0],
				OnTimer = () => {
					let s = ''
					for (const nam in nams)
						if (!nams[nam]) s += (s ? ', ' : '') + nam

					if (s)
						console.error(`Для ${modul} недозагрузились скрипты: ${s} (таймер o5timload=${o5timload}с.)`)
					load.timeout = 0
				},
				OnLoad = (name) => {
					nams[name] = true
					for (const nam in nams)
						if (!nams[nam]) return

					if (load.timeout > 0) {
						window.clearTimeout(load.timeout)
						load.timeout = 0
					}
					iniFun(args)
				},
				OnError = (name, e) => {
					console.error(`Для ${name} ошибка дозагрузки '${name}' (из ${e.target.src})`)
					// OnLoad(name)
				}

			for (const name of names) { // в очерёдности размещения	
				if (!window.olga5[modul]) {
					C.ConsoleError(`В скрипте, выполняющем дозагрузку скриптов, не создан объект 'window.olga5.${modul}'`)
					continue
				}
				if (!window.olga5[modul][name]) {
					if (!load.is_set) Object.assign(load, {
						is_set: true,
						// path: C.o5scriptPath + modul + '/',
						path: actpath + modul + '/',
						timeout: window.setTimeout(OnTimer, 1000 * o5timload),
					})
					nams[name] = false

					const script = document.createElement('script')

					if (script.readyState) script.onreadystatechange = () => { OnLoad(name); }
					else script.onload = () => { OnLoad(name); }
					script.onerror = function (e) { OnError(name, e); }

					script.src = load.path + name + '.js'
					script.dataset.o5add = modul
					if (C.consts.o5debug > 0) {
						const MakeObjName = obj =>
							(obj.id && obj.id.length > 0) ? ('#' + obj.id) : (
								('[' + obj.tagName ? obj.tagName : (obj.nodeName ? obj.nodeName : '?') + ']') +
								'.' + (obj.className ? obj.className : '?'))
						console.log(`Вставляю скрипт ${name + '.js'}  перед  ${modul + '.js'} (в parentNode=${MakeObjName(actscript.parentNode)})`)
					}

					if (actscript.parentNode)
						actscript.parentNode.insertBefore(script, actscript)
					else // это ватще-то заплатка. по-хорошему надо бы убрать 'actscript' оставив 'module'	
						for (const scr of document.scripts)
							if (scr.src.lastIndexOf('/' + modul + '.js') > 0) {
								scr.parentNode.insertBefore(script, scr)
								break
							}
				}
			}
			if (!load.timeout) iniFun(args)
		},
		RunO5com = () => {
			console.time(timera)
			Object.assign(C, {
				IncludeScripts: IncludeScripts,
			})

			const _url_olga5 = C.o5script.src.match(/\S*\//)[0],
				errs = []
			for (const modname of modnames) {
				if (wshp[modname]) wshp[modname](_url_olga5)
				else
					errs.push(modname)
			}

			if (errs.length > 0)
				console.error(`Не найдены [${errs.join(', ')}] в ${olga5_modul}.js ( где-то синтаксическая ошибка ?)`)
			console.timeEnd(timera)
		},
		GetBaseHR = (root) => { // функции определения адреса текущиещей страницы и корня сайна
			const url = new window.URL(window.location) //"http://rombase.h1n.ru/o5/2020/olga5-all.html")
			if (root == 'root') return url.origin + '/'
			else return url.origin + url.pathname.substring(0, url.pathname.lastIndexOf('/') + 1)
		},
		TryToDigit = x => {
			if (typeof x === 'undefined') return true
			const val = ('' + x).replace(C.repQuotes, '')

			const i = parseInt(val)
			if (i == val) return i
			const f = parseFloat(val)
			if (f == val) return f
			const rez = val.replace(/\s*;\s*\n+\s*/g, ';').replace(/\s*\n+\s*/g, ';')
			return rez.replace(/\t+/g, ' ').trim()
		},
		GetAttribute = (attrs, name) => { // нахождение значения 'attr' в массиве атрибутов 'attrs'
			const nams = [name, 'data-' + name, '_' + name, 'data_' + name]
			for (const nam of nams)
				if (attrs.hasOwnProperty(nam)) return attrs[nam]
		},
		GetAttrs = attributes => {
			const attrs = {}
			for (const attribute of attributes)
				attrs[Repname(attribute.name)] = TryToDigit(attribute.value)
			return attrs
		},
		Repname = name => {
			return name.trim().replaceAll('-', '_').toLowerCase()
		},
		ConstsFillFromUrl = (xs) => {  // параметры адресной строки,- м.б. (т.е. интерпретируются) только константы
			const hash = window.location.hash
			if (hash) 
				C.save.hash = hash ? hash.substring(1).trim() : ''
				
			const smatchs = window.location.search.match(/[?&]\S+?(#|$)/) || []
			for (const smatch of smatchs) {
				const match = smatch.replaceAll(/(%20|\s)/g, '').trim()
				if (match) {
					const params = match.split(/[,;?&#]/)
					for (const param of params) {
						const u = param.trim()
						if (u.length > 0) {
							const prms = u.split(/[=:]/),
								nam = Repname(prms[0])
							if (C.consts.hasOwnProperty(nam)) {
								const val = TryToDigit(prms[1])
								xs[nam] = { val: val, source: C.save.urlName }
								C.constsurl[nam] = val
							}
						}
					}
				}
			}
		},
		ParamsFillFromScript = (xs, defs, attrs, p) => {
			const stradd = '(добавлен)'
			for (const name in attrs) {
				const nam = Repname(name)
				if (defs.hasOwnProperty(nam) && !xs.hasOwnProperty(nam)) {
					const add = defs.hasOwnProperty(nam) ? '' : stradd
					xs[nam] = { val: TryToDigit(attrs[name]), source: `атрибут${add}` }
				}
			}

			const partype = 'o5' + p
			if (attrs[partype]) {
				const params = attrs[partype].split(/[;]/)  // параметры в атрибуте разделяются только ';'
				for (const param of params) {
					const u = param.replace(/\s*#.*$/, ''), // trim()
						i = u.indexOf('=')
					if (i > 0) {
						const nam = Repname(u.substring(0, i).trim())
						if (!xs[nam]) {
							const add = defs.hasOwnProperty(nam) ? '' : stradd,
								val = TryToDigit(u.substring(i + 1).trim())
							xs[nam] = { val: val, source: `параметр${add}` }
							// console.log(`${nam} = '${val}'`)
						}
					}
				}
			}

			let n = 0	// подсчет к-ва 'стандартных' параметров
			for (const nam in defs) {
				n++
				if (!xs[nam])
					xs[nam] = { val: TryToDigit(defs[nam]), source: 'default' }
			}
			return n
		}

	Object.assign(C, {
		repQuotes: /^\s*['"`]?\s*|\s*['"`]?\s*$/g,  // необязат. первая и последняя кавычки с окруж. пробелами,
		TryToDigit: TryToDigit,
		ParamsFillFromScript,
		GetAttrs: GetAttrs,
		GetAttribute: GetAttribute,
		Repname: Repname,
		o5script: document.currentScript,
		o5attrs: GetAttrs(document.currentScript.attributes),
		cstate: { activated: false }, // общее состояние 
		urlrfs: {
			_url_html: GetBaseHR('href'),
			_url_root: GetBaseHR('root'),
			_url_olga5: '' // будет задан при инициализации (document.currentScript.src.match(/\S*\//)[0],)
		},
		consts: {
			o5debug: 0, o5nomnu: 0, o5noact: 0, o5timload: 3, o5only: 0,
			o5incls: '', o5doscr: 'olga5_sdone',
			o5init_events: 'DOMContentLoaded, readystatechange, transitionstart, transitionend, message',
		},
		constsurl: {},
		depends: { spisok: "o5ref o5inc, o5pop, o5snd:o5ref o5inc; o5shp=o5snd o5ref, o5shp:o5inc, o5blog o5mnu o5inc, o5mnu o5inc" },
		save: { hash: null, xs: null, p: '', n1: -1, urlName: 'url', libName: 'ядро', }, // сохранение для "красивой" печати - потом удалю
		// urlSaveName: 'url',
		// libSaveName: 'ядро'		
	})

	const xs = {}, // временное хранилилище для считываемых параметров
		p = 'consts',
		defs = C[p]

	Object.assign(C.save, { xs: xs, p: p, n1: -1 })

	ConstsFillFromUrl(xs)
	C.save.n1 = ParamsFillFromScript(xs, defs, C.o5attrs, p)

	for (const nam in xs) defs[nam] = xs[nam].val

	IncludeScripts({ modul: olga5_modul, names: modnames, actscript: C.o5script, iniFun: RunO5com, })

	const activateEvents = ['click', 'keyup', 'resize'],
		SetActivated = e => {
			C.cstate.activated = true
			activateEvents.forEach(activateEvent => document.removeEventListener(activateEvent, SetActivated))
		}
	activateEvents.forEach(activateEvent => document.addEventListener(activateEvent, SetActivated))
	//и почему таки не меняется изображение?

	console.log(`}---< загружено ядро библиотеки`)
})();
