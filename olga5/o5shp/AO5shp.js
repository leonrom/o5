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
                atr = 'o5' + blng.akey,
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

                            blng.bords.push({ tag: null, out: false, itag: -1, typ: t, cod: cod, num: num, err: '', })
                        }
                        else
                            errs.push({ name: aO5.name, str: str, err: `тип ссылки '${t}' не начинается одним из '${typs}'` })
                    }
            }
            if (blng.bords.length === 0) {
                blng.bords.push({ tag: null, out: false, itag: -1, typ: def, cod: '', num: 0, err: '', })
                if (str)
                    errs.push({ name: aO5.name, str: str, err: `дал умолчание '${def}' для '${blng.akey}'` })
            }
        },
        DblClick = e => {
            const aO5 = e.target.aO5shp
            if (aO5.act.xFixed)
                aO5.UnFixV()
        }

    class AO5 {
        #isVisi
        #outOfBords
        IsVisi = () => this.#isVisi
        CheckIsVisi = () => {       // запускается только при изменении видимости контейнера
            this.#isVisi = this.#outOfBords.find(bord => bord.tag.pO5.observ.IsVisi())
        }

        static Tbelong = { to: null, le: null, ri: null, bo: null, attr: '', }
        static Margs = { t: 0, l: 0, r: 0, b: 0 }
        static Outln = { w: 0, s: 0, c: 0, o: 0 }

        constructor(shp) {
            this.#isVisi = false
            this.#outOfBords = [] // список bord'ов, из которых вылезло (и зафиксировалось) для подвисания

            const aO5 = this

            aO5.name = window.olga5.C.MakeObjName(shp)
            aO5.id = shp.id
            aO5.shp = shp
            aO5.shdw = shp
            aO5.prev = shp.parentElement
            aO5.node = shp.parentNode

            shp.aO5shp = aO5

            aO5.DecodeType(shp.aO5quals)
            delete shp.aO5quals
            
            for (const nam of ['old', 'act', 'visi', 'margs', 'outln', 'posW', 'posC', 'posS', 'ofram', 'owner'])
                Object.seal(this[nam])

            Object.freeze(aO5.cls)
            Object.freeze(aO5)
            
            shp.addEventListener('dblclick', DblClick)
        }
        name = '' // повтор - чтобы было 1-м в отладчике

        act = { xFixed: null, uScroll:false, canFix:false }

        margs = { t: '', l: '', r: '', b: '', }
        outln = { w: '', s: '', c: '', o: '', }

        ofram = Object.assign({ akey: 'oframs', bords: [], }, AO5.Tbelong)
        owner = Object.assign({ akey: 'owners', bords: [], }, AO5.Tbelong)

        posC = Object.assign({}, { top: 0, left: 0, height: 0, width: 0, })
        posW = Object.assign({}, { top: 0, left: 0, height: 0, width: 0, })
        posS = { top: 0, left: 0, }

        clon = null
        cart = null
        orig = {}
        padds = {}

        static SetMargOutls = (style, margs, outln) => {
            Object.assign(style,
                { marginTop: margs.t, marginLeft: margs.l, marginRight: margs.r, marginBottom: margs.b },
                { outlineWidth: outln.w, outlineStyle: outln.s, outlineColor: outln.c, outlineOffset: outln.o }
            )
        }
        static UnFix = aO5 => {
            const
                shp = aO5.shp,
                tag = aO5.act.xFixed.tag,
                bordname = tag ? `на границе ${tag.pO5.name}` : `под  ${aO5.act.xFixed.name}`

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
                console.log(`UnFix - ${aO5.name} на '${bordname}'`)

            for (const iO5 of wshp.aO5s)
                if (iO5.act.xFixed === aO5)
                    iO5.UnFix(true)

            aO5.ChgObserve(false)

            if (tag)  // сообщаем 1 раз - только для основного
                window.dispatchEvent(new CustomEvent('o5shp_chgFix', { detail: { name: aO5.name, act: 'UnFix', target: tag } }))
        }
        DoFixV = target => {
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

            aO5.act.xFixed = target
            aO5.shdw = aO5.clon
            aO5.ShowFix()

            if (target.tag) {
                const bord = target
                if (aO5.#outOfBords.indexOf(bord) < 0)
                    aO5.#outOfBords.push(bord)
            }

            if (o5debug > 0)
                console.log(`DoFixV - ${aO5.name}: ${target.tag ? 'на границе ' + target.tag.pO5.name : ('под объектом ' + target.name)}`)

            aO5.ChgObserve(true)

            if (aO5.act.xFixed.tag)  // признак, что на bord'е: сообщаем 1 раз - только для основного 
                window.dispatchEvent(new CustomEvent('o5shp_chgFix', { detail: { name: aO5.name, act: 'DoFix', target: target, } }))
        }
        UnFixV = bord => {
            const aO5 = this
            if (bord)
                aO5.#outOfBords.splice(aO5.#outOfBords.indexOf(bord), 1)

            AO5.UnFix(aO5)
            window.dispatchEvent(new CustomEvent('o5shp_chgFix', { detail: { name: aO5.name, act: 'UnFix', target: bord ? bord.tag : null } }))
        }
        ShowFix = () => {
            const aO5 = this,
                posC = aO5.posC,
                posS = aO5.posS,
                pw = (posC.width <= 0) ? 0 : posC.width,
                ph = (posC.height <= 0) ? 0 : posC.height,
                display = (pw === 0 || ph === 0 || !aO5.act.xFixed) ? 'none' : ''

            Object.assign(aO5.cart.style, {
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
        ChgObserve = fix => {
            if (o5debug > 1)
                console.log("%c%s", fmtOK, '--:  ChgObserve', this.name, fix, ' (' + (fix ? 'зафиксировано' : 'отпущено') + ')')

            for (const bord of this.ofram.bords) {
                const
                    o = bord.tag.pO5.observ,
                    aO5 = o.aO5s.find(aO5 => aO5 === this)

                if (fix) {
                    o.unobserve(aO5.shp)
                    if (aO5.clon)
                        o.observe(aO5.clon)
                }
                else {
                    if (aO5.clon)
                        o.unobserve(aO5.clon)
                    o.observe(aO5.shp)
                }
            }
        }
        Clone = () => {
            if (C.consts.o5debug > 1)
                console.log(`----------------- клонирую '${this.name}' -----------`)

            const aO5 = this,
                style = aO5.shp.style

            Object.assign(aO5.orig, {
                display: style.display, position: style.position,
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
                zIndex: aO5.shp.style.zIndex,
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
        DecodeType = quals => {
            const aO5 = this
            let err = ''

            aO5.cls = {                 level: 0, pitch: 'S', alive: false, dirV: 'U', putV: 'T',             }
            Object.seal(aO5.cls)

            for (const qual of quals) {
                const tt = qual.replaceAll(/-/g, '=').split('='),
                    t0 = tt[0],
                    c = t0.substr(0, 1).toUpperCase()

                if (c !== '' && !isNaN(t0)) aO5.cls.level = Number(t0)
                else if (c === 'C') aO5.cls.pitch = 'C' // сжимает предыдущий
                else if (c === 'P') aO5.cls.pitch = 'P' // сталкивает предыдущий
                else if (c === 'S') aO5.cls.pitch = 'S' // сдвигает предыдущий
                else if (c === 'O') aO5.cls.pitch = 'O' // наезжает на предыдущий
                else if (c === 'A') aO5.cls.alive = true
                else if (c === 'D' || c === 'U') aO5.cls.dirV = c
                else if (c === 'B' || c === 'T') aO5.cls.putV = c
                else err += (err ? ', ' : '') + t0
            }

            if (err)
                C.ConsoleError(`Для тега ${aO5.name} не определены квалификаторы: `, err)
        }
        Resize=()=>{         
        }
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, shp => {
        errs.splice(0, errs.length)

        const aO5 = new AO5(shp)

        if (!aO5.prev.mO5s)
            aO5.prev.mO5s = []

        ReadAttrs(aO5, aO5.ofram, wshp.W.consts.o5oframs)     // S - screen
        ReadAttrs(aO5, aO5.owner, wshp.W.consts.o5owners)     // B - блок с выделенной границей

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
