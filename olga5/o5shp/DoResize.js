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
                if (cls !== '' && !classList.contains(cls)) return false
            return true
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
                    // if (o5debug > 1) console.log('  >> ReadAttrs (' + atrib.cod + ') для объектов [' + C.MyJoinO5s(aO5s) + ']');
                    let prevN = '' // значене этого атрибута у предыдущего тега

                    for (const aO5 of aO5s) { // определение вложенностей shp's друг в друга
                        const shp = aO5.shp,
                            atrX = shp.getAttribute(atrib.atr),
                            atrN = atrX || (shp.attributes.olga5_repeat ? prevN : ''),
                            attr = atrN.length > 0 ? atrN : atrib.def

                        if (atrN) prevN = atrN
                        ChecksReadAttrs(aO5, atrib.cod, attr, errs)
                        // if (atrib.cod=='located')                        
                        // console.log(`aO5.id=${aO5.id}, atrib.cod=${atrib.cod}, attr=${attr}, aO5.located.asks.length=${aO5.located.asks.length}`)
                        if (aO5[atrib.cod].asks.length === 0) {
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
        CalcSizes = (aO5s) => {
            const GPV = (nam, nst) => { return MyRound(nst.getPropertyValue(nam)) }
            for (const aO5 of aO5s) {
                const pos = aO5.shdw.getBoundingClientRect(),
                   nst = window.getComputedStyle(aO5.shp),
                    // add = aO5.addSize
                    add = {
                        w: Math.ceil(GPV('padding-left', nst) + GPV('padding-right', nst) + GPV('border-left-width', nst) + GPV('border-right-width', nst)),
                        h: Math.ceil(GPV('padding-top', nst) + GPV('padding-bottom', nst) + GPV('border-top-width', nst) + GPV('border-bottom-width', nst))
                    }

                Object.assign(aO5.posS, { width: Math.floor(pos.width - add.w), height: Math.floor(pos.height - add.h) })

                CalcSizes(aO5.aO5s)

                if (o5debug > 2)
                    console.log(`${aO5.name} : pos.width=${pos.width}, add.w=${add.w}, posS.width=${aO5.posS.width}`)
            }
        },
        SortAll = (aO5s) => { // сортировка и индексация
            const nest = aO5s.nest

            if (o5debug > 2)
                console.log('  >> яSortAll (' + nest + '): aO5s=' + C.MyJoinO5s(aO5s))
            
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
                Object.assign(aO5.cls, { minIndex: minIndex, aO5o: aO5s })
                if (!aO5.cls.remo || aO5.cls.dirV) {
                    aO5.cart.style.zIndex = ++z
                    aO5.cls.zIndex = z
                }
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
                    })   // let err = '',
                    //     rez = ''
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
                                    (t == 'N' && (cu === '' ? final : (parent.nodeName == cu && ask.nY-- <= 1))) ||
                                    (t == 'C' && IsInClass(parent.classList, clss) && ask.nY-- <= 1) ||
                                    (t == 'S' && (final || pO5.scroll.yesV)) ||
                                    (t == 'B' && (final || (aO5.cls.dirV != 'D' && pO5.cdif.ct) || (aO5.cls.dirV != 'U' && pO5.cdif.cb)))
                                // (t == 'B' && (final || (aO5.cls.dirV == 'U' && pO5.cdif.ct) || (aO5.cls.dirV == 'D' && pO5.cdif.cb)))

                                if (ask.ok)
                                    ask.bords.push(...parents.slice(k, ask.fix ? k + 1 : k2))

                                if (ask.ok || final) break
                            }

                            // let err = '',
                            //     rez = ''
                            if (ask.bords.length === 0) {
                                const subst = parents[k2 - 1],
                                    nam = window.olga5.C.MakeObjName(subst),
                                    i = ask.bords.indexOf(nam)
                                errs.push({ aO5: aO5.name, 'для типа': act, 'не найден': (t + ':' + c), 'подставлен': (i < 0 ? '+ ' : '= ') + nam })
                                if (i < 0)
                                    ask.bords.push(subst)
                            }
                        }
                    if (o5debug > 2) console.log('  >> FillBlngs: aO5s=' + C.MyJoinO5s(aO5s))
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
        CalcSizes(aO5s)
        FillBlngsAll(aO5s, showerr, timeStamp)
        
        wshp.DoScroll(wshp.aO5s)
        showerr = false
    }
    )

})();
