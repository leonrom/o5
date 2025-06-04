/* -global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5snd/AO5snd ---
    "use strict"
    const
        olga5_modul = 'o5snd',
        modulname = 'AO5snd',
        C = window.olga5.C,
        wshp = C.ModulAddSub(olga5_modul, modulname, snd => {
            const
                ss = wshp.setClass,
                olga5sndError = wshp.css.olga5sndError,
                W = window.olga5.find(w => w.modul == olga5_modul), // так делать во всех подмодулях 
                o5debug = C.consts.o5debug,
                lognam = `${olga5_modul}/${modulname} `,
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
                                console.log(`${lognam} Изменено: ${txt} для '${aO5.name}' }`)
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
                            C.ConsoleError(`"${errTypes[mrk]}" (код=${mrk})` + (txt ? ` ${txt}` : '') + ` для '${aO5.name}'`)

                            aO5.sound.errIs.errs = true
                            if (!aO5.snd.classList.contains(olga5sndError))
                                aO5.snd.classList.add(olga5sndError)
                        }
                    },
                    RemError: (aO5, mrk) => {
                        if (aO5.sound.errIs[mrk]) {
                            errTypes.SetT(aO5, mrk, false)
                            console.log(`${lognam} Устранена ошибка: errTypes.${mrk}`)

                            const errIs = aO5.sound.errIs
                            for (const erri in errIs)
                                if (erri != 'errs' && errIs[erri])
                                    return

                            aO5.sound.errIs.errs = false
                            if (aO5.snd.classList.contains(olga5sndError))
                                aO5.snd.classList.remove(olga5sndError)
                        }
                    }
                },
                StartSound = (aO5) => {
                    const sound = aO5.sound,
                        audio = sound.audio,
                        Play = (aO5) => {
                            if (o5debug > 1) console.log(`${lognam}   > Play()`)

                            if (aO5.modis.over && !wshp.activated)
                                errTypes.AddError(aO5, 'неАктивир.')

                            if (sound.ison) { // если курсор не ушел
                                if (o5debug > 1) console.log(`${lognam} --> Play OK`)
                                try {
                                    const audio = sound.audio
                                    // audio.volume = aO5.sound.volume
                                    audio.playbackRate = sound.shiftKey != 0 ? o5shift_speed : 1.0
                                    if (sound.state != ss.pause) audio.currentTime = 0 // т.е. если перезапуск старого музона	
                                    else audio.currentTime = Math.max(audio.currentTime - W.consts.o5return_time, 0)

                                    audio.play()
                                }
                                catch (e) {
                                    console.error(`ошибка воспроизведения:`, e.message)
                                }
                            }
                            else
                                wshp.StopSound(aO5)
                        }

                    if (o5debug > 1) console.log(`${lognam} --> StartSound() из '${aO5.sound.state}'`)

                    if (wshp.actaudio && wshp.actaudio != audio)
                        wshp.StopSound(wshp.actaudio.aO5snd)
                    
					window.dispatchEvent(new CustomEvent('olga5_stopPlay', { detail: { tag: wshp.actaudio, type: 'audio(moe)', } }))

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
                                        `\n${e.type}: (это при audio_play= '${aO5.parms.audio_play}', attrs.aplay= '${aO5.modis.aplay}') `)
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
                                    wshp.activated = true
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
                            { type: 'loadstart', Act: snd => snd.classList.add(wshp.css.olga5sndLoad) },
                            { type: 'loadeddata', Act: snd => snd.classList.remove(wshp.css.olga5sndLoad) },
                            { type: 'abort', Act: (snd, e) => PlayError(snd.aO5snd, e) },
                            { type: 'stalled', Act: (snd, e) => PlayError(snd.aO5snd, e) },
                        ],
                        OnPlayAct = (e, eacts, txt) => {
                            const type = e.type,
                                snd = GetTargetObj(e),
                                aO5 = snd.aO5snd

                            if (o5debug > 1) console.log(`${lognam}  OnPlayAct.${txt}  ${('' + e.timeStamp).padStart(8)}` +
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

                            // if (o5debug > 1) console.log(`${lognam}  CallStartSound() ${aO5.name} '${aO5.sound.state}'  e.type= '${e.type}'`)
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

                    if (o5debug > 1) console.log(`${lognam}  Activate ${aO5.name} '${e.type}'`)

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

                    if (o5debug > 2) console.log(`${lognam}  WaitActivate ${snd.id}`)
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

        )

})();
/* -global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5snd/Prep ---
    "use strict"

    const
        olga5_modul = 'o5snd',
        modulname = 'Prep',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        lognam = `${olga5_modul}/${modulname} `,
        StopSoundOnPage = () => {
            if (wshp.actaudio)
                wshp.StopSound(wshp.actaudio.aO5snd)
        },
        TryEncode = (ori, tag) => {
            const wref = C.DeCodeUrl(wshp.W.urlrfs, ori.url, tag ? tag.aO5snd.o5attrs : '')
            if (wref.err.length > 0)
                errs.Add(C.MakeObjName(tag), ori.url, "декодир. ссылки", ori.atr, wref.err)
            return wref.url
        },
        urlattrs = [],
        errs = [],
        wshp = C.ModulAddSub(olga5_modul, modulname, mtags => {
            const btns = { stop: '', play: '' },
                DecodeAttrs = (mtag) => {
                    const snd = mtag.tag,
                        scls = snd.className,
                        aO5 = snd.aO5snd,
                        modis = aO5.modis,
                        ers = []
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
                                case 'F': if (!snd.classList.contains(wshp.css.olga5freeimg))
                                    snd.classList.add(wshp.css.olga5freeimg)
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

                    if (!modis.aplay && !modis.none)
                        errs.Add(aO5.name, scls, `игнор остальных квалиф.`, 'audio_play', "нету аудио-квалиф.")

                    if (aO5.modis.none) snd.classList.add(wshp.css.olga5sndNone)

                    if (!snd.alt || (snd.alt.trim() == '')) snd.alt = snd.title.trim()
                },
                PrepOther = aO5 => {
                    const snd = aO5.snd,
                        srcAtr = aO5.srcAtr,
                        ori = wshp.OriForTag(snd, srcAtr, '')

                    if (ori.url) {
                        const url = TryEncode(ori, snd)
                        if (url != snd[srcAtr]) {
                            snd.setAttribute(srcAtr, url)
                            urlattrs.push({ snd: aO5.name, atr: srcAtr, url: url, 'ориг.': ori.url })
                        }
                    }
                    else
                        errs.Add(aO5.name, 'PrepUrlsAudio()', `тег <${aO5.snd.tagName}>`, '', `Нет ${'data-' + srcAtr}, ${'_' + srcAtr} или ${srcAtr}`)

                    if (ori.atr == 'data-' + srcAtr || ori.atr == '_' + srcAtr)
                        snd.removeAttribute(ori.atr)	// чтоб другие модули не повторяли

                },
                GetBtnUrl = (atr) => {
                    const ori = { url: wshp.W.urlrfs[atr], atr: atr }

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

                if (tagName.match(/audio/i)) continue

                const aO5 = wshp.AO5snd(snd)

                if (mtag.quals && mtag.quals.length > 0) {
                    DecodeAttrs(mtag)

                    const ori = { url: aO5.modis.aplay, atr: 'audio_play' }
                    if (ori.url) {
                        const url = TryEncode(ori, snd)
                        aO5.parms.audio_play = url
                        urlattrs.push({ snd: aO5.name, atr: ori.atr, url: url, 'ориг.': ori.url })
                    }
                }
                else if (!aO5.modis.none)
                    errs.Add(aO5.name, 'PrepUrlsSnd()', `для тега <${aO5.snd.tagName}> '${aO5.name}' `, '', `нет 'audio_play' или иных атрибутов url'а`)

                if (aO5.image.stop) {
                    if (!wshp.imgs) {
                        wshp.imgs = wshp.Imgs()
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

                Object.seal(aO5.modis) // м.б. изменено 'none'
                Object.freeze(aO5.parms)
            }

            // window.addEventListener('olga5_done', StopSoundOnPage)
            C.E.AddEventListener('olga5_done', StopSoundOnPage)
            for (const eve of ['blur', 'pagehide', 'dblclick'])
                document.addEventListener(eve, StopSoundOnPage)

            /*
                        PrepareAudios
            */
            const audios = C.GetTagsByTagNames('audio', wshp.W.modul),
                efirsts = ['mouseenter', 'focusin'],
                OnPlay = (audio) => {                    
					window.dispatchEvent(new CustomEvent('olga5_stopPlay', { detail: { tag: audio, type: 'audio(тег)', } }))
                    const a = wshp.actaudio
                    if (a && a != audio)
                        wshp.StopSound(a.aO5snd)

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
                    sound: { state: wshp.setClass.stop, },
                    name: C.MakeObjName(audio),
                    o5attrs: C.GetAttrs(audio.attributes),
                }

                const name = C.MakeObjName(audio),
                    ori = wshp.OriForTag(audio, 'src', 'audio_play')

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

            if (urlattrs.length > 0)
                if (C.consts.o5debug > 0) C.ConsoleInfo(`Всего выполнено подстановок snd/audio`, urlattrs.length, urlattrs)

            if (errs.length > 0)
                C.ConsoleError(`${wshp.W.modul}: ошибки перекодировки тегов с ${wshp.W.class}`, errs.length, errs)
        })


    errs.Add = function (name, url, txt, atr, err) {
        this.push({ snd: name, 'источник': url, 'пояснение': txt, val: atr, 'ошибка': err })
    }

    Object.assign(wshp, {
        setClass: {
            stop: 'stop', play: 'play', pause: 'pause',
            SetC: (aO5, state) => {
                if (o5debug > 1) console.log(`${lognam} SetC (${aO5.name}, '${state}')`)
                const classList = (aO5.image.play ? aO5.image.play : aO5.snd).classList
                if (state == wshp.setClass.play) {
                    const image = aO5.image
                    if (image.play) {
                        image.stop.style.display = 'none'
                        image.play.style.display = aO5.modis.dspl
                    }
                    classList.add(wshp.css.olga5sndPlay)
                    classList.remove(wshp.css.olga5sndPause)
                }
                else if (state == wshp.setClass.pause) {
                    classList.remove(wshp.css.olga5sndPlay)
                    classList.add(wshp.css.olga5sndPause)
                }
                else if (state == wshp.setClass.stop) {
                    classList.remove(wshp.css.olga5sndPlay)
                    classList.remove(wshp.css.olga5sndPause)
                }
                else alert(`setClass.SetC: state='${state}'`)
                aO5.sound.state = state
            }
        },
        OriForTag: (tag, ref, atnam) => {
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
        StopSound: aO5 => {
            if (o5debug > 1) console.log(`${lognam}  StopSound (${aO5.name})`)

			// тут его НИЗЗЯ ! window.dispatchEvent(new CustomEvent('olga5_stopPlay', { detail: { tag: aO5.audio, type: 'audio', } }))

            wshp.actaudio = null

            const image = aO5.image,
                audio = aO5.audio ? aO5.audio : aO5.sound.audio

            audio.pause()
            audio.currentTime = 0
            aO5.sound.state = wshp.setClass.stop

            if (image && image.play) {
                image.play.style.display = 'none'
                image.stop.style.display = aO5.modis.dspl
            }

            if (audio !== aO5.audio)
                wshp.setClass.SetC(aO5, wshp.setClass.stop)
        },
    })

    window.addEventListener('olga5_stopPlay', e => {
        if (wshp.actaudio && wshp.actaudio != e.detail.tag)
            wshp.StopSound(wshp.actaudio.aO5snd)
        // console.log(act.id, 5, e.detail)
    })

})();
/* -global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5snd/Imgs ---
    "use strict"
    const
        C = window.olga5.C,
        olga5_modul = 'o5snd',
        modulname = 'Imgs',
        wshp = C.ModulAddSub(olga5_modul, modulname, () => {
            let imgs = null
            const
                a = document.createElement('a'),
                lognam = `${olga5_modul}/${modulname} `,
                FullUrl = (url) => {
                    if (C.IsFullUrl(url)) return url
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
                            console.log(`${lognam} olga5_Imgs создание нового для url=${url}`)

                        const nimg = document.createElement('img')
                        Object.assign(nimg, { src: url, importance: 'high', loading: 'eager', crossOrigin: null })
                        maps.set(url, { img: nimg, err: '' })

                        nimg.addEventListener('load', () => {
                            if (C.consts.o5debug > 1)
                                console.log(`${lognam} GetImgForRef: загружен url= ${url}`)
                            if (url.trim() == '')
                                alert('url=?')
                            Resolve({ img: nimg, new: true })
                        }, { once: true })

                        nimg.addEventListener('error', e => {
                            // Reject(`GetImgForRef: для url=${url}- ошибка ${e.message ? e.message : 'не определен (?)'}`)
                            Reject({ err: `GetImgForRef ошибка: ${e.message ? e.message : 'не определен'}`, url: url })
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
                            console.log(`${lognam} olga5_Imgs ${isinmap ? 'повтор  ' : 'добавлен'} url=${url} для img.id='${img.id}' ${s}`)
                    }
                    else
                        console.error(`olga5_Imgs : попытка добавить` + (img ? ` пустой src для img.id='${img.id}'` : ` пустой  <img>`))
                }),
                CopyStyle = (img, newimg) => {
                    newimg.className = img.className
                    if (img.attributes.style) {
                        if (!newimg.attributes.style)
                            newimg.setAttribute('style', '')
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
                    }).catch(reject => {
                        C.ConsoleError(reject.err, reject.url.replace(/https?:\/\//, ''))
                    })
                    // }).catch(err => {
                    //     C.ConsoleError(`SetImgByRef.${err}`)
                    // })
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
                            console.error(aO5.name, 'PrepImage()', `тег <img>`, '', `Нет вариантов url'а и отсутствует 'btn_stop'`)

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
        )
})();
/* -global document, window*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {              // ---------------------------------------------- o5snd ---
	'use strict';

	const
		C = window.olga5.C,
		W = {
			modul: 'o5snd',
			Init: SndInit,
			class: 'olga5_snd',
			consts: `		
				o5shift_speed=0.5 # при Shift - замедлять вдвое;
				o5return_time=0.3 # при возобновлении "отмотать" 0.3 сек ;
			`,
			urlrfs: 'btn_play=""; btn_stop=',
			incls: {
				names: ['AO5snd', 'Imgs', 'Prep'],
				actscript: document.currentScript,
			}
		},
		wshp = C.ModulAdd(W),
		css = {
			olga5sndError: `olga5-sndError`, olga5sndLoad: `olga5-sndLoad`, olga5sndPause: `olga5-sndPause`,
			olga5sndPlay: `olga5-sndPlay`, olga5sndNone: `olga5-sndNone`, olga5freeimg: `olga5-freeimg`,
		},
		o5css = `
		.${W.class}:not(.${css.olga5sndNone}) {
			cursor: pointer;
		}
		.${W.class}.${css.olga5sndPlay} {
			cursor: progress;
			animation: olga5_viewTextWash 5s infinite linear;
		}
		.${W.class}.${css.olga5sndPause} {
			cursor: wait;
			animation: none;
		}
		.${W.class}.${css.olga5sndError} {
			opacity: 0.5;
			outline: 2px dotted black;
			cursor: help;
		}
		.${W.class}.${css.olga5sndLoad} {
			opacity: 0.5;
			outline: 1px dotted black;
			cursor: wait;
		}
		img.${W.class}:not(.${css.olga5freeimg}) {
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
		img.${W.class}.${css.olga5sndPlay} {
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

	function SndInit() {

		wshp.css = css

		C.ParamsFill(W, o5css)


		const excls = document.getElementsByClassName('olga5_snd_none') 
		for (const excl of excls) {
			const exs = excl.querySelectorAll('[class *=olga5_snd]')
			for (const ex of exs)
				ex.classList.add('olga5-sndNone')
		}

		const mtags = C.SelectByClassName(W.class, W.modul)
		wshp.Prep(mtags)

		// window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		C.E.DispatchEvent('olga5_sinit', W.modul)
	}

})();
