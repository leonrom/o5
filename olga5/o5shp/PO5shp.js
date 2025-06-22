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
                    pos = pO5.pos,
                    sl = scroll.last

                if (sl.pO5 && sl.pO5 !== pO5) { // заканчиваю предыдущую цепочку скроллингов
                    if (o5debug > 2)
                        console.log("%c%s", fmtErr, `scroll ${sl.pO5.id}: `, ' закончил!')

                    Object.assign(pos, { top: sl.top, left: sl.left, height: 0, width: 0, time: sl.time })
                    wshp.DoChgs.MakeScroll(sl.sV || sl.rV, sl.sH || sl.rH, sl.pO5)
                    sl.pO5 = null
                }

                const
                    dm = scroll.dm,
                    now = performance.now(),
                    dt = now - pos.time >= dm.dt,
                    sV = el.scrollTop - pos.top,
                    sH = el.scrollLeft - pos.left,
                    rH = el.clientWidth - pos.width,
                    rV = el.clientHeight - pos.height

                if (
                    (sV !== 0 && (Math.abs(sV) >= dm.V || dt)) ||
                    (sH !== 0 && (Math.abs(sH) >= dm.H || dt)) ||
                    (rV !== 0 && (Math.abs(rV) >= dm.V || dt)) ||
                    (rH !== 0 && (Math.abs(rH) >= dm.H || dt))
                ) {
                    if (o5debug > 2)
                        console.log("%c%s", fmtErr, `scroll ${pO5.id}: `, typ === 'S' ? 'скроллинг' : 'размеры'
                            `sV=${sV}, sH=${sH}, rV=${rV}, rH=${rH},- sT=${el.scrollTop}, aT=${pos.top}, sL=${el.scrollLeft}, aL=${pos.left}, `
                        )

                    Object.assign(pos, { top: el.scrollTop, left: el.scrollLeft, width: el.clientWidth, height: el.clientHeight, time: now })
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
                const time = performance.now()
                for (const e of entries) {
                    const el = e.target.pO5 ? e.target : document.body
                    scroll.Act(e.target, 'R')
                    el.pO5.CalcScrollScope(time)
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
                pos: { // позиции скроллинга, видимые границы , текущие границы,  изменение границ от предыдущего
                    time: -1,  
                    top: el.scrollTop,
                    left: el.scrollLeft,
                    width: el.clientWidth,   
                    height: el.clientHeight,  
                    scops: { T: 0, L: 0, R: 0, B: 0 },  
                    schgs: { T: 0, L: 0, R: 0, B: 0 },
                    visis: { T: { p: null, v: NaN }, L: { p: null, v: NaN }, R: { p: null, v: NaN }, B: { p: null, v: NaN } }
                }
            })
            // добавляю сам себя
            pO5.pOuts.add(pO5)
            pO5.pIncs.add(pO5)

            for (const nam of ['scops', 'schgs', 'visis'])
                Object.seal(pO5.pos[nam])

            for (const nam of ['aAlls', 'pOuts', 'pIncs', 'scrls',  'pos'])
                Object.seal(pO5[nam])

            Object.freeze(pO5.pos.visis)

            Object.freeze(pO5.borders)
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
        CalcScrollScope(time) {   // видимост,- пересчитывается при скроллине в DoChgs
            if (this.pos.time === time)
                return

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
                sc = pO5.pos.scops,
                pos = pO5.pos

            pos.time = time
            Object.assign(pos.schgs, { T: r.T - sc.T, L: r.L - sc.L, R: r.R - sc.R, B: r.B - sc.B })
            Object.assign(pos.scops, r)

            for (const x of 'TLRB')
                Object.assign(pos.visis[x], { p: pO5, v: pO5.pos.scops[x] })

            return true  // чтобы потом пересчитать aO5
        }
    }

    // window.addEventListener('scroll', scroll.Act)
    wshp = C.AddModuleSub(olga5_modul, modulname, [PO5])
})();
