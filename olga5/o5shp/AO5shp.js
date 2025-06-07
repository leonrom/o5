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

                aO5.UnFix('TLRB')
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
                base:                {pO5: null, pbase: null},
                act: {
                    clon: null,
                    cart: null,
                    shdw: shp,          // будет: или  shp или clon
                    checkN: -1,         // для проверок подвисания под ним
                    iTested: false,     // для контроля в тестах                    
                    // wasFull: false,     // был полностью показан на экране - может прилипнуть на границы
                },
                margs: { t: '', l: '', r: '', b: '', },
                outln: { w: '', s: '', c: '', o: '', },

                shrunks: { T: [], L: [], R: [], B: [] },   // список прижатых aO5

                nears: {},
                hidden: Object.assign({}, AO5.TFix),    //  если zeroed и нету 'alive'                
                // wasFix: Object.assign({}, AO5.TFix),    //  сохраняемый результат фиксирования
                // tryFix: Object.assign({}, AO5.TFix),    //  предлагаемые фиксирования 

                pFixs: { fixed: false, T: null, L: null, R: null, B: null },

                zeroed: { V: false, H: false },          //  имеют нулевой размер  - по результату ChNudget
                isFull: { V: false, H: false }, //  признак, что тег был полностью видим - по вертикали и горизонтали   

                frames: new Set(),
                // frames: [],                     // нужен Array т.к. будет frame = cls ? aO5.frames.find(FindFrame(cls)) : null
                posS: { top: 0, left: 0, },
                posC: { top: 0, left: 0, height: 0, width: 0, },      // координаты скроллируемого
                posO: { top: 0, left: 0, right: 0, bottom: 0, height: 0, width: 0 },        // ПОТОМ УБРАТЬ за ненадобностьбю !!
                // posSf: { top: 0, left: 0, },            // координаты, запомненные при фиксации
                // posCf: Object.assign({}, AO5.Tall),     // координаты, запомненные при фиксации

                // posD: Object.assign({}, AO5.TFix),      // границы для определения близости к контейнерам TLRB
                orig: { display: '', position: '', top: 0, left: 0, height: 0, width: 0, },
            })

            const
                names = ['fix', 'cut', 'out'],
                n0 = { v: NaN, p: null },
                xs = 'TLRB'

            // for (const x of xs) {
            //     Object.assign(this.pFixs[x], {p:null, v:NaN})
            //     Object.seal(this.pFixs[x])  
            // } 
            Object.seal(this.pFixs)

            for (const name of names) {
                this.nears[name] = Object.assign({}, AO5.TObj)
                for (const x of xs) {
                    this.nears[name][x] = Object.assign({}, n0)
                    Object.seal(this.nears[name][x])
                }
                Object.freeze(this.nears[name])
                // Object.freeze(this.nears.fix.T )
            }
            Object.freeze(this.nears)

            for (const x of 'TLRB')
                aO5.shrunks[x] = new Set()

            // this.ReadAttrs(aO5.shp.aO5quals || [])
            // thiswshp.Frames.ReadAttrs(aO5, aO5.shp.aO5quals || [])
            // aO5.SetPosD()

            // 'tryFix', 'wasFix', 
            for (const nam of ['base', 'margs', 'outln', 'shrunks', 'hidden', 'pFixs', 'zeroed', 'isFull', 'posC', 'posO',  'posS',  'orig', 'cls'])
                if (aO5[nam])
                    Object.seal(aO5[nam])
                else
                    console.log("%c%s", fmtErr, `в aO5 отсутствует '${nam}'`)

            Object.freeze(this)

            // if (o5debug > 1)
            //     console.log(`>> class AO5  ${aO5.id}  => ` +
            //         `T= ${aO5.posD.T.toFixed().padStart(4)}; ` +
            //         `L= ${aO5.posD.L.toFixed().padStart(4)}; ` +
            //         `R= ${aO5.posD.R.toFixed().padStart(4)}; ` +
            //         `B= ${aO5.posD.B.toFixed().padStart(4)}; ` +
            //         ``)
        }
        #SetMargOutls(style, margs, outln) {
            Object.assign(style,
                { marginTop: margs.t, marginLeft: margs.l, marginRight: margs.r, marginBottom: margs.b },
                { outlineWidth: outln.w, outlineStyle: outln.s, outlineColor: outln.c, outlineOffset: outln.o }
            )
        }
        #HasFixedDebug() {
            let s = ''
            for (const x of 'TLRB')
                if (this.pFixs[x]) s += x
            return s
        }
        HasHidden() {
            for (const x of 'TLRB')
                if (this.hidden[x])
                    return true
        }
        DoFix(pFix, x) {
            const aO5 = this,
                shp = aO5.shp,
                act = aO5.act,
                clon = act.clon || aO5.#Clone(),
                cart = act.cart

            // for (const x of s)
            //     aO5.wasFix[x] = true
            // Object.assign(aO5.pFixs[x], pFix)
            aO5.pFixs[x] = pFix
            aO5.pFixs.fixed = true

            // aO5.act.wasFull = true

            if (o5debug)
                console.log("%c%s", fmtOK, `DoFix`, `${aO5.id} на ${pFix.name}, всего теперь  [${this.#HasFixedDebug()}]`)

            if (act.shdw !== clon) {
                act.shdw = clon

                cart.style.display = ''
                clon.style.display = aO5.orig.display

                // aO5.parent.removeChild(shp)
                cart.appendChild(shp)

                aO5.#SetMargOutls(shp.style, AO5.Margs, AO5.Outln)
                Object.assign(shp.style, { position: 'absolute', top: 0, left: 0 })

                wshp.DoInit.SwitchObserve({ on: clon, off: shp })

                shp.addEventListener('dblclick', DblClick, true)
                window.dispatchEvent(new CustomEvent('o5_fixed', { detail: { aO5: aO5, fix: true } }))
            }
        }
        UnFix(x) {
            const
                aO5 = this,
                shp = aO5.shp,
                act = aO5.act,
                clon = act.clon,
                cart = act.cart,
                pFixs = aO5.pFixs

            // for (const x of s)
            //     aO5.wasFix[x] = false

            // Object.assign(this.pFixs[x], {p:null, v:NaN})
            pFixs[x] = null
            aO5.pFixs.fixed = pFixs.T || pFixs.L || pFixs.R || pFixs.B

            if (o5debug)
                console.log("%c%s", fmtOK, `UnFix`, `${aO5.id}, осталось [${this.#HasFixedDebug()}] `)

            if (act.shdw !== shp && !aO5.pFixs.fixed) {  // !this.HasFixed()) {
                act.shdw = shp

                Object.assign(shp.style, aO5.orig)
                aO5.#SetMargOutls(shp.style, aO5.margs, aO5.outln)

                clon.style.display = 'none'
                cart.style.display = 'none'

                aO5.parent.insertBefore(shp, cart)

                wshp.DoInit.SwitchObserve({ off: clon, on: shp })

                shp.removeEventListener('dblclick', DblClick, true)

                window.dispatchEvent(new CustomEvent('o5_fixed', { detail: { aO5: aO5, fix: false } }))
            }
        }
        ShowFix = () => {
            const aO5 = this,
                posC = aO5.posC,
                posS = aO5.posS,
                pw = (posC.width > 0) ? posC.width : 0,
                ph = (posC.height > 0) ? posC.height : 0,
                display = (pw === 0 || ph === 0) ? 'none' : ''      //   aO5.act.iHidden ||  //  || hi.T || hi.L|| hi.R || hi.B

            // Object.assign(aO5.posCf, posC)
            // Object.assign(aO5.posSf, posS)

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
        #Clone = () => {
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
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [AO5])
})();
