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
        FillBords = (pO5, strt) => { // РЕКУРСИЯ !
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
                    FillBords(prev.pO5, strt)
                }
                for (const parent of prev.pO5.prevs)
                    pO5.prevs.push(parent)

            }         
            
            const nst = window.getComputedStyle(pO5.current),
            minScrollW = 3

            Object.assign(pO5.scroll,{
        dw : minScrollW + C.MyRound(nst.borderLeftWidth) + C.MyRound(nst.borderRightWidth) + C.MyRound(nst.paddingLeft) + C.MyRound(nst.paddingRight),
        dh : C.MyRound(nst.borderTopWidth) + C.MyRound(nst.borderBottomWidth) + C.MyRound(nst.paddingTop) + C.MyRound(nst.paddingBottom),
        ovfX : nst.overflowX,
        ovfY : nst.overflowY},
            )

        for (const bord of ['top', 'left', 'right', 'bottom'])
            pO5.add[bord] = parseFloat(nst.getPropertyValue('border-' + bord + '-width'))
        
        const
            IsFloat001 = (s) => { return Math.abs(parseFloat(s) > 0.01) },
            CN = (nst, nam) => {
                const color = nst.getPropertyValue(nam + '-color'),
                    rgb = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i),
                    GRGB = (i) => { return ("0" + parseInt(rgb[i], 10).toString(16)).slice(-2) }
                return (rgb && rgb.length === 4) ? "#" + GRGB(1) + GRGB(2) + GRGB(3) : ''
            }
        
        Object.assign(pO5.coldi, {
            c: CN(nst, 'background'),
            t: IsFloat001(nst.borderTopWidth),
            l: IsFloat001(nst.borderLeftWidth),
            r: IsFloat001(nst.borderRightWidth),
            b: IsFloat001(nst.borderBottomWidth),
        })
        }

    class PO5 {
        constructor(current) {
            const pO5 = this

            current.pO5=pO5
            pO5.current = current
            pO5.id = current.id
            pO5.name = C.MakeObjName(current)
            pO5.isBody = current === document.body || current.nodeName == 'BODY'
            pO5.isFinal = pO5.isBody ||
                ['overview-content', 'viewitem-panel'].find(cls => current.classList.contains(cls)) ||
                false
            pO5.isDIV = current.tagName.match(/\bdiv\b/i)  // == "DIV"

            Object.seal(pO5.add)
            // Object.seal(pO5.cdif)
            Object.seal(pO5.pos)
            Object.seal(pO5.scroll)
          
        }
        add = { top: 0, left: 0, right: 0, bottom: 0 }
        pos = { top: 0, left: 0, right: 0, bottom: 0, } // пересчитывается при DoScroll
        scroll = { yesV: false, yesH: false, dw: 0, dh: 0, ovfX: false, ovfY: false } // пересчитывается при Resize

        // aO5s = []
        prevs = []; // всегда содержит самого себя
        coldi = { c: 0, t: 0, l: 0, r: 0, b: 0, }
        // owners = { to: null, le: null, ri: null, bo: null, timeStamp: 0 } // для тех которые в aO5.oframs
        owns =[]
        frms =[]

        observ={observer : null}
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
            
            FillBords(pO5, 'pO5=' + pO5.name + (aO5 ? (' для aO5=' + aO5.name) : ''))

            Object.freeze(pO5.prevs)
            Object.freeze(pO5.coldi)
            Object.freeze(pO5.owners)
            Object.freeze(pO5)

            if (o5debug > 2)
                console.log("создан pO5 для '" + pO5.name + "'")
        }

        return pO5
    })

})();
