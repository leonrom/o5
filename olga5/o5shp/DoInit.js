/* global window, console, IntersectionObserver */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
(function () {
    "use strict"

    /**
     * @module o5shp/DoInit
     * Инициализация скроллируемых объектов.
     *
     * Содержит функции:
     * - `Observe(entries)` — обработка появления элементов в области видимости.
     * - `Init()` — первичная инициализация обсерверов.
     */
    let observ;

    const
        olga5_modul = "o5shp",
        modulname = 'DoInit',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmtOK = "background: blue; color: white;",
        fmtErr = "background: yellow; color: black;",
        observes = [];

    /**          
     * Демонстрация главной фишки динамическоо создания aO5
     * @function DebugShowRez
     * контейнеры для aO5,- обрабатываются только "новые" контейнеры,
     * а инфа из уже обработанных просто переписывается
         */
    const DebugShowRez = aO5 => {
        const rez = []
        let prev = aO5.parent
        do {
            const pO5 = prev.pO5
            rez.push({
                pO5: pO5.name,
                scrl: (pO5.scrls.H ? 'H' : '') + (pO5.scrls.V ? 'V' : ''),
                pOuts: (Array.from(pO5.pOuts)).map(pO5 => pO5.name).join(', '),
                pIncs: (Array.from(pO5.pIncs)).map(pO5 => pO5.name).join(', '),
                aOwns: (Array.from(pO5.aOwns)).map(a => a.a_name).join(', '),
                // aAlls: (Array.from(pO5.aAlls)).map(a => a.a_name).join(', '),
            })
            if (prev.pO5.ibody)
                break
            else
                prev = prev.parentElement
        } while (true)
        const name = aO5.base.pO5 ? aO5.base.pO5.name : '?'
        C.ConsoleInfo(`Контейнеры для ${aO5.a_name} в base=${name}`, rez.length, rez)
    };

    /**          
     * создать aO5 и прописать его во все вышестоящие контейнеры
     * выполняется однократно для каждого обнаруживаемого (нового) aO5
     * @function CreateAO5
     * создаются/дополняются pO5 во всех обрамляющих контейнерах содержащих контейнер prev
     * @function CreatePrevPO5
     */
    const CreateAO5 = shp => {
        const
            aO5 = new wshp.AO5shp.AO5(shp),
            parent = aO5.parent,
            pIncs = [],
            FindPScrolls = (aO5, prev) => {
                let pO5 = prev.pO5, next, scrl;

                if (!pO5) {
                    pO5 = new wshp.PO5shp.PO5(prev)

                    if (!pO5.ibody) {
                        next = prev.parentElement

                        console.log(`FindPScrolls next=${next.id}`)
                        FindPScrolls(aO5, next)
                    }
                }

                console.log(`FindPScrolls next=${next ? next.id : '  - '}  prev=${prev.id}  pO5=${pO5.name}`)

                if (next)
                    for (const o5 of next.pO5.pOuts)
                        pO5.pOuts.add(o5)
            },
            FillScrollableIncs = pOuts => {
                for (const pO5 of pOuts)
                    if (pO5.scrls.H || pO5.scrls.V) {
                        let j = pIncs.length
                        while (j-- > 0)
                            pO5.pIncs.add(pIncs[j])
                        
                        pIncs.push(pO5)
                    }
            }

        if (!parent.pO5)
            FindPScrolls(aO5, parent)

        FillScrollableIncs(aO5.parent.pO5.pOuts)

        wshp.PBases.PBase.Attach(aO5)

        aO5.base.pO5.aOwns.add(aO5)
        // for (const p of aO5.base.pO5.pOuts)
        //     p.aAlls.add(aO5)

        if (o5debug > 1)
            DebugShowRez(aO5)

        return aO5
    };

    /**
     * Обработчик событий от IntersectionObserver.
     * Создаёт aO5 для 'увиденного' элемента и отключает его наблюдение.
     * запускает прослушиватель 'scroll
     * @function Observe
     * @param {IntersectionObserverEntry[]} entries - Список наблюдаемых пересечений.
     */
    const Observe = entries => {
        let isi;
        for (const entry of entries)
            if (entry.isIntersecting) {
                isi = true
                const shp = entry.target
                if (!shp.aO5shp) {  // вообще-то можно и не проверять....
                    const
                        aO5 = CreateAO5(shp),
                        el = observ.getel(shp)

                    wshp.Frames.Frame.ReadAttrs(aO5, el.quals)
                }
                observ.unobserve(shp)

                // wshp.DoChgs.ActListener(true)
            }
        // if (isi)
        //     wshp.DoChgs.MakeScroll(0.1, 0.1, body)
    };

    /**
     * создаёт наблюдателя за элементами
     * @function CreateObserver
     */
    function CreateObserver(options) {
        const state = {
            observer: null,
            elements: new Set,
        }

        state.observer = new IntersectionObserver(Observe, options)

        function getel(tag) {
            for (const el of state.elements)
                if (el.tag === tag)
                    return el
        }

        return {
            observe: (tag, quals) => {
                state.elements.add({ tag: tag, quals: quals.join(':') })
                state.observer.observe(tag)
            },
            unobserve: (tag) => {
                state.observer.unobserve(tag)
                const el = getel(tag)   // заменено!
                state.elements.delete(el)

                if (state.elements.length === 0) {
                    state.observer.disconnect()
                    state.observer = null
                    if (o5debug)
                        console.log("%c%s", fmtOK, `observe: `, ` отключено полностью`)
                }
            },
            getel, // экспортируем в объект
            get observedElements() {
                return Array.from(state.elements)
            },
        }
    }

    /**
     * Инициализирует список наблюдаемых элементов.
     * @function Init
     */
    const Init = () => {
        const mtags = C.SelectByClassName(wshp.W.class, olga5_modul)
        let found;

        for (const mtag of mtags) {
            if (
                !mtag.tag.classList.contains('o5shp_none') &&
                !mtag.quals.find(qual => !qual.includes('=') && qual.match(/n/i))
            ) {
                if (!observ)
                    observ = CreateObserver({
                        root: null,
                        threshold: [0, 1],
                        rootMargin: '0px',
                        trackVisibility: false,
                    })
                observ.observe(mtag.tag, mtag.quals)
                found = true
            }
        }

        if (!found)
            console.log("%c%s", fmtErr, `В тегах с классом 'olga5_Start' нет объектов '${wshp.W.class}' без class='o5shp_none' и квалификатора ':N'`)
    };

    const wshp = C.AddModuleSub(olga5_modul, modulname, [Init])
})();
