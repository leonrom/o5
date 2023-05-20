/* global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/MakeAO5 ---
    "use strict"
    let wshp = {},
        debugids = ['shp_text', 'shp_1÷4']

    const
        olga5_modul = "o5shp",
        modulname = 'MakeAO5',
        C = window.olga5.C,
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
            wshp.DoScroll(aO5.cls.aO5o)
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
        },
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
        Clone = function (aO5) {
            if (C.consts.o5debug > 1)
                console.log(`----------------- клонирую '${aO5.name}' -----------`)

            const shp = aO5.shp,
                cart = aO5.cart = document.createElement('div'),
                shdw = aO5.shdw = shp.cloneNode(true),
                posC = shp.getBoundingClientRect()

            // cart
            Object.assign(cart.style, {
                width: (posC.width) + 'px',
                height: (posC.height) + 'px',
                left: (posC.left) + 'px',
                top: (posC.top) + 'px',
            })
            cart.aO5shp = aO5 // чтобы найти при обработке клика
            cart.pO5 = null

            cart.classList.add(wshp.olga5cart)

            // коррекция shdw
            shdw.classList.add(C.olga5ignore)

            const add = '_shdw',
                parentNode = shp.parentNode,
                ids = shdw.querySelectorAll("[id]")

            ids.forEach(id => {
                if (id.hasAttribute('id'))
                    id.setAttribute('id', id.id + add)
            })
            if (shp.id) {
                shdw.id = shp.id + add
                cart.id = shp.id + '_cart'
            }
            wshp.W.origs.consts.split(/;|,/).forEach(c => {
                shdw.removeAttribute(c.split(/=|:/)[0])
            })
            if (aO5.cls.dirV == 'D') shdw.style.height = '0.1px' // на экране НЕ должно занимать месо

            // коррекция shp
            const GPV = nam => { return MyRound(nst.getPropertyValue(nam)) },
                nst = window.getComputedStyle(shp) // д.б. до replaceChild()
            Object.assign(aO5.addSize, {
                w: GPV('padding-left') + GPV('padding-right') + GPV('border-left-width') + GPV('border-right-width'),
                h: GPV('padding-top') + GPV('padding-bottom') + GPV('border-top-width') + GPV('border-bottom-width')
            })
            //             const PN=n=>{   
            //                 const nst1 = window.getComputedStyle(shp)
            //                 const nst2 = window.getComputedStyle(shdw)
            //                 console.log('shp  : '+shp.id +"  zoom="+nst.zoom+", trans="+nst.transform+", zoom="+shp.style.zoom+", trans="+shp.style.transform+"   =====  " +n)
            //                 console.log('shdw : '+shdw.id+"  zoom="+nst2.zoom+", trans="+nst2.transform+", zoom="+shdw.style.zoom+", trans="+shdw.style.transform+"")
            //                 console.log('shp1 : '+shp.id +"  zoom="+nst1.zoom+", trans="+nst1.transform )
            //                 // console.log('shdw: '+shp.id+"  outlineWidth='"+nst2.outlineWidth+"' outline='"+nst2.outline+"' zoom="+nst2.zoom+", transform='"+nst2.transform+"'")
            //             }
            // PN(1)
            for (const prop of [   // перенос нужных "внешних" свойств на cart 
                'outline-color', 'outline-offset', 'outline-style', 'outline-width'
            ]) {
                const wi = nst.getPropertyValue(prop)
                if (wi && wi.length > 0) {
                    shp.style[prop] = ''
                    cart.style[prop] = wi
                }
            }
            for (const prop of [   // перенос нужных "внешних" свойств на shdw 
                'zoom', 'transform'
            ]) {
                const wi = nst.getPropertyValue(prop)
                if (wi && wi.length > 0) {
                    shp.style[prop] = ''
                    shdw.style[prop] = wi
                }
            }

            parentNode.replaceChild(shdw, shp)  // д.б. перед коррекцией shp но после shdw

            // коррекция значения атрибута style
            const sn = [
                'position: relative', 'left:0', 'top:0', 'width:100%', 'height:100%',
                'margin-top: 0', 'margin-right: 0', 'margin-bottom: 0', 'margin-left: 0', 'margin: 0'
            ]
            for (const s of sn) {
                const uu = s.split(/\s*:\s*/)
                shp.style[uu[0]] = uu[1]
            }

            cart.appendChild(shp)
            parentNode.insertBefore(cart, shdw)

            for (const o of [cart, aO5.posW, aO5.posC, aO5.posS]) Object.seal(o)
            Object.freeze(aO5)

            shp.addEventListener('dblclick', DoShpClick, { capture: true, passive: true })

            for (const iO5 of aO5.aO5s)
                Clone(iO5)
        },
        Tbelong = { attr: '', to: null, le: null, ri: null, bo: null }

    class AO5 {
        constructor(shp, cls) {
            this.name = window.olga5.C.MakeObjName(shp)
            this.id = shp.id
            this.shp = shp
            this.prev = shp.parentElement
            Object.assign(this.cls, cls)

            for (const nam of ['cls', 'old', 'addSize', 'act', 'fix', 'hovered', 'located', 'posW', 'posC', 'posS'])
                Object.seal(this.nam)
            Object.seal(this)
        }
        name = '' // повтор - чтобы было 1-м в отладчике
        aO5s = [] // перечень включенных в этот aO5
        cls = { kill: false, dirV: '', putV: 'T', alive: false, nest: -2, level: 0, zIndex: 0, minIndex: 0, aO5o: [], pitch: 'S', }
        old = { hovered: { to: null, located: { to: null } }, located: { to: null } } //  для отладки: зраненеие предыдущих контейнеров
        addSize = { w: 0, h: 0 }
        act = { dspl: true, wasKilled: false, wasClick: false, underClick: false, pushedBy: null, }
        fix = { putV: '', iO5: null, iO5up: null }
        hovered = Object.assign({ act: 'hovered', asks: [], }, Tbelong) // массивы д.б.персонально
        located = Object.assign({ act: 'located', asks: [], }, Tbelong)
        posW = { top: 0, left: 0, height: 0, width: 0 }
        posC = Object.assign({}, this.posW)
        posS = { top: 0, left: 0, }
        sizS = { height: 0, width: 0, }

        cart = null
        shdw = null

        Show = () => Show(this)
        Hide = () => Hide(this)
        DoFixV = (iO5) => DoFixV(this, iO5)
        SetClick = (clk) => SetClick(this, clk)
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, (shp, cls, PO5) => {
        shp.aO5shp = new AO5(shp, cls)
        const aO5 = shp.aO5shp
        let pO5 = aO5.prev.pO5
        if (!pO5) {
            // console.log('--++ ' + C.MakeObjName(aO5.prev))
            try {
                aO5.prev.pO5 = new PO5(aO5.prev, aO5)
            } catch (err) {
                console.error('--?? ' + C.MakeObjName(aO5.prev))
            }
            pO5 = aO5.prev.pO5
        }
        else if (wshp.W.consts.o5debug > 0)
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
            if (C.consts.o5debug > 0) C.ConsoleInfo(`ожидается завершение загрузки '${aO5.name}'`)
            shp.addEventListener('load', e => {
                wshp.DoResize(`из '${modulname}'`)
            })
        }
        // AO5shp: () => {
        //     for (const aO5 of wshp.aO5s)
        //         Clone(aO5)
        // }
    })
    wshp.Clone = Clone

})();
/* global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {              // ---------------------------------------------- o5shp/DoInit ---
    "use strict"
    // let debugids = []  // 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'        

    const
        olga5_modul = "o5shp",
        modulname = 'DoInit',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        IsFloat001 = (s) => { return Math.abs(parseFloat(s) > 0.01) },
        prevsPO5 = {},
        MyJoinO5s = (aO5s) => {
            let s = ''
            for (const aO5 of aO5s) s += (s ? ', ' : '') + aO5.name
            return s
        },
        SwitchOpacity = aO5s => {
            for (const aO5 of aO5s) {
                aO5.shdw.style.opacity = 0
                aO5.cart.style.opacity = 1
                SwitchOpacity(aO5.aO5s)
            }
        },
        FillBords = (pO5, strt) => { // РЕКУРСИЯ !
            if (pO5.prevs.length > 0)
                return

            pO5.prevs.push(pO5.current)
            if (pO5.isFinal || pO5.current.aO5shp) {
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
        },
        Finish = () => {
            const hash = C.save.hash
            if (hash) { // делать именно когда загружен документ (например - тут)
                const tag = document.getElementById(hash)
                if (tag) tag.scrollIntoView({ alignToTop: true, block: 'start', behavior: "auto" })
                else
                    C.ConsoleError(`Неопределён hash= '${hash}' в адресной строке`)
            }
        },
        DbgDoResize = e => { // для отладки  !!!!!!!!!!!!!!!!!!
            if (e.timeStamp > wshp.etimeStamp + 0.1)
                if (!e.target.classList.contains(wshp.W.class))
                    wshp.DoResize('из DbgDoResize ')
            wshp.etimeStamp = e.timeStamp
        },
        DoScroll = e => {
            const pO5 = (e.target == document ? document.body : e.target).pO5
            if (pO5) {
                const aO5s = (pO5.owns.own ? pO5.owns.own : wshp).aO5s
                wshp.DoScroll(aO5s, e.timeStamp)
            }
        }

    class PO5 {
        constructor(current, aO5) {
            this.current = current
            this.id = current.id
            this.name = C.MakeObjName(current)
            this.isBody = current == document.body || current.nodeName == 'BODY'
            this.isFinal = this.isBody ||
                ['overview-content', 'viewitem-panel'].find(cls => current.classList.contains(cls))
            this.isDIV = current.tagName.match(/\bdiv\b/i)  // == "DIV"
            if (o5debug > 2)
                console.log("создаётся pO5 для '" + this.name + "'")
            FillBords(this, 'pO5=' + this.name + (aO5 ? (' для aO5=' + aO5.name) : ''))

            this.nst = window.getComputedStyle(current)
            this.PO5Colors(0)
            Object.seal(this.prevs)
            Object.seal(this.pos)
            Object.seal(this.located)
            Object.seal(this.colors)
            Object.seal(this.scroll)
            Object.seal(this.act)
            Object.seal(this.cdif)
            Object.freeze(this)
        }
        nst = {}
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
                nst = pO5.nst,
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
                c = CN(pO5.nst, 'background')
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

    const
        // name = 'страница',
        // aO5s = [],
        // nests = [],
        // wasResize = false,
        // aO5str = '', // строка рез. вложенности (для демок  и отладки)
        // TestCC3a = pO5 => { // для теста CC3a в alltst.js
        //     pO5.PO5Colors(0)
        //     FillBords(pO5, 'pO5=' + C.MakeObjName(pO5.current))
        // },
        wshp = C.ModulAddSub(olga5_modul, modulname, () => {
            const timeInit = Date.now() + Math.random(),
                mtags = C.SelectByClassName(wshp.W.class, olga5_modul),
                errs = [],
                MakeAO5s = () => {
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

                    // wshp.FillClasses()
                    for (const mtag of mtags) {
                        const dt = DecodeType(mtag.quals),
                            shp = mtag.tag

                        if (dt.err) errs.push({ shp: C.MakeObjName(shp), className: mtag.origcls, err: dt.err })

                        if (!dt.cls.none)
                            wshp.MakeAO5(shp, dt.cls, PO5)
                    }

                    if (errs.length > 0) C.ConsoleError("Ошибки классов подвисабельных объектов", errs.length, errs)
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

                    if (o5debug > 1)
                        console.log(" >> SetLevelsAll " + ('' + Date.now()).substr(-6) + ", вложенности объектов: \n\t  " + aO5str)
                    return aO5str
                }

            MakeAO5s()

            wshp.aO5str = SetLevelsAll(wshp.aO5s)

            if (o5debug > 0) {
                const sels = []
                for (const mtag of mtags)
                    sels.push({ name: C.MakeObjName(mtag.tag), origcls: mtag.origcls, class: mtag.tag.className, quals: mtag.quals.join(', '), })
                if (sels.length > 0) C.ConsoleInfo(`o5shp: найдены селекторы:`, sels.length, sels)

                for (const start of C.page.starts)
                    start.addEventListener('click', DbgDoResize)
            }

            if (wshp.aO5s.length > 0) {

                for (const aO5 of wshp.aO5s)
                    wshp.Clone(aO5)

                wshp.DoResize('из DoInit')
                SwitchOpacity(wshp.aO5s)

                // window.addEventListener('resize', wshp.DoResize)
                C.E.AddEventListener('resize', wshp.DoResize)
                document.addEventListener('scroll', DoScroll, true)
            }

            Finish()

            errs.splice(0, errs.length)
            mtags.splice(0, mtags.length)
        })

    Object.assign(wshp, {
        name: 'страница',
        aO5s: [],
        nests: [],
        wasResize: false,
        aO5str: '', // строка рез. вложенности (для демок  и отладки)
        etimeStamp:0,
    })
})();

/* global window, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoResize ---
    "use strict"
    let wshp = {},
        o5debug = 0,
        debugids = ['head_32']  //  shp_5÷8 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'

    const
        olga5_modul = "o5shp",
        modulname = 'DoResize',
        C = window.olga5.C,
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
                            const
                                cc = s.split(':'),
                                u = cc[0].trim(),
                                t = u.length > 0 ? u[0].toUpperCase() : '?'
                            if (typs.includes(t)) {
                                const cod = cc.length > 1 ? cc[1].trim() : '',
                                    num = cc.length > 2 ? MyRound(cc[2]) : 1,
                                    fix = cc.length > 2 ? cc[2].toUpperCase() == 'F' : false

                                AddNew(blng.asks, { typ: t, cod: cod, num: num, nY: num, ok: false, fix: fix, bords: [] })
                            }
                            else
                                errs.push({ name: aO5.name, str: s, err: "тип ссылки не начинается одним из '" + typs + "'" })
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

                        if (aO5.aO5s.length > 0)
                            ReadAttrs(aO5.aO5s, atrib)
                    }
                }

            for (const atrib of atribs) {
                ReadAttrs(aO5s, atrib)
            }
            if (errs.length > 0 && showerr)
                Error("Ошибки в атрибутах  для тегов", errs.length, errs)
        },
        CalcSize = (aO5s) => {
            for (const aO5 of aO5s) {
                const pos = aO5.shdw.getBoundingClientRect(),
                    add = aO5.addSize,
                    w = aO5.sizS.width

                Object.assign(aO5.sizS, { width: (pos.width - add.w), height: (pos.height - add.h) })
                Object.assign(aO5.shp.style, { width: 100 + '%', height: aO5.sizS.height + 'px' })
                // Object.assign(aO5.shp.style, { width: aO5.sizS.width + 'px', height: aO5.sizS.height + 'px' })

                CalcSize(aO5.aO5s)

                if (o5debug > 2)
                    console.log(`${aO5.name} : pos.width=${pos.width}, add.w=${add.w}, sizS.width=${aO5.sizS.width}, старое=${w}`)
            }
        },
        SortAll = (aO5s) => { // сортировка и индексация
            const nest = aO5s.nest

            if (o5debug > 2)
                console.log('  >> яSortAll (' + nest + '): aO5s=' + MyJoinO5s(aO5s));
            ``
            for (const aO5 of aO5s) {
                const b = aO5.shdw.getBoundingClientRect()
                Object.assign(aO5.posW, { top: b.top, left: b.left })
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

            for (const aO5 of aO5s)
                if (aO5.aO5s.length > 0)
                    SortAll(aO5.aO5s)
        },

        FillBlngsAll = function (aO5s, showerr, timeStamp) {
            const errs = [],
                AskScrolls = (pO5) => {
                    const minScrollW = 3,
                        current = pO5.current,
                        nst = pO5.nst,
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
                                    final = pO5.isFinal || (!ask.fix && pO5.current.aO5shp)

                                if (t == 'S' && pO5.scroll.tim != timeStamp)
                                    AskScrolls(pO5)

                                ask.ok =
                                    (t == 'I' && pO5.id == c && ask.nY-- <= 1) ||
                                    (t == 'N' && (cu == '' ? final : (parent.nodeName == cu && ask.nY-- <= 1))) ||
                                    (t == 'C' && IsInClass(parent.classList, clss) && ask.nY-- <= 1) ||
                                    (t == 'S' && (final || pO5.scroll.yesV)) ||
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
                            for (const ask of blng.asks)
                                FillAsk(aO5, ask, blng.act)
                        }

                        if (aO5.aO5s.length > 0)
                            FillBlngs(aO5.aO5s)
                    }
                }

            FillBlngs(aO5s)
            if (errs.length > 0 && showerr)
                C.ConsoleError("При старте (в  'DoResize'): не опр. ссылки на контейнеры ", errs.length, errs)
        }

    let showerr = true

    wshp = C.ModulAddSub(olga5_modul, modulname, txt => {
        /* 
        фактически - д.б. 1 раз. - при первом скроллинге,
        но для отладки - может вызываться повторно
        */
        const timeStamp = Date.now() + Math.random()
        let aO5s = wshp.aO5s

        o5debug = C.consts.o5debug

        if (o5debug > 1) {
            console.groupCollapsed(`  старт Resize(${txt}) для '` + (() => {
                let s = ''
                aO5s.forEach(aO5 => { s += (s ? ', ' : '') + aO5.name })
                return s
            })())
            console.trace("трассировка вызовов ")
            console.groupEnd()
        }

        ReadAttrsAll(aO5s, showerr)
        SortAll(aO5s)
        CalcSize(aO5s)
        FillBlngsAll(aO5s, showerr, timeStamp)
        wshp.DoScroll(wshp.aO5s)
        showerr = false
    }
    )

})();
/*jshint asi:true  */
/* global window, console */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoScroll ---
    "use strict"
    let wshp = {},
        timeStamp = 0,
        debugids = ['shp1'] // , 'shp_text' shp1 shp_1÷4 shp_5÷8 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'

    const
        olga5_modul = "o5shp",
        modulname = 'DoScroll',
        lognam = `${olga5_modul}/${modulname} `,
        C = window.olga5.C,
        datestart = Date.now(),
        CalcParentLocate = pO5 => {
            if (pO5.isBody) {
                const doc = document.documentElement
                Object.assign(pO5.pos,
                    { tim: timeStamp, top: 0, bottom: doc.clientHeight, left: 0, right: doc.clientWidth })
            }
            else {
                const current = pO5.current,
                    isO5 = current.aO5shp,
                    p = isO5 ? current.aO5shp.posC : current.getBoundingClientRect(),
                    // right1 = isO5 ? p.left + p.width : p.right,
                    // bottom1 = isO5 ? p.top + p.height : p.bottom,
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
        PrepareBords1 = (aO5) => {
            const
                NewBords = (bord, a) => {
                    const pO5 = bord.pO5,
                        pos = pO5.pos
                    if (pos.top != pos.bottom) {
                        if (a.to == null || a.to.pos.top < pos.top) a.to = pO5
                        if (a.bo == null || a.bo.pos.bottom > pos.bottom) a.bo = pO5
                    }
                    if (pos.left != pos.right) {
                        if (a.le == null || a.le.pos.left < pos.left) a.le = pO5
                        if (a.ri == null || a.ri.pos.right > pos.right) a.ri = pO5
                    }
                },
                Hovered = (bords, a) => {
                    let j = bords.length
                    while (j-- > 0)
                        NewBords(bords[j], a)
                },
                Located = (bords, a) => {
                    for (let j = 0; j < bords.length; j++)
                        NewBords(bords[j], a)
                }

            Object.assign(aO5.hovered, { to: null, le: null, ri: null, bo: null })
            for (const ask of aO5.hovered.asks)
                Hovered([ask.bords[0]], aO5.hovered)

            Object.assign(aO5.located, { to: null, le: null, ri: null, bo: null })
            for (const ask of aO5.located.asks)
                Located(ask.bords, aO5.located)

            for (const hoverMarks of ['to', 'le', 'ri', 'bo']) {
                const pO5 = aO5.hovered[hoverMarks]
                if (!pO5 || !pO5.located)
                    alert(`located '${hoverMarks}' (in  DoScroll.PrepareBords)`)

                if (pO5.located.timeStamp != timeStamp) { // чтобы не повторяться для одинаковых
                    Hovered(pO5.prevs, pO5.located)
                    pO5.located.timeStamp = timeStamp
                }
            }

        },
        PrepareBords = (aO5) => {
            const bO5 = document.body.pO5,
                a = { to: bO5, le: bO5, ri: bO5, bo: bO5 },
                Located = (bords, a) => {
                    const bO5 = bords.length > 0 ? bords[bords.length - 1].pO5 : null
                    for (const bord of bords) {
                        const pO5 = bord.pO5,
                            pos = pO5.pos
                        if (pos.top != pos.bottom) {
                            if (a.to == null || a.to == bO5 || a.to.pos.top < pos.top) a.to = pO5
                            if (a.bo == null || a.bo == bO5 || a.bo.pos.bottom > pos.bottom) a.bo = pO5
                        }
                        if (pos.left != pos.right) {
                            if (a.le == null || a.le == bO5 || a.le.pos.left < pos.left) a.le = pO5
                            if (a.ri == null || a.ri == bO5 || a.ri.pos.right > pos.right) a.ri = pO5
                        }
                    }
                }
            for (const ask of aO5.hovered.asks)
                Located([ask.bords[0]], a)
            Object.assign(aO5.hovered, a)

            Object.assign(a, { to: bO5, le: bO5, ri: bO5, bo: bO5 })

            for (const ask of aO5.located.asks)
                Located(ask.bords, a)
            Object.assign(aO5.located, a)

            for (const hoverMarks of ['to', 'le', 'ri', 'bo']) {
                const pO5 = aO5.hovered[hoverMarks]
                if (!pO5 || !pO5.located)
                    alert(`located '${hoverMarks}' (in  DoScroll.PrepareBords)`)
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
                    if (posC.left >= bR) aO5.Hide()
                    else
                        posC.width -= (posC.left + posC.width - bR)
                }
            }
        },
        SavePos = (aO5) => {
            if (aO5.act.dspl) { //  вообще-то тут два вариантта: либо после сталкивания пропадает совсем, либо попадает на своё место, но уже под верхний                  
                const shp = aO5.shp,
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
                    // width: (posS.width - aO5.addSize.w) + 'px', // именно! Если 'offset' то вылезут бордюры,
                    // height: (posS.height - aO5.addSize.h) + 'px', // aO5.clientHeight + 'px',
                    top: (posS.top) + 'px',
                    left: (posS.left) + 'px',
                })
                if (aO5.fix.putV) cart.classList.add(wshp.olga5ifix)
                else cart.classList.remove(wshp.olga5ifix)
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
                                console.log(lognam + s)
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
            if (wshp.W.consts.o5debug > 2)
                console.log(lognam + "Scroll для '" + (() => {
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

                    const b = aO5.shdw.getBoundingClientRect()
                    Object.assign(aO5.posW, { top: b.top, left: b.left, height: b.height, width: b.width })
                    Object.assign(aO5.posC, aO5.posW)
                    Object.assign(aO5.posS, { top: 0, left: 0, })
                    onscr = aO5.posW.top < aO5.located.bo.pos.bottom //aO5.act.first.pO5.pos.bottom) {
                }
                if (onscr) {
                    k2 = k
                    aO5.Show()
                } else {        //тут не давать 'break' - пусть попрячет остальные !
                    aO5.Hide()
                    aO5.act.wasKilled = false
                }
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

            if (wshp.W.consts.o5debug > 2)
                DebugShowBounds(aO5s)

            for (const aO5 of aO5s)   //  не скроллировать внутренности!
                if (aO5.aO5s.length > 0)
                    Scroll(aO5.aO5s)
        }

    wshp = C.ModulAddSub(olga5_modul, modulname, (aO5s, etimeStamp) => {
        timeStamp = etimeStamp ? etimeStamp : (Date.now() + Math.random())

        if (aO5s.length > 0) {
            const debug = timeStamp && wshp.W.consts.o5debug > 2
            if (debug)
                console.groupCollapsed(`  старт Scroll для '` + (() => {
                    let s = ''
                    aO5s.forEach(aO5 => { s += (s ? ', ' : '') + aO5.name })
                    return s
                })() + "'" + ' (t=' + (Date.now() - datestart) + ')')

            Scroll(aO5s)

            if (debug) {
                console.trace("трассировка вызовов ")
                console.groupEnd()
            }
        }
        // window.dispatchEvent(new window.Event('o5shp_scroll'))
        C.E.DispatchEvent('o5shp_scroll', 'DoScroll', true)
    })

})();
﻿/* global document, window, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {              // ---------------------------------------------- o5shp ---
	"use strict";

	const
		C = window.olga5.C,
		W = {
			modul: 'o5shp',
			Init: ShpInit,
			class: 'olga5_shp',
			consts: `		
				o5shp_dummy=0.123; //  просто так, для проверок в all0_.html
                olga5_frames='s';
                olga5_owners='b';
			`,
			incls: {
				names: ['DoScroll', 'DoResize', 'MakeAO5', 'DoInit'],
				actscript: document.currentScript,
			},
		},
		olga5cart = 'olga5-cart',
		olga5ifix = 'olga5-ifix',
		o5css = `
.${olga5cart} {
    position : fixed;
    overflow : hidden;
    background-color : transparent;
    direction : ltr; // эти 4 д.б. тут чтобы "перебить" из shp
	opacity: 0;  // это только вначале
}
.${olga5cart}.${olga5ifix} {
	cursor: pointer;
}`,
		LastDoResize = () => {
			// if (window.olga5.o5shp && window.olga5.o5shp.DoResize)
			window.olga5.o5shp.DoResize('по olga5_ready')
		}

	function ShpInit() {

		// window.addEventListener('olga5_ready', e => {
		C.E.AddEventListener('olga5_ready', e => {		
			window.setTimeout(LastDoResize, 1)
		})

		C.ParamsFill(W, o5css)
		window.olga5[W.modul].DoInit()

		// window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		C.E.DispatchEvent('olga5_sinit', W.modul)

		window.olga5[W.modul].activated = false 	// признак, что было одно из activateEvents = ['click', 'keyup', 'resize']
		const activateEvents = ['click', 'keyup', 'resize'],
			wd = window, // document
			SetActivated = e => {
				window.olga5[W.modul].activated = true
				activateEvents.forEach(activateEvent => wd.removeEventListener(activateEvent, SetActivated))
			}
		activateEvents.forEach(activateEvent => wd.addEventListener(activateEvent, SetActivated))
	}

	C.ModulAdd(W, { olga5cart: olga5cart, olga5ifix: olga5ifix, })
})();
