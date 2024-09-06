/* -global window, document, console */
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
        fmtErr = "background: lightgoldenrodyellow; color: black;",
        DecodeType = (aO5, quals) => {
            const
                cls = aO5.cls
            let err = ''

            for (const qual of quals) {
                const tt = qual.replaceAll(/-/g, '=').split('='),
                    t0 = tt[0],
                    c = t0.substr(0, 1).toUpperCase()

                if (c !== '' && !isNaN(t0)) aO5.act.level = Number(t0)
                else if (c === 'N') cls.cnone = true
                else if (c === 'C') cls.pitch = 'C' // сжимает предыдущий
                else if (c === 'P') cls.pitch = 'P' // сталкивает предыдущий
                else if (c === 'S') cls.pitch = 'S' // сдвигает предыдущий
                else if (c === 'O') cls.pitch = 'O' // наезжает на предыдущий
                else if (c === 'A') cls.alive = true
                else if (c === 'D' || c === 'U') cls.dirV = c
                else if (c === 'B' || c === 'T') cls.putV = c
                else err += (err ? ', ' : '') + t0
            }

            if (err)
                C.ConsoleError(`Для тега ${aO5.name} не определены квалификаторы: `, err)
        },
        ReadAttrs = (aO5, blng, def) => { // определение вложенностей shp's друг в друга
            const
                shp = aO5.shp,
                atr = 'olga5_' + blng.akey,
                str = shp.getAttribute(atr)

            blng.attr = str     // сохранить для alltst.js
            if (str) {
                const ss = str ? str.split(/\s*[,;]\s*/g) : [''],
                    typs = 'CINSB'

                for (const s of ss) // ss оставил для контроля устаревших заданий контейнеров
                    if (s.length > 0) {
                        const
                            cc = s.split(':'),
                            u = cc[0].trim(),
                            t = u.length > 0 ? u[0].toUpperCase() : '?'

                        if (typs.includes(t)) {
                            const cod = cc.length > 1 ? cc[1].trim() : '',
                                num = cc.length > 2 ? C.MyRound(cc[2]) : 0

                            blng.bords.push({ tag: null, itag: -1, typ: t, cod: cod, num: num, err: '', })
                        }
                        else
                            errs.push({ name: aO5.name, str: str, err: "тип ссылки не начинается одним из '" + typs + "'" })
                    }
            }
            if (blng.bords.length === 0) {
                blng.bords.push({ tag: null, itag: -1, typ: def, cod: '', num: 0, err: '', })
                if (str)
                    errs.push({ name: aO5.name, str: str, err: `дал умолчание '${def}' для '${blng.akey}'` })
            }
        },
        DblClick = e => {
            const aO5 = e.target.aO5shp
            if (aO5.act.xFixed)
                UnFixV(aO5)
        },
        errs = []

    class AO5 {
        static Tbelong = { to: null, le: null, ri: null, bo: null, attr: '', bordL: null, }
        static Margs = { t: 0, l: 0, r: 0, b: 0 }
        static Outln = { w: 0, s: 0, c: 0, o: 0 }

        constructor(shp) {
            const aO5 = this
            aO5.name = window.olga5.C.MakeObjName(shp)
            aO5.id = shp.id
            aO5.shp = shp
            aO5.shdw = shp
            aO5.prev = shp.parentElement
            aO5.node = shp.parentNode
            shp.aO5shp = aO5

            for (const nam of ['cls', 'old', 'act', 'visi', 'margs', 'outln', 'posW', 'posC', 'posS', 'ofram', 'owner'])
                Object.seal(this[nam])
            Object.seal(this)

            shp.addEventListener('dblclick', DblClick)
        }
        name = '' // повтор - чтобы было 1-м в отладчике

        cls = { dirV: 'U', putV: 'T', alive: false, none: false, pitch: 'S', zIndex: 0, top: 0, }

        act = { xFixed: null, isCloned: false, readyFix: true, level: 0, cIndex: 1 } //  bordFix: false,

        margs = { t: '', l: '', r: '', b: '', }
        outln = { w: '', s: '', c: '', o: '', }

        ofram = Object.assign({ akey: 'oframs', bords: [], pO5L: null }, AO5.Tbelong)
        owner = Object.assign({ akey: 'owners', bords: [], }, AO5.Tbelong)

        posC = Object.assign({}, { top: 0, left: 0, height: 0, width: 0, })
        posW = Object.assign({}, { height: 0, width: 0, })
        posS = { top: 0, left: 0, }

        clon = null
        cart = null
        orig = {}
        padds = {}

        static SetMargOutls = (style, margs, outln) => {
            // if (margs)
            //     Object.assign(style, { marginTop: margs.t, marginLeft: margs.l, marginRight: margs.r, marginBottom: margs.b })
            // if (outln)
            //     Object.assign(style, {
            //         outlineWidth: outln.w, outlineStyle: outln.s, outlineColor: outln.c, outlineOffset: outln.o
            //     })
            Object.assign(style,
                { marginTop: margs.t, marginLeft: margs.l, marginRight: margs.r, marginBottom: margs.b },
                { outlineWidth: outln.w, outlineStyle: outln.s, outlineColor: outln.c, outlineOffset: outln.o }
            )
        }
        DoFixV = xO5 => {
            const aO5 = this,
                shp = aO5.shp

            if (!aO5.clon)
                aO5.Clone()

            aO5.cart.style.display = ''

            aO5.node.removeChild(shp)
            aO5.cart.appendChild(shp)
            AO5.SetMargOutls(shp.style, AO5.Margs, AO5.Outln)
            Object.assign(shp.style, { position: 'absolute', top: 0, left: 0 })

            aO5.clon.style.display = aO5.orig.display

            aO5.act.xFixed = xO5
            aO5.shdw = aO5.clon
            aO5.ShowFix()

            if (o5debug > 0)
                console.log(`DoFixV - ${aO5.name}: ${xO5 === true ? 'на какой-то границе' : ('под объектом ' + xO5.name)}`)

            if (aO5.act.xFixed === true)  // сообщаем 1 раз - только для основного
                window.dispatchEvent(new CustomEvent('olga5_fix-act', { detail: { name: aO5.name, act: 'DoFix', xO5: xO5, } }))

        }
        UnFixV = () => {
            const aO5 = this,
                shp = aO5.shp,
                bordname = aO5.act.xFixed === true ? "на границе bord'а" : ('под ' + aO5.act.xFixed.name)

            Object.assign(shp.style, aO5.orig)
            AO5.SetMargOutls(shp.style, aO5.margs, aO5.outln)
            // AO5.SetMargOutls(aO5.cart.style, AO5.Outln)

            aO5.cart.style.display = 'none'
            aO5.clon.style.display = 'none'

            aO5.cart.removeChild(shp)
            aO5.node.insertBefore(shp, aO5.cart)

            aO5.act.xFixed = null
            aO5.shdw = shp
            aO5.ShowFix()

            if (o5debug > 0)
                console.log(`UnFixV - ${aO5.name} на '${bordname}'`)

            for (const iO5 of wshp.aO5s)
                if (iO5.act.xFixed === aO5)
                    iO5.UnFixV(true)

            if (aO5.act.xFixed === true)  // сообщаем 1 раз - только для основного
                window.dispatchEvent(new CustomEvent('olga5_fix-act', { detail: { name: aO5.name, act: 'UnFix', xO5: aO5.act.xFixed } }))
        }
        ShowFix = () => {
            const aO5 = this,
                posC = aO5.posC,
                posS = aO5.posS

            if (posC.width <= 0 || posC.height <= 0)
                aO5.cart.style.display = 'none'
            else
                Object.assign(aO5.cart.style, {
                    top: posC.top + 'px',
                    left: posC.left + 'px',
                    width: posC.width + 'px',
                    height: posC.height + 'px',
                })
            Object.assign(aO5.shp.style, {
                top: posS.top + 'px',
                left: posS.left + 'px',
            })
        }
        StrtObs = fix => {
            if (o5debug > 1)
                console.log("%c%s", fmtOK, '--:  StrtObs', this.name, fix, ' (' + (fix ? 'зафиксировано' : 'отпущено') + ')')

            const aO5 = this,
                o = aO5.ofram.pO5L.observP

            if (fix) {
                if (aO5.act.xFixed) {
                    if (aO5.clon)
                        o.observe(aO5.clon)
                    o.unobserve(aO5.shp)
                }
                else {
                    if (aO5.clon)
                        o.unobserve(aO5.clon)
                    o.observe(aO5.shp)
                }
            } else {
                if (aO5.clon)
                    o.unobserve(aO5.clon)
                o.observe(aO5.shp)
            }
        }
        Clone = () => {
            if (C.consts.o5debug > 1)
                console.log(`----------------- клонирую '${this.name}' -----------`)

            const aO5 = this,
                style = aO5.shp.style

            Object.assign(aO5.orig, {
                display: style.display, position: style.position, zIndex: style.zIndex,
                top: style.top, left: style.left, height: style.height, width: style.width,
            })

            const clon = aO5.clon = aO5.shp.cloneNode(true)
            clon.classList.add('olga5-clon')
            if (clon.id) clon.id += '_clon'
            clon.aO5shp = aO5
            Object.assign(aO5.clon.style, {
                display: 'none',
                opacity: 0,
            })
            aO5.shp.parentNode.insertBefore(clon, aO5.shp)

            const cart = aO5.cart = document.createElement('div')
            cart.classList.add('olga5-cart')                        // нужно ля тестов - CC()
            if (cart.id) cart.id += '_cart'
            cart.aO5shp = aO5
            Object.assign(aO5.cart.style, {
                display: 'none',
                cursor: 'pointer',
                position: 'fixed',
                overflow: 'hidden',
                background: 'none',
                zIndex: aO5.act.cIndex,
            })
            aO5.shp.parentNode.insertBefore(cart, aO5.shp)

            const nst = window.getComputedStyle(aO5.shp),
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

            AO5.SetMargOutls(aO5.cart.style, AO5.Margs, aO5.outln)
        }
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, shp => {
        errs.splice(0, errs.length)

        const aO5 = new AO5(shp)

        DecodeType(aO5, shp.aO5shp2.quals)
        aO5.cls.top = shp.aO5shp2.top
        Object.freeze(aO5.cls)

        ReadAttrs(aO5, aO5.ofram, 'S')     // S - screen
        ReadAttrs(aO5, aO5.owner, 'B')     // B - блок с выделенной границей

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

})();
