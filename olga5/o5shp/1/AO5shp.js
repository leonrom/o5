/* -global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/AO5shp ---
    "use strict"
    let wshp = {}
    // debugids = ['shp_text', 'shp_1÷4']

    const
        olga5_modul = "o5shp",
        modulname = 'AO5shp',
        C = window.olga5.C,
        SetClick = (aO5, clk, next) => {
            if (next) aO5.act.underClick = clk
            else {
                aO5.act.wasClick = clk
                aO5.fix.iO5up = clk ? aO5.fix.iO5 : null
                aO5.cart.style.zIndex = clk ? aO5.cls.minIndex : aO5.cls.zIndex
            }
            for (const iO5 of aO5.aO5s) {
                iO5.act.underClick = clk
                SetClick(iO5, clk, true)
            }
            wshp.DoScroll(aO5.cls.aO5o)
        },
        Show = aO5 => {
            return
            if (!aO5.act.dspl) {
                aO5.act.dspl = true
                aO5.cart.style.display = ''
                aO5.shdw.style.opacity = 0
                for (const iO5 of aO5.aO5s) Show(iO5)
            }
        },
        Hide = aO5 => {
            return
            if (aO5.act.dspl) {
                aO5.act.dspl = false
                aO5.shdw.style.opacity = 1
                aO5.cart.style.display = 'none'
                for (const iO5 of aO5.aO5s) Hide(iO5)
            }
        },
        Clone = function (aO5) {
            if (C.consts.o5debug > 1)
                console.log(`----------------- клонирую '${aO5.name}' -----------`)

            const clon = aO5.clon = aO5.shp.cloneNode(true)
            clon.classList.add('olga5-clon')    // нужно ля тестов - CC()

            Object.assign(aO5.orig, { display: clon.style.display, position: clon.style.position, zIndex: clon.style.zIndex })
            if (clon.id) clon.id += '_clon'
            clon.style.display = 'none'
            clon.style.opacity = 0

            aO5.shp.parentNode.insertBefore(clon, aO5.shp)

            const nst = window.getComputedStyle(aO5.shp),
                GPV = (nam, nst) => { return C.MyRound(nst.getPropertyValue(nam)) }

            Object.assign(aO5.border, {
                w: Math.ceil(GPV('border-left-width', nst) + GPV('border-right-width', nst)),
                h: Math.ceil(GPV('border-top-width', nst) + GPV('border-bottom-width', nst))
                })
        },

        SetShpStyle = (aO5, pos, position, zIndex) => {
            Object.assign(aO5.shp.style, {
                'z-index': zIndex,
                position: position,
                top: (pos.top) + 'px',
                left: (pos.left) + 'px',
                width: (pos.width - aO5.border.w) + 'px',
                height: (pos.height - aO5.border.h) + 'px',
            })
        },
        DoFixV = (aO5, iO5) => {
            const posC = aO5.posC,
                putV = aO5.cls.putV,
                hovered = aO5.hovered,
                wasfix=aO5.fix.putV

            if (!aO5.clon)
                Clone(aO5)

            
            const b1 = aO5.shp.getBoundingClientRect()
            const b2 = aO5.clon.getBoundingClientRect()

            if (putV == 'T') {
                if (iO5) posC.top = iO5.posC.top + iO5.posC.height
                else posC.top = hovered.to.pos.top
            } else {
                const bottom = iO5 ? iO5.posC.top : hovered.to.pos.bottom
                if (iO5) posC.top = iO5.posC.top + iO5.posC.height
                else posC.top = bottom - posC.height
            }
            
            Object.assign(aO5.fix, { putV: putV, iO5: iO5 })

            aO5.clon.style.display = aO5.shp.style.display

            SetShpStyle(aO5, aO5.posC, 'fixed', aO5.cls.zIndex++)
            aO5.shdw = aO5.clon

            if (!wasfix){ // д.б. в конце
                C.E.DispatchEvent('olga5_fix-act', { detail: {aO5:aO5,  fix: true } })
            }
        },
        UnFixV = (aO5) => {
            if (aO5.fix.putV) {
                const pos = aO5.shdw.getBoundingClientRect()

                SetShpStyle(aO5, pos, aO5.orig.position, aO5.orig.zIndex)
                aO5.clon.style.display = 'none'
                aO5.shdw = aO5.shp
                aO5.fix.putV = ''
                C.E.DispatchEvent('olga5_fix-act', { detail: { aO5:aO5, fix: false } })
            }
        },
        DoShpClick = function (e) {
            const
                MarkClick = aO5 => {
                    if (aO5.fix.putV === '') {
                        const parents = aO5.prev.pO5.prevs, // ДОБАВИЛ !!
                            m = parents.length,
                            lastParent = m > 0 ? parents[m - 1] : null
                        if (lastParent && lastParent.aO5shp)
                            MarkClick(lastParent.aO5shp)
                    } else
                        aO5.SetClick(true)
                }

            let shp = e.target
            while (shp && !shp.aO5shp) shp = shp.parentElement

            if (shp && shp.aO5shp) {
                if (shp.onclick) shp.onclick(e)
                MarkClick(shp.aO5shp)
            }
        },

        Tbelong = { attr: '', to: null, le: null, ri: null, bo: null }

    class AO5 {
        constructor(shp, cls) {
            this.name = window.olga5.C.MakeObjName(shp)
            this.id = shp.id
            this.shp = shp
            this.shdw = shp
            this.prev = shp.parentElement
            Object.assign(this.cls, cls)

            for (const nam of ['cls', 'old', 'act', 'fix', 'hovered', 'located', 'posW', 'posC', 'posS'])
                Object.seal(this[nam])
            Object.seal(this)
        }
        name = '' // повтор - чтобы было 1-м в отладчике
        aO5s = [] // перечень включенных в этот aO5
        cls = { kill: false, remo: false, dirV: '', putV: 'T', alive: false, nest: -2, level: 0, zIndex: 0, minIndex: 0, aO5o: [], } //  pitch: 'S', }
        old = { hovered: { to: null, located: { to: null } }, located: { to: null } } //  для отладки: зраненеие предыдущих контейнеров
        act = { dspl: false, doKill:false, isKilled: false, wasClick: false, underClick: false, pushedBy: null, doFix:false}
        fix = { putV: '', iO5: null, iO5up: null }
        hovered = Object.assign({ act: 'hovered', asks: [], }, Tbelong) // массивы д.б.персонально
        located = Object.assign({ act: 'located', asks: [], }, Tbelong)
        posW = { top: 0, left: 0, height: 0, width: 0 }
        posC = Object.assign({}, this.posW)
        posS = Object.assign({}, this.posW)

        clon = null
        orig = {}
        border = {}
        allbords=[]

        Show = () => Show(this)
        Hide = () => Hide(this)
        DoFixV = iO5 => DoFixV(this, iO5)
        UnFixV = iO5 => UnFixV(this, iO5)
        SetClick = clk => SetClick(this, clk)
        // SetShpStyle = () => SetShpStyle(this)
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, (shp, cls) => {
        const aO5 = shp.aO5shp = new AO5(shp, cls)

        if (shp.tagName.match(/\b(img|iframe|svg)\b/i) && !shp.complete) {
            if (C.consts.o5debug > 0) C.ConsoleInfo(`ожидается завершение загрузки '${aO5.name}'`)
            shp.addEventListener('load', () => {
                wshp.DoResize(`из '${modulname}'`)
            })
        }
        return aO5
    })

})();
