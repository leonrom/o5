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
                    alert(`located '${hoverMarks}' (in  DoScroll.prepareBords)`)
                if (pO5.located.timeStamp != timeStamp) { // чтобы не повторяться для одинаковых
                    Located(pO5.prevs, pO5.located)
                    pO5.located.timeStamp = timeStamp
                }
            }
        },
        CheckIsUp = (aO5, canPush) => {
            const
                allbords = aO5.allbords,
                level = aO5.cls.level,
                posC = aO5.posC,
                IsConnect = iO5 => {
                    const posI = iO5.posW,
                        clsI = iO5.cls
                    return (
                        (posI.left > posC.left && posI.left < posC.right) ||
                        (posI.right < posC.right && posI.right > posC.left)
                    ) && (
                            (clsI.dirV == 'U' && posI.top < posC.bottom) ||
                            (clsI.dirV == 'D' && posI.bottom > posC.top)
                        )
                },
                DoPush = iO5 => {
                    /*   
                        сжимание (при iO5.cls.level <= level)
                        висит - aO5, а iO5 - подползает
                    */
                    const d = iO5.posC.bottom - aO5.posC.top
                     
                    if (iO5.cls.pitch == 'P') {
                        aO5.UnFixV()
                        aO5.act.pushedBy = iO5
                    }
                    else {
                        aO5.posC.height -= d
                        if (iO5.cls.pitch == 'S') aO5.shp.style.top = -d + 'px'
                    }
                }

            for (const bord of allbords) {
                const iO5s = bord.pO5.aO5s

                for (const iO5 of iO5s)
                    if ((iO5.cls.alive || !iO5.act.isKilled) &&
                        iO5 !== aO5 && !iO5.act.checkup &&           // && iO5.act.checkStep !== checkStep
                        (iO5.cls.putV === 'T' && (iO5.cls.dirV === 'U' || iO5.cls.remo)) // лепим только движущиеся вверх !!
                    )
                        if (IsConnect(iO5)) {
                            if (canPush && iO5.cls.level <= level) {
                                DoPush(iO5)
                                break       // достаточно сдвига от самого верхнего         
                            }

                            if (!canPush && iO5.cls.level > level)
                                iO5.DoFixV(aO5)
                        }
            }
        },
        Scroll = aO5s => {
            // P('begin')
            if (wshp.W.consts.o5debug > 2)
                console.log(lognam + "Scroll для '" + (() => {
                    let s = ''
                    aO5s.forEach(aO5 => { s += (s ? ', ' : '') + aO5.name })
                    return s
                })() + "'")

            for (const aO5 of aO5s) {

                CalcParentsLocates(aO5) // пересчитываются размеры всех предков-контейнеров        
                PrepareBords(aO5)       // обределение минимальных границ контейнеров (родвисания и владения)

                const act = aO5.act,
                    posW = aO5.posW

                const b = aO5.shdw.getBoundingClientRect() // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона
                Object.assign(posW, { top: b.top, left: b.left, height: b.height, width: b.width, right: b.right, bottom: b.bottom })

                if (act.isFixed) {
                    const c = aO5.cart.getBoundingClientRect() // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона
                    Object.assign(aO5.posC, { top: c.top, left: c.left, height: c.height, width: c.width, right: c.right, bottom: c.bottom })
                } else
                    Object.assign(aO5.posC, aO5.posW)

                const pos = aO5.located.to.pos
                // обнуление Kill'еров
                Object.assign(act, { doKill: false, checkup: false, checkStep: 0, })

                // обределение видимости клона (или объекта)              
                Object.assign(act.visi, {
                    part: posW.top <= pos.bottom && posW.bottom >= pos.top,
                    full: posW.top >= pos.top && posW.bottom <= pos.bottom
                })
            }

            /*
                установка подверженности  Kill'ерам на границах всех 'владельцев'
            */
            for (const aO5 of aO5s) {
                const vpart = aO5.act.visi.part

                if (aO5.cls.kill && vpart) {        //  если Kill'ер частично видим
                    const allbords = aO5.allbords

                    for (const bord of allbords) {
                        const iO5s = bord.pO5.aO5s
                        for (const iO5 of iO5s)
                            if (iO5 !== aO5)
                                iO5.act.doKill = true
                    }
                }
            }

            for (const aO5 of aO5s) {
                const posW = aO5.posW,
                    act = aO5.act

                if (act.visi.full) {        // очистка при полном появлении
                    act.isKilled = false
                    act.pushedBy = null
                    act.underClick = false
                    if (aO5.act.isFixed)
                        aO5.UnFixV()
                } else {
                    const cls = aO5.cls

                    if ((act.visi.part || act.isFixed) &&
                        !(act.underClick || act.pushedBy)
                        && ((cls.dirV == 'U' && posW.top < aO5.hovered.to.pos.top && aO5.located.to.pos.top <= aO5.hovered.to.pos.top)
                            || (cls.dirV == 'D' && posW.bottom < aO5.hovered.bo.pos.bottom)
                        )
                    ) {     // виксация подвисания если не было
                        if (act.doKill) {
                            act.isKilled = true
                            if (aO5.act.isFixed)
                                aO5.UnFixV()
                        }
                        else
                            if (cls.alive || !act.isKilled) {
                                aO5.DoFixV()
                                CheckIsUp(aO5, true)    // те, которые могут выталкивать
                                CheckIsUp(aO5)          // те, которые могут прилипать
                            }
                    }
                }
            }

            /*
                проверка и фиксация 'наезда' остальных на уже зафиксированные
            
            let n = 1,
                checkStep = 0
            while (n > 0) {
                n = 0
                checkStep++
                for (const aO5 of aO5s)
                    if (aO5.act.isFixed && !aO5.act.checkup && aO5.act.checkStep !== checkStep) {
                        const allbords = aO5.allbords,
                            posC = aO5.posC

                        for (const bord of allbords) {
                            const iO5s = bord.pO5.aO5s
                            for (const iO5 of iO5s)
                                if (iO5 !== aO5 && !iO5.act.checkup && iO5.act.checkStep !== checkStep &&
                                    (iO5.cls.alive || !iO5.act.isKilled)
                                ) {
                                    const posI = iO5.posW,
                                        clsI = iO5.cls

                                    if ((
                                        (posI.left > posC.left && posI.left < posC.right) ||
                                        (posI.right < posC.right && posI.right > posC.left)
                                    ) && (
                                            (clsI.dirV == 'U' && posI.top < posC.bottom) ||
                                            (clsI.dirV == 'D' && posI.bottom > posC.top)
                                        )
                                    ) {
                                        iO5.DoFixV(aO5)
                                        iO5.act.checkStep = checkStep
                                        n++
                                    }
                                }
                        }
                        aO5.act.checkup = true // чтобы к ЭТОМУ уже не "лепились"
                    }
            }
            */

            // let k2 = -1,
            //     onscr = true
            // for (const [k, aO5] of aO5s.entries()) {
            //     if (onscr) {
            //         CalcParentsLocates(aO5)
            //         PrepareBords(aO5)

            //         const b = aO5.shdw.getBoundingClientRect()
            //         Object.assign(aO5.posW, { top: b.top, left: b.left, height: Math.ceil(b.height), width: Math.ceil(b.width) })
            //         Object.assign(aO5.posC, aO5.posW)
            //         // Object.assign(aO5.posS, { top: 0, left: 0, })
            //         onscr = aO5.posW.top < aO5.located.bo.pos.bottom //aO5.act.first.pO5.pos.bottom) {
            //     }
            //     if (onscr) {
            //         k2 = k
            //         aO5.Show()
            //     } else {        //тут не давать 'break' - пусть попрячет остальные !
            //         aO5.Hide()
            //         aO5.act.isKilled = false
            //     }
            // }

            // let killevel = -1
            // for (let k = k2; k >= 0; k--) {
            //     const aO5 = aO5s[k],
            //         act = aO5.act,
            //         cls = aO5.cls,
            //         posW = aO5.posW,
            //         hovered = aO5.hovered

            //     if (act.pushedBy && (cls.alive || posW.top > hovered.to.pos.top) && act.pushedBy.posW.top > hovered.to.pos.top) {
            //         act.pushedBy = null
            //         aO5.cart.style.zIndex = aO5.cls.zIndex
            //     }
            //     if (killevel >= 0 && killevel <= aO5.cls.level)
            //         act.isKilled = true
            //     else if (cls.alive ||
            //         (cls.dirV == 'U' && posW.top > hovered.to.pos.top) ||
            //         (cls.dirV == 'D' && posW.top > hovered.bo.pos.bottom)
            //     )
            //         act.isKilled = false

            //     if (cls.kill)
            //         killevel = killevel < 0 ? cls.level : Math.min(killevel, cls.level)
            // }

            // for (let k = 0; k <= k2; k++) { // '<=' - чтобы захватить всплытие 'киллера'
            //     const aO5 = aO5s[k],
            //         cls = aO5.cls

            //     if (!aO5.act.isKilled) {
            //         if (cls.dirV)  // это может отсутствовать у kill cls.remo || 
            //             FixSet(aO5)
            //         if (k > 0 && (cls.dirV || cls.remo)) {
            //             const act = aO5.act
            //             if (act.dspl && !act.wasClick && !act.underClick && !act.pushedBy && !act.isKilled)
            //                 CheckIsUp(k, aO5s)
            //         }
            //     }
            //     // }
            //     CutBounds(aO5)
            // }

            // for (let k = 0; k <= k2; k++) { // эту часть проверок делать "после" чтобы определились координаты iO5
            //     const aO5 = aO5s[k],
            //         posW = aO5.posW

            //     if (aO5.act.wasClick && posW.top > aO5.hovered.to.pos.top) {
            //         const dir = aO5.cls.dirV,
            //             iO5 = aO5.fix.iO5 || aO5.fix.iO5up

            //         if (dir == 'D' ? (posW.top > aO5.hovered.bo.pos.bottom) :
            //             (iO5 ? posW.top > iO5.posC.top + iO5.posC.height : (dir == 'U')))
            //             aO5.SetClick(false)
            //     }
            // }


            if (wshp.W.consts.o5debug > 2) {
                if (window.olga5.o5dbg && window.olga5.o5dbg.DebugShowBounds)
                    window.olga5.o5dbg.DebugShowBounds(aO5s)
                else
                    console.error('для распечатки DebugShowBounds подключите o5dbg (с модулем Utils)')
            }
            for (const aO5 of aO5s)
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
