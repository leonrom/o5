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
                aO5.UnFix(x)

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

        #isCut = { T: false, L: false, R: false, B: false }
        #pFixs = { T: null, L: null, R: null, B: null }

        constructor(shp, quals) {
            const aO5 = this

            shp.aO5shp = aO5

            Object.assign(aO5, {
                a_name: window.olga5.C.MakeObjName(shp),  // shp.id, // только чтобы легче видеть в отладчике 
                parent: shp.parentElement,
                nom: AO5.nom++,
                id: shp.id,
                shp: shp,
                ext: {},    // для хранения произвольных данных внешними (тестовыми) модулями
                cls: { level: 0, pitch: 0, none: 0, nofx: 0, alive: 0, puts: [] }, // инициализация будет в ReadCls(aO5, ss) 
                base: { bO5: null, pBase: null },  // будут присвоены в PBases в Attach(aO5)
                act: {
                    time: -1,    // для пересчетка текущей позиции
                    shdw: shp,          // будет: или  shp или clon
                    clon: null,
                    cart: null,
                    checkN: -1,         // для проверок подвисания под ним
                    quals: quals,
                    iTested: false,     // для контроля в тестах       
                },
                margs: { t: '', l: '', r: '', b: '', },
                outln: { w: '', s: '', c: '', o: '', },

                // pFixsOn: [],

                shrunks: { T: new Set(), L: new Set(), R: new Set(), B: new Set() },   // список прижатых aO5

                // nears: {},
                // hidden: Object.assign({}, AO5.TFix),    //  если zeroed и нету 'alive'           

                // zeroed: { V: false, H: false },          //  имеют нулевой размер  - по результату ChNudget
                // isFull: { V: false, H: false }, //  признак, что тег был полностью видим - по вертикали и горизонтали   

                frms: { tagCut: null, frames: new Set() },

                posS: { top: 0, left: 0, },
                posC: { top: 0, left: 0, height: 0, width: 0, },      // координаты скроллируемого
                posO: { top: 0, left: 0, height: 0, width: 0, right: 0, bottom: 0 },        // ПОТОМ УБРАТЬ за ненадобностьбю !!

                orig: { display: '', position: '', top: 0, left: 0, height: 0, width: 0, },
            })

            for (const nam of ['base', 'frms', 'margs', 'outln', 'posC', 'posO', 'posS', 'orig', 'cls'])
                if (aO5[nam])
                    Object.seal(aO5[nam])
                else
                    console.log("%c%s", fmtErr, `в aO5 отсутствует '${nam}'`)

            Object.freeze(this.shrunks)
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
        IsCut(x) {
            return this.#isCut[x]
        }
        DoCut(x, d, v) {
            const aC = this.posC
            switch (x) {
                case 'T': aC.height -= d; aC.top = v; this.posS.top -= d; break
                case 'L': aC.width -= d; aC.left = v; this.posS.left -= d; break
                case 'R': aC.width -= d; aC.left = v - aC.width; break
                case 'B': aC.height -= d; aC.top = v - aC.height; break
            }
            this.#isCut[x] = true
        }
        UnCut(x) {
            this.#isCut[x] = false
        }
        IsFix(x) {
            return this.#pFixs[x]
        }
        DoFix(x, pO5, v) {
            const aO5 = this

            if ('TB'.includes(x)) aO5.posC.top = v
            else aO5.posC.left = v

            aO5.#pFixs[x] = pO5

            const
                clon = aO5.act.clon || aO5.#Clone(),
                shp = aO5.shp,
                cart = aO5.act.cart

            aO5.act.shdw = clon

            cart.style.display = ''
            clon.style.display = aO5.orig.display

            cart.appendChild(shp)

            aO5.#SetMargOutls(shp.style, AO5.Margs, AO5.Outln)
            Object.assign(shp.style, { position: 'absolute', top: 0, left: 0 })

            shp.addEventListener('dblclick', DblClick, true)
            window.dispatchEvent(new CustomEvent('o5_fixed', { detail: { aO5: this, fix: true } }))
        }
        UnFix(x) { // тут pO5 чисто для проверки
            const
                aO5 = this,
                shp = aO5.shp

            if ('TB'.includes(x)) aO5.posC.top = aO5.posO.top
            else aO5.posC.left = aO5.posO.left

            aO5.#pFixs[x] = null

            aO5.act.shdw = shp

            Object.assign(shp.style, aO5.orig)
            aO5.#SetMargOutls(shp.style, aO5.margs, aO5.outln)

            aO5.act.clon.style.display = 'none'
            aO5.act.cart.style.display = 'none'

            aO5.parent.insertBefore(shp, aO5.act.cart)

            shp.removeEventListener('dblclick', DblClick, true)

            window.dispatchEvent(new CustomEvent('o5_fixed', { detail: { aO5: aO5, fix: false } }))
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
            Object.assign(aO5.posS, { top: 0, left: 0 })

            const pF = aO5.#pFixs
            aO5.posC.top = pF.T ? pF.T.scops.T : (pF.B ? (pF.B.scops.B - p.height) : aO5.posO.top)
            aO5.posC.left = pF.L ? pF.L.scops.L : (pF.R ? (pF.R.scops.R - p.width) : aO5.posO.left)
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [AO5])
})();
