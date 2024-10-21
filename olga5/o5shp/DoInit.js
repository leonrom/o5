/* global window, document, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {              // ---------------------------------------------- o5shp/DoInit ---
    "use strict"
    // let debugids = []  // 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'        

    const
        olga5_modul = "o5shp",
        // modulname = 'DoInit',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        Observe0 = (entries, obsrv0) => {
            /*
            инициализация подвисабельных обектов по мере их ПОЛНОГО появления на экране
            когда все буду инициализированы - отключаем
            */
            const
                fmt = "background: aquamarine; color: black;"
            // CalcLevel = (aO5, level) => {
            //     const bords = aO5.ofram.bords,
            //         xO5 = bords[bords.length - 1].aO5shp
            //     if (xO5)
            //         CalcLevel(xO5, ++level)
            //     return level
            // }

            for (const entry of entries) {
                if (entry.isIntersecting) {
                    const
                        shp = entry.target

                    shp.aO5shp2.top = entry.boundingClientRect.top

                    const
                        aO5 = wshp.AO5shp(shp),
                        top = shp.aO5shp2.top // aO5.cls.top

                    // aO5.act.level = CalcLevel(aO5, 0)

                    let i = wshp.aO5s.length
                    while (i-- > 0)
                        if (wshp.aO5s[i].shp.aO5shp2.top < top)
                            break

                    wshp.aO5s.splice(i + 1, 0, ...[aO5]) // aO5s.push()
                    const zIndex = wshp.W.consts.o5zindex + 1
                    for (let i = 0; i < wshp.aO5s.length; i++) {
                        const aO5 = wshp.aO5s[i]
                        // aO5.cls.zIndex = zIndex + i
                        if (!aO5.shp.style.zIndex)
                            aO5.shp.style.zIndex = zIndex + i
                    }

                    wshp.PO5shp(aO5) // найти контейнерах ofram  и  owner     

                    wshp.Boards(aO5) // найти в контейнерах ofram  и  owner       

                    obsrv0.unobserve(shp)

                    const noact = wshp.shps.find(shp => !shp.aO5shp)
                    if (!noact)
                        obsrv0.disconnect()

                    if (o5debug > 0) {
                        console.log("%c%s", fmt,
                            `обработал`,
                            ` '${aO5.name.padEnd(12)}' (видно ${parseFloat(entry.intersectionRatio).toFixed(2)}) `
                        )
                        if (o5debug > 1)
                            C.Debug.ShowShpBords()

                        if (!noact)
                            console.log("%c%s", fmt, `конец первичного обосрения: obsrv0.disconnected (все shp обработаны)!`)
                    }
                }
            }
        },
        DoInit = () => {
            const
                mtags = C.SelectByClassName(wshp.W.class, olga5_modul),
                obsrv0 = new IntersectionObserver(Observe0, {
                    root: null,
                    rootMargin: '0px',
                    threshold: 0,
                })

            // obsrv0.pO5 = { n: mtags.length }

            for (const mtag of mtags) {
                const shp = mtag.tag

                shp.aO5shp2 = { quals: mtag.quals, top: 0 }
                obsrv0.observe(shp)
                wshp.shps.push(shp)
            }

            const hash = C.save.hash
            if (hash) { // делать именно когда загружен документ (например - тут)
                const tag = document.getElementById(hash)
                if (tag) tag.scrollIntoView({ alignToTop: true, block: 'start', behavior: "auto" })
                else
                    C.ConsoleError(`Неопределён hash= '${hash}' в адресной строке`)
            }

            mtags.splice(0, mtags.length)
        },
        wshp = C.ModulAddSub(olga5_modul, DoInit)

    wshp.shps = [] // это ВСЕ подвисабельные
    wshp.aO5s = [] // это инициированные подвисабельные
})();

