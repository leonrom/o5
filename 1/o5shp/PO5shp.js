/* -global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/PO5shp ---
    "use strict"
    let wshp = {}

    const
        olga5_modul = "o5shp",
        modulname = 'PO5shp',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
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
                if (o5debug > 2) console.log("fillBords:  " + strt + " += " + C.MakeObjName(prev))

                if (!prev.pO5) {
                    prev.pO5 = new PO5(prev)
                    FillPrevs(prev.pO5, strt)
                }
                for (const parent of prev.pO5.prevs)
                    pO5.prevs.push(parent)

            }
            Object.freeze(pO5.prevs)
        },
        CalcDiffColor0 = prevs => {
            const minScrollW = 3,
                IsFloat001 = s => { return Math.abs(parseFloat(s)) > 0.01 },
                CN = (nst, nam) => {
                    const color = nst.getPropertyValue(nam + '-color'),
                        rgb = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i),
                        GRGB = (i) => { return ("0" + parseInt(rgb[i], 10).toString(16)).slice(-2) }
                    return (rgb && rgb.length === 4) ? "#" + GRGB(1) + GRGB(2) + GRGB(3) : ''
                }
            let i = prevs.length,
                oldc = -1

            while (i-- > 0) {
                const prev = prevs[i],
                    pO5 = prev.pO5,
                    nst = window.getComputedStyle(prev),
                    newc = CN(nst, 'background'),
                    diff = (i === prevs.length - 1) || (newc !== oldc && pO5.current.style.backgroundColor)

                // console.log(`${pO5.name}: '${pO5.current.style.backgroundColor}'`)
                // if (pO5.name=="div4" )
                //     console.log(`${pO5.name}`)
                // if (pO5.name == '#moe82')
                //     console.log('')
                pO5.scroll.diffT = diff || IsFloat001(nst.borderTopWidth)
                pO5.scroll.diffB = diff || IsFloat001(nst.borderBottomWidth)

                Object.assign(pO5.scroll, {
                    dw: minScrollW + C.MyRound(nst.borderLeftWidth) + C.MyRound(nst.borderRightWidth) + C.MyRound(nst.paddingLeft) + C.MyRound(nst.paddingRight),
                    dh: C.MyRound(nst.borderTopWidth) + C.MyRound(nst.borderBottomWidth) + C.MyRound(nst.paddingTop) + C.MyRound(nst.paddingBottom),
                    ovfX: nst.overflowX,
                    ovfY: nst.overflowY,
                })

                for (const btyp of ['top', 'left', 'right', 'bottom'])
                    pO5.add[btyp] = parseFloat(nst.getPropertyValue('border-' + btyp + '-width'))

                oldc = newc
            }
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

            for (const cls of current.classList)
                pO5.classTag.push(cls)

            for (const nam of ['add', 'pos', 'scroll'])
                Object.seal(this[nam])
            Object.seal(this)
        }
        add = { top: 0, left: 0, right: 0, bottom: 0 }
        pos = { top: 0, left: 0, right: 0, bottom: 0, tim: 0, } // пересчитывается при DoScroll
        scroll = { newC: null, diffT: false, diffB: false, dw: 0, dh: 0, ovfX: false, ovfY: false, zIndex:-1, } // yesV: false, yesH: false, 

        prevs = []      // всегда содержит самого себя
        oframs = []
        owners = []
        classTag = []   // для поиск контейнеров 'c:'

        observ = { observer: null }
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, aO5 => {
        let pO5 = aO5.prev.pO5
        if (!pO5) {
            try {
                pO5 = new PO5(aO5.prev)
            } catch (err) {
                C.ConsoleError(`Для объекта '${aO5.name}' ошибка при определении prev='${C.MakeObjName(aO5.prev)}':\n\t  "${err.message}"`)
                return
            }
            // давать ВНЕ инициализации, чтобы легче идентифицировать ошибку
            Object.freeze(pO5)

            FillPrevs(pO5, 'pO5=' + pO5.name + (aO5 ? (' для aO5=' + aO5.name) : ''))

            CalcDiffColor(pO5.prevs)


            // Object.freeze(pO5.owners)
            // Object.freeze(pO5.oframs)

            if (o5debug > 2)
                console.log("создан pO5 для '" + pO5.name + "'")
        }

        return pO5
    })

})();
