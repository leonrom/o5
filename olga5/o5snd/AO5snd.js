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
                    if (snd.aO5snd.modis.none ||
                        snd.aO5snd.modis.activated
                    )
                        return

                    if (o5debug > 1) console.log(`${lognam}  WaitActivate ${C.MakeObjName(snd)}`)

                    snd.aO5snd.modis.activated = true
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

                modis = { over: false, alive: false, loop: snd.getAttribute('loop'), aplay: '', dspl: snd.style.display, none: false, activated: false }
                sound = { audio: null, errIs: { errs: false, }, state: ss.stop, eventsAreSet: false, ison: false, shiftKey: 0 }
                parms = { audio_play: '', image_play: '' }
                image = { stop: null, play: null }

                // для доступа из o5snd
                waitActivate = snd => WaitActivate(snd)
                asdf=1
            }
            return new AO5snd(snd)

        })

})();
