/* global window, document, console, CustomEvent */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/AO5shp ---
    "use strict"
    let wshp = {}

    const
        debugnames = ['moe4'],	//'shp1-2', 
        olga5_modul = "o5shp",
        modulname = 'AO5shp',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmtOK = "background: cornsilk; color: black;",
        fmtErr = "background: yellow; color: black;",
        DblClick = e => {
            if (e.currentTarget !== e.target && e.target.ondblclick) {
                if (o5debug > 0)
                    console.log("%c%s", fmtErr, ` У тега ${C.MakeObjName(e.target)} уже есть свой dblclick-обработчик — пропускаем`)
                return
            }

            const aO5 = e.currentTarget.aO5shp

            for (const x of 'TRLB')    // т.е. расфиксирую всё
                aO5.DoFix(x)

            e.stopImmediatePropagation()

            if (o5debug > 0)
                console.log("%c%s", fmtOK, `расфиксация '${aO5.id}' по событию '${e.type}'`)
        }

    class AO5 {
        static Margs = { t: 0, l: 0, r: 0, b: 0 }
        static Outln = { w: 0, s: 0, c: 0, o: 0 }
        static Tall = { top: 0, left: 0, right: 0, bottom: 0, height: 0, width: 0, }
        static TFix = { T: false, L: false, R: false, B: false }
        static TObj = { T: {}, L: {}, R: {}, B: {} }
        static nom = 0

        name = ''
        pFixs = { T: null, L: null, R: null, B: null }  // зафиксированные на границе контейнера
        aFixs = { T: null, L: null, R: null, B: null }  // на какаом этот зафиксорован (аналог pFixs)
        attaches = { T: [], L: [], R: [], B: [] }       // список: которые зафиксированы на этом

        canFixs = { T: null, L: null, R: null, B: null }
        extCuts = { T: null, L: null, R: null, B: null }
        tagCuts = { T: null, L: null, R: null, B: null }

        scops = {    //   копия из pO5 - координаты рабочей зоны контейнера
            T: 0, L: 0, R: 0, B: 0
        }

        constructor(shp, quals) {
            const
                name = window.olga5.C.MakeObjName(shp)

            shp.aO5shp = this

            Object.assign(this, {
                a_name: name,  // shp.id, // только чтобы легче видеть в отладчике 
                parent: shp.parentElement,
                nom: AO5.nom++,
                id: shp.id,
                shp: shp,
                cls: { level: 0, pitch: 0, none: 0, nofx: 0, alive: 0, puts: { T: false, L: false, R: false, B: false } }, // инициализация будет в ReadCls(this, ss) 
                base: { bO5: null, pBase: null },  // будут присвоены в PBases в AddToBase(aO5)
                act: {
                    // time: -1,    // для пересчетка текущей позиции
                    shdw: shp,          // будет: или  shp или clon
                    clon: null,
                    cart: null,
                    quals: quals,
                    isfix: false,
                    ready: false,
                    observer: null,
                    // iTested: false,     // для контроля в тестах       
                },
                margs: { t: '', l: '', r: '', b: '', },
                outln: { w: '', s: '', c: '', o: '', },

                frms: { tagCut: null, frames: new Set() },

                posS: { top: 0, left: 0, },
                posC: { top: 0, left: 0, height: 0, width: 0, },      // координаты скроллируемого
                posO: { top: 0, left: 0, height: 0, width: 0, right: 0, bottom: 0 },        // ПОТОМ УБРАТЬ за ненадобностьбю !!

                orig: { display: '', position: '', top: 0, left: 0, height: 0, width: 0, },
            })

            this.name = name
            this.aO5s = {}  // списки тех, кто может наткнуться НА этого aO5
            for (const m of 'TLRB') {
                this.aO5s[m] = new Set()
                Object.freeze(this.aO5s[m])
            }

            for (const nam of ['base', 'frms', 'margs', 'outln', 'posC', 'posO', 'posS', 'orig', 'cls', 'scops'])
                if (this[nam])
                    Object.seal(this[nam])
                else
                    console.log("%c%s", fmtErr, `в aO5 отсутствует '${nam}'`)

            Object.freeze(this.attaches)
            Object.freeze(this.aO5s)
            Object.freeze(this)
        }
        #SetMargOutls(style, margs, outln) {
            Object.assign(style,
                { marginTop: margs.t, marginLeft: margs.l, marginRight: margs.r, marginBottom: margs.b },
                { outlineWidth: outln.w, outlineStyle: outln.s, outlineColor: outln.c, outlineOffset: outln.o }
            )
        }
        HasHidden() {
            for (const x of 'TLRB')
                if (this.hidden[x])
                    return true
        }
        CanFixsOn(pO5) {
            for (const frame of this.frms.frames)
                if (frame.pO5 === pO5)
                    return frame
        }
        GetV(m, pos) {	// если результат > 0 то тег вышел за пределы контейнера
            const aX = this[pos]
            switch (m) {
                case 'T': return aX.top
                case 'L': return aX.left
                case 'R': return aX.left + aX.width
                case 'B': return aX.top + aX.height
            }
        }
        SetPos(x) {
            const
                v = this.pFixs[x].scops[x],
                aC = this.posC
            let d;
            if (this.extCuts[x]) {
                switch (x) {
                    case 'T': d = v - aC.top; break
                    case 'L': d = v - aC.left; break
                    case 'R': d = (aC.left + aC.width) - v; break
                    case 'B': d = (aC.top + aC.height) - v; break
                }
            }

            switch (x) {
                case 'T': aC.top = v; break
                case 'L': aC.left = v; break
                case 'R': aC.left = v - this.posO.width; break
                case 'B': aC.top = v - this.posO.height; break
            }

            if (d > 0)
                switch (x) {
                    case 'T': aC.height -= d; this.posS.top -= d; break
                    case 'L': aC.width -= d; this.posS.left -= d; break
                    case 'R': aC.width -= d; break
                    case 'B': aC.height -= d; break
                }
        }
        CutFix(o) {
            const
                v = this.tagCuts[o].scops[o],
                aC = this.posC

            let d;
            switch (o) {
                case 'T': d = v - aC.top; break
                case 'L': d = v - aC.left; break
                case 'R': d = aC.left + aC.width - v; break
                case 'B': d = aC.top + aC.height - v; break
            }

            if (d > 0)
                switch (o) {
                    case 'T': aC.height -= d; aC.top += d; break
                    case 'L': aC.width -= d; aC.left += d; break
                    case 'R': aC.width -= d; this.posS.left -= d; break
                    case 'B': aC.height -= d; this.posS.top -= d; break
                }

            return (aC.height > 0 && aC.width > 0)
        }
        DoFix(x, xO5) {
            const
                pF = this.pFixs,
                aF = this.aFixs,
                op = xO5 ? 'фиксация' : 'расфиксация'

            if (x && (
                !!aF[x] === !!xO5 ||
                !!pF[x] === !!xO5 ||
                (aF[x] && pF[x])
            )) {
                alert(`DoFix повтор '${op}' на ${this.name} для : ${xO5 ? xO5.name : ' -  '}[${x}]`)
                return
            }

            let s = ''
            if (x) {
                if (xO5)
                    this[(xO5.constructor.name === 'PO5') ? 'pFixs' : 'aFixs'][x] = xO5
                else
                    aF[x] = pF[x] = null

                if (o5debug) s = `${op} на ${xO5 ? xO5.name : ''} по [${x}]`
            }
            else {
                for (const m of 'TLRB')
                    aF[m] = pF[m] = null

                if (o5debug) s = `расфиксирован полностью`
            }
            const
                act = this.act,
                shp = this.shp

            act.isfix = pF.T || pF.L || pF.R || pF.B || aF.T || aF.L || aF.R || aF.B

            if (act.isfix && act.shdw === shp || (!act.isfix && act.shdw !== shp)) {
                const
                    clon = act.clon || this.#Clone(),
                    cart = act.cart

                cart.style.display = act.isfix ? '' : 'none'
                clon.style.display = act.isfix ? this.orig.display : 'none'

                if (act.isfix) {
                    act.shdw = clon
                    act.observer.unobserve(shp)
                    act.observer.observe(clon)

                    cart.appendChild(shp)
                    this.#SetMargOutls(shp.style, AO5.Margs, AO5.Outln)
                    Object.assign(shp.style, { position: 'absolute', top: 0, left: 0 })
                }
                else {
                    act.shdw = shp
                    act.observer.unobserve(clon)
                    act.observer.observe(shp)

                    Object.assign(shp.style, this.orig)
                    this.#SetMargOutls(shp.style, this.margs, this.outln)
                    this.parent.insertBefore(shp, act.cart)
                }

                shp[(act.isfix ? 'add' : 'remove') + 'EventListener']('dblclick', DblClick, true)
                window.dispatchEvent(new CustomEvent('o5_fixed', { detail: { aO5: this, fix: act.isfix } }))

                if (o5debug) s += `- физически`
            }
            if (o5debug)
                console.log(`DoFix ${this.name}: ` + s)
        }
        ShowFix() {
            const
                posC = this.posC,
                posS = this.posS,
                pw = (posC.width > 0) ? posC.width : 0,
                ph = (posC.height > 0) ? posC.height : 0,
                display = (pw === 0 || ph === 0) ? 'none' : ''

            Object.assign(this.act.cart.style, {
                display: display,
                top: posC.top + 'px',
                left: posC.left + 'px',
                width: pw + 'px',
                height: ph + 'px',
            })

            Object.assign(this.shp.style, {
                top: posS.top + 'px',
                left: posS.left + 'px',
            })
        }
        #Clone() {
            if (o5debug)
                console.log(`----------------- клонирую '${this.id}' -----------`)

            const
                shp = this.shp,
                act = this.act,
                id = shp.id,
                clon = act.clon = shp.cloneNode(true),
                cart = act.cart = document.createElement('div'),
                style = shp.style

            Object.assign(this.orig, {
                display: style.display,
                position: style.position,
                top: style.top, left: style.left, height: style.height, width: style.width,
            })

            clon.classList.add('olga5_clon')
            if (id) clon.id = id + '_clon'
            clon.aO5shp = this
            Object.assign(clon.style, {
                display: 'none',
                opacity: 0,
            })
            shp.parentNode.insertBefore(clon, shp)

            cart.classList.add('olga5_cart')                        // нужно ля тестов - CC()
            if (id) cart.id = id + '_cart'
            cart.aO5shp = this
            Object.assign(cart.style, {
                display: 'none',
                cursor: 'pointer',
                position: 'fixed',
                overflow: 'hidden',
                background: 'none',
                zIndex: shp.style.zIndex // ? Number(shp.style.zIndex) : 0,
            })
            shp.parentNode.insertBefore(cart, shp)

            const nst = window.getComputedStyle(shp)
            Object.assign(this.margs, {
                t: nst.getPropertyValue('margin-top'),
                l: nst.getPropertyValue('margin-left'),
                r: nst.getPropertyValue('margin-right'),
                b: nst.getPropertyValue('margin-bottom')
            })
            Object.assign(this.outln, {
                w: nst.getPropertyValue('outline-width'),
                s: nst.getPropertyValue('outline-style'),
                c: nst.getPropertyValue('outline-color'),
                o: nst.getPropertyValue('outline-offset')
            })

            this.#SetMargOutls(cart.style, AO5.Margs, this.outln)

            return clon
        }
        CalcCurPos() {
            const
                p = this.act.shdw.getBoundingClientRect(),
                aNaN = { T: NaN, L: NaN, R: NaN, B: NaN }

            Object.assign(this.posO, { top: p.top, left: p.left, height: p.height, width: p.width, right: p.right, bottom: p.bottom })
            Object.assign(this.posC, { top: p.top, left: p.left, height: p.height, width: p.width })
            Object.assign(this.posS, { top: 0, left: 0 })
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [AO5])
})();
