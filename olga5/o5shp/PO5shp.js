/* global window, document, console, CustomEvent, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/PO5shp ---11
    "use strict"
    let pbserv = null
    const
        olga5_modul = "o5shp",
        modulname = 'PO5shp',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmtOK = "background: aquamarine; color: black;",
        GetName = (aO5, fix, cut) => {
            return aO5.name + fix ? '/fix' : '' + cut ? '/cut' : ''
        },
        Pbserve = entries => {
            for (const entry of entries) {
                const pO5 = entry.target.pO5

                Object.assign(pO5.scope, {
                    isVisi: entry.isIntersecting,
                    hasScroll: pO5.aO5fs.find(aO5f => aO5f.aO5.act.uScroll),
                })
                if (o5debug > 1)
                    console.log("%c%s", fmtOK,
                        `PO5 ${pO5.name.padEnd(16)} - ${pO5.scope.isVisi ? 'ПОЯВИЛОСЬ' : 'исчезло'} на экране`)
            }

            const
                IsVisi = pO5 => pO5.scope.hasScroll && pO5.scope.isVisi

            wshp.DoScroll(
                wshp.pO5s.find(pO5 => IsVisi(pO5)),
                `PO5.Pbserve для ${wshp.pO5s.map(pO5 => (IsVisi(pO5) ? `+` : '-') + pO5.name).join(', ')}`
            )
        }

    class PO5 {
        constructor(current) {
            if (current.pO5) {
                C.ConsoleError(`Повтор создания 'pO5' для контейнера id='${current.id}'`)
                return
            }

            const pO5 = this,
                isBody = current === document.body || current.nodeName == 'BODY'

            Object.assign(pO5, {
                id: current.id,
                name: C.MakeObjName(current),
                mO5s: [],  // сохранение типов поиска frame'а
                aO5fs: [],  // все, которые могут взаимодействовать нс его границами, упорядочены  по 'top'  
                isBody: isBody,
                current: current,
                ovfX: getComputedStyle(current).overflowX=== 'visible',
                ovfY: getComputedStyle(current).overflowY=== 'visible',
                classOrigs: Array.from(current.classList),
                isFinal: isBody ||
                    ['olga5_shp', 'overview-content', 'viewitem-panel'].find(cls => current.classList.contains(cls)) ||
                    false,
            })
            current.pO5 = pO5

            const
                nst = window.getComputedStyle(pO5.current),
                top = C.MyRound(nst.borderTopWidth),
                left = C.MyRound(nst.borderLeftWidth),
                right = C.MyRound(nst.borderRightWidth),
                bottom = C.MyRound(nst.borderBottomWidth)

            pO5.scope = {
                time: 0,
                isVisi: true,
                hasScroll: false,
                pos: { top: 0, left: 0, right: 0, bottom: 0, }, // пересчитывается при DoScroll
                add: { top: top, left: left, right: right, bottom: bottom, },
                scroll: {
                    dw: left + right + C.MyRound(nst.paddingLeft) + C.MyRound(nst.paddingRight) + 3,  // т.е. minScrollW,
                    dh: top + bottom + C.MyRound(nst.paddingTop) + C.MyRound(nst.paddingBottom),
                    // ovfX: nst.overflowX,
                    // ovfY: nst.overflowY,
                },
            }

            Object.seal(pO5.scope.pos)
            Object.freeze(pO5.scope.scroll)
            Object.freeze(pO5.scope.add)

            Object.seal(this.scope)

            if (current.id == "moe6")
                console.log('')

            // if (!pO5.isFinal)
            //     this.FindParents(current)

            // Object.freeze(this.parents)
            Object.freeze(this)

            if (o5debug > 1)
                console.log(`PO5 создано для ${pO5.name.padEnd(16)}`)
        }

        AddtO5s = (aO5, fix, cut) => {  // вставка в порядке возрастания posC.top  - xO5.AddtO5s  (aO5)
            const
                pO5 = this,
                aO5fs = pO5.aO5fs,
                top = aO5.posC.top,
                found = aO5fs.find(aO5f => aO5f.aO5 === aO5)

            let i = aO5fs.length

            if (found) {
                if (found.fix === fix && found.cut === cut)
                    return `"${GetName(aO5, fix, cut)}" в контейнер '${pO5.name}' `

                if (fix) found.fix = fix
                if (cut) found.cut = cut
            }
            else {
                while (i-- > 0)
                    if (aO5fs[i].aO5.posC.top <= top)
                        break

                aO5fs.splice(i + 1, 0, { aO5: aO5, fix: fix, cut: cut });
            }
        }
    }

    const
        PO5shp = aO5 => {
            let pO5 = aO5.parent.pO5
            if (!pO5)
                pO5 = aO5.parent.pO5 = new PO5(aO5.parent)

            wshp.FindBords(aO5)

            const errs=[]
            for (const frame of aO5.frames) {
                const pO5 = frame.pO5
                if (pO5) {
                    if (wshp.pO5s.indexOf(pO5) < 0) {
                        wshp.pO5s.push(pO5)
                        if (!pbserv)
                            pbserv = new IntersectionObserver(Pbserve, {
                                root: null,
                                rootMargin: '0px',
                                threshold: 0,
                                trackVisibility: false,
                            })
                        pbserv.observe(pO5.current)
                    }

                    const err = pO5.AddtO5s(aO5)
                    if (err)
                        errs.push(err)
                }
            }

            if (errs.length){
                // wshp.FrameErr(frame, err)
                C.ConsoleError(`Повторы добавления тега `, errs.length, errs)
            }
            if (o5debug > 0) {
                const ps = []
                let parent = aO5.parent
                do {
                    ps.push(parent.pO5.name)
                } while (parent = wshp.NextParent(parent))

                console.log("%c%s", fmtOK, `${aO5.name.padEnd(12)} инициировал`,
                    `${ps.join(', ')}`
                )
            }
        },
        wshp = C.ModulAddSub(olga5_modul, PO5shp)

    wshp.pO5s = []
    wshp.PO5 = PO5

})();
