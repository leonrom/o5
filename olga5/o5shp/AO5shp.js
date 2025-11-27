/* global window, document, console, CustomEvent */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/AO5shp ---
    "use strict"
    let wshp = {}, ytop;

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
                    console.error("%c%s", fmtErr, C.MakeObjName(e.target), ` - тег имеет свой dblclick-обработчик — пропускаем`)
                return
            }

            const aO5 = e.currentTarget.aO5shp  // т.е. расфиксирую всё
            aO5.DoFix()

            e.stopImmediatePropagation()

            if (o5debug > 0)
                console.log("%c%s", fmtOK, `расфиксация '${aO5.id}' по событию '${e.type}'`)
        },
        HasNoScaleRotate = t => {
            if (t && t !== 'none') {

                const m = t.match(/matrix\(([^)]+)\)/),
                    errs = []

                if (!m) errs.push(`хз-матрица `)

                const
                    mi = 0.00001,
                    [a, b, c, d] = m[1].split(',').map(Number)

                // Проверяем, что матрица = единичная (нет scale/rotate)
                if (
                    Math.abs(a - 1) > mi || Math.abs(d - 1) > mi) errs.push(`масштабирование`)
                if (Math.abs(b) > mi || Math.abs(c) > mi) errs.push(`поворачивание`)

                if (errs.length)
                    return `для 'transform' задано: ` + errs.join(', ')
            }
        }

    class AO5 {
        static Margs = { t: 0, l: 0, r: 0, b: 0 }
        static Outln = { w: 0, s: 0, c: 0, o: 0 }
        static Tall = { top: 0, left: 0, right: 0, bottom: 0, height: 0, width: 0, }
        static TFix = { T: false, L: false, R: false, B: false }
        static TObj = { T: {}, L: {}, R: {}, B: {} }
        static nom = 0

        name = ''
        attachss = { T: [], L: [], R: [], B: [] }       // список: которые зафиксированы на этом

        canFixs = { T: null, L: null, R: null, B: null }
        canCuts = { T: null, L: null, R: null, B: null }
        tagCuts = { T: null, L: null, R: null, B: null }

        scops = { T: 0, L: 0, R: 0, B: 0 }  //   копия из pO5 - координаты рабочей зоны контейнера

        constructor(shp, quals) {
            const name = window.olga5.C.MakeObjName(shp)
            shp.aO5shp = this

            Object.assign(this, {
                a_name: name,  // shp.id, // только чтобы легче видеть в отладчике 
                parent: shp.parentElement,
                nom: AO5.nom++,
                id: shp.id,
                shp: shp,
                cls: {
                    level: 0, pitch: 0, nofx: 0, alive: 0, zIndex: shp.style.zIndex,
                    puts: { T: false, L: false, R: false, B: false }
                }, // инициализация puts будет в ReadCls(this, ss) 
                base: { bO5: null, pBase: null },  // будут присвоены в PBases в AddToBase(aO5)
                act: {
                    shdw: shp,          // будет: или  shp или clon
                    clon: null,
                    cart: null,
                    quals: quals,
                    isfix: false,
                    ready: false,
                    zIndex: NaN,
                    // cpitch: false,      //метка для текущего pitch
                    observer: null,
                },
                hidden: { T: 0, L: 0, R: 0, B: 0 },
                // forced: { T: 0, L: 0, R: 0, B: 0 },
                margs: { t: '', l: '', r: '', b: '', },
                outln: { w: '', s: '', c: '', o: '', },

                frms: { tagCut: null, frames: new Set() },

                posS: { top: 0, left: 0, },
                posC: { top: 0, left: 0, height: 0, width: 0, },      // координаты скроллируемого
                posO: { top: 0, left: 0, height: 0, width: 0, right: 0, bottom: 0 },        // ПОТОМ УБРАТЬ за ненадобностьбю !!
            })

            this.name = name
            this.aO5s = {}      // списки aO5 в порядке удалённости с соттв. стороны  (т.е. от 'TLRB')
            this.fixs = {}      // состояние фиксированности по сторонам 'TLRB'
            for (const m of 'TLRB') {
                this.aO5s[m] = new Set()
                Object.freeze(this.aO5s[m])

                this.fixs[m] = { xO5: null, isP: '' }
                Object.seal(this.fixs[m])
            }

            for (const nam of [
                'posC', 'posO', 'posS', 'base', 'frms', 'margs', 'outln', 'cls', 
                'scops', 'hidden', 'attachss', 'canFixs', 'canCuts', 'tagCuts'
            ])
                if (this[nam]) Object.seal(this[nam])
                else
                    console.log("%c%s", fmtErr, this.name + ' (ошибка разработчика)', ` - в aO5 отсутствует '${nam}' `)

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

            const hasNoScaleRotate = HasNoScaleRotate(nst.transform)
            let z, s = ''
            if (hasNoScaleRotate) s = `задание трансформации: '${hasNoScaleRotate}';`
            if ((z = nst.position) !== 'static' && z !== 'relative') s += `позиционирование '${z}';`
            if ((z = nst.zoom) && !(z === "normal" || Number(z) === 1)) s += `задание zoom='${z}';`
            if (s)
                console.log("%c%s", fmtErr, this.name, ' - недопустимое ' + s)

            const
                t = nst.transform,
                xy = { x: 0, y: 0 }
            if (t && t !== 'none') {
                const m = t.match(/matrix\(([^)]+)\)/)
                if (m) {
                    const parts = m[1].split(',').map(Number)
                    Object.assign(xy, {
                        x: parts[4], // e
                        y: parts[5]  // f
                    })
                }
            }
            this.transform = { 
                p: nst.position, 
                x: xy.x, y: xy.y, 
                add: { x: 0, y: 0 }, 
                tac: { x: xy.x, y: xy.y },                 
            }

            const st = shp.style
            this.orig = {
                display: st.display,
                position: st.position,
                top: st.top, left: st.left, height: st.height, width: st.width,
            }

            Object.freeze(this.transform)
            Object.freeze(this.attachss)
            Object.freeze(this.orig)
            Object.freeze(this.aO5s)
            Object.freeze(this.fixs)
            Object.freeze(this)
        }
        #SetMargOutls(style, margs, outln) {
            Object.assign(style,
                { marginTop: margs.t, marginLeft: margs.l, marginRight: margs.r, marginBottom: margs.b },
                { outlineWidth: outln.w, outlineStyle: outln.s, outlineColor: outln.c, outlineOffset: outln.o }
            )
        }
        IsP(x, isP) {
            const fix = this.fixs[x]
            if (fix.xO5)
                if (fix.isP === isP)
                    return fix.xO5
                else return false
            else return null
        }
        DoFix(x, xO5) {
            const fixs = this.fixs
            let fold;
            // if (!xO5 && this.name==='shp1'){
            // console.log('0shp', this.shp.scrollTop, this.shp.scrollLeft); 
            // console.log('clon', this.act.clon.scrollTop, this.act.clon.scrollLeft); 
            // console.log('cart', this.act.cart.scrollTop, this.act.cart.scrollLeft); }
            if (x) {
                fold = fixs[x].xO5
                if (xO5)
                    Object.assign(fixs[x], { xO5: xO5, isP: xO5.constructor.name === 'PO5' })
                else
                    fixs[x].xO5 = null

                if (fold === xO5)
                    console.log("%c%s", fmtErr,
                        `DoFix ${this.name}: повтор 'fix' для  ${xO5 ? xO5.name : 'null'}[${x}]`)
            }
            else
                fixs.T.xO5 = fixs.L.xO5 = fixs.R.xO5 = fixs.B.xO5 = null

            const
                act = this.act,
                shp = this.shp,
                fix = fixs.T.xO5 || fixs.L.xO5 || fixs.R.xO5 || fixs.B.xO5,
                scroll = { scrollTop: shp.scrollTop, scrollLeft: shp.scrollLeft }

            // scroll = Object.assign({}, {scrollTop:shp.scrollTop, scrollLeft:shp.scrollLeft})

            if (o5debug) {
                const op = xO5 ? ((fold ? `пере` : '    ') + `фиксация на ${xO5.name}`) : `расфиксация`
                console.log(`DoFix ${this.name}: по [${x}] ` +
                    (x ? `${op} от ${act.isfix ? act.isfix.name : 'старт'}` : `полная расфиксация`))
            }

            if (act.isfix !== fix) {
                const
                    clon = act.clon || this.#Clone(),
                    cart = act.cart

                act.isfix = fix
                act.shdw = fix ? clon : shp
                cart.style.display = fix ? '' : 'none'
                clon.style.display = fix ? this.orig.display : 'none'

                act.observer.observe(fix ? clon : shp)
                act.observer.unobserve(fix ? shp : clon)

                if (fix) {
                    cart.appendChild(shp)
                    this.#SetMargOutls(shp.style, AO5.Margs, AO5.Outln)
                    Object.assign(shp.style, { position: 'absolute', top: 0, left: 0 })
                    shp.style.transform = `translate(0px, 0px)`
                }
                else {
                    Object.assign(shp.style, this.orig)
                    this.#SetMargOutls(shp.style, this.margs, this.outln)
                    this.parent.insertBefore(shp, cart)
                    const tac =this.transform.tac
                    shp.style.transform = `translate(${tac.x}px, ${tac.y}px)`

                    shp.style.zIndex = this.cls.zIndex	// исправить у тех, кто сдвигал
                }

                Object.assign(shp, scroll)
                // if (this.name==='shp1'){                
                // console.log(' shp', shp.scrollTop, shp.scrollLeft); 
                // }
                Object.assign(this.hidden, { T: 0, L: 0, R: 0, B: 0 })
                // Object.assign(this.forced, { T: 0, L: 0, R: 0, B: 0 })

                shp[(fix ? 'add' : 'remove') + 'EventListener']('dblclick', DblClick, true)
                window.dispatchEvent(new CustomEvent('o5_fixed', { detail: { aO5: this, fix: fix } }))
            }
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

            // if (this.name==='shp0' || this.name==='shp-demo'){
            // console.log('ShowFix(): '
            //      + ('' + posC.top).padStart(4)
            //      + (ytop > posC.top ? (' -' + (ytop - posC.top)) : '')
            // )
            // ytop = posC.top}
        }
        #Clone() {
            if (o5debug)
                console.log(`----------------- клонирую '${this.id}' -----------`)

            const
                shp = this.shp,
                act = this.act,
                id = shp.id,
                clon = act.clon = shp.cloneNode(true),
                cart = act.cart = document.createElement('div')

            clon.classList.add('olga5_clon')
            if (id) clon.id = id + '_clon'
            clon.aO5shp = this
            Object.assign(clon.style, {
                display: 'none',
                opacity: o5debug ? 0.22 : 0,
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
                transform: `translate(0px, 0px)`
            })
            shp.parentNode.insertBefore(cart, shp)

            this.#SetMargOutls(cart.style, AO5.Margs, this.outln)

            return clon
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [AO5])
})();
