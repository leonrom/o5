/* global window, document, console */
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
        )
})();
