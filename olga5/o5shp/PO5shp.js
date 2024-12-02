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
        fmtOK = "background: aquamarine; color: black;"

    const Pbserve = entries => {
        for (const entry of entries) {
            const current = entry.target
            let hasFix = null

            current.pO5.scope.isVisi = entry.isIntersecting

            for (const pO5 of wshp.pO5s)
                if (pO5.scope.isVisi) {
                    hasFix = pO5.aO5s.find(aO5 => aO5.act.pO5fix)
                    // if (hasFix) {
                    //     wshp.DoScroll(true, `Pbserve: ${pO5.name}`)
                    //     break
                    // }
                }

            // if (!hasFix)
            //     wshp.DoScroll(false, `Pbserve: нет зависших`)

            if (o5debug > 1)
                console.log("%c%s", fmtOK,
                    `PO5 ${current.pO5.name.padEnd(16)} - ${current.pO5.scope.isVisi ? 'ПОЯВИЛОСЬ' : 'исчезло'} на экране`)
        }
    }

    class PO5 {
        FindParents = current => {
            // parent = current.parentElement   // так не делать, т.к. 'теряет'
            if (!current.parentElement)
                return

            current.pO5.parents.push(current.parentElement)

            if (!current.parentElement.pO5)
                current.parentElement.pO5 = new PO5(current.parentElement)

            Array.prototype.push.apply(current.pO5.parents, current.parentElement.pO5.parents)
        }

        constructor(current) {
            if (current.pO5) {
                C.ConsoleError(`Повтор создания 'pO5' для контейнера id='${current.id}'`)
                return
            }

            const pO5 = this

            current.pO5 = pO5
            pO5.current = current

            pO5.id = current.id
            pO5.name = C.MakeObjName(current)
            pO5.isBody = current === document.body || current.nodeName == 'BODY'
            pO5.isFinal = pO5.isBody ||
                ['overview-content', 'viewitem-panel'].find(cls => current.classList.contains(cls)) ||
                false

            pO5.parents = []
            pO5.mO5s = []  // сохранение типов поиска bord'а
            pO5.aO5s = []  // все, которые могут подвисать на его границе, упорядочены  по 'top'            

            pO5.classOrigs = Array.from(current.classList).map(s => s.toUpperCase())

            pO5.scope = {
                pos: { top: 0, left: 0, right: 0, bottom: 0, tim: 0, }, // пересчитывается при DoScroll
                isVisi: true,
                ready: false,
                scroll: {},
                add: {},
            } // структура создается только для контейнеров

            if (!pO5.isFinal)
                this.FindParents(current)

            // for (const nam of ['add', 'pos', 'scroll', 'po'])
            Object.seal(this.scope)

            Object.freeze(this.parents)
            Object.freeze(this)

            if (o5debug > 1)
                console.log(`PO5 создано для ${pO5.name.padEnd(16)}`,
                    ` [${pO5.parents.map(parent => parent.pO5 ? parent.pO5.name : ' - ').join(', ')}]`)
        }

        AddtO5s = aO5 => {  // вставка в порядке возрастания posC.top  - xO5.AddtO5s  (aO5)
            const
                pO5 = this,
                aO5s = pO5.aO5s,
                top = aO5.posC.top

            let i = aO5s.length

            if (o5debug) {
                if (pO5.aO5s.indexOf(aO5) >= 0)
                    C.ConsoleError(`повтор добавления тега '${aO5.name}' в контейнер '${pO5.name}' `)
            }
            while (i-- > 0)
                if (aO5s[i].posC.top <= top)
                    break

            aO5s.splice(i + 1, 0, aO5);
        }
    }

    const
        FindBords = (aO5, blng) => {
            const
                errs = [],
                IsInClass = (classorigs, clss) => {
                    if (classorigs.length > 0) {
                        for (const cls of clss)
                            if (cls && classorigs.indexOf(cls) >= 0)
                                return true
                    }
                },
                prev = aO5.parents[0]

            for (const bord of blng.bords) {
                const
                    cod = (bord.cod || '').trim(),
                    ask = {
                        c: cod.toUpperCase(),
                        t: bord.typ.toUpperCase(),
                        n: bord.num
                    },
                    t = ask.t,
                    c = ask.c,
                    clss = (t === 'C') ? c.split(/\s*[.,]\s*/) : null,
                    xO5 = { itag: 9999, tag: document.body },
                    mO5 = prev.pO5.mO5s.find(m => m.c === c && m.t === t && m.n === ask.n) || {}

                if (!mO5.tag) {
                    let err = '',
                        n = ask.n

                    Object.assign(mO5, { c: c, t: t, n: ask.n, itag: -1, tag: null })
                    Object.seal(mO5)

                    if ('SINC'.indexOf(t) < 0)
                        err = `Селектор '${t}:${c}:${ask.n}':  недопустимый тип '${t}'`
                    else
                        if (t === 'S') Object.assign(mO5, xO5)
                        else
                            for (const [i, parent] of aO5.parents.entries())
                                if (
                                    (t === 'I' && parent.id.toUpperCase() == c) ||
                                    (t === 'N' && parent.nodeName == c) ||
                                    (t === 'C' && IsInClass(parent.pO5.classOrigs, clss))
                                )
                                    if (--n <= 0 || ask.n <= 1) {   // именно в такой очередности                                        
                                        Object.assign(mO5, { itag: i, tag: parent })
                                        break
                                    }
                                    else
                                        Object.assign(xO5, { itag: i, tag: parent })

                    if (!mO5.tag) {
                        if (!err && c !== 'OLGA5-START_HR') {
                            bord.err = ` контейнер '${ask.t}:${cod}:${ask.n}' - ` +
                                ((ask.n > 0 && ask.n > n) ? `найдено лишь ${ask.n - n} из ${ask.n}` : `не найден (ни одного)`)
                            errs.push(bord.err)
                        }
                        Object.assign(mO5, xO5)
                    }

                    prev.pO5.mO5s.push(mO5)
                }
                else
                    if (o5debug > 1)
                        console.log(`для ${aO5.name} (${blng.akey}) взял готовенький mO5(${c + ':' + t + ':' + ask.n})`, mO5.tag.id)

                const cls = 'olga5-' + blng.akey,
                    tag = mO5.tag,
                    pO5 = tag.pO5,
                    scope = pO5.scope,
                    b = blng.bords.find(b => b.tag === tag)

                if (b && !b.err)
                    C.ConsoleError(`FindBords - в ${blng.akey} повтор контейнера '${pO5.name}' ` +
                        `для атрибутов "${b.s}" и "${bord.s}" ` +
                        `(т.е. соотв. "${b.typ}:${b.cod}:${b.num}" и "${ask.t}:${cod}:${ask.n}")`)

                Object.assign(bord, { itag: mO5.itag, tag: tag })

                if (!tag.classList.contains(cls))
                    tag.classList.add(cls)

                if (!scope.ready) {
                    scope.ready = true

                    const
                        minScrollW = 3,
                        add = scope.add,
                        nst = window.getComputedStyle(pO5.current)

                    add.top = C.MyRound(nst.borderTopWidth)
                    add.left = C.MyRound(nst.borderLeftWidth)
                    add.right = C.MyRound(nst.borderRightWidth)
                    add.bottom = C.MyRound(nst.borderBottomWidth)

                    Object.assign(scope.scroll, {
                        dw: add.left + add.right + C.MyRound(nst.paddingLeft) + C.MyRound(nst.paddingRight) + minScrollW,
                        dh: add.top + add.bottom + C.MyRound(nst.paddingTop) + C.MyRound(nst.paddingBottom),
                        ovfX: nst.overflowX,
                        ovfY: nst.overflowY,
                    })

                    Object.freeze(scope.scroll)
                    Object.freeze(scope.add)

                    if (o5debug > 1)
                        console.log(`PO5 инициирован контейнер ${pO5.name.padEnd(16)}`,
                            ` [${pO5.parents.map(parent => parent.pO5 ? parent.pO5.name : ' - ').join(', ')}]`)
                }
            }

            blng.bords.sort((b1, b2) => { return b1.itag - b2.itag })

            if (errs.length > 0)
                C.ConsoleError(`${aO5.name} для ${blng.akey} - ошибки определения контейеров`, errs.length, errs)

            if (o5debug > 1)
                console.log("%c%s", fmtOK, `${aO5.name.padEnd(12)} `,
                    `${blng.akey}: ${blng.bords.map(bord => bord.tag.pO5.name).join(', ')}`
                )
            // для тестирования в shpC.html
            window.dispatchEvent(new CustomEvent('olga5-containers', { detail: { aO5: aO5, akey: blng.akey } }))
        },
        PO5shp = aO5 => {
            const parent = aO5.shp.parentElement
            let pO5 = parent.pO5
            if (!pO5)
                pO5 = parent.pO5 = new PO5(parent)

            aO5.parents.push(parent)
            Array.prototype.push.apply(aO5.parents, pO5.parents)

            FindBords(aO5, aO5.ofram)
            FindBords(aO5, aO5.owner)

            aO5.ofram.bords.forEach(bord => {
                const pO5 = bord.tag.pO5
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
                pO5.AddtO5s(aO5)
            })

            if (o5debug > 0)
                console.log("%c%s", fmtOK, `${aO5.name.padEnd(12)} инициировал`,
                    `${aO5.parents.map(p => p.pO5.name).join(', ')}`
                )
        },
        wshp = C.ModulAddSub(olga5_modul, PO5shp)

    wshp.pO5s = []

})();
