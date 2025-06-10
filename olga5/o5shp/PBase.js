/* global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/PBase ---
    "use strict"

    let wshp, observ;

    const
        olga5_modul = "o5shp",
        modulname = 'Base',
        C = window.olga5.C,
        o5debug = C.consts.o5debug
    /**
* база - скроллируемый контейнер, содержащий общую информацию для подвисабельных объектов
*/
    class PBase {
        constructor(pO5) {
            this.pO5 = pO5
            this.baO5s = new Set()     // все эти будут проверяться на "натыкание"
            this.bframes = new Map()   // mO5s = new wshp.Map()

            this.act = {
                time: 0,          // только для DoChgs
            }

            Object.seal(this)
            Object.seal(this.act)

            Object.freeze(this)

            PBase.pbases.set(pO5, this)
        }
        static pbases = new Map()
        Attach(aO5) {
            // ищу ближайший контейнер с рамкой или отличным фоном             
            const
                CurColor = pO5 => {
                    if (pO5 && pO5.color !== 'transparent' && pO5.color !== 'rgba(0, 0, 0, 0)')
                        return pO5.color
                },
                FindNearest = pOuts => {
                    for (const pOut of pOuts) {
                        const b = pOut.borders
                        if (b.top || b.left || b.right || b.bottom)
                            return pOut
                        else {
                            const pNex = pOut.tag.parentElement.pO5
                            if (!pNex)
                                return pOut

                            const curColor = CurColor(pOut)
                            if (curColor && curColor !== CurColor(pNex))
                                return pOut
                        }
                    }
                }

            // подключаем (и создаём) pbase
            const
                pO5 = FindNearest(aO5.pOuts),
                pbase = PBase.pbases.get(pO5) || new PBase(pO5)

            Object.assign(aO5.base, { pO5, pbase })
        }      
        AddFrame(frame)  {

        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [Attach, AddFrame])
})();