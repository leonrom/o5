/*jshint asi:true  */
/* -global window, console */
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
        PrepareBords = (aO5) => {
            const bO5 = document.body.pO5,
                a = { to: bO5, le: bO5, ri: bO5, bo: bO5 },
                Located = (bords, a) => {
                    const bO5 = bords.length > 0 ? bords[bords.length - 1].pO5 : null
                    for (const bord of bords) {
                        const pO5 = bord.pO5,
                            pos = pO5.pos
                        if (pos.top != pos.bottom) {
                            if (a.to === null || a.to == bO5 || a.to.pos.top < pos.top) a.to = pO5
                            if (a.bo === null || a.bo == bO5 || a.bo.pos.bottom > pos.bottom) a.bo = pO5
                        }
                        if (pos.left != pos.right) {
                            if (a.le === null || a.le == bO5 || a.le.pos.left < pos.left) a.le = pO5
                            if (a.ri === null || a.ri == bO5 || a.ri.pos.right > pos.right) a.ri = pO5
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
        FixSet = (aO5) => {
            const posW = aO5.posW,
                act = aO5.act,
                cls = aO5.cls
            if (!(act.wasClick || act.underClick || act.pushedBy || act.wasKilled) &&
                (
                    (cls.dirV == 'U' && posW.top < aO5.hovered.to.pos.top && aO5.located.to.pos.top <= aO5.hovered.to.pos.top) ||
                    (cls.dirV == 'D' && posW.top + posW.height < aO5.hovered.bo.pos.bottom)
                )
            ) aO5.DoFixV()
        },
        CheckIsUp = function (k, aO5s) {
            const aO5 = aO5s[k],
                cls = aO5.cls,
                posC = aO5.posC,
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
                if (iO5.fix.putV === '' || cls.putV != iO5.cls.putV || posC.left + posC.width < iposC.left || posC.left > iposC.left + iposC.width || !iO5.act.dspl) continue
                if (cls.putV == 'T') {
                    const d = iO5.posC.top + iO5.posC.height - posC.top
                    if (cls.dirV == 'U' || cls.remo) { //только при движении вверх
                        if (d > 0) {
                            if (cls.level <= iO5.cls.level) {
                                if (cls.pitch == 'P' || iposC.height <= d) HideByO5(iO5)
                                else
                                    if (cls.pitch == 'S') {
                                        iposC.height -= d
                                        iposS.top = -d
                                    }
                                    else
                                        if (cls.pitch == 'C') {
                                            iposC.height -= d
                                            // iposS.height = -d
                                        }
                            } else
                                if (cls.dirV == 'U')
                                    aO5.DoFixV(iO5)
                        }
                    } else
                        if (cls.dirV == 'D') // никаких просто else - всегда проверять!
                            if (posC.top + posC.height > aO5.located.bo.pos.bottom) {
                                if (cls.level <= iO5.cls.level) iO5.Hide()  // iO5.act.dspl = false
                                else aO5.DoFixV(iO5)
                            }
                } else {//                    if (cls.putV == 'B') { // можно и не проверять,                    
                    const posW = aO5.posW
                    if (cls.dirV == 'U' && posW.top < aO5.hovered.to.pos.top) {
                        if (cls.level <= iO5.cls.level) HideByO5(iO5)
                        else aO5.DoFixV(iO5)
                    } else {
                        const b = aO5.hovered.bo.pos.bottom
                        if (cls.dirV == 'D' && posW.top < b) {
                            if (cls.pitch == 'P' || posW.top + posW.height <= 1 + b) HideByO5(iO5)
                            else {
                                if (cls.pitch == 'S' || cls.pitch == 'C') {
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
                    Object.assign(aO5.posW, { top: b.top, left: b.left, height: Math.ceil(b.height), width: Math.ceil(b.width) })
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
                const aO5 = aO5s[k],
                    cls = aO5.cls
                Object.assign(aO5.fix, { putV: '', iO5: null })
                // if (cls.dirV != '') {
                if (!aO5.act.wasKilled) {
                    if (cls.dirV)  // это может отсутствовать у kill cls.remo || 
                        FixSet(aO5)
                    if (k > 0 && (cls.dirV || cls.remo)) {
                        const act = aO5.act
                        if (act.dspl && !act.wasClick && !act.underClick && !act.pushedBy && !act.wasKilled)
                            CheckIsUp(k, aO5s)
                    }
                }
                // }
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
                if (aO5.act.dspl) { //  вообще-то тут два варианта: либо после сталкивания пропадает совсем, либо попадает на своё место, но уже под верхний                  
                    aO5.SetShpStyle()

                    if (aO5.fix.putV) {
                        // aO5.cart.classList.add(wshp.olga5ifix)
                        aO5.Show()
                    }
                    else{ 
                        aO5.Hide()
                        // aO5.cart.classList.remove(wshp.olga5ifix)
                    }
                }

            if (wshp.W.consts.o5debug > 2)
                DebugShowBounds(aO5s)

            for (const aO5 of aO5s)   //  не скроллировать внутренности!
                if (aO5.aO5s.length > 0)
                    Scroll(aO5.aO5s)
        }

    wshp = C.ModulAddSub(olga5_modul, modulname,
        (aO5s, etimeStamp) => {
            timeStamp = etimeStamp ? etimeStamp : (Date.now() + Math.random())

            if (aO5s.length > 0) {
                const debug = timeStamp && wshp.W.consts.o5debug > 2
                if (debug)
                    console.groupCollapsed(`  старт Scroll для '` + (() => {
                        let s = ''
                        aO5s.forEach(aO5 => { s += (s ? ', ' : '') + `${aO5.name}(top=${parseInt(aO5.posW.top)}) ` })
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
        }
    )

})();
