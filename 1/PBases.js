/* global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/PBases ---
    "use strict"

    let wshp, ibase = 0

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
        #aO5s = []
        constructor(pO5) {
            this.pO5 = pO5
            this.idn = PBase.#idn++
            this.aO5s = { T: null, L: null, R: null, B: null }      // все эти будут проверяться на "натыкание"

            this.pOuts = {}               // упорядоченные внешние (скроллируемые) конейнеры
            for (const x of 'TLRB')
                this.pOuts[x] = [...pO5.pOuts]

            this.tagsIn= []

            Object.freeze(this.pOuts)
            Object.freeze(this)

            PBase.#pbases.set(pO5, this)
        }
        ReorderAO5s() {
            for (const aO5 of this.#aO5s)
                aO5.CalcCurPos()

            for (const m of 'TLRB') {
                this.#aO5s.sort((a1, a2) => {   // по возрастанию
                    switch (m) {
                        case 'T': return a1.posO.top - a2.posO.top;
                        case 'L': return a1.posO.left - a2.posO.left;
                        case 'R': return (a2.posO.left + a2.posO.width) - (a1.posO.left + a1.posO.width);
                        case 'B': return (a2.posO.left + a2.posO.width) - (a1.posO.left + a1.posO.width);
                    }
                })
                this.aO5s[m] = new Set(this.#aO5s)

                // if (o5debug > 1)
                //     console.log(`${this.idn}=${this.pO5.name}[${m}]: ${Array.from(this.aO5s[m]).map(a => a.a_name).join(',')}`)
            }
        }
        Add(bO5, aO5) {
            const pBase = this
            Object.assign(aO5.base, { bO5, pBase })
            if (!pBase.#aO5s.includes(aO5))
                pBase.#aO5s.push(aO5)
        }
        static Attach(aO5) {
            let bO5, pTop, newPs = 0;
            const SetbO5 = pO5 => {
                if (!bO5) bO5 = pO5
                else
                    pO5.pIncs.add(pTop)

                for (const pOut of bO5.pOuts)
                    pOut.pOuts.add(pO5)

                pTop = pO5
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
            } while (!found && tag && tag.nodeName !== 'HTML')

            // подключаем (и создаём) pbase
            const
                pBase = PBase.#pbases.get(bO5) || new PBase(bO5)   // там же и set()

            for (const pOut of bO5.pOuts)
                pOut.pBases.add(pBase)

            pBase.Add(bO5, aO5)
            // Object.assign(aO5.base, { bO5, pBase })
            // if (!pBase.aaO5s.includes(aO5))
            //     pBase.aaO5s.push(aO5)

            return newPs
        }
        // делаем класс итерируемым
        static *[Symbol.iterator]() {
            for (const [pO5, pBase] of this.#pbases.entries()) {
                yield { pO5, pBase };
            }
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [PBase])
})();