/* global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/AO5shp ---
    "use strict"
    let debugids = ['shp_text', 'shp_1÷4']

    const
        olga5_modul = "o5shp",
        modulname = 'AO5shp',
        C = window.olga5.C,
        wshp = window.olga5[olga5_modul],
        MyRound = (s) => { return Math.round(parseFloat(s)) },
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
        Show = (aO5) => {
            aO5.act.dspl = true
            aO5.cart.style.display = ''
        },
        Hide = (aO5) => {
            aO5.act.dspl = false
            aO5.cart.style.display = 'none'
            for (const iO5 of aO5.aO5s) Hide(iO5)
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
            Object.assign(aO5.fix, { putV: putV, iO5: iO5 })
        },
        DoShpClick = function (e) {
            const
                MarkClick = (aO5) => {
                    if (aO5.fix.putV == '') {
                        const m = aO5.parents.length,
                            lastParent = m > 0 ? aO5.parents[m - 1] : null
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
        Clone = function (aO5) {
            if (C.consts.o5debug > 1)
                console.log(`----------------- клонирую '${aO5.name}' -----------`)

            const shp = aO5.shp,
                cart = aO5.cart = document.createElement('div'),
                shdw = aO5.shdw = shp.cloneNode(true),
                posC = shp.getBoundingClientRect()

            // cart
            Object.assign(cart.style, {
                width: (posC.width) + 'px',
                height: (posC.height) + 'px',
                left: (posC.left) + 'px',
                top: (posC.top) + 'px',
            })
            cart.aO5shp = aO5 // чтобы найти при обработке клика
            cart.pO5 = null

            cart.classList.add(wshp.olga5cart)

            // коррекция shdw
            shdw.classList.add(C.olga5ignore)

            const add = '_shdw',
                parentNode = shp.parentNode,
                ids = shdw.querySelectorAll("[id]")

            ids.forEach(id => {
                if (id.hasAttribute('id'))
                    id.setAttribute('id', id.id + add)
            })
            if (shp.id) shdw.id = shp.id + add

            wshp.W.origs.consts.split(/;|,/).forEach(c => {
                shdw.removeAttribute(c.split(/=|:/)[0])
            })
            if (aO5.cls.dirV == 'D') shdw.style.height = '0.1px' // на экране НЕ должно занимать месо

            // коррекция shp
            const GPV = nam => { return MyRound(nst.getPropertyValue(nam)) },
                nst = window.getComputedStyle(shp) // д.б. до replaceChild()
            Object.assign(aO5.addSize, {
                w: GPV('padding-left') + GPV('padding-right') + GPV('border-left-width') + GPV('border-right-width'),
                h: GPV('padding-top') + GPV('padding-bottom') + GPV('border-top-width') + GPV('border-bottom-width')
            })
            //             const PN=n=>{   
            //                 const nst1 = window.getComputedStyle(shp)
            //                 const nst2 = window.getComputedStyle(shdw)
            //                 console.log('shp  : '+shp.id +"  zoom="+nst.zoom+", trans="+nst.transform+", zoom="+shp.style.zoom+", trans="+shp.style.transform+"   =====  " +n)
            //                 console.log('shdw : '+shdw.id+"  zoom="+nst2.zoom+", trans="+nst2.transform+", zoom="+shdw.style.zoom+", trans="+shdw.style.transform+"")
            //                 console.log('shp1 : '+shp.id +"  zoom="+nst1.zoom+", trans="+nst1.transform )
            //                 // console.log('shdw: '+shp.id+"  outlineWidth='"+nst2.outlineWidth+"' outline='"+nst2.outline+"' zoom="+nst2.zoom+", transform='"+nst2.transform+"'")
            //             }
            // PN(1)
            for (const prop of [   // перенос нужных "внешних" свойств на cart 
                'outline-color', 'outline-offset', 'outline-style', 'outline-width'
            ]) {
                const wi = nst.getPropertyValue(prop)
                if (wi && wi.length > 0) {
                    shp.style[prop] = ''
                    cart.style[prop] = wi
                }
            }
            for (const prop of [   // перенос нужных "внешних" свойств на shdw 
                'zoom', 'transform'
            ]) {
                const wi = nst.getPropertyValue(prop)
                if (wi && wi.length > 0) {
                    shp.style[prop] = ''
                    shdw.style[prop] = wi
                }
            }

            parentNode.replaceChild(shdw, shp)  // д.б. перед коррекцией shp но после shdw

            // коррекция значения атрибута style
            const sn = [
                'position: relative', 'left:0', 'top:0', 'width:100%', 'height:100%',
                'margin-top: 0', 'margin-right: 0', 'margin-bottom: 0', 'margin-left: 0', 'margin: 0'
            ]
            for (const s of sn) {
                const uu = s.split(/\s*:\s*/)
                shp.style[uu[0]] = uu[1]
            }

            cart.appendChild(shp)
            parentNode.insertBefore(cart, shdw)

            for (const o of [cart, aO5.posW, aO5.posC, aO5.posS]) Object.seal(o)
            Object.freeze(aO5)

            // PN(2)
            shp.addEventListener('dblclick', DoShpClick, { capture: true, passive: true })

            // wshp.AO5shp(aO5)
            for (const iO5 of aO5.aO5s)
                Clone(iO5)
        },
        Tbelong = { attr: '', to: null, le: null, ri: null, bo: null }

    class AO5 {
        constructor(shp, cls) {
            this.name = window.olga5.C.MakeObjName(shp)
            this.id = shp.id
            this.shp = shp
            this.prev = shp.parentElement
            Object.assign(this.cls, cls)

            for (const nam of ['cls', 'old', 'addSize', 'act', 'fix', 'hovered', 'located', 'posW', 'posC', 'posS'])
                Object.seal(this.nam)
            Object.seal(this)
        }
        name = '' // повтор - чтобы было 1-м в отладчике
        aO5s = [] // перечень включенных в этот aO5
        cls = { kill: false, dirV: '', putV: 'T', alive: false, nest: -2, level: 0, zIndex: 0, minIndex: 0, aO5o: [], pitch: 'S', }
        old = { hovered: { to: null, located: { to: null } }, located: { to: null } } //  для отладки: зраненеие предыдущих контейнеров
        addSize = { w: 0, h: 0 }
        act = { dspl: true, wasKilled: false, wasClick: false, underClick: false, pushedBy: null, }
        fix = { putV: '', iO5: null, iO5up: null }
        hovered = Object.assign({ act: 'hovered', asks: [], }, Tbelong) // массивы д.б.персонально
        located = Object.assign({ act: 'located', asks: [], }, Tbelong)
        posW = { top: 0, left: 0, height: 0, width: 0 }
        posC = Object.assign({}, this.posW)
        posS = { top: 0, left: 0, }
        sizS = { height: 0, width: 0, }

        cart = null
        shdw = null

        Show = () => Show(this)
        Hide = () => Hide(this)
        DoFixV = (iO5) => DoFixV(this, iO5)
        SetClick = (clk) => SetClick(this, clk)
    }

    // --------------------------------------------------------------------- //    

    Object.assign(wshp, {
        MakeAO5: (shp, cls, PO5) => {
            shp.aO5shp = new AO5(shp, cls)
            const aO5 = shp.aO5shp
            let pO5 = aO5.prev.pO5
            if (!pO5) {
                // console.log('--++ ' + C.MakeObjName(aO5.prev))
                try {
                    aO5.prev.pO5 = new PO5(aO5.prev, aO5)
                } catch (err) {
                    console.error('--?? ' + C.MakeObjName(aO5.prev))
                }
                pO5 = aO5.prev.pO5
            }
            else if (wshp.W.consts.o5debug > 0)
                pO5.PutBords(pO5, "FillBords: взял для '" + aO5.name + "' => ")

            pO5.aO5s.push(aO5)

            const prevs = pO5.prevs,
                parent = prevs.find(parent => parent.aO5shp),
                own = parent ? parent.aO5shp : null
            if (own)
                for (const prev of prevs) {
                    const hasown = prev.pO5.owns.own
                    prev.pO5.owns.own = own
                    if (prev.aO5shp || hasown) break
                }

            const aO5s = (own || wshp).aO5s
            aO5s.push(aO5)

            if (shp.tagName.match(/\b(img|iframe|svg)\b/i) && !shp.complete) {
                if (C.consts.o5debug > 0) C.ConsoleInfo(`ожидается завершение загрузки '${aO5.name}'`)
                shp.addEventListener('load', e => {
                    wshp.DoResize('из AO5shp')
                })
            }
        },
        AO5shp: () => {
            for (const aO5 of wshp.aO5s)
                Clone(aO5)
        }
    })

    C.MsgAddSub(olga5_modul, modulname)
})();
