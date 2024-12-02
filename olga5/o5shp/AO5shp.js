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
        // fmtErr = "background: lightgoldenrodyellow; color: black;",
        errs = [],
        ReadAttrs = (aO5, blng, def) => { // определение вложенностей shp's друг в друга
            const
                shp = aO5.shp,
                bords = blng.bords,
                atr = 'o5' + blng.akey,
                str = shp.getAttribute(atr),
                bord = {
                    typ: def, cod: '', num: 0,
                    tag: null, out: false, itag: -1, err: '',
                }

            Object.seal(bord)
            blng.attr = str     // сохранить для alltst.js

            if (str) {
                const ss = str ? str.split(/\s*[,;]\s*/g) : [''],
                    typs = 'CINSB'
                // продолжение см. PO5shp.FindBords()

                for (const s of ss) // ss оставил для контроля устаревших заданий контейнеров
                    if (s.length > 0) {
                        const
                            cc = s.split(':'),
                            u = cc[0].trim(),
                            t = u.length > 0 ? u[0].toUpperCase() : '?'

                        if (typs.includes(t)) {
                            blng.bords.push(Object.assign({}, bord, {
                                s: s,
                                typ: t,
                                cod: cc.length > 1 ? cc[1].trim() : '',
                                num: cc.length > 2 ? C.MyRound(cc[2]) : 0,
                            }))
                        }
                        else
                            errs.push({ name: aO5.name, str: str, err: `тип ссылки '${t}' не начинается одним из '${typs}'` })
                    }

                if (bords.length === 0)
                    errs.push({ name: aO5.name, str: str, err: `дал умолчание '${def}' для '${blng.akey}'` })
            }
            if (bords.length === 0)
                blng.bords.push(Object.assign({}, bord))
        },
        DblClick = e => {
            e.target.aO5shp.UnFixV(`по событию '${e.type}'`)
        }

    class AO5 {
        static Tbelong = { to: null, le: null, ri: null, bo: null, attr: '', }
        static Margs = { t: 0, l: 0, r: 0, b: 0 }
        static Outln = { w: 0, s: 0, c: 0, o: 0 }

        constructor(shp) {
            if (shp.aO5shp) {
                C.ConsoleError(`Повтор создания 'aO5' для тега  id='${shp.id}'`)
                return
            }

            const
                aO5 = this

            for (const nam of ['old', 'act', 'ads', 'visi', 'margs', 'outln', 'posW', 'posC', 'posS', 'ofram', 'owner'])
                Object.seal(aO5[nam])

            aO5.name = window.olga5.C.MakeObjName(shp)
            aO5.id = shp.id
            aO5.shp = shp
            aO5.act.shdw = shp
            aO5.parent = shp.parentElement

            shp.aO5shp = aO5

            const
                cls = aO5.cls = { level: 0, pitch: 'S', alive: false, dirV: 'U', putV: 'T', },
                errs = []

            for (const qual of shp.aO5quals)
                if (!isNaN(qual))
                    cls.level = Number(qual)
                else {
                    const c = qual.substr(0, 1).toUpperCase()
                    switch (c) {
                        case 'A': cls.alive = true; break
                        case 'C': cls.pitch = c; break  // сжимает предыдущий
                        case 'P': cls.pitch = c; break  // сталкивает предыдущий
                        case 'S': cls.pitch = c; break  // сдвигает предыдущий
                        case 'O': cls.pitch = c; break  // наезжает на предыдущий
                        case 'D':
                        case 'U': cls.dirV = c; break
                        case 'B':
                        case 'T': cls.putV = c; break
                        default: errs.push(qual)
                    }
                }

            if (errs.length > 0)
                C.ConsoleError(`Для тега ${aO5.name} c квалификаторами "${shp.aO5quals.join(':')}" не определены: `, errs.join(', '))

            delete shp.aO5quals

            wshp.PO5shp(aO5)
            // Object.freeze(aO5.ads) -> будет в Clone
            Object.freeze(aO5.cls)
            Object.freeze(aO5)

            wshp.aO5s.push(aO5)
        }

        act = {
            shdw: null,
            isFix: false,
            pO5fix: null,   // тег на границе которого подвис этот aO5
            // aO5fix: null,   // тег на котором прификсирован этот aO5
            // iO5hid: null,   // ссылка на aO5 объекта, "который сдвинул этот aO5 до "нулевой высоты"
            uScroll: false, // тег или его клон видны на экране
        }

        margs = { t: '', l: '', r: '', b: '', }
        outln = { w: '', s: '', c: '', o: '', }

        parents = []
        ofram = Object.assign({ akey: 'ofram', bords: [], }, AO5.Tbelong)
        owner = Object.assign({ akey: 'owner', bords: [], }, AO5.Tbelong)

        posC = Object.assign({}, { top: 0, left: 0, height: 0, width: 0, })
        posW = Object.assign({}, { top: 0, left: 0, height: 0, width: 0, })
        posS = { top: 0, left: 0, }

        ads = { clon: null, cart: null }
        orig = {}
        padds = {}

        static SetMargOutls = (style, margs, outln) => {
            Object.assign(style,
                { marginTop: margs.t, marginLeft: margs.l, marginRight: margs.r, marginBottom: margs.b },
                { outlineWidth: outln.w, outlineStyle: outln.s, outlineColor: outln.c, outlineOffset: outln.o }
            )
        }
        DoFixV = () => {
            const aO5 = this

            if (!aO5.ads.clon)
                aO5.Clone()

            const
                clon = aO5.ads.clon,
                cart = aO5.ads.cart,
                shp = aO5.shp

            Object.assign(aO5.act, { shdw: clon, isFix: true,  })

            cart.style.display = ''
            clon.style.display = aO5.orig.display

            aO5.parent.removeChild(shp)
            cart.appendChild(shp)

            AO5.SetMargOutls(shp.style, AO5.Margs, AO5.Outln)
            Object.assign(shp.style, { position: 'absolute', top: 0, left: 0 })

            wshp.observ.unobserve(aO5.shp)
            wshp.observ.observe(aO5.ads.clon)

            shp.addEventListener('dblclick', DblClick)

            // if (onBoard)
            //     Object.assign(act, { pO5fix: xO5, }) // oldIR: 1 })
            // else
            //     Object.assign(act, { aO5fix: xO5, }) // oldIR: 1 })

            // if (act.pO5fix && act.aO5fix)
            //     C.ConsoleError(`Одновременное подвисание на границе '${act.pO5fix.name}' и под '${act.aO5fix.name}' `)

            // if (o5debug > 0)
            //     console.log(`DoFixV - ${aO5.name}: ` +
            //         `${(onBoard ? 'на границе ' : 'под объектом ') + xO5.name}`)
        }
        UnFixV = () => {
            const aO5 = this,
                clon = aO5.ads.clon,
                cart = aO5.ads.cart,
                shp = aO5.shp

            // if (o5debug > 0) {
            //     const oname = (typeof xO5 === 'string')?xO5:
            //         `${act.pO5fix ? 'на границе ' : 'под объектом ' + xO5.name}`
            //     console.log(`UnFixV - ${aO5.name} ${oname} `)
            // }
            // if (xO5 !== (act.pO5fix || act.aO5fix))
            //     C.ConsoleError(`Расфиксация на ином объекте ??`)

            Object.assign(shp.style, aO5.orig)
            AO5.SetMargOutls(shp.style, aO5.margs, aO5.outln)

            clon.style.display = 'none'
            cart.style.display = 'none'

            cart.removeChild(shp)
            aO5.parent.insertBefore(shp, cart)

            Object.assign(aO5.act, { shdw: shp, isFix: false,})

            shp.removeEventListener('dblclick', DblClick)

            wshp.observ.unobserve(clon)
            wshp.observ.observe(aO5.shp)

            // Object.assign(act, {
            //     // oldIR: 1,
            //     pO5fix: null,
            //     aO5fix: null,
            //     uScroll: false,
            // })

            if (!wshp.aO5s.find(iO5 => iO5 !== aO5 && iO5.act.uScroll))
                wshp.DoScroll(false, `Observe: ${aO5.name}`)
        }
        ShowFix = () => {
            const aO5 = this,
                posC = aO5.posC,
                posS = aO5.posS,
                pw = (posC.width <= 0) ? 0 : posC.width,
                ph = (posC.height <= 0) ? 0 : posC.height,
                display = (pw === 0 || ph === 0 || aO5.act.iO5hid) ? 'none' : ''  //|| !aO5.act.pO5fix 

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

            clon.classList.add('olga5-clon')
            if (id) clon.id = id + '_clon'
            clon.aO5shp = aO5
            Object.assign(clon.style, {
                display: 'none',
                opacity: 0,
            })
            shp.parentNode.insertBefore(clon, shp)

            cart.classList.add('olga5-cart')                        // нужно ля тестов - CC()
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
        Resize = () => {
        }
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, shp => {
        errs.splice(0, errs.length)

        const aO5 = new AO5(shp)

        ReadAttrs(aO5, aO5.ofram, wshp.W.consts.o5ofram)     // S - screen
        ReadAttrs(aO5, aO5.owner, wshp.W.consts.o5owner)     // B - блок с выделенной границей

        if (errs.length > 0)
            C.ConsoleError("Ошибки в атрибутах  для тегов", errs.length, errs)

        if (shp.tagName.match(/\b(img|iframe|svg)\b/i) && !shp.complete) {
            if (C.consts.o5debug > 0) C.ConsoleInfo(`ожидается завершение загрузки '${aO5.name}'`)
            shp.addEventListener('load', () => {
                wshp.DoResize(`из '${modulname}'`)
            })
        }
        return aO5
    })

    wshp.aO5s = [] // это инициированные подвисабельные

})();
