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
            let target = e.target
            while (target && !target.aO5shp)
                target = target.parentElement

            if (target && target.aO5shp) {
                const aO5 = target.aO5shp

                for (const x of 'TRLB')    // т.е. расфиксирую всё
                    for (const p of pFixs(x))
                        aO5.UnFix(x, p)

                e.stopImmediatePropagation()

                if (o5debug > 0)
                    console.log("%c%s", fmtOK, `расфиксация '${aO5.id}' по событию '${e.type}'`)
            }
        }

    class AO5 {
        static Margs = { t: 0, l: 0, r: 0, b: 0 }
        static Outln = { w: 0, s: 0, c: 0, o: 0 }
        static Tall = { top: 0, left: 0, right: 0, bottom: 0, height: 0, width: 0, }
        static TFix = { T: false, L: false, R: false, B: false }
        static TObj = { T: {}, L: {}, R: {}, B: {} }
        static nom = 0

        constructor(shp) {
            const aO5 = this

            shp.aO5shp = aO5

            Object.assign(aO5, {
                a_name: window.olga5.C.MakeObjName(shp),  // shp.id, // только чтобы легче видеть в отладчике 
                parent: shp.parentElement,
                nom: AO5.nom++,
                id: shp.id,
                shp: shp,
                ext: {},    // для хранения произвольных данных внешними (тестовыми) модулями
                cls: { puts: [], pitch: 'S', alive: false, none: false, level: 0, nofx: false },
                base: { pO5: null, pbase: null },
                act: {
                    time: -1,    // для пересчетка текущей позиции
                    clon: null,
                    cart: null,
                    fixed: false,
                    shdw: shp,          // будет: или  shp или clon
                    checkN: -1,         // для проверок подвисания под ним
                    iTested: false,     // для контроля в тестах       
                    // fixOnO5: false,     // отметка зафиксированности на pcO5 при скроллингу            
                },
                margs: { t: '', l: '', r: '', b: '', },
                outln: { w: '', s: '', c: '', o: '', },

                pFixs: { T: [], L: [], R: [], B: [] },
                pCouldFixs: { T: [], L: [], R: [], B: [] },

                shrunks: { T: [], L: [], R: [], B: [] },   // список прижатых aO5

                nears: {},
                hidden: Object.assign({}, AO5.TFix),    //  если zeroed и нету 'alive'           

                zeroed: { V: false, H: false },          //  имеют нулевой размер  - по результату ChNudget
                isFull: { V: false, H: false }, //  признак, что тег был полностью видим - по вертикали и горизонтали   

                frames: new Set(),

                posS: { top: 0, left: 0, },
                posC: { top: 0, left: 0, height: 0, width: 0, },      // координаты скроллируемого
                posO: { top: 0, left: 0, right: 0, bottom: 0, height: 0, width: 0 },        // ПОТОМ УБРАТЬ за ненадобностьбю !!

                orig: { display: '', position: '', top: 0, left: 0, height: 0, width: 0, },
            })

            const
                names = ['fix', 'cut', 'out'],
                n0 = { v: NaN, p: null },
                xs = 'TLRB'

            for (const name of names) {
                this.nears[name] = Object.assign({}, AO5.TObj)
                for (const x of xs) {
                    this.nears[name][x] = Object.assign({}, n0)
                    Object.seal(this.nears[name][x])
                }
                Object.freeze(this.nears[name])
            }
            Object.freeze(this.nears)

            for (const x of 'TLRB')
                aO5.shrunks[x] = new Set()

            for (const nam of ['base', 'margs', 'outln', 'shrunks', 'hidden', 'pFixs', 'pCouldFixs', 'zeroed', 'isFull', 'posC', 'posO', 'posS', 'orig', 'cls'])
                if (aO5[nam])
                    Object.seal(aO5[nam])
                else
                    console.log("%c%s", fmtErr, `в aO5 отсутствует '${nam}'`)

            Object.freeze(this.pFixs)
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
        #SetPosC(x, vx) {
            const aC = this.posC
            let o, v;
            switch (x) {
                case 'T': o = 'B'; v = aC.top; aC.top = vx; break
                case 'L': o = 'R'; v = aC.left; aC.left = vx; break
                case 'R': o = 'L'; v = aC.left; aC.left = vx - aC.width; break
                case 'B': o = 'T'; v = aC.top; aC.top = vx - aC.height; break
            }
            if (this.pFixs[o].length)
                if ('TB'.includes(x)) aC.height -= (v - aC.top)
                else aC.width -= (v - aC.left)
        }
        OnNearestFix(x) {
            const xtl = 'TL'.includes(x)
            let vx = NaN
            for (const pFix of this.pFixs[x]) {		//  - сравниваю границы во всех где он зафиксирован
                const v = pFix.pos.scops[x]
                if (isNaN(vx) || (xtl && v > vx) || (!xtl && v < vx))
                    vx = v
            }
            this.#SetPosC(x, vx)
        }
        DoFix(x, pO5) {
            const
                act = this.act,
                clon = act.clon || this.#Clone()

            if (o5debug) {
                const fmt = this.pFixs[x].includes(pO5) ? fmtErr : fmtOK
                console.log("%c%s", fmt, `DoFix` + (fmt === fmtErr ? ' (повтор)' : ''),
                    `${this.id} по ${x} на ${pO5.name}: всего [${this.pFixs[x].map(p => p.name).join(' ') + ' ' + pO5.name}]`)
            }

            this.pFixs[x].push(pO5)
            act.fixed = true

            if (act.shdw !== clon) {
                const
                    shp = this.shp,
                    cart = act.cart

                act.shdw = clon

                cart.style.display = ''
                clon.style.display = this.orig.display

                cart.appendChild(shp)

                this.#SetMargOutls(shp.style, AO5.Margs, AO5.Outln)
                Object.assign(shp.style, { position: 'absolute', top: 0, left: 0 })

                shp.addEventListener('dblclick', DblClick, true)
                window.dispatchEvent(new CustomEvent('o5_fixed', { detail: { aO5: this, fix: true } }))
            }
        }
        UnFix(x, pO5) {
            const
                aO5 = this,
                act = aO5.act,
                clon = act.clon,
                pFixs = this.pFixs,
                ia = pFixs[x].indexOf(pO5)

            if (ia >= 0)
                pFixs[x].splice(ia, 1)

            // let vx = pFixs[x].length ? this.#FindNearestFix(x) : NaN

            // if (isNaN(vx)) {  // значит уже расфиксировано по 'x'
            //     this.act.fixed = pFixs.find(pFix => pFix.length > 0)
            //     vx = this.posO['TB'.includes(x) ? 'top' : 'left']
            // }
            // this.#SetPosC(x, vx)

            if (pFixs[x].length)
                this.OnNearestFix(x)
            else
                this.#SetPosC(x, 'TB'.includes(x) ? this.posO.top : this.posO.left)

            this.act.fixed = pFixs.T.length || pFixs.L.length || pFixs.R.length || pFixs.B.length

            if (o5debug)
                console.log("%c%s", fmtOK, `UnFix`, `${aO5.id} по ${x} : всего [${Array.from(aO5.pFixs[x]).map(p => p.name).join(', ')}] `)

            if (!this.act.fixed && act.shdw === clon) {
                const
                    shp = aO5.shp,
                    cart = act.cart

                act.shdw = shp

                Object.assign(shp.style, aO5.orig)
                aO5.#SetMargOutls(shp.style, aO5.margs, aO5.outln)

                clon.style.display = 'none'
                cart.style.display = 'none'

                aO5.parent.insertBefore(shp, cart)

                shp.removeEventListener('dblclick', DblClick, true)

                window.dispatchEvent(new CustomEvent('o5_fixed', { detail: { aO5: aO5, fix: false } }))
            }
        }
        ShowFix() {
            const aO5 = this,
                posC = aO5.posC,
                posS = aO5.posS,
                pw = (posC.width > 0) ? posC.width : 0,
                ph = (posC.height > 0) ? posC.height : 0,
                display = (pw === 0 || ph === 0) ? 'none' : ''      //   aO5.act.iHidden ||  //  || hi.T || hi.L|| hi.R || hi.B

            Object.assign(aO5.act.cart.style, {
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
        #Clone() {
            if (o5debug > 1)
                console.log(`----------------- клонирую '${this.id}' -----------`)

            const aO5 = this,
                shp = aO5.shp,
                act = aO5.act,
                id = shp.id,
                clon = act.clon = shp.cloneNode(true),
                cart = act.cart = document.createElement('div'),
                style = shp.style

            Object.assign(aO5.orig, {
                display: style.display,
                position: style.position,
                top: style.top, left: style.left, height: style.height, width: style.width,
            })

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

            const nst = window.getComputedStyle(shp)
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

            aO5.#SetMargOutls(cart.style, AO5.Margs, aO5.outln)

            return clon
        }
        CalcCurPos() {
            const
                aO5 = this,
                p = aO5.act.shdw.getBoundingClientRect()

            Object.assign(aO5.posO, { top: p.top, left: p.left, right: p.right, bottom: p.bottom, height: p.height, width: p.width })

            Object.assign(aO5.posC, { width: p.width, height: p.height })
            if (!aO5.pFixs['L'].length && !aO5.pFixs['R'].length) aO5.posC.left = p.left
            if (!aO5.pFixs['T'].length && !aO5.pFixs['B'].length) aO5.posC.top = p.top

            Object.assign(aO5.posS, { top: 0, left: 0 })
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [AO5])
})();
