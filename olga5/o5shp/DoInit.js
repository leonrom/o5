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
                if (wshp.W.consts.o5debug > 2)
                    console.log(e)
                const aO5s = (pO5.owns.own ? pO5.owns.own : wshp).aO5s

                // document.removeEventListener('scroll', DoScroll, true)

                wshp.DoScroll(aO5s, e.timeStamp)

                // document.addEventListener('scroll', DoScroll, true)
            }
        }

    class PO5 {
        constructor(current, aO5) {
            this.current = current
            this.id = current.id
            this.name = C.MakeObjName(current)
            this.isBody = current === document.body || current.nodeName == 'BODY'
            this.isFinal = this.isBody ||
                ['overview-content', 'viewitem-panel'].find(cls => current.classList.contains(cls))
            this.isDIV = current.tagName.match(/\bdiv\b/i)  // == "DIV"
            if (o5debug > 2)
                console.log("создаётся pO5 для '" + this.name + "'")
            FillBords(this, 'pO5=' + this.name + (aO5 ? (' для aO5=' + aO5.name) : ''))

            this.nst = window.getComputedStyle(current)
            this.PO5Colors()
            Object.seal(this.prevs)
            Object.seal(this.pos)
            Object.seal(this.located)
            Object.seal(this.colors)
            Object.seal(this.scroll)
            Object.seal(this.act)
            Object.seal(this.cdif)
            Object.freeze(this)
        }
            // nst = {}
        add = { top: 0, left: 0, right: 0, bottom: 0 }
        owns = { own: null }
        aO5s = []
        prevs = []; // всегда содержит самого себя
        located = { to: null, le: null, ri: null, bo: null, timeStamp: 0 } // для тех которые в aO5.hovered
        cdif = { tim: 0, ct: false, cl: false, cr: false, cb: false }
        pos = { tim: 0, top: 0, left: 0, right: 0, bottom: 0, } // пересчитывается при Scroll
        colors = { c: 0, t: 0, l: 0, r: 0, b: 0, }
        scroll = { tim: 0, yesV: false, yesH: false } // пересчитывается при Resize
        
        PO5Colors() {
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
        PutBords (pO5, txt) {
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
                            const cls = {
                                level: 0, kill: false, remo: false, pitch: 'S', alive: false,
                                dirV: '', putV: 'T', none: false, cartopacity: 1,
                            }
                            const errs = []
                            for (const qual of quals) {
                                const tt = qual.replaceAll(/-/g, '=').split('='),
                                    c = tt[0].substr(0, 1).toUpperCase()

                                if (c != '' && !isNaN(c)) cls.level = Number(c)
                                else if (c === 'N') cls.none = true
                                else if (c === 'K') cls.kill = true
                                else if (c === 'R') cls.remo = true
                                else if (c === 'C') cls.pitch = 'C' // сжимает предыдущий
                                else if (c === 'P') cls.pitch = 'P' // сталкивает предыдущий
                                else if (c === 'S') cls.pitch = 'S' // сдвигает предыдущий
                                else if (c === 'O') cls.pitch = 'O' // наезжает на предыдущий
                                else if (c === 'A') cls.alive = true
                                else if (c === 'D' || c === 'U') cls.dirV = c
                                else if (c === 'B' || c === 'T') cls.putV = c
                                else errs.push(`'${c}'`)
                            }
                            if (cls.kill) cls.remo = false
                            if (!cls.dirV && !cls.kill && !cls.remo) cls.dirV = 'U'

                            Object.freeze(cls)
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

                        if (!dt.cls.none && !mtag.tag.classList.contains('olga5_shp_none'))
                            wshp.MakeAO5(shp, dt.cls, PO5)
                    }

                    if (errs.length > 0) C.ConsoleError("Ошибки классов подвисабельных объектов", errs.length, errs)
                },
                SetLevelsAll = (aO5s) => { // сортировки и формирование
                    let aO5str = ''
                    const
                        SetLevels = (aO5s, nest) => {
                            if (typeof wshp.nests[nest] === 'undefined') wshp.nests[nest] = []
                            if (o5debug > 2) console.log('  >> SetLevels (' + nest + '): aO5s=' + C.MyJoinO5s(aO5s));
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
                // SwitchOpacity(wshp.aO5s)

                C.E.AddEventListener('resize', e => {
                    wshp.DoResize(e)
                })
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
        etimeStamp: 0,
    })
})();

