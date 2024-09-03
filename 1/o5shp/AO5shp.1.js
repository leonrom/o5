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
        DecodeType = aO5 => {
            const
                quals = aO5.shp.aO5quals,
                cls = aO5.cls,
                errs = []
            // cls = {
            //     level: 0, kill: false, remo: false, pitch: 'S', alive: false,
            //     dirV: 'U', putV: 'T', none: false, cartopacity: 1,
            // }

            for (const qual of quals) {
                const tt = qual.replaceAll(/-/g, '=').split('='),
                    c = tt[0].substr(0, 1).toUpperCase()

                if (c != '' && !isNaN(c)) cls.level = Number(c)
                else if (c === 'N') cls.none = true
                else if (c === 'K') cls.kill = true
                else if (c === 'R') cls.remo = true
                else if (c === 'C') cls.pitch = 'C' // сжимает предыдущий
                else if (c === 'P') cls.pitch = 'P' // сталкивает предыдущий
                else if (c === 'S') cls.pitch = 'S' // сдвигает предыдущий
                else if (c === 'O') cls.pitch = 'O' // наезжает на предыдущий
                else if (c === 'A') cls.alive = true
                else if (c === 'D' || c === 'U') cls.dirV = c
                else if (c === 'B' || c === 'T') cls.putV = c
                else errs.push(`'${c}'`)
            }

            // delete aO5.shp.aO5quals

            if (errs.length > 0)
                C.ConsoleError("Ошибки классов подвисабельного объекта", aO5.name, errs)
            // if (cls.kill) cls.remo = false
            // if (!cls.dirV && !cls.kill && !cls.remo) cls.dirV = 'U'

            // Object.freeze(cls)
            // return { cls: cls, err: errs.length ? (`неопр. коды: ` + errs.join(', ')) : '' }
        },
        ReadAttrs = (aO5, atrib) => { // определение вложенностей shp's друг в друга
            const typs = 'CINSB',
                errs = [],
                shp = aO5.shp,
                cod = atrib.cod,
                blng = aO5[cod],
                attr = shp.getAttribute(atrib.atr) || atrib.def,
                ss = attr ? attr.split(/[,;]/g) : [''],
                AddNew = (asks, ask) => {
                    const a = Object.assign({}, ask);
                    Object.seal(a);
                    asks.push(a);
                }

            blng.asks.splice(0, blng.asks.length)
            blng.attr = attr

            let i = ss.length
            while (--i >= 0) {
                const s = ss[i].trim()
                if (s.length > 0) {
                    const
                        cc = s.split(':'),
                        u = cc[0].trim(),
                        t = u.length > 0 ? u[0].toUpperCase() : '?'
                    if (typs.includes(t)) {
                        const cod = cc.length > 1 ? cc[1].trim() : '',
                            num = cc.length > 2 ? C.C.MyRound(cc[2]) : 1,
                            fix = cc.length > 2 ? cc[2].toUpperCase() == 'F' : false

                        AddNew(blng.asks, { typ: t, cod: cod, num: num, nY: num, }) // ok: false, fix: fix, })  //  bords: []                                                
                    }
                    else
                        errs.push({ name: aO5.name, str: s, err: "тип ссылки не начинается одним из '" + typs + "'" })
                }
            }

            if (aO5[atrib.cod].asks.length === 0) {
                AddNew(aO5[atrib.cod].asks, { typ: atrib.def.toUpperCase(), cod: '', num: 1, nY: 1,}) //  ok: false, fix: false, bords: [] })
                errs.push({ name: aO5.name, str: attr, err: "нету [id, класс, тип, к-во]" })
                Error = C.ConsoleAlert
            }


            if (errs.length > 0)
                Error("Ошибки в атрибутах  для тегов", errs.length, errs)
        },
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

            const nst = window.getComputedStyle(aO5.shp),
                GPV = (nam, nst) => { return C.MyRound(nst.getPropertyValue(nam)) },
                MGPV = (nam, nst) => { return Math.ceil(GPV(nam, nst)) }

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
                visi = aO5.visi,
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

                    C.E.DispatchEvent('olga5_fix-act', { detail: { aO5: aO5, fix: true } })
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

                    C.E.DispatchEvent('olga5_fix-act', { detail: { aO5: aO5, fix: false } })
                }
            if (visi.doFi>0 && !act.isFixed) DoFixV(aO5)
                            if (visi.doFix<0 && act.isFixed) UnFixV(aO5)
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
        Tbelong = { attr: '', to: null, le: null, ri: null, bo: null }

    class AO5 {
        constructor(shp, cls) {
            const aO5 = this
            aO5.name = window.olga5.C.MakeObjName(shp)
            aO5.id = shp.id
            aO5.shp = shp
            aO5.shdw = shp
            aO5.prev = shp.parentElement
            aO5.node = shp.parentNode
            shp.aO5shp = aO5

            for (const nam of ['cls', 'old', 'act', 'visi', 'margs', 'outln', 'frames', 'owners', 'posW', 'posC', 'posS'])
                Object.seal(this[nam])
            Object.seal(this)

            shp.addEventListener('dblclick', DblClick)
        }
        name = '' // повтор - чтобы было 1-м в отладчике
        // aO5s = [] // перечень включенных в этот aO5
        cls = { kill: false, remo: false, dirV: '', putV: 'T', alive: false, nest: -2, level: 0, pitch: 'S', }
        old = { frames: { to: null, owners: { to: null } }, owners: { to: null } } //  для отладки: зраненеие предыдущих контейнеров
        act = { dspl: false, isFixed: false, isKilled: false, underClick: false, pushedBy: null, zIndex: 0, }
        visi = { doKill: false, doFix: false, checkUp: false, part: false, full: false, } //time:0,checkUp: false, top: 0, }

        margs = { t: '', l: '', r: '', b: '', }
        outln = { w: '', s: '', c: '', o: '', }

        frames = Object.assign({ act: 'frames', asks: [], bords: [] }, Tbelong) // массивы д.б.персонально
        owners = Object.assign({ act: 'owners', asks: [], bords: [] }, Tbelong)
        posW = { top: 0, left: 0, height: 0, width: 0, }  // Right: (this.left+this.width)(), Bottom: (this.top+this.height)(), } 
        posC = Object.assign({}, this.posW)
        posS = { top: 0, left: 0, }

        clon = null
        cart = null
        orig = {}
        // bords = {}
        // padds = {}
        // allbords = []

        SetFix = () => SetFix(this)
        ShowFix = () => ShowFix(this)
        IsConnect = (upO5) => IsConnect(this, upO5)
    }

    // --------------------------------------------------------------------- //    
    wshp = C.ModulAddSub(olga5_modul, modulname, (shp) => {
        const aO5 = new AO5(shp)
        for (const atrib of [
            { atr: 'olga5_frames', cod: 'frames', def: 's' },
            { atr: 'olga5_owners', cod: 'owners', def: 'b' }
        ]) {
            ReadAttrs(aO5, atrib)
            Object.freeze(aO5[atrib.cod].asks)
        }

        DecodeType(aO5)
        Object.freeze(aO5.cls)

        if (shp.tagName.match(/\b(img|iframe|svg)\b/i) && !shp.complete) {
            if (C.consts.o5debug > 0) C.ConsoleInfo(`ожидается завершение загрузки '${aO5.name}'`)
            shp.addEventListener('load', () => {
                wshp.DoResize(`из '${modulname}'`)
            })
        }
        return aO5
    })

})();
