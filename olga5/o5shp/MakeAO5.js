/* -global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/MakeAO5 ---
    "use strict"
    let wshp = {} 
        // debugids = ['shp_text', 'shp_1÷4']

    const
        olga5_modul = "o5shp",
        modulname = 'MakeAO5',
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
        Show = aO5 =>  {
            if (!aO5.act.dspl){
            aO5.act.dspl = true
            aO5.cart.style.display = ''
            aO5.shdw.style.opacity=0        
            for (const iO5 of aO5.aO5s) Show(iO5)}
        },
        Hide = aO5 => {
            if (aO5.act.dspl){
            aO5.act.dspl = false
            aO5.shdw.style.opacity=1
            aO5.cart.style.display = 'none'
            for (const iO5 of aO5.aO5s) Hide(iO5)}
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
        Clone = function (aO5) {
            if (C.consts.o5debug > 1)
                console.log(`----------------- клонирую '${aO5.name}' -----------`)

            const shp = aO5.shp,
                cart = aO5.cart = document.createElement('div'),
                shdw = aO5.shdw = shp.cloneNode(true),
                posC = shp.getBoundingClientRect()

            // cart
            Object.assign(cart.style, {
                width: Math.ceil(posC.width) + 'px',
                height: Math.ceil(posC.height) + 'px',
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
            if (shp.id) {
                shdw.id = shp.id + add
                cart.id = shp.id + '_cart'
            }
            wshp.W.origs.consts.split(/;|,/).forEach(c => {
                shdw.removeAttribute(c.split(/=|:/)[0])
            })
            if (aO5.cls.dirV == 'D') shdw.style.height = '0.1px' // на экране НЕ должно занимать месо

            // // коррекция shp
            // const 
            // MyRound = (s) => { return Math.round(parseFloat(s)) },
            //    GPV = nam => { return MyRound(nst.getPropertyValue(nam)) },
            //     nst = window.getComputedStyle(shp) // д.б. до replaceChild()
            // Object.assign(aO5.addSize, {
            //     w: Math.ceil(GPV('padding-left') + GPV('padding-right') + GPV('border-left-width') + GPV('border-right-width')),
            //     h: Math.ceil(GPV('padding-top') + GPV('padding-bottom') + GPV('border-top-width') + GPV('border-bottom-width'))
            // })

            const nst = window.getComputedStyle(shp) // д.б. до replaceChild()
            for (const prop of [   // перенос нужных "внешних" свойств на cart 
                'opacity', 'outline-color', 'outline-offset', 'outline-style', 'outline-width'
            ]) {
                const wi = nst.getPropertyValue(prop)
                if (wi && wi.length > 0) {
                    shp.style[prop] = ''
                    cart.style[prop] = wi
                    if (prop == 'opacity')
                        aO5.cls.cartopacity = wi
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

            Object.assign(shp.style, {
                position: 'relative',
                'margin-top': 0, 'margin-left': 0, 'margin-right': 0, 'margin-bottom': 0,
            })
            
            Object.assign(aO5.posS, { left: 0, top: 0, width: posC.width, height: posC.height, })
            // aO5.SetShpStyle()

            cart.appendChild(shp)
            parentNode.insertBefore(cart, shdw)

            for (const o of [cart, aO5.posW, aO5.posC, aO5.posS]) Object.seal(o)
            Object.freeze(aO5)

/* !1 */            shp.addEventListener('dblclick', DoShpClick, { capture: false, passive: true })

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

            // for (const nam of ['cls', 'old', 'addSize', 'act', 'fix', 'hovered', 'located', 'posW', 'posC', 'posS'])
            for (const nam of ['cls', 'old', 'act', 'fix', 'hovered', 'located', 'posW', 'posC', 'posS'])
                Object.seal(this[nam])
            Object.seal(this)
        }
        name = '' // повтор - чтобы было 1-м в отладчике
        aO5s = [] // перечень включенных в этот aO5
        cls = { kill: false, remo: false, dirV: '', putV: 'T', alive: false, nest: -2, level: 0, zIndex: 0, minIndex: 0, aO5o: [], } //  pitch: 'S', }
        old = { hovered: { to: null, located: { to: null } }, located: { to: null } } //  для отладки: зраненеие предыдущих контейнеров
        // addSize = { w: 0, h: 0 }
        act = { dspl: false, wasKilled: false, wasClick: false, underClick: false, pushedBy: null, }
        fix = { putV: '', iO5: null, iO5up: null }
        hovered = Object.assign({ act: 'hovered', asks: [], }, Tbelong) // массивы д.б.персонально
        located = Object.assign({ act: 'located', asks: [], }, Tbelong)
        posW = { top: 0, left: 0, height: 0, width: 0 }
        posC = Object.assign({}, this.posW)
        posS = { top: 0, left: 0, height: 0, width: 0, }

        cart = null
        shdw = null

        Show = () => Show(this)
        Hide = () => Hide(this)
        DoFixV = (iO5) => DoFixV(this, iO5)
        SetClick = (clk) => SetClick(this, clk)
        SetShpStyle = () => {
            const aO5 = this,
            posC=aO5.posC,
            posS=aO5.posS
            
            Object.assign(aO5.cart.style, {
                top: (posC.top) + 'px',
                left: (posC.left) + 'px',
                width: (posC.width) + 'px',
                height: (posC.height) + 'px',
                // width: (Math.ceil(posC.width)+1) + 'px',
                // height: (Math.ceil(posC.height)+1) + 'px',
                display: '',
            })
            Object.assign(aO5.shp.style, {
                top: (posS.top) + 'px',
                left: (posS.left) + 'px',
                width: (posS.width) + 'px',
                height: (posS.height) + 'px',
                // width: Math.floor(posS.width) + 'px',
                // height: Math.floor(posS.height) + 'px',
            })
// console.log(aO5.cart.style.width, aO5.shp.style.width, parseInt( aO5.cart.style.width)-parseInt(aO5.shp.style.width))
        }

    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, (shp, cls, PO5) => {
        shp.aO5shp = new AO5(shp, cls)
        const aO5 = shp.aO5shp
        let pO5 = aO5.prev.pO5
        if (!pO5) {
            // console.log('--++ ' + C.MakeObjName(aO5.prev))
            try {
                aO5.prev.pO5 = new PO5(aO5.prev, aO5)
            } catch (err) {
                console.error('--?? ' + C.MakeObjName(aO5.prev), err.message)
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
            shp.addEventListener('load', () => {
                wshp.DoResize(`из '${modulname}'`)
            })
        }
    })
    wshp.Clone = Clone

})();
