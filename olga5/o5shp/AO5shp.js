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
        DecodeType = (aO5, quals) => {
            const
                cls = aO5.cls
            let err = ''

            for (const qual of quals) {
                const tt = qual.replaceAll(/-/g, '=').split('='),
                    t0 = tt[0],
                    c = t0.substr(0, 1).toUpperCase()

                if (c !== '' && !isNaN(t0)) cls.level = Number(t0)
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

            Object.freeze(cls)

            if (err)
                C.ConsoleError(`Для тега ${aO5.name} не определены квалификаторы: `, err)
        },
        ReadAttrs = (aO5, blng) => { // определение вложенностей shp's друг в друга
            const
                shp = aO5.shp,
                atr = 'olga5_' + blng.akey,                   // т.е.  olga5_owners либо olga5_oframs
                str = shp.getAttribute(atr) || shp.getAttribute(atr + 's')
                
            if (str) {
                const ss = str ? str.split(/\s*[,;]\s*/g) : [''],
                typs='CINSB'
                
                for (const s of ss) // ss оставил для контроля устаревших заданий контейнеров
                    if (s.length > 0) {
                        const
                            cc = s.split(':'),
                            u = cc[0].trim(),
                            t = u.length > 0 ? u[0].toUpperCase() : '?'

                        if (typs.includes(t)) {
                            const cod = cc.length > 1 ? cc[1].trim() : '',
                                num = cc.length > 2 ? C.MyRound(cc[2]) : 0,
                                bord={tag: null, typ: t, cod: cod, num: num, err: '', }
                            
                            Object.seal(bord)
                            blng.bords.push(bord)
                        }
                        else
                            errs.push({ name: aO5.name, str: str, err: "тип ссылки не начинается одним из '" + typs + "'" })
                    }
            }
        },
        Clone = function (aO5) {
            if (C.consts.o5debug > 1)
                console.log(`----------------- клонирую '${aO5.name}' -----------`)

            const style = aO5.shp.style
            Object.assign(aO5.orig, { display: style.display, position: style.position, zIndex: style.zIndex })

            const clon = aO5.clon = aO5.shp.cloneNode(true)
            clon.aO5 = aO5
            clon.classList.add('olga5-clon')    // нужно ля тестов - CC()
            if (clon.id) clon.id += '_clon'
            aO5.shp.parentNode.insertBefore(clon, aO5.shp)

            const cart = aO5.cart = document.createElement('div')
            cart.classList.add('olga5-cart')    // нужно ля тестов - CC()
            if (clon.id) cart.id += '_clon'
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
        },
        DoFixV = aO5 => {
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

            const margs = aO5.margs,
                outln = aO5.outln

            Object.assign(aO5.cart.style, {
                display: '',
                zIndex: aO5.act.zIndex,
                marginTop: margs.t,
                marginLeft: margs.l,
                marginRight: margs.r,
                marginBottom: margs.b,
                outlineWidth: outln.w,
                outlineStyle: outln.s,
                outlineColor: outln.c,
                outlineOffset: outln.o
            })
            Object.assign(aO5.clon.style, {
                display: aO5.shp.style.display,
                opacity: 0,
            })

            aO5.node.removeChild(aO5.shp)
            aO5.cart.appendChild(aO5.shp)

            aO5.shdw = aO5.clon
            aO5.act.isFixed = true

            C.E.DispatchEvent('olga5_fix-act', { detail: (aO5.name + ' - isFixed==true') })
        },
        UnFixV = aO5 => {
            const posW = aO5.posW

            Object.assign(aO5.shp.style, {
                position: aO5.orig.position,
                zIndex: aO5.act.zIndex,
                top: posW.top + 'px',
                left: posW.left + 'px',
                marginTop: aO5.margs.t,
                marginLeft: aO5.margs.l,
                marginRight: aO5.margs.r,
                marginBottom: aO5.margs.b,
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

            C.E.DispatchEvent('olga5_fix-act', { detail: (aO5.name + ' - isFixed==false') })
        },
        ShowFix = aO5 => {
            const
                posC = aO5.posC,
                posS = aO5.posS

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
        },
        SetFix = aO5 => {     // отображение изменеий - только для зафиксированных
            const act = aO5.act,
                visi = aO5.visi
            if (visi.doFix && !act.isFixed) DoFixV(aO5)
            else
                if (!visi.doFix && act.isFixed) UnFixV(aO5)
            if (aO5.act.isFixed)
                ShowFix(aO5)
        },
        DblClick = e => {
            const aO5 = e.target.aO5shp
            if (aO5.act.isFixed) {
                UnFixV(aO5)
                aO5.act.underClick = true
            }
        },
        IsConnect = (aO5, upO5) => {
            const
                reached = (upO5.cls.dirV === 'U') ?   // проверка что "на уровне"
                    (aO5.posW.top < upO5.posC.top + upO5.posW.height) :
                    (aO5.posW.top + aO5.posW.height > upO5.posC.top)

            if (reached) {                          // проверка, что один под другим
                const
                    aL = aO5.posC.left,
                    aR = aO5.posC.left + aO5.posW.width,
                    iL = upO5.posC.left,
                    iR = upO5.posC.left + upO5.posW.width

                return (
                    (aL > iL && aL < iR) ||
                    (aR > iL && aR < iR) ||
                    (iL > aL && iL < aR) ||
                    (iR > aL && iR < aR)
                )
            }
        },
        errs = [],
        Tbelong = { bords: [], to: null, le: null, ri: null, bo: null }

    class AO5 {
        constructor(shp) {
            const aO5 = this
            aO5.name = window.olga5.C.MakeObjName(shp)
            aO5.id = shp.id
            aO5.shp = shp
            aO5.shdw = shp
            aO5.prev = shp.parentElement
            aO5.node = shp.parentNode
            shp.aO5shp = aO5

            for (const nam of ['cls', 'old', 'act', 'visi', 'margs', 'outln', 'posW', 'posC', 'posS', 'oframs', 'owners'])
                Object.seal(this[nam])
            Object.seal(this)

            shp.addEventListener('dblclick', DblClick)
        }
        name = '' // повтор - чтобы было 1-м в отладчике

        cls = { dirV: 'U', putV: 'T', alive: false, none: false, level: 0, pitch: 'S', }
        act = { dspl: false, isFixed: false, isCloned: false, isKilled: false, underClick: false, pushedBy: null, zIndex: 0, }
        visi = { doKill: false, doFix: '', checkUp: false, part: false, full: false, } //time:0,checkUp: false, top: 0, }

        margs = { t: '', l: '', r: '', b: '', }
        outln = { w: '', s: '', c: '', o: '', }

        oframs = Object.assign({ akey: 'oframs' }, Tbelong)
        owners = Object.assign({ akey: 'owners' }, Tbelong)

        // frames = Object.assign({ act: 'frames', asks: [], bords: [] }, Tbelong) // массивы д.б.персонально
        // owners = Object.assign({ act: 'owners', asks: [], bords: [] }, Tbelong)

        posW = Object.assign({}, { top: 0, left: 0, height: 0, width: 0, })
        posC = Object.assign({}, this.posW)
        posS = { top: 0, left: 0, }

        clon = null
        cart = null
        orig = {}
        padds = {}

        DoFixV = () => DoFixV(this)
        UnFixV = () => UnFixV(this)
        SetFix = () => SetFix(this)
        ShowFix = () => ShowFix(this)
        IsConnect = (upO5) => IsConnect(this, upO5)
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, (shp, quals) => {
        errs.splice(0, errs.length)

        const aO5 = new AO5(shp)

        DecodeType(aO5, quals)

        ReadAttrs(aO5, aO5.oframs)
        ReadAttrs(aO5, aO5.owners)

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
