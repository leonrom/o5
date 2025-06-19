/* global window, document, console, CustomEvent */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/PO5shp ---11
    "use strict"
    let wshp, nst;
    const
        olga5_modul = "o5shp",
        modulname = 'PO5shp',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmtErr = "background: yellow; color: black;",
        fmtOK = "background: aquamarine; color: black;",
        scroll = {
            last: { sV: 0, sH: 0, rV: 0, rH: 0, pO5: null, top: 0, left: 0, height: 0, width: 0, time: 0 },
            dm: { V: 2, H: 2, dt: 100 },
            Act: (el, typ) => {
                const
                    pO5 = el.pO5,
                    sl = scroll.last

                if (sl.pO5 && sl.pO5 !== pO5) { // заканчиваю предыдущую цепочку скроллингов
                    if (o5debug > 2)
                        console.log("%c%s", fmtErr, `scroll ${sl.pO5.id}: `, ' закончил!')

                    Object.assign(sl.pO5.actScroll, { top: sl.top, left: sl.left, height: 0, width: 0, time: sl.time })
                    wshp.DoChgs.MakeScroll(sl.sV || sl.rV, sl.sH || sl.rH, sl.pO5)
                    sl.pO5 = null
                }

                const
                    dm = scroll.dm,
                    acs = pO5.actScroll,
                    now = performance.now(),
                    dt = now - acs.time >= dm.dt,
                    sV = el.scrollTop - acs.top,
                    sH = el.scrollLeft - acs.left,
                    rH = el.clientWidth - acs.width,
                    rV = el.clientHeight - acs.height

                if (
                    (sV !== 0 && (Math.abs(sV) >= dm.V || dt)) ||
                    (sH !== 0 && (Math.abs(sH) >= dm.H || dt)) ||
                    (rV !== 0 && (Math.abs(rV) >= dm.V || dt)) ||
                    (rH !== 0 && (Math.abs(rH) >= dm.H || dt))
                ) {
                    if (o5debug > 2)
                        console.log("%c%s", fmtErr, `scroll ${pO5.id}: `, typ === 'S' ? 'скроллинг' : 'размеры'
                            `sV=${sV}, sH=${sH}, rV=${rV}, rH=${rH},- sT=${el.scrollTop}, aT=${acs.top}, sL=${el.scrollLeft}, aL=${acs.left}, `
                        )

                    Object.assign(acs, { top: el.scrollTop, left: el.scrollLeft, width: el.clientWidth, height: el.clientHeight, time: now })
                    wshp.DoChgs.MakeScroll(
                        typ === 'S' ? sV : (rV ? 0.1 : 0),
                        typ === 'S' ? sH : (rH ? 0.1 : 0),
                        pO5
                    )
                    sl.pO5 = null
                }
                else
                    Object.assign(sl, { sV, sH, rV, rH, pO5, top: el.scrollTop, left: el.scrollLeft, height: el.clientHeight, width: el.clientWidth, time: now })
            },
            Scroll: e => {
                const el = e.target.pO5 ? e.target : document.body
                scroll.Act(el, 'S')
            },
            Resize: entries => {
                for (const e of entries) {
                    const el = e.target.pO5 ? e.target : document.body
                    scroll.Act(e.target, 'R')
                    el.pO5.CalcScrollScope()
                }
            }
        },
        ro = new ResizeObserver(scroll.Resize)

    class PO5 {
        static #finalClasses = ['olga5_shp', 'overview-content', 'viewitem-panel']
        constructor(tag) {
            if (tag.pO5)
                C.ConsoleAlert(`Повтор создания 'pO5' для контейнера id='${tag.id}' [${tag.className.trim()}]`)

            const
                pO5 = this,
                ibody = tag.nodeName == 'BODY',
                classList = Array.from(tag.classList),
                el = ibody ? tag.parentElement : tag

            tag.pO5 = pO5

            nst = window.getComputedStyle(tag)
            Object.assign(pO5, {
                id: tag.id,
                tag: tag,
                name: C.MakeObjName(tag),
                classOrigs: classList,
                ibody: ibody,
                final: ibody || PO5.#finalClasses.find(cls => classList.includes(cls)),
                // base: { pbase: null }, // (все pO5) ссылка на ближайший внешний скроллируемый контейнер
                pOuts: new Set(),  //  (все pO5) список внешних скроллируемых контейнеров
                pIncs: new Set(),  //  (скроллируемые pO5) список вложенных скроллируемых контейнеров 
                aAlls: new Set(),  // (скроллируемые pO5) список всех 'своих' подвисабельных тегов
                borders: {
                    top: parseFloat(nst.borderTopWidth),
                    left: parseFloat(nst.borderLeftWidth),
                    right: parseFloat(nst.borderRightWidth),
                    bottom: parseFloat(nst.borderBottomWidth),
                    bgColor: nst.backgroundColor
                },
                scrls: {
                    H: this.ibody || nst.overflow === 'auto' || nst.overflowX === 'auto' || nst.overflow === 'scroll' || nst.overflowX === 'scroll',
                    V: this.ibody || nst.overflow === 'auto' || nst.overflowY === 'auto' || nst.overflow === 'scroll' || nst.overflowY === 'scroll',
                },
                actScroll: {// координаты и время последнего  скроллинга  actResize
                    time: -9999,
                    top: el.scrollTop,
                    left: el.scrollLeft,
                    height: el.clientHeight,
                    width: el.clientWidth
                },
                visis: { T: {}, L: {}, R: {}, B: {} },  // видимые границы 
                scops: { T: 0, L: 0, R: 0, B: 0 },  //  текущие границы
                schgs: { T: 0, L: 0, R: 0, B: 0 },  // изменение границ от предыдущего
            })
            // добавляю сам себя
                        pO5.pOuts.add(pO5)
                        pO5.pIncs.add(pO5)

            for (const x of 'TRLB') {
                pO5.visis[x] = { p: null, v: NaN }
                Object.seal(pO5.visis[x])
            }

            for (const nam of ['aAlls', 'pOuts', 'pIncs', 'scops', 'schgs', 'visis', 'scrls', 'actScroll'])
                if (pO5[nam])
                    Object.seal(pO5[nam])
                else
                    console.log("%c%s", fmtErr, `в pO5 отсутствует '${nam}'`)

            Object.freeze(pO5.borders)
            Object.freeze(pO5.visis)
            Object.freeze(pO5.scrls)
            Object.freeze(this)

            if (pO5.scrls.H || pO5.scrls.V) {
                ro.observe(el)
                el.addEventListener('scroll', scroll.Scroll)
            }

            if (o5debug > 1)
                console.log(`PO5 создано ${pO5.name}`)
        }
        name = ''    // еще и тут - чтобы сразу видеть в отладчике
        CalcScrollScope() {   // видимост,- пересчитывается при скроллине в DoChgs
            const
                pO5 = this,
                tag = pO5.tag,
                de = document.documentElement,
                isBody = tag.nodeName === 'BODY',
                p = isBody ?
                    { top: 0, left: 0, right: de.clientWidth, bottom: de.clientHeight } :
                    tag.getBoundingClientRect(),
                w = isBody ? de.clientWidth : tag.clientWidth,
                h = isBody ? de.clientHeight : tag.clientHeight,

                b = pO5.borders,
                atTo = tag.clientTop > b.top,         // полоса - вверху
                atLe = tag.clientLeft > b.left,       // полоса - слев       
                scrW = tag.offsetWidth - tag.clientWidth - b.left - b.right,
                scrH = tag.offsetHeight - tag.clientHeight - b.top - b.bottom,

                r = {
                    T: p.top + b.top + (atTo ? scrH : 0),
                    L: p.left + b.left + (atLe ? scrW : 0),
                    R: p.left + w,
                    B: p.top + h
                },
                sc = pO5.scops

            Object.assign(pO5.schgs, { T: r.T - sc.T, L: r.L - sc.L, R: r.R - sc.R, B: r.B - sc.B })
            Object.assign(pO5.scops, r)

            for (const x of 'TLRB')
                Object.assign(pO5.visis[x], { p: pO5, v: pO5.scops[x] })
        }
    }

    // window.addEventListener('scroll', scroll.Act)
    wshp = C.AddModuleSub(olga5_modul, modulname, [PO5])
})();
