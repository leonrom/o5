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
        o5debug = C.consts.o5debug,
		opp = { T: 'B', L: 'R', R: 'L', B: 'T' }
    /**
    * база - скроллируемый контейнер, содержащий общую информацию для подвисабельных объектов
    */
    class PBase {
        static #pbases = new Map()
        static #idn = 0
        tagCuts = new Set()
        aAll = []

        constructor(pO5) {
            this.pO5 = pO5
            this.idn = PBase.#idn++
            // this.tagsIn = new Set()
            this.bordss = { // въезжание вложенных контейнеров
                T: [pO5], L: [pO5], R: [pO5], B: [pO5],
            }
            this.bChgs = { // въезжание вложенных контейнеров
                // time: -1, 
                start: true,
                T: 0, L: 0, R: 0, B: 0,
            }

            for (const nam of ['bChgs'])
                Object.seal(this[nam])

            this.bO5s = {}  // списки тех, кто может наткнуться НА этого aO5
            for (const m of 'TLRB') {
                this.bO5s[m] = new Set()
                Object.freeze(this.bO5s[m])
            }

            Object.freeze(this.bordss)
            Object.freeze(this)

            PBase.#pbases.set(pO5, this)
        }
        static #sorters = {   // по возрастанию
            T: (a1, a2) => a1.posO.top - a2.posO.top,
            L: (a1, a2) => a1.posO.left - a2.posO.left,
            R: (a1, a2) => (a2.posO.left + a2.posO.width) - (a1.posO.left + a1.posO.width),
            B: (a1, a2) => (a2.posO.top + a2.posO.height) - (a1.posO.top + a1.posO.height),
        }
        CalcCurPozs() {
            for (const aO5 of this.aAll) {
                const p = aO5.act.shdw.getBoundingClientRect()
                Object.assign(aO5.posO, { top: p.top, left: p.left, height: p.height, width: p.width, right: p.right, bottom: p.bottom })
                Object.assign(aO5.posC, { top: p.top, left: p.left, height: p.height, width: p.width })
                Object.assign(aO5.posS, { top: 0, left: 0 })
            }
        }
        ReorderAO5s() {
            this.CalcCurPozs()

            for (const m of 'TLRB') {
                this.aAll.sort(PBase.#sorters[m])

                this.bO5s[m].clear()
                for (const aO5 of this.aAll) {
                    aO5.aO5s[m].clear()

                    const aO = aO5.posO
                    let i = this.aAll.indexOf(aO5)
                    while (++i < this.aAll.length) {
                        const iO5 = this.aAll[i],
                            iO = iO5.posO
                        if (
                            ('TB'.includes(m) && (iO.right < aO.left || iO.left > aO.right)) ||
                            ('LR'.includes(m) && (iO.bottom < aO.top || iO.top > aO.bottom))
                        )
                            continue

                        aO5.aO5s[m].add(iO5)
                    }
                    this.bO5s[m].add(aO5)
                }
            }
        }
        #Add(bO5, aO5) {
            const pBase = this

            Object.assign(aO5.base, { bO5, pBase })
            if (!pBase.aAll.includes(aO5))
                pBase.aAll.push(aO5)
        }
        static AddToBase(aO5) {
            let bO5, pTop, newPs = 0;
            const SetbO5 = pO5 => {
                if (!bO5) bO5 = pO5

                for (const pOut of bO5.pOuts)
                    pOut.pOuts.add(pO5)
                // pOut.tagsOut.add(pO5.tag)


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

            pBase.#Add(bO5, aO5)

            return newPs
        }
		static SetBorders  (x, pcO5) {
			for (const m of [x, opp[x]]) {
				const isTL = 'TL'.includes(m)

				for (const pBase of pcO5.pBases) {
					const
						pbO5 = pBase.pO5,
						bords = pBase.bordss[m]
					let chg = ''
					if (pbO5.scops.isVisible) {
						const vb = pbO5.scops[m]

						for (const pOut of pbO5.pOuts) {
							if (pOut === pbO5)
								continue

							const
								v = pOut.scops[m],
								iOut = bords.indexOf(pOut),
								inside = isTL ? vb < v : vb >= v

							// chg: либо было пересечение а теперь стало внутри; либо пересечения не было а вышло из внутри
							if (iOut >= 0) {
								if (!inside) {
									chg = `"удалил  '${pOut.name}'"`
									bords.splice(iOut, 1)
								}
							}
							else
								if (inside) {
									let i = bords.length
									while (i-- > 0)
										if (isTL ? bords[i].scops[m] >= v : bords[i].scops[m] < v)
											break

									bords.splice(i, 0, pOut)
                                    chg = `"добавил '${pOut.name}'"`
								}
						}
						// не вылезла ли граница за пределы?
						if (!chg) {
							let v, i = 1, vi = bords[0].scops[m]
							while (!chg && i < bords.length) {
								v = vi
								vi = bords[i++].scops[m]
								if (isTL ? v < vi : v >= vi)
                                    chg = `"изменил '${bords[i].name}'"`
							}
						}

						if (chg)
							bords.sort((b1, b2) =>	 // по возрастанию						
								isTL ? (b2.scops[m] - b1.scops[m]) : (b1.scops[m] - b2.scops[m]))
					}
					pBase.bChgs[m] = chg

					if (o5debug > 1 && chg) 
							console.log(
								`скролл. ${pcO5.name} по [${m}] для ${pBase.pO5.id} '${chg}'   ` +
								`${pBase.bordss[m].map(b => b.name + ':' + ('' + b.scops[m]).padStart(4)).join(', ')}`
							)
				}
			}
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