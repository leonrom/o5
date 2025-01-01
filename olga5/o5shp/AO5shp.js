/* global window, document, console, CustomEvent */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/AO5shp ---
    "use strict"
    let wshp = {}

    const
        olga5_modul = "o5shp",
        modulname = 'AO5shp',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmtOK = "background: cornsilk; color: black;",
        DblClick = e => {
            e.target.aO5shp.UnFixV(`по событию '${e.type}'`)
        }

    class AO5 {
        // static Tbelong = { to: null, le: null, ri: null, bo: null, attr: '', }
        static Margs = { t: 0, l: 0, r: 0, b: 0 }
        static Outln = { w: 0, s: 0, c: 0, o: 0 }

        constructor(shp) {
            if (shp.aO5shp) {
                C.ConsoleError(`Повтор создания 'aO5' для тега  id='${shp.id}'`)
                return
            }

            const
                aO5 = this

            for (const nam of ['old', 'act', 'ads', 'visi', 'margs', 'outln', 'posC', 'posS',])
                Object.seal(aO5[nam])

            aO5.name = window.olga5.C.MakeObjName(shp)
            aO5.parent = shp.parentElement
            aO5.id = shp.id
            aO5.shp = shp

            aO5.act.shdw = shp

            shp.aO5shp = aO5

                wshp.ReadAttrs(aO5, shp.aO5quals||[])

                if (shp.aO5quals) 
                delete shp.aO5quals
            
            // else
            //     C.ConsoleError(`в теге id='${shp.id}' отсутствуют квалификаторы класса для 'aO5quals'`)

            // Object.seal(aO5.#frame.err)
            // Object.freeze(aO5.#cls)
            Object.seal(aO5.cls)
        }

        act = {
            p: {},   // контейнер для getBoundingClientRect()
            time: 0,
            shdw: null,
            tfixs: { T: {}, L: {}, R: {}, B: {}, },   // объекты {typ, pO5} на границах которых подвис этот aO5
            uScroll: false, // тег или его клон видны на экране            
            // fromTest: {},   // атрибут из моих тестов
        }

        margs = { t: '', l: '', r: '', b: '', }
        outln = { w: '', s: '', c: '', o: '', }

        frames = []

        posC = Object.assign({}, { height: 0, width: 0, top: 0, left: 0, right: 0, bottom: 0, })
        // posW = Object.assign({}, { height: 0, width: 0, })
        posS = { top: 0, left: 0, }

        cls = {}
        ads = { clon: null, cart: null }
        orig = {}
        padds = {}

        static SetMargOutls = (style, margs, outln) => {
            Object.assign(style,
                { marginTop: margs.t, marginLeft: margs.l, marginRight: margs.r, marginBottom: margs.b },
                { outlineWidth: outln.w, outlineStyle: outln.s, outlineColor: outln.c, outlineOffset: outln.o }
            )
        }
        IsFix = () => {
            return this.act.shdw !== this.shp
        }
        DoFixV = txt => {
            const aO5 = this

            if (o5debug > 0)
                console.log("%c%s", fmtOK, `DoFixV фиксация    '${aO5.name}'`, txt)
            // aO5.act.pO5s ? `на bord'ах: '${pO5s.map(pO5=>pO5.name).join(', ')}` : ` `)

            if (!aO5.ads.clon)
                aO5.Clone()

            const
                clon = aO5.ads.clon,
                cart = aO5.ads.cart,
                shp = aO5.shp

            // Object.assign(aO5.act, { shdw: clon, isFix: true })
            aO5.act.shdw = clon

            cart.style.display = ''
            clon.style.display = aO5.orig.display

            aO5.parent.removeChild(shp)
            cart.appendChild(shp)

            AO5.SetMargOutls(shp.style, AO5.Margs, AO5.Outln)
            Object.assign(shp.style, { position: 'absolute', top: 0, left: 0 })

            wshp.observ.unobserve(aO5.shp)
            wshp.observ.observe(aO5.ads.clon)

            shp.addEventListener('dblclick', DblClick)
        }
        UnFixV = () => {
            const aO5 = this,
                clon = aO5.ads.clon,
                cart = aO5.ads.cart,
                shp = aO5.shp
                        
            if (o5debug > 0)
                console.log("%c%s", fmtOK, `UnFixV расфиксация '${aO5.name}'`)

            Object.assign(shp.style, aO5.orig)
            AO5.SetMargOutls(shp.style, aO5.margs, aO5.outln)

            clon.style.display = 'none'
            cart.style.display = 'none'

            cart.removeChild(shp)
            aO5.parent.insertBefore(shp, cart)

            // Object.assign(aO5.act, { shdw: shp, isFix: false })
            aO5.act.shdw = shp

            shp.removeEventListener('dblclick', DblClick)

            wshp.observ.unobserve(clon)
            wshp.observ.observe(aO5.shp)

            if (!wshp.aO5s.find(iO5 => iO5.act.uScroll))    //  ?? iO5 !== aO5 && 
                wshp.DoScroll(false, `AO5.UnFixV: ${aO5.name}`)
        }
        ShowFix = () => {
            const aO5 = this,
                posC = aO5.posC,
                posS = aO5.posS,
                pw = (posC.width <= 0) ? 0 : posC.width,
                ph = (posC.height <= 0) ? 0 : posC.height,
                display = (pw === 0 || ph === 0 || aO5.act.iO5hid) ? 'none' : ''

            Object.assign(aO5.ads.cart.style, {
                display: display,
                top: posC.top + 'px',
                left: posC.left + 'px',
                width: pw + 'px',
                height: ph + 'px',
            })

            Object.assign(aO5.shp.style, {
                top: posS.top + 'px',
                left: posS.left + 'px',
            })
        }
        Clone = () => {
            if (C.consts.o5debug > 1)
                console.log(`----------------- клонирую '${this.name}' -----------`)

            const aO5 = this,
                shp = aO5.shp,
                id = shp.id,
                style = shp.style

            Object.assign(aO5.orig, {
                display: style.display, position: style.position,
                top: style.top, left: style.left, height: style.height, width: style.width,
            })

            const clon = aO5.ads.clon = shp.cloneNode(true),
                cart = aO5.ads.cart = document.createElement('div')

            Object.freeze(aO5.ads)

            clon.classList.add('olga5_clon')
            if (id) clon.id = id + '_clon'
            clon.aO5shp = aO5
            Object.assign(clon.style, {
                display: 'none',
                opacity: 0,
            })
            shp.parentNode.insertBefore(clon, shp)

            cart.classList.add('olga5_cart')                        // нужно ля тестов - CC()
            if (id) cart.id = id + '_cart'
            cart.aO5shp = aO5
            Object.assign(cart.style, {
                display: 'none',
                cursor: 'pointer',
                position: 'fixed',
                overflow: 'hidden',
                background: 'none',
                zIndex: shp.style.zIndex ? Number(shp.style.zIndex) : 1,
            })
            shp.parentNode.insertBefore(cart, shp)

            const nst = window.getComputedStyle(shp),
                GPV = (nam, nst) => { return C.MyRound(nst.getPropertyValue(nam)) }

            Object.assign(aO5.padds, {
                w: Math.ceil(GPV('padding-left', nst) + GPV('padding-right', nst)) +
                    Math.ceil(GPV('border-left-width', nst) + GPV('border-right-width', nst)),
                h: Math.ceil(GPV('padding-top', nst) + GPV('padding-bottom', nst)) +
                    Math.ceil(GPV('border-top-width', nst) + GPV('border-bottom-width', nst))
            })
            Object.assign(aO5.margs, {
                t: nst.getPropertyValue('margin-top'),
                l: nst.getPropertyValue('margin-left'),
                r: nst.getPropertyValue('margin-right'),
                b: nst.getPropertyValue('margin-bottom')
            })
            Object.assign(aO5.outln, {
                w: nst.getPropertyValue('outline-width'),
                s: nst.getPropertyValue('outline-style'),
                c: nst.getPropertyValue('outline-color'),
                o: nst.getPropertyValue('outline-offset')
            })

            AO5.SetMargOutls(cart.style, AO5.Margs, aO5.outln)
        }
        Resize = quals => {
            const
                aO5 = this

                wshp.ReadAttrs(aO5, quals)
                wshp.FindBords(aO5)
                wshp.Scroll({ timeStamp: Date.now() + Math.random(), o5scroll: true }) 


            //     ft = aO5.act.fromTest

            // for (const key in ft) {
            //     const blng = aO5[key]
            //     if (blng) {
            //         aO5.ReadAttrs(aO5, quals)   // , ft[key])
            //         wshp.FindBords(aO5)
            //     }
            //     else
            //         alert(`нету aO5[${key}] ?`)
            //     delete ft[key]
            // }
        }
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, shp => {
        const aO5 = new AO5(shp)

        wshp.PO5shp(aO5)

        // Object.freeze(aO5.cls)  // Object.freeze(aO5.ads) -> будет в Clone
        Object.freeze(aO5)

        wshp.aO5s.push(aO5)

        if (shp.tagName.match(/\b(img|iframe|svg)\b/i) && !shp.complete) {
            if (C.consts.o5debug > 0) C.ConsoleInfo(`ожидается завершение загрузки '${aO5.name}'`)
            shp.addEventListener('load', () => {
                wshp.DoResize(`из '${modulname}'`)
            })
        }

        return aO5
    })

    wshp.aO5s = [] // это инициированные подвисабельные    
    // wshp.TT=s=>{        
    //     const 
    //     name='shp1-1',
    //     shp1=olga5.o5shp.shps.find(shp=>shp.id==name ),
    //     shp2=document.getElementById(name)
    //     if (shp1 && shp2){
    //         // shp2.insertAdjacentHTML('afterbegin', '<br> 2: ' + s + ' ' + shp2.className);

    //         shp2.insertAdjacentHTML('afterbegin', '<br> ---------------------------------' +s)
    //         shp1.insertAdjacentHTML('afterbegin', '<br> 1: ' + s + ' ' + shp1.className)
    //         shp2.insertAdjacentHTML('afterbegin', '<br> 2: ' + s + ' ' + shp2.className)
    //     }
    // }
})();
