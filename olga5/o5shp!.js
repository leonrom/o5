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
