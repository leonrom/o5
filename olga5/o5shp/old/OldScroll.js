/*jshint asi:true          */
/* -global window, console */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/OldScroll ---
    "use strict"
    let wshp = {},
        timeStamp = 0

    const
        olga5_modul = "o5shp",
        modulname = 'OldScroll',
        lognam = `${olga5_modul}/${modulname} `,
        C = window.olga5.C,
        datestart = Date.now(),
        CalcParentsLocates = (aO5, blng) => { // пересчитываются размеры всех предков-контейнеров        
            for (const parent of blng.asks.bords) {
                const pO5 = parent.pO5
                if (pO5.pos.tim == timeStamp) break
                else {
                    if (pO5.isBody) {
                        const doc = document.documentElement
                        Object.assign(pO5.pos,
                            { tim: timeStamp, top: 0, bottom: doc.clientHeight, left: 0, right: doc.clientWidth })
                    }
                    else {
                        const current = pO5.current,
                            isO5 = current.aO5shp,
                            p = isO5 ? current.aO5shp.posC : current.getBoundingClientRect(),
                            right = isO5 ? p.left + p.width : p.left + current.clientWidth + pO5.add.left,
                            bottom = isO5 ? p.top + p.height : p.top + current.clientHeight + pO5.add.top
                        Object.assign(pO5.pos,
                            { tim: timeStamp, top: p.top + pO5.add.top, bottom: bottom, left: p.left + pO5.add.left, right: right })
                    }
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
                            if (a.to === null || a.to == bO5 || a.to.pos.top < pos.top) a.to = pO5
                            if (a.bo === null || a.bo == bO5 || a.bo.pos.bottom > pos.bottom) a.bo = pO5
                        }
                        if (pos.left != pos.right) {
                            if (a.le === null || a.le == bO5 || a.le.pos.left < pos.left) a.le = pO5
                            if (a.ri === null || a.ri == bO5 || a.ri.pos.right > pos.right) a.ri = pO5
                        }
                    }
                }

            for (const ask of aO5.frames.asks)
                Located([ask.bords[0]], a)
            Object.assign(aO5.frames, a)


            Object.assign(a, { to: bO5, le: bO5, ri: bO5, bo: bO5 })

            for (const ask of aO5.owners.asks)
                Located(ask.bords, a)
            Object.assign(aO5.owners, a)

            for (const hoverMarks of ['to', 'le', 'ri', 'bo']) {
                const pO5 = aO5.frames[hoverMarks]
                if (!pO5 || !pO5.owners)
                    alert(`owners '${hoverMarks}' (in  OldScroll.prepareBords)`)
                if (pO5.owners.timeStamp != timeStamp) { // чтобы не повторяться для одинаковых
                    Located(pO5.prevs, pO5.owners)
                    pO5.owners.timeStamp = timeStamp
                }
            }
        },
        CheckUps = (aO5, aO5s) => {
            if (aO5.visi.doKill)    //  || aO5.visi.checkUp)
                return

            const
                level = aO5.cls.level,
                upfixeds = []

            // ищу подвисшие с самой нижней bottom-границей
            let lowerO5 = null,
                t = 0                // 1-Number.MAX_VALUE

            for (const upO5 of aO5s)            // всх, кто выше чем aO5
                if (upO5 !== aO5 && upO5.cls.putV === 'T' && !upO5.visi.doKill && upO5.posW.top < aO5.posW.top)
                    if (aO5.IsConnect(upO5)) {

                        if (!upO5.visi.checkUp)
                            CheckUps(upO5, aO5s)

                        if (upO5.visi.doFix) {
                            upfixeds.push(upO5)
                            if (level > upO5.cls.level) {   // т.е. которы могут прилипать, а не сдвигать
                                const y = upO5.posC.top + upO5.posC.height
                                if (y > t) {
                                    t = y
                                    lowerO5 = upO5
                                }
                            }
                        }
                    }

            if (lowerO5) {
                aO5.posC.top = lowerO5.posC.top + lowerO5.posC.height
                aO5.visi.doFix = true
            }

            // поподжимаю всех, в кого упёрлось                
            for (const upO5 of upfixeds)
                if (level <= upO5.cls.level) {
                    if (aO5.cls.pitch === 'P') {
                        upO5.visi.doFix = false    //  UnFixV()
                        upO5.act.pushedBy = aO5
                    }
                    else {
                        let h = aO5.posC.top - upO5.posC.top

                        if (h <= 0) {
                            h = 0
                            upO5.visi.doFix = false
                            upO5.act.pushedBy = aO5
                        }

                        upO5.posC.height = h
                        if (aO5.cls.pitch === 'S')
                            upO5.posS.top = -(upO5.posW.height - h)

                        aO5.posC.top = upO5.posC.top + h
                        aO5.visi.doFix = true
                    }
                }

            aO5.visi.checkUp = true
        },
        DoScroll = aO5s => {
            // P('begin')
            if (wshp.W.consts.o5debug > 2)
                console.log(lognam + "DoScroll для '" + (() => {
                    let s = ''
                    aO5s.forEach(aO5 => { s += (s ? ', ' : '') + aO5.name })
                    return s
                })() + "'")

            for (const aO5 of aO5s) {
                CalcParentsLocates(aO5, aO5.frames) // пересчитываются размеры всех предков-контейнеров        
                CalcParentsLocates(aO5, aO5.owners) // пересчитываются размеры всех предков-контейнеров        
                PrepareBords(aO5)       // обределение минимальных границ контейнеров (родвисания и владения)

                const posW = aO5.posW,
                    posC = aO5.posC

                const b = aO5.shdw.getBoundingClientRect() // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона
                Object.assign(posW, { top: b.top, left: b.left, height: b.height, width: b.width, })
                Object.assign(posC, posW)
                Object.assign(aO5.posS, { top: 0, left: 0, })

                const pos = aO5.owners.to.pos,
                    bottomW = posW.top + posW.height,
                    full = posW.top >= pos.top && bottomW <= pos.bottom,
                    part = posW.top + posW.height <= pos.bottom           //  т.е. уже всплыло снизу   && bottomW >= pos.top

                Object.assign(aO5.visi, { checkUp: false, doKill: false, doFix: false, full: full, part: part })

                if (aO5.visi.full) {        // очистка при полном появлении
                    Object.assign(aO5.act, { pushedBy: null, isKilled: false, underClick: false, })
                    if (aO5.act.isFixed) {
                        aO5.visi.doFix = false
                        aO5.SetFix()
                    }
                }
            }

            /*
                установка подверженности  Kill'ерам на границах всех 'владельцев'
            */
            for (const aO5 of aO5s) {
                const vpart = aO5.visi.part,
                    allbords = aO5.allbords,
                    level = aO5.cls.level,
                    posW = aO5.posW,
                    cls = aO5.cls

                if (cls.kill && vpart)         //  если Kill'ер частично видим
                    for (const bord of allbords)
                        for (const iO5 of bord.pO5.aO5s)
                            if (iO5 !== aO5 &&              //  iO5.visi.part &&
                                level <= iO5.cls.level &&
                                (cls.dirV === 'U' && posW.top > (iO5.posW.top + iO5.posW.height)) ||
                                (cls.dirV === 'D' && (posW.top + posW.height) < iO5.posW.top)
                            )
                                iO5.visi.doKill = true
            }

            /*
                фиксация объектов - либо на предыдущих, либо на рамках
            */
            for (const aO5 of aO5s) {
                const visi = aO5.visi

                if (visi.part && aO5.cls.putV === 'T')
                    CheckUps(aO5, aO5s)

                if (!visi.doFix) {   // проверю фиксацию на границе
                    const cls = aO5.cls,
                        posW = aO5.posW,
                        posC = aO5.posC,
                        totop = aO5.frames.to.pos.top

                    if (
                        (cls.dirV === 'U' && posW.top < totop && aO5.owners.to.pos.top <= totop) ||
                        (cls.dirV === 'D' && (posW.top + posW.height) < aO5.frames.bo.pos.bottom)
                    ) {
                        if (cls.putV === 'T')
                            posC.top = totop
                        else
                            posC.top = aO5.frames.to.pos.bottom - posC.height

                        visi.doFix = true
                    }
                }
            }

            /*
               обрезание зафиксированных объектов рамками
            */
            for (const aO5 of aO5s) {
            }

            for (const aO5 of aO5s)
                aO5.SetFix()

            if (wshp.W.consts.o5debug > 2)
                C.Debug.ShowBounds(aO5s)

            for (const aO5 of aO5s)
                if (aO5.aO5s.length > 0)
                    DoScroll(aO5.aO5s)
        }

    wshp = C.ModulAddSub(olga5_modul, modulname,
        (aO5s, etimeStamp) => {
            timeStamp = etimeStamp ? etimeStamp : (Date.now() + Math.random())

            if (aO5s.length > 0) {
                const debug = wshp.W.consts.o5debug > 2
                if (debug)
                    console.groupCollapsed(`  старт DoScroll для '` + (() => {
                        let s = ''
                        aO5s.forEach(aO5 => { s += (s ? ', ' : '') + `${aO5.name}(top=${parseInt(aO5.posW.top)}) ` })
                        return s
                    })() + "'" + ' (t=' + (Date.now() - datestart) + ')')

                DoScroll(aO5s)

                if (debug) {
                    console.trace("трассировка вызовов ")
                    console.groupEnd()
                }
            }
            // window.dispatchEvent(new window.Event('o5shp_scroll'))
            C.E.DispatchEvent('o5shp_scroll', modulname, true)
        }
    )

})();
