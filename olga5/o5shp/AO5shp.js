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
        // eClone = new window.Event('olga5_cloned'),
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
                nst = aO5.nst,
                posC = shp.getBoundingClientRect()

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

            // shp.style.opacity = 0    

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
                { nam: 'bottom', val: '' }, { nam: 'right', val: '' }, { nam: 'opacity', val: '0' },
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

            // const posC = aO5.shdw.getBoundingClientRect()
            for (const style of [cart.style, shdw.style])
                Object.assign(style, {
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

            // ChangeShpProps(aO5)
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
            // aO5.shp.addEventListener(eClone.type, IsCloned, { once: true })

            // eClone.aO5shp = aO5
            // aO5.shp.dispatchEvent(eClone)
            clones.find(clone => clone.shp === aO5.shp).ready = true

            wshp.CloneAO5s(aO5) //.aO5s)
        }
    // IsCloned = e => {
    //     const aO5 = e.aO5shp
    //     clones.find(clone => clone.shp === aO5.shp).ready = true

    //     wshp.CloneAO5s(aO5.aO5s)
    // }

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
                for (const prev of prevs) {
                    const hasown = prev.pO5.owns.own
                    prev.pO5.owns.own = own
                    if (prev.aO5shp || hasown) break
                }

            const aO5s = (own || wshp).aO5s
            aO5s.push(aO5)

            if (shp.tagName.match(/\b(img|iframe|svg)\b/i) && !shp.complete) {
                C.ConsoleInfo(`ожидается завершение загрузки '${aO5.name}'`)
                shp.addEventListener('load', e => wshp.DoResize(aO5s, e))
            }

            //             const tagnama = ['img'],
            //                 tagnams = tagnama.join(','),
            //                 tag1 = Array.from(shp.querySelectorAll(tagnams)),
            //                 tag2 = tagnama.includes(shp.tagName.toLowerCase()) ? [shp] : [],
            //                 tags = tag1.concat(tag2),
            //                 errs = [],
            //                 TagLoad = (e) => {
            //                     // console.log('tagnama 3', e.target)
            //                     window.dispatchEvent(new window.Event('olga5_update'))
            // // 1 ждать пока все загрузятся
            // // 2                     
            //                 }
            //             for (const tag of tags) {
            //                 // console.log('tagnama 1', tag.id)
            //                 if (!(tag.complete && tag.naturalHeight !== 0)) {
            //                     const td = C.TagDes(tag, 'src', errs)
            //                     if (td) {
            //                         if (td.trans) { // !url.match(/[\/\.+]/)) {
            //                             const wref = C.DeCodeUrl(C.urlrfs, td.orig)
            //                             if (wref.err) {
            //                                 errs.push({ tag: C.MakeObjName(tag), ref: td.orig, txt: wref.err })
            //                                 // C.ConsoleError(`Неопределён '${td.orig}' в теге ${nam}`)
            //                                 continue
            //                             } else
            //                                 tag.setAttribute('src', wref.url)
            //                         }
            //                         tag.addEventListener('load', TagLoad)
            //                     }
            //                 }
            //             }
            //             if (errs.length > 0)
            //                 C.ConsoleError(`AO5shp: ошибки в тегах `, errs.length, errs)
        },
        CloneAO5s: o => {
                if (o.aO5s.length > 0) {
                    if (W.consts.o5debug > 1)
                        console.log(`----------------- клонирую ${o.aO5s.length} шт. для '${o.name}' -----------`)
                    C = window.olga5.C
                    for (const aO5 of o.aO5s)
                        aO5.Clone()
                }
            // if (!clones.find(clone => !clone.ready)) {
            //     if (W.consts.o5debug > 1)
            //         console.log(`----------------- CloneAO5s: all  done -----------`)
            // }
        }
    })

    console.log(`}---< ${document.currentScript.src.indexOf(`/${olga5_modul}.`) > 0 ? 'дозагружен' : 'подключён '}:  ${olga5_modul}/AO5shp.js`)
})();
