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
        // Show = aO5 => {
        //     return
        //     if (!aO5.act.dspl) {
        //         aO5.act.dspl = true
        //         aO5.cart.style.display = ''
        //         aO5.shdw.style.opacity = 0
        //         for (const iO5 of aO5.aO5s) Show(iO5)
        //     }
        // },
        // Hide = aO5 => {
        //     return
        //     if (aO5.act.dspl) {
        //         aO5.act.dspl = false
        //         aO5.shdw.style.opacity = 1
        //         aO5.cart.style.display = 'none'
        //         for (const iO5 of aO5.aO5s) Hide(iO5)
        //     }
        // },
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

            Object.assign(aO5.bords, {
                w: Math.ceil(GPV('border-left-width', nst) + GPV('border-right-width', nst)),
                h: Math.ceil(GPV('border-top-width', nst) + GPV('border-bottom-width', nst))
            })
            Object.assign(aO5.padds, {
                w: Math.ceil(GPV('padding-left-width', nst) + GPV('padding-right-width', nst)),
                h: Math.ceil(GPV('padding-top-width', nst) + GPV('padding-bottom-width', nst))
            })
        },
        DoFixV = (aO5, iO5) => {
            const posC = aO5.posC,
                putV = aO5.cls.putV,
                hovered = aO5.hovered
            // wasfix = aO5.act.isFixed

            if (putV == 'T') {
                if (iO5) posC.top = iO5.posC.top + iO5.posC.height
                else posC.top = hovered.to.pos.top
            } else {
                const bottom = iO5 ? iO5.posC.top : hovered.to.pos.bottom
                if (iO5) posC.top = iO5.posC.top + iO5.posC.height
                else posC.top = bottom - posC.height
            }

            if (!aO5.act.isFixed) {
                if (!aO5.clon) {
                    Clone(aO5)
                    // return    
                }
                const b1 = aO5.shp.getBoundingClientRect()
                const b2 = aO5.clon.getBoundingClientRect()

                aO5.shdw = aO5.clon
                aO5.act.isFixed = true

                Object.assign(aO5.shp.style, {
                    'z-index': aO5.cls.zIndex,
                    position: 'fixed',
                    width: (posC.width - aO5.bords.w - aO5.padds.w) + 'px',
                    height: (posC.height - aO5.bords.h - aO5.padds.h) + 'px',
                })

                const b = aO5.shdw.getBoundingClientRect()
                const c = aO5.clon.getBoundingClientRect()
                const d = aO5.shp.getBoundingClientRect()

                C.E.DispatchEvent('olga5_fix-act', { detail: { aO5: aO5, fix: true } })
            }
            Object.assign(aO5.shp.style, {
                top: (posC.top) + 'px',
                left: (posC.left) + 'px',
            })
        },
        UnFixV = aO5 => {
            // const pos = aO5.shdw.getBoundingClientRect()
return
            const pos = aO5.posW
            Object.assign(aO5.shp.style, {
                'z-index': aO5.orig.zIndex,
                position: aO5.orig.position,
                top: (pos.top) + 'px',
                left: (pos.left) + 'px',
                width: (pos.width - aO5.bords.w - aO5.padds.w) + 'px',
                height: (pos.height - aO5.bords.h - aO5.padds.h) + 'px',
            })
            // SetShpStyle(aO5, aO5.posW, aO5.orig.position, aO5.orig.zIndex)
            aO5.clon.style.display = 'none'
            aO5.shdw = aO5.shp
            aO5.act.isFixed = false
            C.E.DispatchEvent('olga5_fix-act', { detail: { aO5: aO5, fix: false } })
        },
        DoClick = e => {
            const aO5 = e.target.aO5shp
            if (aO5.act.isFixed) {
                UnFixV()
                aO5.act.underClick = true
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

            shp.addEventListener('click', DoClick)
        }
        name = '' // повтор - чтобы было 1-м в отладчике
        aO5s = [] // перечень включенных в этот aO5
        cls = { kill: false, remo: false, dirV: '', putV: 'T', alive: false, nest: -2, level: 0, zIndex: 0, aO5o: [], } //  pitch: 'S', }
        old = { hovered: { to: null, located: { to: null } }, located: { to: null } } //  для отладки: зраненеие предыдущих контейнеров
        act = { dspl: false, checkB: false, isFixed: false, doKill: false, isKilled: false, underClick: false, pushedBy: null, }
        // fix = { putV: '', iO5: null, iO5up: null }
        hovered = Object.assign({ act: 'hovered', asks: [], }, Tbelong) // массивы д.б.персонально
        located = Object.assign({ act: 'located', asks: [], }, Tbelong)
        posW = { top: 0, left: 0, height: 0, width: 0, right: 0, bottom: 0, } // x: 0, y: 0 }
        posC = Object.assign({}, this.posW)
        posS = Object.assign({}, this.posW)

        clon = null
        orig = {}
        bords = {}
        padds = {}
        allbords = []

        // Show = () => Show(this)
        // Hide = () => Hide(this)
        DoFixV = iO5 => DoFixV(this, iO5)
        UnFixV = () => UnFixV(this)
        // SetClick = clk => SetClick(this, clk)
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
