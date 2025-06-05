/* global window */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoResize ---
    "use strict"

    let wshp;
    const
        olga5_modul = "o5shp",
        modulname = 'DoResize',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        isResize = { act: false, time: 0, name: 'isResize' }

    class PBase {
        constructor(pbO5) {
            this.pbO5 = pbO5
            this.baO5s = new Set()     // все эти будут проверяться на "натыкание"
            this.bframes = new Set()   // mO5s = new wshp.Map()
            this.scrollPs = new Set()   // этот и скроллируемые "вышестоящиие" теги - обновляется в DoResize() 
            this.act = {
                tResize: -1,         // только для DoResize
                tScroll: 0,         // только для DoScroll
                // visible: false,     // чтобы не инициировало скроллинг при запуске
            }

            Object.seal(this)
            Object.seal(this.act)

            Object.freeze(this)

            PBase.pbases.set(pbO5, this)

            // FillScrollable(this, 0)
        }
        static pbases = new Map()
        static FindBase = aO5 => {
            /*
            поиск pbase - первого НЕ скроллируемого контейнера
            */
           const pO5 =aO5.parent.pO5
            let pbase = PBase.pbases.get(pO5)

            if (!pbase) {
                let pbO5 = pO5;
                for (const xO5 of pO5.pOuts) {
                    const
                        tag = xO5.tag,
                        style = getComputedStyle(tag),
                        isOverflowHidden =
                            style.overflow === 'hidden' &&
                            style.overflowX === 'hidden' &&
                            style.overflowY === 'hidden',
                        hasNoScroll =
                            tag.scrollWidth <= tag.clientWidth &&
                            tag.scrollHeight <= tag.clientHeight

                    if (!isOverflowHidden || !hasNoScroll) {
                        pbO5 = xO5
                        break
                    }
                }
                pbase = new PBase(pbO5)
            }

            aO5.act.pbase = pbase
        }
    }

    const
        Resize = async e => {
            const time = e.timeStamp

            if (!body.pO5 || !body.pO5.aAlls ||
                (isResize.act && (time - isResize.time) < 66)
            )
                return

            Object.assign(isResize, { act: true, time: time })

            for (const aO5 of wshp.allAO5s)
                wshp.Boards.FillScrollable(aO5, time)

            wshp.DoScroll.MakeScroll(time, 0.1, 0.1, body)

            isResize.act = false
        },
        OnResize = async e => {
            const name = await Resize(e)
        },
        Debounce = (func, delay) => {  // Функция для дебаунса    // function debounce(func, delay) {
            let timeout
            return function (...args) {
                clearTimeout(timeout)
                timeout = setTimeout(() => {// Вызываем функцию через задержку                    
                    func(...args) // при "стрелочной" декларации, а в общем =>  func.apply(this, args); 
                }, delay)
            }
        },
        DebouncedResize = Debounce(OnResize, 66)

    window.addEventListener('resize', DebouncedResize, true);

    wshp = C.AddModuleSub(olga5_modul, modulname, [isResize, PBase])
})();
