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

            const style = aO5.shp.style
            Object.assign(aO5.orig, { display: style.display, position: style.position, zIndex: style.zIndex })

            const clon = aO5.clon = aO5.shp.cloneNode(true)
            clon.classList.add('olga5-clon')    // нужно ля тестов - CC()
            if (clon.id) clon.id += '_clon'
            aO5.shp.parentNode.insertBefore(clon, aO5.shp)

            const cart = aO5.cart = document.createElement('div')
            cart.classList.add('olga5-cart')    // нужно ля тестов - CC()
            if (clon.id) cart.id += '_clon'
            aO5.shp.parentNode.insertBefore(cart, aO5.shp)

            // не убирать - оставить как пример
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                        console.log('Стиль изменен:', mutation.target.style.cssText);
                    }
                }
            });
            observer.observe(cart, { attributes: true });

            const nst = window.getComputedStyle(aO5.shp),
                GPV = (nam, nst) => { return C.MyRound(nst.getPropertyValue(nam)) },
                MGPV = (nam, nst) => { return Math.ceil(GPV(nam, nst)) }

            Object.assign(aO5.bords, {
                w: Math.ceil(GPV('border-left-width', nst) + GPV('border-right-width', nst)),
                h: Math.ceil(GPV('border-top-width', nst) + GPV('border-bottom-width', nst))
            })
            Object.assign(aO5.padds, {
                w: Math.ceil(GPV('padding-left', nst) + GPV('padding-right', nst)),
                h: Math.ceil(GPV('padding-top', nst) + GPV('padding-bottom', nst))
            })
            Object.assign(aO5.margs, {
                t: MGPV('margin-top', nst),
                l: MGPV('margin-left', nst),
                r: MGPV('margin-right', nst),
                b: MGPV('margin-bottom', nst)
            })
            Object.assign(aO5.outln, {
                w: nst.getPropertyValue('outline-width'),
                s: nst.getPropertyValue('outline-style'),
                c: nst.getPropertyValue('outline-color'),
                o: nst.getPropertyValue('outline-offset')
            })
        },
        DoFixV = (aO5, iO5) => {
            const posC = aO5.posC,
                putV = aO5.cls.putV,
                hovered = aO5.hovered

            if (putV == 'T') {
                if (iO5) posC.top = iO5.posC.top + iO5.posC.height
                else posC.top = hovered.to.pos.top
            } else {
                const bottom = iO5 ? iO5.posC.top : hovered.to.pos.bottom
                if (iO5) posC.top = iO5.posC.top + iO5.posC.height
                else posC.top = bottom - posC.height
            }

            if (!aO5.act.isFixed) {
                if (!aO5.clon)
                    Clone(aO5)

                Object.assign(aO5.shp.style, {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    marginTop: 0,
                    marginLeft: 0,
                    marginRight: 0,
                    marginBottom: 0,
                    outline: 'none'
                })
                Object.assign(aO5.cart.style, {
                    display: '',
                    zIndex: aO5.cls.zIndex,
                    // width: (posC.width - aO5.bords.w - aO5.padds.w) + 'px',
                    // height: (posC.height - aO5.bords.h - aO5.padds.h) + 'px',
                    width: posC.width + 'px',
                    height: posC.height + 'px',
                    marginTop: aO5.margs.t + 'px',
                    marginLeft: aO5.margs.l + 'px',
                    marginRight: aO5.margs.r + 'px',
                    marginBottom: aO5.margs.b + 'px',
                    outlineWidth: aO5.outln.w,
                    outlineStyle: aO5.outln.s,
                    outlineColor: aO5.outln.c,
                    outlineOffset: aO5.outln.o
                })
                Object.assign(aO5.clon.style, {
                    display: aO5.shp.style.display,
                    opacity: 0,
                })

                aO5.node.removeChild(aO5.shp)
                aO5.cart.appendChild(aO5.shp)

                aO5.shdw = aO5.clon
                aO5.act.isFixed = true

                C.E.DispatchEvent('olga5_fix-act', { detail: { aO5: aO5, fix: true } })
            }
            Object.assign(aO5.cart.style, {
                top: (posC.top) + 'px',
                left: (posC.left) + 'px',
            })
        },
        UnFixV = aO5 => {
            const posW = aO5.posW

            Object.assign(aO5.shp.style, {
                zIndex: aO5.cls.zIndex,
                position: aO5.orig.position,
                top: (posW.top) + 'px',
                left: (posW.left) + 'px',
                // width: (posW.width - aO5.bords.w - aO5.padds.w) + 'px',
                // height: (posW.height - aO5.bords.h - aO5.padds.h) + 'px',
                marginTop: aO5.margs.t + 'px',
                marginLeft: aO5.margs.l + 'px',
                marginRight: aO5.margs.r + 'px',
                marginBottom: aO5.margs.b + 'px',
                outlineWidth: aO5.outln.w,
                outlineStyle: aO5.outln.s,
                outlineColor: aO5.outln.c,
                outlineOffset: aO5.outln.o
            })
            Object.assign(aO5.cart.style, {
                display: 'none',
            })
            Object.assign(aO5.clon.style, {
                display: 'none',
            })

            aO5.cart.style.display = 'none'
            aO5.cart.removeChild(aO5.shp)
            aO5.node.insertBefore(aO5.shp, aO5.cart)

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
            this.node = shp.parentNode
            Object.assign(this.cls, cls)

            for (const nam of ['cls', 'old', 'act', 'fix', 'hovered', 'located', 'posW', 'posC', 'posS'])
                Object.seal(this[nam])
            Object.seal(this.act.visi)
            Object.seal(this.margs)
            Object.seal(this.outln)
            Object.seal(this)

            shp.addEventListener('click', DoClick)
        }
        name = '' // повтор - чтобы было 1-м в отладчике
        aO5s = [] // перечень включенных в этот aO5
        cls = { kill: false, remo: false, dirV: '', putV: 'T', alive: false, nest: -2, level: 0, zIndex: 0, aO5o: [], } //  pitch: 'S', }
        old = { hovered: { to: null, located: { to: null } }, located: { to: null } } //  для отладки: зраненеие предыдущих контейнеров
        act = {
            dspl: false, isFixed: false, doKill: false, isKilled: false,
            underClick: false, pushedBy: null,
            visi: { part: false, full: false },
            checkup: false, checkStep: 0,
        }
        margs = { t: 0, l: 0, r: 0, b: 0, }
        outln = { w: '', s: '', c: '', o: '' }
        // fix = { putV: '', iO5: null, iO5up: null }
        hovered = Object.assign({ act: 'hovered', asks: [], }, Tbelong) // массивы д.б.персонально
        located = Object.assign({ act: 'located', asks: [], }, Tbelong)
        posW = { top: 0, left: 0, height: 0, width: 0, right: 0, bottom: 0, } // x: 0, y: 0 }
        posC = Object.assign({}, this.posW)
        posS = Object.assign({}, this.posW)

        clon = null
        cart = null
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
