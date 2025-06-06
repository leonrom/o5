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
     * - `SwitchObserve(aO5, on)` — включение/отключение наблюдения.
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
     * Включает или отключает наблюдение за элементом.
     * @function SwitchObserve
     * @param {Object} aO5 - Объект наблюдения (обёртка над DOM-элементом).
     * @param {boolean} on - Флаг: true — включить, false — выключить.
     */
    const SwitchObserve = (aO5, on) => {
        const name = aO5.a_name
        if (on) {
            if (observes.includes(aO5))
                console.log("%c%s", fmtErr, `SwitchObserve`, ` добавление повторно '${name}`)
            else {
                observes.push(aO5)
                observ.observe(aO5.shp)

                if (o5debug)
                    console.log("%c%s", fmtOK, `SwitchObserve`, ` добавлен '${name}`)
            }
        }
        else {
            const i = observes.indexOf(aO5)
            if (i < 0)
                console.log("%c%s", fmtErr, `SwitchObserve`, ` удаление отсутствующего sw.off='${name}`)
            else {
                observ.unobserve(aO5.shp)
                observes.splice(i, 1)
                if (observes.length === 0) {
                    observ.disconnect()
                    observ = null
                }
                if (o5debug)
                    console.log("%c%s", fmtOK, `SwitchObserve`, ` удален '${name}' ` +
                        (observes.length ? `осталось на обозрении = ${observes.length}` : `обозреватель ВЫКЛЮЧЕН`)
                    )
            }
        }
    };

    /**          
     * @function DebugShowRez
     * показ контейнеров для aO5 при отладке
         */
    const DebugShowRez = aO5 => {
        const rez = []
        for (const p of aO5.parent.pO5.pOuts) {
            rez.push({
                p: p.name,
                pOuts: Array.from(p.pOuts),
                pIncs: Array.from(p.pIncs),
                aAlls: Array.from(p.aAlls),
            })
        }
        C.ConsoleInfo(` Обработанные контейнеры для ${aO5.a_name}`, rez.length, rez)

        const pbase = aO5.act.pbase,
            scrollPs = Array.from(pbase.scrollPs),
            s = scrollPs.map(p => p.name).join(', ')
        C.ConsoleInfo(` База для ${aO5.a_name} => ${aO5.act.pbase.pbO5.name}`, s)
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
            CreatePrevPO5 = prev => {
                let pO5 = prev.pO5, ps;

                if (!pO5){
                    pO5 = new wshp.PO5shp.PO5(prev)

                    pO5.pOuts.add(pO5)          // первым - самого себя!

                    if (prev.nodeName !== 'BODY')
                        ps = CreatePrevPO5(prev.parentElement)
                }

                if (ps)
                    for (const p of ps)
                        pO5.pOuts.add(p)

                Object.freeze(pO5.pOuts)
                return pO5.pOuts
            },
            GetPBase = pO5 => {
                let pbase = wshp.PBase.pbases.get(pO5)

                if (!pbase) {
                    pbase = new wshp.PBase(pO5)
                    wshp.PBase.pbases.set(pO5, pbase)
                }
                return pbase
            }

        CreatePrevPO5(aO5.parent)

        let pbase = aO5.act.pbase
        const pIncs = new Set()
        for (const pO5 of aO5.parent.pO5.pOuts) {
            pO5.aAlls.add(aO5)

            if (pO5.scrls.H || pO5.scrls.V) {
                if (!pbase)
                    pbase = aO5.act.pbase = GetPBase(pO5)
                pbase.scrollPs.add(pO5)
            }

            for (const pInc of pIncs)
                pO5.pIncs.add(pInc)

            pIncs.add(pO5)
        }

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
        for (const entry of entries)
            if (entry.isIntersecting) {
                const shp = entry.target
                if (!shp.aO5shp) {  // вообще-то можно и не проверять....
                    const
                        aO5 = CreateAO5(shp),
                        el = observ.getel(shp)

                    wshp.DoResize.PBase.FindBase(aO5)
                    wshp.Frames.ReadAttrs(aO5, el.quals)
                    wshp.Boards.FindBords(aO5)
                }
                observ.unobserve(shp)

                if (!wshp.tLastScroll) {
                    wshp.tLastScroll = performance.now()  // пересчитываетс в DoScroll
                    C.E.AddEventListener('scroll', wshp.DoScroll.EveScroll, { couldRepeat: true })
                }
            }
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
