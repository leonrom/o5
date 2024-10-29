/* global window, document, console, CustomEvent, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/PO5shp ---11
    "use strict"
    let wshp = {}

    const
        olga5_modul = "o5shp",
        modulname = 'PO5shp',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmtOK = "background: aquamarine; color: black;",
        // fmtErr = "background: lightgoldenrodyellow; color: black;",

        Observe = (entries, observ) => {
            const
                pO5 = observ.pO5,
                timeStamp = Date.now() + Math.random()
            // bordnam = observ.root ? pO5.name : 'окно'

            if (o5debug > 1) {
                let s = ''
                for (const entry of entries)
                    s += (s ? ', ' : '') +
                        `${entry.isIntersecting ? '+' : '-'}${entry.target.aO5shp.name}/` +
                        ` ${entry.intersectionRatio.toFixed(2)}${(entry.target.classList.contains('olga5-clon') ? '-clon' : '')}`

                console.log("%c%s", fmtOK, '--:  Observe bord=', pO5.name, '[' + s + ']')
            }

            for (const entry of entries)
                if (entry.isIntersecting) {
                    const shp = entry.target,
                        aO5 = shp.aO5shp,
                        bord = aO5.ofram.bords.find(bord => bord.tag.pO5 === pO5)

                    if (shp.classList.contains('olga5-clon')) { // т.е. это есть клон) 
                        if (entry.intersectionRatio === 1 && aO5.act.xFixed.tag) {
                            bord.out = false
                            const allIn = !aO5.ofram.bords.find(bord => bord.out)
                            if (allIn) {
                                aO5.UnFixV(bord)

                                let areFixed = false
                                for (const pO5x of wshp.pO5s)
                                    if (pO5x.IsVisi() &&
                                        pO5x.observ.aO5s.find(xO5 => xO5.act.xFixed)
                                    ) {
                                        areFixed = true
                                        break
                                    }

                                // if (!areFixed && observ.IsVisi())
                                //     for (const xO5 of observ.aO5s)
                                //         if (xO5.act.xFixed) {
                                //             areFixed = true
                                //             break
                                //         }

                                if (!areFixed)
                                    wshp.escroll.ScrollAct(false, `свободно ${aO5.name} ${allIn}?' (все свободны)':''`)
                            }
                        }
                    }
                    else {   // if (isr < 1 && !act.xFixed && act.readyFix) 
                        const
                            // br = entry.boundingClientRect,
                            // pos = entry.intersectionRect,
                            br = entry.intersectionRect,
                            pos = observ.pO5.pos,
                            dirV = aO5.cls.dirV

                        wshp.escroll.ScrollAct(true, `подвисло ${aO5.name}`)
                        // if (
                        //     (br.top < pos.top && dirV === 'U') ||
                        //     (br.bottom > pos.bottom && dirV === 'D')
                        // ) {
                        //     wshp.DoScroll({ aO5: aO5, bord: bord, timeStamp: timeStamp })

                        //     wshp.escroll.ScrollAct(true, `подвисло ${aO5.name}`)
                        //     bord.out = true
                        // }
                    }
                }
        },
        FindBords = (aO5, blng) => {
            const
                errs = [],
                IsInClass = (tag, cc) => {
                    const
                        cs = cc.split(/[.,]/),
                        cls = tag.classList.map(s => s.toUpperCase())

                    for (const c of cs)
                        if (c !== '' && !cls.find(c))
                            return false
                    return true
                },
                CheckNST = prev => {
                    if (!prev.mO5s) prev.mO5s = []
                    if (!prev.mO5s.nst)
                        prev.mO5s.nst = window.getComputedStyle(prev)
                    return prev.mO5s.nst
                },
                CalcDiff = (prev, parent) => {
                    const
                        nst = CheckNST(prev),
                        IsFloat001 = s => { return Math.abs(parseFloat(s)) > 0.01 },
                        CN = (nst, nam) => {
                            const color = nst.getPropertyValue(nam + '-color'),
                                rgb = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i),
                                GRGB = (i) => { return ("0" + parseInt(rgb[i], 10).toString(16)).slice(-2) }
                            return (rgb && rgb.length === 4) ? "#" + GRGB(1) + GRGB(2) + GRGB(3) : ''
                        }

                    if (parent) {
                        CheckNST(parent)

                        const diff = CN(nst, 'background') !== CN(parent.mO5s.nst, 'background') &&
                            prev.style.backgroundColor

                        prev.mO5s.diffT = diff || IsFloat001(nst.borderTopWidth)
                        prev.mO5s.diffB = diff || IsFloat001(nst.borderBottomWidth)
                    }
                    else {
                        prev.mO5s.diffT = true
                        prev.mO5s.diffB = true
                    }
                },
                CalcScroll = pO5 => {
                    const
                        nst = CheckNST(pO5.current),
                        minScrollW = 3

                    Object.assign(pO5.scroll, {
                        dw: minScrollW + C.MyRound(nst.borderLeftWidth) + C.MyRound(nst.borderRightWidth) + C.MyRound(nst.paddingLeft) + C.MyRound(nst.paddingRight),
                        dh: C.MyRound(nst.borderTopWidth) + C.MyRound(nst.borderBottomWidth) + C.MyRound(nst.paddingTop) + C.MyRound(nst.paddingBottom),
                        ovfX: nst.overflowX,
                        ovfY: nst.overflowY,
                    })

                    for (const bord of ['top', 'left', 'right', 'bottom'])
                        pO5.add[bord] = parseFloat(nst.getPropertyValue('border-' + bord + '-width'))
                }
            // Ask = bord => {
            //     const c = (bord.cod || '').trim()
            //     return {
            //         c: c.toUpperCase(),
            //         t: bord.typ.toUpperCase(),
            //         n: bord.num
            //     }
            // },
            // Find = (aO5, ask) => {
            //     return aO5.prev.mO5s.find(m => m.c === ask.c && m.t === ask.t && m.n === ask.n)
            // },
            // GetmO5 = (aO5, bords, ask) => { // заодно выполняю поиск всех из ask
            //     let
            //         i = -1,
            //         itag = -1,
            //         tag = null,
            //         prev = aO5.prev,
            //         mO5 = null

            //     while (prev) {
            //         const parent = prev.nodeName == 'BODY' ? null : prev.parentNode
            //         i++
            //         for (const bord of bords) {
            //             const
            //                 x = Ask(bord),
            //                 t = ask.t

            //             let n = x.n

            //             if (t === 'B') {
            //                 CalcDiff(prev, parent)
            //             }
            //             if (
            //                 (t === 'B' && (prev.mO5s.diffT || prev.mO5s.diffB)) ||
            //                 (t === 'I' && prev.id.toUpperCase() == x.c) ||
            //                 (t === 'N' && prev.nodeName == x.c) ||
            //                 (t === 'C' && IsInClass(prev, x.c))
            //             ) {
            //                 itag = i
            //                 tag = prev
            //                 if (--n <= 0 || bord.num <= 1) {// именно в такой очередности
            //                     const xO5 = { c: x.c, t: x.t, n: x.n, itag: itag, tag: tag }

            //                     if (!Find(aO5, ask, xO5))
            //                         aO5.prev.mO5s.push(xO5)

            //                     if (ask.c === x.c && ask.t === x.t && ask.n === x.n)
            //                         mO5 = xO5

            //                     break
            //                 }
            //             }
            //         }

            //         if (!bords.find(bord => !bord.tag) || !parent)
            //             break

            //         prev = parent
            //     }

            //     if (itag < 0) {
            //         itag = i
            //         tag = prev
            //         if (ask.t !== 'S')
            //             errs.push(`'${ask.t}:${ask.c}' - не найден`)
            //     }
            //     else
            //         if (ask.n > 0)
            //             errs.push(` контейнер '${ask.t}:${ask.c}:${bord.num}' - найдено ${bord.num - n} из ${bord.num}`)

            //     return mO5
            // }

            for (const bord of blng.bords) {
                const
                    cod = (bord.cod || '').trim(),
                    ask = {
                        c: cod.toUpperCase(),
                        t: bord.typ.toUpperCase(),
                        n: bord.num
                    }

                const xO5 = { itag: 9999, tag: document.body },
                    mO5 = aO5.prev.mO5s.find(m => m.c === ask.c && m.t === ask.t && m.n === ask.n) || {}

                if (!mO5.tag) {
                    let err = '',
                        n = ask.n,
                        found = false

                    Object.assign(mO5, { c: ask.c, t: ask.t, n: ask.n, itag: -1, tag: null })
                    Object.seal(mO5)

                    if ('SIBNC'.indexOf(ask.t) < 0)
                        err = `Селектор '${ask.t}:${ask.c}:${ask.n}':  недопустимый тип '${ask.t}'`
                    else
                        if (ask.t === 'S') Object.assign(mO5, xO5)
                        else {
                            let i = -1,
                                prev = aO5.prev

                            while (prev) {
                                i++
                                const parent = prev.nodeName == 'BODY' ? null : prev.parentNode
                                let ok = true

                                switch (ask.t) {
                                    case 'I': ok = prev.id.toUpperCase() == ask.c; break
                                    case 'N': ok = prev.nodeName == ask.c; break
                                    case 'C': ok = IsInClass(prev, ask.c); break
                                    default:  // case 'B'
                                        CalcDiff(prev, parent)
                                        ok = (prev.mO5s.diffT || prev.mO5s.diffB)
                                }
                                if (ok) {
                                    Object.assign(xO5, { itag: i, tag: prev })
                                    found = true
                                    if (--n <= 0 || ask.n <= 1) {   // именно в такой очередности                                        
                                        Object.assign(mO5, xO5)
                                        break
                                    }
                                }

                                if (parent) prev = parent
                                else
                                    break
                            }
                        }

                    if (!mO5.tag) {
                        if (!err && ask.c !== 'OLGA5-START_HR') {
                            bord.err = ` контейнер '${ask.t}:${cod}:${ask.n}' - ` +
                                (found ? `найдено лишь ${ask.n - n}` : `не найден`)
                            errs.push(bord.err)
                        }
                        Object.assign(mO5, xO5)
                    }
                    aO5.prev.mO5s.push(mO5)
                }
                bord.tag = mO5.tag
                bord.itag = mO5.itag

                const cls = 'olga5-' + blng.akey
                if (!bord.tag.classList.contains(cls))
                    bord.tag.classList.add(cls)

                if (!bord.tag.pO5) {
                    try {
                        bord.tag.pO5 = new PO5(bord.tag)
                    } catch (e) {
                        C.ConsoleAlert(`В ModulAddSub Для объекта '${aO5.name}' ошибка при определении prev='${C.MakeObjName(aO5.prev)}':\n\t  "${e.message}"`)
                        return
                    }

                    CalcScroll(bord.tag.pO5)
                }

                const pO5 = bord.tag.pO5
                if (blng.akey === 'oframs') {
                    if (!pO5.observ) {
                        pO5.observ = new Observ(pO5)
                        wshp.pO5s.push(pO5)
                    }
                    pO5.observ.AddO5(aO5)
                }
            }


            // // устранение дублирования
            // const pO5s = []

            // let err = '',
            //     i = blng.bords.length

            // while (i-- > 0) {
            //     const bord = blng.bords[i],
            //         pO5 = bord.tag.pO5

            //     // !!вот здесь создавать pO5  !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


            //     if (pO5s.includes(pO5)) {
            //         blng.bords.splice(i, 1)
            //         err += (err ? ', ' : '') + pO5.name + ' (' + bord.typ + ':' + bord.cod + ':' + bord.num + ')'
            //     }
            // }
            // сортировка по вложенности от внутреннего к внешнему
            //   ?? нужна, т.к. всё равно надо по всем проерять
            blng.bords.sort((b1, b2) => { return b1.itag - b2.itag })

            if (o5debug > 1) {
                let s = ''
                for (const bord of blng.bords) {
                    const u = (bord && bord.tag) ? bord.tag.pO5.name : '?'
                    s += (s ? ', ' : '') + u
                }
                console.log("%c%s", fmtOK, aO5.name, blng.akey, '[ ' + s + ' ]')
            }
            // if (err)
            //     C.ConsoleError(`Тег '${aO5.name}' - устранил дублирующие контейнеры:`, err)

            if (errs.length > 0)
                C.ConsoleError(`Тег '${aO5.name}' - ошибки определения контейеров`, errs.length, errs)

            if (o5debug > 1) // для тестирования в shpC.html
                window.dispatchEvent(new CustomEvent('olga5-containers', { detail: { aO5: aO5, akey: blng.akey } }))

        }

    class Observ extends IntersectionObserver {
        constructor(pO5) {
            super(Observe, {
                root: pO5.current === document.body ? null : pO5.current,
                rootMargin: '0px',
                threshold: [0.001, 1],
                trackVisibility: false,
            })
            this.pO5 = pO5
            this.aO5s = []  // которые контролируются (observer'ом)

            if (o5debug > 1)
                console.log("%c%s", fmtOK,
                    `создал 'observ' на ${pO5.name.padEnd(6)}  [${pO5.current.className}]`)
        }
        AddO5 = aO5 => {
            this.aO5s.push(aO5)
            this.observe(aO5.shp)
        }
        HasVisibleFixed = () => this.aO5s.find(aO5 =>
            aO5.act.xFixed &&
            aO5.cart.style.display !== 'none'
        )
    }

    class PO5 {
        #cutts
        #isVisi
        IsVisi = () => this.#isVisi
        AddCut = aO5 => {
            // console.log("%c%s", fmtErr, `PO5shp повторное 'обрезание' объекта `, aO5.name)
            if (!this.#cutts.includes(aO5))
                this.#cutts.push(aO5)
        }
        DelCut = aO5 => {
            const i = this.#cutts.indexOf(aO5)
            if (i >= 0)
                this.#cutts.splice(i, 1)
        }
        IsCuts = () => this.#cutts.length > 0
        MarkVisible = visi => {
            if (this.#isVisi !== visi) {
                this.#isVisi = visi
                for (const aO5 of this.observ.aO5s) {
                    if (visi)
                        this.observ.observe(aO5.shp)
                    else
                        this.observ.unobserve(aO5.shp)
                    aO5.CheckIsVisi()
                }
            }
        }
        constructor(current) {
            this.#cutts = []
            this.#isVisi = false

            const pO5 = this

            current.pO5 = pO5
            pO5.current = current

            pO5.id = current.id
            pO5.name = C.MakeObjName(current)
            pO5.isBody = current === document.body || current.nodeName == 'BODY'
            pO5.isFinal = pO5.isBody ||
                ['overview-content', 'viewitem-panel'].find(cls => current.classList.contains(cls)) ||
                false

            // pO5.pO5L = new PO5L(pO5)        // используется для крайних ofram.bords
            pO5.add = { top: 0, left: 0, right: 0, bottom: 0 }
            pO5.pos = { top: 0, left: 0, right: 0, bottom: 0, tim: 0, } // пересчитывается при DoScroll
            pO5.scroll = { dw: 0, dh: 0, ovfX: false, ovfY: false, }    // zIndex: -1, 

            pO5.classOrig = [].concat(current.classList) // для поиск контейнеров 'c:'
            pO5.observ = null

            for (const nam of ['add', 'pos', 'scroll', 'po'])
                Object.seal(this[nam])


            Object.seal(this)
        }
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, aO5 => {
        // let pO5 = aO5.prev.pO5
        // if (!pO5) {

        FindBords(aO5, aO5.ofram)
        FindBords(aO5, aO5.owner)

        if (o5debug > 1)
            console.log("%c%s", fmtOK, "созданы bord'ы  для '" + aO5.name + "'")
    })
    wshp.pO5s = []

})();
