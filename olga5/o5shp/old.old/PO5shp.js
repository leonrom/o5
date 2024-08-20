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
        IsFloat001 = (s) => { return Math.abs(parseFloat(s) > 0.01) },
        prevsPO5 = {},
        PutBords = (pO5, txt) => {
            let s = '',
                j = pO5.prevs.length
            while (j-- > 0) {
                const bord = pO5.prevs[j],
                    name = bord.pO5 ? bord.pO5.name : C.MakeObjName(bord) // для того pO5 еще только создаётся
                s += (s ? ', ' : '') + name
            }
            if (o5debug > 2)
                console.log(txt + s)
            if (!prevsPO5[pO5.name]) prevsPO5[pO5.name] = s
        },
        FillaO5s = (aO5, pO5) => { // РЕКУРСИЯ !
            if (!pO5.aO5s.includes(aO5))
                pO5.aO5s.push(aO5)
            for (const prev of pO5.prevs)
                if (prev.pO5 !== pO5)
                    FillaO5s(aO5, prev.pO5)
        },
        FillBords = (pO5, strt) => { // РЕКУРСИЯ !
            if (pO5.prevs.length > 0)
                return

            if (!pO5.prevs.includes(pO5.current))
                pO5.prevs.push(pO5.current)

            if (pO5.isFinal || pO5.current.aO5shp) {
                if (o5debug > 1) console.log("fillBords:  " + strt + " == конец")
                Object.assign(pO5.cdif, { ct: true, cl: true, cr: true, cb: true })
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

                const cc = pO5.colors,
                    cd = pO5.cdif,
                    c = prev.pO5.colors.c

                if (!cd.ct) cd.ct = cc.t != c && cc.t != '#000000'
                if (!cd.ct) cd.ct = cc.b != c && cc.b != '#000000'
                if (!cd.ct) cd.ct = cc.l != c && cc.l != '#000000'
                if (!cd.ct) cd.ct = cc.r != c && cc.r != '#000000'
            }

            if (o5debug > 0) PutBords(pO5, "fillBords:  " + strt + " +> ")
        }

    class PO5 {
        constructor(current) {
            const pO5 = this

            pO5.current = current
            pO5.id = current.id
            pO5.name = C.MakeObjName(current)
            pO5.isBody = current === document.body || current.nodeName == 'BODY'
            pO5.isFinal = pO5.isBody ||
                ['overview-content', 'viewitem-panel'].find(cls => current.classList.contains(cls))
            pO5.isDIV = current.tagName.match(/\bdiv\b/i)  // == "DIV"

            if (o5debug > 2)
                console.log("создаётся pO5 для '" + pO5.name + "'")

            const nst = window.getComputedStyle(current),
                cd = {
                    ct: IsFloat001(nst.borderTopWidth),
                    cl: IsFloat001(nst.borderLeftWidth),
                    cr: IsFloat001(nst.borderRightWidth),
                    cb: IsFloat001(nst.borderBottomWidth),
                },
                CN = (nst, nam) => {
                    const color = nst.getPropertyValue(nam + '-color'),
                        rgb = color.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i),
                        GRGB = (i) => { return ("0" + parseInt(rgb[i], 10).toString(16)).slice(-2) }
                    return (rgb && rgb.length === 4) ? "#" + GRGB(1) + GRGB(2) + GRGB(3) : ''
                },
                c = CN(nst, 'background'),
                minScrollW = 3

            pO5.scroll.dw = minScrollW + C.MyRound(nst.borderLeftWidth) + C.MyRound(nst.borderRightWidth) + C.MyRound(nst.paddingLeft) + C.MyRound(nst.paddingRight)
            pO5.scroll.dh = C.MyRound(nst.borderTopWidth) + C.MyRound(nst.borderBottomWidth) + C.MyRound(nst.paddingTop) + C.MyRound(nst.paddingBottom)

            for (const bord of ['top', 'left', 'right', 'bottom'])
                pO5.add[bord] = parseFloat(nst.getPropertyValue('border-' + bord + '-width'))

            Object.assign(pO5.colors, {
                c: c,
                t: cd.ct ? CN(nst, 'border-top') : c,
                l: cd.cl ? CN(nst, 'border-left') : c,
                r: cd.cr ? CN(nst, 'border-right') : c,
                b: cd.cb ? CN(nst, 'border-bottom') : c,
            })
            Object.assign(pO5.cdif, {
                ct: cd.ct ? pO5.colors.t != c : false,
                cl: cd.cl ? pO5.colors.l != c : false,
                cr: cd.cr ? pO5.colors.r != c : false,
                cb: cd.cb ? pO5.colors.b != c : false,
            })
        }
        // nst = {}
        add = { top: 0, left: 0, right: 0, bottom: 0 }
        cdif = { tim: 0, ct: false, cl: false, cr: false, cb: false }
        pos = { tim: 0, top: 0, left: 0, right: 0, bottom: 0, } // пересчитывается при Scroll
        scroll = { tim: 0, yesV: false, yesH: false, wh: { dw: 0, dh: 0 } } // пересчитывается при Resize

        owns = { own: null }
        aO5s = []
        prevs = []; // всегда содержит самого себя
        colors = { c: 0, t: 0, l: 0, r: 0, b: 0, }
        located = { to: null, le: null, ri: null, bo: null, timeStamp: 0 } // для тех которые в aO5.hovered
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, (aO5) => {
        let pO5 = aO5.prev.pO5
        if (!pO5) {
            // console.log('--++ ' + C.MakeObjName(aO5.prev))
            try {
                pO5 = aO5.prev.pO5 = new PO5(aO5.prev)
            } catch (err) {
                console.error('--?? ' + C.MakeObjName(aO5.prev), err.message)
                return
            }

            FillBords(pO5, 'pO5=' + pO5.name + (aO5 ? (' для aO5=' + aO5.name) : ''))
        }
        FillaO5s(aO5, pO5)

        Object.seal(pO5.add)
        Object.seal(pO5.cdif)
        Object.seal(pO5.pos)
        Object.seal(pO5.scroll)

        Object.freeze(pO5.prevs)
        Object.freeze(pO5.prevs)
        Object.freeze(pO5.colors)
        Object.freeze(pO5.located)
        Object.freeze(pO5)

        if (o5debug > 0)
            PutBords(pO5, "fillBords: взял для '" + aO5.name + "' => ")

        const prevs = pO5.prevs,
            parent = prevs.find(parent => parent.aO5shp),
            own = parent ? parent.aO5shp : null
        if (own)
            for (const prev of prevs) {
                prev.pO5.owns.own = own
                if (prev.aO5shp || prev.pO5.owns.own) break
            }
        return pO5
    })

})();
