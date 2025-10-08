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
        aAll = []
        constructor(pO5) {
            this.pO5 = pO5
            this.idn = PBase.#idn++
            this.aO5s = { T: null, L: null, R: null, B: null }      // все эти будут проверяться на "натыкание"
            
            this.tagsIn = new Set()

            this.bordss = { // въезжание вложенных контейнеров
                T: [pO5], L: [pO5], R: [pO5], B: [pO5],
            }
            this.bChgs = { // въезжание вложенных контейнеров
                time:-1, T: 0, L: 0, R: 0, B: 0,
            }

            for (const nam of ['aO5s', 'bChgs'])
                Object.seal(this[nam])

            Object.freeze(this.bordss)
            Object.freeze(this)

            PBase.#pbases.set(pO5, this)
        }
        ReorderAO5s() {
            for (const aO5 of this.aAll)
                aO5.CalcCurPos()

            for (const m of 'TLRB') {
                this.aAll.sort((a1, a2) => {   // по возрастанию
                    switch (m) {
                        case 'T': return a1.posO.top - a2.posO.top;
                        case 'L': return a1.posO.left - a2.posO.left;
                        case 'R': return (a2.posO.left + a2.posO.width) - (a1.posO.left + a1.posO.width);
                        case 'B': return (a2.posO.left + a2.posO.width) - (a1.posO.left + a1.posO.width);
                    }
                })
                this.aO5s[m] = new Set(this.aAll)

                // if (o5debug > 1)
                //     console.log(`${this.idn}=${this.pO5.name}[${m}]: ${Array.from(this.aO5s[m]).map(a => a.a_name).join(',')}`)
            }
        }
        Add(bO5, aO5) {
            const
                pBase = this,
                fintag = pBase.pO5.tag

            Object.assign(aO5.base, { bO5, pBase })
            if (!pBase.aAll.includes(aO5))
                pBase.aAll.push(aO5)

            let tag = aO5.shp
            do {
                tag = tag.parentNode
                pBase.tagsIn.add(tag)
            } while (tag != fintag)
        }
        static Attach(aO5) {
            let bO5, pTop, newPs = 0;
            const SetbO5 = pO5 => {
                if (!bO5) bO5 = pO5

                for (const pOut of bO5.pOuts) {
                    pOut.pOuts.add(pO5)
                    pOut.tagsOut.add(pO5.tag)
                }

                if (pTop)
                    for (const pInc of pTop.pIncs)
                        pO5.pIncs.add(pInc)

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