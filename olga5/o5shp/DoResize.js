/* -global window, console */
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
        IsInClass = (classList, clss) => {
            for (const cls of clss)
                if (cls !== '' && !classList.contains(cls)) return false
            return true
        },
        CalcSizes = (aO5s) => {
            const GPV = (nam, nst) => { return C.MyRound(nst.getPropertyValue(nam)) }
            for (const aO5 of aO5s) {
                const pos = aO5.shdw.getBoundingClientRect(),
                    nst = window.getComputedStyle(aO5.shp),
                    add = { w: 0, h: 0 }
                // add = aO5.addSize
                // add = {
                //     w: Math.ceil(GPV('padding-left', nst) + GPV('padding-right', nst) + GPV('border-left-width', nst) + GPV('border-right-width', nst)),
                //     h: Math.ceil(GPV('padding-top', nst) + GPV('padding-bottom', nst) + GPV('border-top-width', nst) + GPV('border-bottom-width', nst))
                // }

                Object.assign(aO5.posS, { width: Math.floor(pos.width - add.w), height: Math.floor(pos.height - add.h) })

                CalcSizes(aO5.aO5s)

                if (o5debug > 2)
                    console.log(`${aO5.name} : pos.width=${pos.width}, add.w=${add.w}, posS.width=${aO5.posS.width}`)
            }
        },
        FillBlngsAll = function (aO5s, showerr, timeStamp) {
            const errs = [],
                AskScrolls = (pO5) => {
                    const current = pO5.current

                    // if (pO5.scroll.wh) {
                    //     const nst = pO5.nst
                    //     pO5.scroll.dw = minScrollW + C.MyRound(nst.borderLeftWidth) + C.MyRound(nst.borderRightWidth) + C.MyRound(nst.paddingLeft) + C.MyRound(nst.paddingRight),
                    //         pO5.scroll.dh = C.MyRound(nst.borderTopWidth) + C.MyRound(nst.borderBottomWidth) + C.MyRound(nst.paddingTop) + C.MyRound(nst.paddingBottom)
                    // }
                    Object.assign(pO5.scroll, {
                        tim: timeStamp,
                        yesV: current.offsetWidth > (current.clientWidth + pO5.scroll.dw),
                        yesH: current.offsetHeight > (current.clientHeight + pO5.scroll.dh),
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

                        const asks = aO5.located.asks,
                            allbords = aO5.allbords
                        for (const ask of asks) {
                            const bords = ask.bords
                            for (const bord of bords) {
                                if (!allbords.includes(bord))
                                    allbords.push(bord)
                            }
                        }
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
            // if (o5debug > 3){ // проверки для теста all2.html
            //     const img2=document.getElementById('img2')
            //     if (img2 && img2.aO5snd)
            //         console.log(img2.aO5snd)
            // }
        }

        CalcSizes(aO5s)
        FillBlngsAll(aO5s, showerr, timeStamp)

        wshp.DoScroll(wshp.aO5s)
        showerr = false
    }
    )

})();
