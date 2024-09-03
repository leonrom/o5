/* -global window, document, console */
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
        fmtErr = "background: lightgoldenrodyellow; color: black;",
        FillPrevs = (pO5, strt) => { // РЕКУРСИЯ !
            if (pO5.prevs.length > 0)
                return

            if (!pO5.prevs.includes(pO5.current))
                pO5.prevs.push(pO5.current)

            if (pO5.isFinal || pO5.current.aO5shp) {
                if (o5debug > 1) console.log("fillBords:  " + strt + " == конец")
                // Object.assign(pO5.cdif, { ct: true, cl: true, cr: true, cb: true })
            }
            else {
                const prev = pO5.current.parentElement // не надо ...aO5shp.shdw т.к. ещё не было клонирования
                if (o5debug > 1)
                    console.log("fillBords:  " + strt + " += " + C.MakeObjName(prev))

                if (!prev.pO5) {
                    prev.pO5 = new PO5(prev)
                    FillPrevs(prev.pO5, strt)
                }
                for (const parent of prev.pO5.prevs)
                    pO5.prevs.push(parent)

            }
            Object.freeze(pO5.prevs)
        },
        CalcDiffColor = prevs => {
            const minScrollW = 3,
                IsFloat001 = s => { return Math.abs(parseFloat(s)) > 0.01 },
                CN = (nst, nam) => {
                    const color = nst.getPropertyValue(nam + '-color'),
                        rgb = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i),
                        GRGB = (i) => { return ("0" + parseInt(rgb[i], 10).toString(16)).slice(-2) }
                    return (rgb && rgb.length === 4) ? "#" + GRGB(1) + GRGB(2) + GRGB(3) : ''
                }
            let i = prevs.length,
                oldC = -1

            while (i-- > 0) {
                const prev = prevs[i],
                    pO5 = prev.pO5
                let newC = pO5.scroll.newC

                if (newC === null) {   // эта проверка - чтобы обсчитывать только 1 раз
                    const nst = window.getComputedStyle(prev)

                    newC = CN(nst, 'background')

                    const diff = (i === prevs.length - 1) || (newC !== oldC && pO5.current.style.backgroundColor)

                    Object.assign(pO5.scroll, {
                        dw: minScrollW + C.MyRound(nst.borderLeftWidth) + C.MyRound(nst.borderRightWidth) + C.MyRound(nst.paddingLeft) + C.MyRound(nst.paddingRight),
                        dh: C.MyRound(nst.borderTopWidth) + C.MyRound(nst.borderBottomWidth) + C.MyRound(nst.paddingTop) + C.MyRound(nst.paddingBottom),
                        ovfX: nst.overflowX,
                        ovfY: nst.overflowY,
                        diffT: diff || IsFloat001(nst.borderTopWidth),
                        diffB: diff || IsFloat001(nst.borderBottomWidth),
                        newC: newC,
                    })

                    for (const btyp of ['top', 'left', 'right', 'bottom'])
                        pO5.add[btyp] = parseFloat(nst.getPropertyValue('border-' + btyp + '-width'))
                }
                oldC = newC
            }
        },
        ObserveP = (entries, observP) => {
            const
                bordnam = observP.root ? observP.root.pO5.name : 'окно',
                IsFixetOnBord = (aO5) => {
                    for (const xO5 of wshp.aO5s)
                        if (xO5.act.xFixed && xO5.shp.pO5 && aO5 !== xO5)
                            return true
                }
            // FindFrame=(br, dirV)=>{}

            if (o5debug > 1) {
                let s = ''
                for (const entry of entries) {
                    const shp = entry.target,
                        aO5 = shp.aO5shp

                    s += (s ? ', ' : '') +
                        `${entry.isIntersecting ? '+' : '-'}${aO5.name}/` +
                        ` ${entry.intersectionRatio.toFixed(2)}${(shp.classList.contains('olga5-clon') ? '-clon' : '')}`
                }

                if (o5debug > 1)
                    console.log("%c%s", fmtOK, '--:  ObserveP bord=', bordnam, '[' + s + ']')
            }

            for (const entry of entries) {
                const shp = entry.target,
                    aO5 = shp.aO5shp,
                    act = aO5.act,
                    isr = entry.intersectionRatio

                if (entry.isIntersecting) {
                    if (isr === 1)
                        act.readyFix = true

                    if (shp.classList.contains('olga5-clon')) { // т.е. это есть клон) 
                        if ((isr === 1 || !act.readyFix) &&
                            !wshp.aO5s.find(aO5 => { aO5.act.xFixed })
                        ) {
                            aO5.UnFixV()
                            
                            aO5.StrtObs(false)      //scroll.Stop(aO5)
                            aO5.ofram.pO5L.FixO5(aO5, false)
                            if (!IsFixetOnBord(aO5))
                                wshp.escroll.ScrollAct(false, `возврат ${aO5.name}`)
                        }
                    }
                    else
                        if (isr < 1 && !act.xFixed && act.readyFix) {
                            const
                                br = entry.boundingClientRect,
                                top = entry.intersectionRect.top,
                                bottom = entry.intersectionRect.bottom,
                                dirV = aO5.cls.dirV

                            if (
                                (br.top < top && dirV === 'U') ||
                                (br.bottom > bottom && dirV === 'D')
                            ) {
                                const
                                    posC = aO5.posC,
                                    b = aO5.shdw.getBoundingClientRect() // д.б. ОТДЕЛЬНО - текущее положение объекта или его клона
                                Object.assign(posC, { top: b.top, left: b.left, height: b.height, width: b.width, })
                                Object.assign(aO5.posW, posC)
                                posC.top = aO5.cls.dirV === 'U' ? top : bottom - posC.height

                                aO5.DoFixV(true)
                                aO5.StrtObs(true)      //scroll.Start(aO5)
                                aO5.ofram.pO5L.FixO5(aO5, true)
                                if (!IsFixetOnBord(aO5))
                                    wshp.escroll.ScrollAct(true, `подвисание ${aO5.name}`)
                            }
                        }
                }
            }
        }
    class PO5L {
        #isVisi
        constructor(pO5) {
            this.#isVisi = false
            this.pO5 = pO5
            this.paO5s = []
            this.observP = null

            this.observP = new IntersectionObserver(ObserveP, {
                root: pO5.current === document.body ? null : pO5.current,
                rootMargin: '0px',
                threshold: [0.001, 1],
                trackVisibility: false,
            })

            if (o5debug > 1)
                console.log("%c%s", fmtOK,
                    `создал observP на ${pO5.name.padEnd(6)}  [${pO5.current.className}]`)
        }
        IsVisi = () => this.#isVisi
        HasFix = () => this.paO5s.find(paO5 => paO5.fix)
        ActPO = act => {
            this.#isVisi = act

            for (const paO5 of this.paO5s)
                if (paO5.act !== act) {
                    paO5.act = act
                    paO5.aO5.StrtObs(act)
                }
        }
        AddO5 = aO5 => {
            aO5.ofram.pO5L = this
            this.paO5s.push({ aO5: aO5, act: false, fix: false })
            this.observP.observe(aO5.shp)
        }
        FixO5 = (aO5, fix) => {
            const paO5 = this.paO5s.find(paO5 => paO5.aO5 === aO5),
                thesame = paO5.fix === fix

            paO5.fix = fix
            if (thesame)
                console.error("%c%s", fmtErr, `PO5L повтор ${fix ? 'DoFixV' : 'UnFixV'} для aO5=${aO5.name}`)
        }
    }

    class PO5 {
        constructor(current) {
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
            pO5.scroll = { pO5L: null, newC: null, diffT: false, diffB: false, dw: 0, dh: 0, ovfX: false, ovfY: false, zIndex: -1, }

            pO5.classOrig = [].concat(current.classList) // для поиск контейнеров 'c:'
            // pO5.oframs = []
            // pO5.owners = []
            pO5.prevs = []      // всегда содержит самого себя

            for (const nam of ['add', 'pos', 'scroll', 'po'])
                Object.seal(this[nam])
            Object.seal(this)
        }
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, aO5 => {
        let pO5 = aO5.prev.pO5
        if (!pO5) {
            try {
                pO5 = new PO5(aO5.prev)
            } catch (err) {
                C.ConsoleAlert(`В ModulAddSub Для объекта '${aO5.name}' ошибка при определении prev='${C.MakeObjName(aO5.prev)}':\n\t  "${err.message}"`)
                return
            }
            // давать ВНЕ инициализации, чтобы легче идентифицировать ошибку
            Object.freeze(pO5)

            FillPrevs(pO5, 'pO5=' + pO5.name + (aO5 ? (' для aO5=' + aO5.name) : ''))

            CalcDiffColor(pO5.prevs)

            if (o5debug > 1)
                console.log("%c%s", fmtOK, "создан pO5 для '" + pO5.name + "'")
        }

        return pO5
    })

    wshp.PO5L = PO5L
})();
