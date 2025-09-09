/* global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/PBases ---
    "use strict"

    let wshp, observ, ibase = 0

    const
        olga5_modul = "o5shp",
        modulname = 'PBases',
        C = window.olga5.C,
        o5debug = C.consts.o5debug

    /**
    * база - скроллируемый контейнер, содержащий общую информацию для подвисабельных объектов
    */
    class PBase {
        static #pbases = new Map()
        static #idn = 0
        constructor(pO5) {
            this.idn = PBase.#idn++
            this.aO5s = new Set()      // все эти будут проверяться на "натыкание"

            this.pOuts = {}               // упорядоченные внешние (скроллируемые) конейнеры
            for (const x of 'TLRB')
                this.pOuts[x] = [...pO5.pOuts]

            Object.freeze(this.pOuts)
            Object.freeze(this)

            PBase.#pbases.set(pO5, this)
        }
        static Attach(aO5) {
            let bO5, newPs=0;
            const SetbO5 = pO5 => {
                if (!bO5) bO5 = pO5

                for (const pOut of bO5.pOuts)
                    pO5.pIncs.add(pOut)

                for (const p of pO5.pOuts)
                    for (const pOut of bO5.pOuts)
                        pOut.pOuts.add(pO5)
            }

            let nst, scrls, tag = aO5.parent, found = false
            do {
                if (tag.pO5) {               // уже был раньше создан
                    SetbO5(tag.pO5)
                    scrls = tag.pO5.scrls   // для отладочной печати
                    found = true
                }
                else {
                    nst = window.getComputedStyle(tag)
                    scrls = wshp.PO5shp.PO5.Scrls(tag, nst)
                    if (scrls.V || scrls.H) {
                        const pO5 = new wshp.PO5shp.PO5(tag, nst)
                        SetbO5(pO5)
                        newPs++
                    }
                }

                if (o5debug > 1)
                    console.log(`${aO5.a_name}: tag=${tag.id}, V=${scrls.V}, H=${scrls.H}. ${found ? ' === конец' : ''}`)

                tag = tag.parentNode
            } while (!found && tag)

            // подключаем (и создаём) pbase
            const
                pbase = PBase.#pbases.get(bO5) || new PBase(bO5)   // там же и set()

            for (const pOut of bO5.pOuts) {
                pOut.pBases.add(pbase)
                pOut.aO5s.add(aO5)
            }
            
            Object.assign(aO5.base, { bO5, pbase })
            pbase.aO5s.add(aO5)

            return newPs
        }
        // делаем класс итерируемым
        static *[Symbol.iterator]() {
            for (const [pO5, pbase] of this.#pbases.entries()) {
                yield { pO5, pbase };
            }
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [PBase])
})();