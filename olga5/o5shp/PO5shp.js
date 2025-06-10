/* global window, document, console, CustomEvent */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */

(function () {              // ---------------------------------------------- o5shp/PO5shp ---11
    "use strict"
    let wshp;
    const
        olga5_modul = "o5shp",
        modulname = 'PO5shp',
        C = window.olga5.C,
        o5debug = C.consts.o5debug,
        fmtErr = "background: yellow; color: black;",
        fmtOK = "background: aquamarine; color: black;"

    class PO5 {
        static #finalClasses = ['olga5_shp', 'overview-content', 'viewitem-panel']
        constructor(tag) {
            if (tag.pO5)
                C.ConsoleAlert(`Повтор создания 'pO5' для контейнера id='${tag.id}' [${tag.className.trim()}]`)

            const
                pO5 = this,
                ibody = tag.nodeName == 'BODY',
                nst = window.getComputedStyle(tag),
                classList = Array.from(tag.classList)

            tag.pO5 = pO5

            Object.assign(pO5, {
                tag: tag,
                name: C.MakeObjName(tag),
                classOrigs: classList,
                ibody: ibody,
                final: ibody || PO5.#finalClasses.find(cls => classList.includes(cls)),
                base: { pO5: null, }, // (все pO5) ссылка на ближайший скроллируемый контейнер
                pOuts: new Set(),  //  (все pO5) список  скроллируемых контейнеров
                pIncs: new Set(),  //  (скроллируемые pO5) список вложенных скроллируемых контейнеров 
                aAlls: new Set(),  // (скроллируемые pO5) список всех подвисабельных тегов
                borders: {
                    top: parseFloat(nst.borderTopWidth),
                    left: parseFloat(nst.borderLeftWidth),
                    right: parseFloat(nst.borderRightWidth),
                    bottom: parseFloat(nst.borderBottomWidth),
                },
                scrls: {
                    H: nst.overflow === 'auto' || nst.overflowX === 'auto' || nst.overflow === 'scroll' || nst.overflowX === 'scroll',
                    V: nst.overflow === 'auto' || nst.overflowY === 'auto' || nst.overflow === 'scroll' || nst.overflowY === 'scroll',
                },
                actScroll: {
                    time: 0,
                    V: false, H: false,             // скроллируемость по верт. и гориз.
                    left: 0, top: 0, timcall: -1,   // координыты и время последнео  скроллинга
                },
                visis: { T: {}, L: {}, R: {}, B: {} },  // видимые границы 
                scops: { T: 0, L: 0, R: 0, B: 0 },  //  текущие границы
                schgs: { T: 0, L: 0, R: 0, B: 0 },  // изменение границ от предыдущего
            })

            // pO5.CalcScrollScope()

            for (const x of 'TRLB') {
                pO5.visis[x] = { p: null, v: NaN }
                Object.seal(pO5.visis[x])
            }

            for (const nam of ['aAlls', 'pOuts', 'pIncs', 'base', 'scops', 'schgs', 'visis', 'actScroll'])
                if (pO5[nam])
                    Object.seal(pO5[nam])
                else
                    console.log("%c%s", fmtErr, `в pO5 отсутствует '${nam}'`)

            Object.freeze(pO5.borders)
            Object.freeze(pO5.visis)
            Object.freeze(this)

            pO5.ActScroll()

            if (o5debug > 1)
                console.log(`PO5 создано ${pO5.name}`)
        }
        name = ''    // еще и тут - чтобы сразу видеть в отладчике

        // HasFixed() {
        //     for (const aO5 of this.aAlls)
        //         if (aO5.pFixs.fixed)
        //             return true
        // }
        ActScroll(time) {
            if (this.actScroll.time === time)
                return

            const
                tag = this.tag,
                r = this.borders
            Object.assign(this.actScroll, {
                time: time,
                timcall: -1,
                top: tag.scrollTop,
                left: tag.scrollLeft,
                V: this.ibody || tag.offsetWidth > tag.clientWidth + r.left + r.right,
                H: this.ibody || tag.offsetHeight > tag.clientHeight + r.top + r.bottom,
            })
        }
        IsInClass(clss) {
            const classOrigs = this.classOrigs
            if (classOrigs.length > 0) {
                for (const cls of clss)
                    if (cls && classOrigs.indexOf(cls) >= 0)
                        return true
            }
            else {
                if (clss.length === 0 || clss.find(cls => cls.trim().length == 0) != null)
                    return true
            }
        }
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
            Object.assign(sc, r)

            for (const x of 'TLRB')
                Object.assign(pO5.visis[x], { p: pO5, v: pO5.scops[x] })
        }
    }

    wshp = C.AddModuleSub(olga5_modul, modulname, [PO5])
})();
