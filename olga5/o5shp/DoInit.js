/* -global window, document, console */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {              // ---------------------------------------------- o5shp/DoInit ---
    "use strict"
    // let debugids = []  // 'shp_text' // 'shp_1÷4' // 'shp-demo' // 'shp_text'        

    const
        olga5_modul = "o5shp",
        modulname = 'DoInit',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        Observe = (entries, observer) => {
            /*
            инициализация подвисабельных обектов по мере их ПОЛНОГО появления на экране
            когда все буду инициализированы - отключаем
            */
            const fmt = "background: aquamarine; color: black;"

            for (const entry of entries) {
                if (entry.isIntersecting) {

                    const shp = entry.target,
                        aO5 = wshp.AO5shp(shp, shp.aO5quals)

                    if (!aO5.prev.pO5)  // сделать цепочку контейнеров 
                        wshp.PO5shp(aO5)

                    wshp.Boards(aO5) // найти в контейнерах ofram  и  owner       

                    observer.unobserve(shp)

                    if (!wshp.aO5s.includes(aO5))
                        wshp.aO5s.push(aO5)

                    if (wshp.aO5s.length === observer.pO5.n)
                        observer.disconnect()

                    if (o5debug > 0) {
                        console.log("%c%s", fmt,
                            `обработал '${aO5.name}' (видно ${parseFloat(entry.intersectionRatio).toFixed(2)}) `
                            // `  включено в ${aO5.owner.bord.pO5.name}, виснет на ${aO5.ofram.bord.pO5.name} `
                        )
                        C.Debug.ShowShpBords()

                        if (wshp.aO5s.length === observer.pO5.n)  
                            console.log("%c%s", fmt, `конец первичного обосрения: observer.disconnected !` )
                    }
                }
            }
        },
        DoInit = () => {
            const
                mtags = C.SelectByClassName(wshp.W.class, olga5_modul),
                observer = new IntersectionObserver(Observe, {
                    root: null,
                    rootMargin: '0px',
                    threshold: [1],
                })

            observer.pO5 = { n: mtags.length }
            for (const mtag of mtags) {
                const shp = mtag.tag
                shp.aO5quals = mtag.quals
                observer.observe(shp)
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
        wshp = C.ModulAddSub(olga5_modul, modulname, DoInit)

    Object.assign(wshp, {
        name: modulname,
        aO5s: [],
    })
})();

