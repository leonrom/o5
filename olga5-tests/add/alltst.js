/* global document, window, console */
/* exported shp_Init, Init0, Init1, Init2, Init3, Init4, CC2, CC3*/
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
function IsInitEvents() { // дублирование ядра
    "use strict"
    const curScript = document.currentScript || document.scripts[document.scripts.length - 1],
        CurScriptParams = function (cs) { // считывает все параметры скрипта,
            let m = cs.attributes.length
            const params = []
            while (--m >= 0) {
                const attr = cs.attributes[m]
                params[attr.name.toLowerCase()] = attr.value.trim()
            }
            return params
        },
        params = CurScriptParams(curScript),
        s_events = params.o5init_events

    if (typeof s_events === 'undefined') return true
    else if (s_events.trim().length > 0) return true
    else {
        window.alert("не задан 'o5init_events'")
        return false
    }
}

function shpX_SetWindow(w0, h0) {
    "use strict"
    if (window.name.indexOf('olga5_popup_') < 0) // если НЕ было открыто из родителя ---
        return

    const aw = window.screen.availWidth,
        ah = window.screen.availHeight,
        w = aw > w0 ? w0 : aw,
        h = ah > h0 ? h0 : ah

    window.resizeTo(w, h)
    window.moveTo(aw - w - 5, 5)
    console.log(`PopUp: w0=${w0}, aw=${aw}, w=${w}, aw - w=${aw - w}`)

    window.olga5.C.E.AddEventListener('beforeunload', function () {
        window.opener.postMessage(window.name, '*');
    })
    document.addEventListener('blur', function () {
        window.focus()
    })

    const show1 = '***',
        nam = window.document.title,
        focusTimer = window.setInterval(function () {
            try {
                window.document.title = (window.document.title == show1) ? nam : show1
            } catch (e) {
                console.log('Прекращено `focusTimer`, причина: ' + e.message);
                window.clearInterval(focusTimer);
            }
        }, 888)
    return true
}

function shpX_GetFrams(t, nom) {
    "use strict"
    const fbody = document.getElementById(t + 'body' + nom),
        fshp0 = document.getElementById(t + 'shp0' + nom)
    let s = (fbody && fbody.checked) ? ',N' : ''
    for (let i = 1; i < 9; i++) {
        const div = document.getElementById(t + 'div' + i + nom)
        if (div) s += div.checked ? ((s ? ',' : '') + 'i:div' + i) : ''
    }
    s += (fshp0 && fshp0.checked) ? ((s ? ',' : '') + 'i:shp0') : ''
    return s
}

function shpX_BordNames() {
    "use strict"
    const wshp = window.olga5.o5shp
    if (!wshp) return

    const tshpsp = document.getElementById('tshpsp'),
        pitches = { 'O': 'ver', 'S': 'hift', 'P': 'ush', 'C': 'lench' },
        dirput = { 'T': 'op', 'B': 'ottom', 'U': 'p', 'D': 'own', '': '' },
        Sid = (t, pO5) => {
            const nam = pO5 ? (pO5.id ? pO5.id : (pO5.current.nodeName)) : '?'
            return ' <i>' + t + '</i>=' + nam + ', '
        },
        FillDescription = (aO5s) => {
            if (!aO5s)
                console.log("aO5s не опр.? в FillDescription")
            for (const aO5 of aO5s) {
                const ps = aO5.shp.getElementsByTagName('p'),
                    cls = aO5.cls,
                    o = aO5.located, //.botNam,
                    f = aO5.hovered, //.botNam,
                    s1 = ' к.=' + (cls.alive ? ':<b>A</b>live' : '') + (cls.level > 0 ? ':<b>' + cls.level + '</b>' : ''),
                    s2 = ':<b>' + cls.dirV + '</b>' + dirput[cls.dirV],
                    s3 = ':<b>' + cls.putV + '</b>' + dirput[cls.putV],
                    s = '[<b><u>' + aO5.id + '</u></b>]/' + aO5.cls.nest +
                        ' к.=' + (cls.alive ? ':<b>A</b>live' : '') + (cls.level > 0 ? ':<b>' + cls.level + '</b>' : '') +
                        ':<b>' + cls.dirV + '</b>' + dirput[cls.dirV] +
                        ':<b>' + cls.putV + '</b>' + dirput[cls.putV] +
                        ':<b>' + cls.pitch + '</b>' + pitches[cls.pitch] +
                        '<br/>&nbsp;olga5_frames= ' + aO5.hovered.attr +
                        '<br/>&nbsp;olga5_owners= ' + aO5.located.attr +
                        '<br/>f: ' + Sid('t', f.to) + Sid('b', f.bo) + Sid('l', f.le) + Sid('r', f.ri) +
                        '<br/>o: ' + Sid('t', o.to) + Sid('b', o.bo) + Sid('l', o.le) + Sid('r', o.ri)

                if (ps && ps.length > 0)
                    ps[0].innerHTML = s
                if (aO5.aO5s.length > 0) FillDescription(aO5.aO5s)
            }
        }

    FillDescription(wshp.aO5s)
    if (tshpsp) {
        tshpsp.innerHTML = wshp.aO5str
    }
}

function CC() {
    "use strict";
    const shdwcb = document.getElementById('shdwcb'),
        cartcb = document.getElementById('cartcb'),
        cartc0 = document.getElementById('cartc0'),
        cartc1 = document.getElementById('cartc1'),
        shdws = document.getElementsByClassName('olga5_shp olga5-ignore'),
        carts = document.getElementsByClassName('olga5-cart'),
        SetOpacity = (shps, val, o) => {
            for (const shp of shps) {
                shp.style.opacity = val ? 1 : o
            }
            return val ? 'видно' : 'тени'
        },
        SetOpacit2 = (cart, val, o) => {
            cart.style.opacity = val ? 1 : o
            return val ? 'видно' : 'тени'
        }
    if (shdws && shdwcb) shdwcb.nextSibling.nodeValue = 'shdws: ' + SetOpacity(shdws, shdwcb.checked, 0.22)
    if (carts && cartcb) cartcb.nextSibling.nodeValue = 'carts: ' + SetOpacity(carts, cartcb.checked, 0.11)
    if (cartc0) cartc0.nextSibling.nodeValue = 'cart0: ' + SetOpacit2(carts[0], cartc0.checked, 0.11)
    if (cartc1) cartc1.nextSibling.nodeValue = 'cart1: ' + SetOpacit2(carts[1], cartc1.checked, 0.11)
}

const outlin = { e: '', eOffset: '' }
function OL(cb) {
    "use strict";
    const shps = document.getElementsByClassName('olga5_shp'),
        copys = document.getElementsByClassName('olga5_shp_copy'),
        cntls = document.getElementsByClassName('olga5-cart')
    if (outlin.e == '') {
        for (const shp of shps) {

            const nst1 = window.getComputedStyle(shp)
            console.log(shp.id + "  outlineWidth='" + nst1.outlineWidth + "' outline='" + nst1.outline + "'")

            const nst = window.getComputedStyle(shp)
            if (parseFloat(nst.outlineWidth) > 0.1) {
                outlin.e = nst.outlineColor + ' ' + nst.outlineStyle + ' ' + nst.outlineWidth
                outlin.eOffset = nst.outlineOffset
                break
            }
        }
    }
    for (const objs of [shps, cntls, copys])
        for (const obj of objs) {
            obj.style.outline = cb.checked ? outlin.e : 'none'
            obj.style.outlineOffset = cb.checked ? outlin.eOffset : '0'
        }
    cb.nextSibling.nodeValue = cb.checked ? 'с ' : 'без '
}

function shpX_ChgDirPos(cb) {
    "use strict";

    const sDoff = 10514, // '&#8673;', //'<b>&uarr;</b>',
        sDon = 8613, // '&#8675;', //'<b>&darr;</b>',
        sFoff = 8868,
        sFon = 8869

    if (cb) {
        const t = cb.id.substr(0, 1), // тип 'd' или 'p'
            nom = cb.id.substr(5), // номер строки, т.е. номер shp
            shp = document.getElementById('shp' + nom),
            cls = shp.aO5shp.cls
        if (t == 'd') cls.dirV = cb.innerHTML.charCodeAt(0) == sDon ? 'U' : 'D'
        if (t == 'p') cls.putV = cb.innerHTML.charCodeAt(0) == sFon ? 'T' : 'B'
    }

    const shps = document.querySelectorAll("[id ^= shp]"),
        dmarks = document.querySelectorAll("[id ^= dmark]"),
        pmarks = document.querySelectorAll("[id ^= pmark]")

    for (const ishp in shps) { // не заморачиваюсь: отображение каждый раз пересчитыать для всех
        const shp = shps[ishp]
        if (!shp.aO5shp || !shp.id || shp.id.indexOf('_') >= 0) continue

        const cls = shp.aO5shp.cls,
            k = shp.id.substr(3)

        for (const dmark of dmarks) {
            if (dmark.id.substr(5) == k) {
                const down = cls.dirV == 'D'
                dmark.innerHTML = '&#' + (down ? sDon : sDoff) + ';'
                dmark.title = "направление начала залипания= " + (down ? 'Снизу' : 'Верх')
                break
            }
        }
        for (const pmark of pmarks) {
            if (pmark.id.substr(5) == k) {
                const bottom = cls.putV == 'B'
                pmark.innerHTML = '&#' + (bottom ? sFon : sFoff) + ';'
                pmark.title = "место залипания= " + (bottom ? 'НИЗ' : 'ВЕРХ')
                break
            }
        }
    }
}

function Check3state(cb) { // обработка 3-х позиционного CheckBox'a
    cb.max = cb.max < 2 ? ++cb.max : 0
    cb.checked = cb.max > 0 // == 2
    cb.indeterminate = cb.max == 1
    return cb.max // == 2 ? 'P' : (pcb.max == 1 ? 'S' : 'O')
}

function GetPitchTitle(key) {
    switch (key) {
        case 'O': return "Over='наезжает'"
        case 'P': return "Push='сталкивает'"
        case 'C': return "Clench='стискивает'"
        default: return "Shift='сдвигает'"
    }
}

function CC1(cb) {
    "use strict";
    const wshp = window.olga5.o5shp
    if (!wshp) return

    const shps = [],
        check3state = ['O', 'S', 'P', 'C']
    if (cb) shps.push(document.getElementById(cb.id.substr(1)))
    else {
        (function ConcatAll(aO5s) {
            if (!aO5s)
                console.log("aO5s не опр.? в CC1")
            for (const aO5 of aO5s) {
                shps.push(aO5.shp)
                if (aO5.aO5s.length > 0) ConcatAll(aO5.aO5s)
            }
        })(wshp.aO5s)
    }
    for (const shp of shps) { // тут нет вложенных - можно не заморачиваться с 
        const i = shp.id.indexOf('_SHDW'),
            nam = i > 0 ? shp.id.substr(0, i) : shp.id,
            level = document.getElementById('l' + nam),
            alive = document.getElementById('a' + nam),
            pitch = document.getElementById('p' + nam),
            cls = shp.aO5shp.cls

        if (cb) {
            if (pitch && pitch == cb) {
                const pitchs = 'OPCS',
                    o = pitchs.indexOf(cls.pitch),
                    n = o < pitchs.length - 1 ? (o + 1) : 0

                cls.pitch = pitchs[n]
                cb.innerText = cls.pitch
                cb.title = GetPitchTitle(cb.innerText)
            }
            if (alive && alive == cb) {
                cls.alive = alive.checked
                cb.title = cls.alive ? "подвиснет сразу при обратном скроллине" : "сможет подвиснуть по возврате в 'доподвисабельное' состояние"
            }
            if (level && level == cb) {
                cls.level = level.value
            }
            shp.aO5shp.act.wasClick = false
        } else {
            if (level) level.value = cls.level
            if (alive) alive.checked = cls.alive
            // if (pitch) {
            //     pitch.checked = cls.pitch != 'O'
            //     pitch.indeterminate = cls.pitch == 'S'
            //     pitch.max = cls.pitch == 'S' ? 1 : (cls.pitch == 'P' ? 2 : 0)
            //     // console.log();
            // }
        }
    }
    window.olga5.o5shp.DoResize(`CC1(${cb})`)
}

function CC1a(cb) {
    shpX_ChgDirPos(cb)
    window.olga5.o5shp.DoResize(`CC1a(${cb})`)
}

function CC2(cb, namshp) {
    "use strict";
    const t = cb.id.substr(0, 1),
        shp = document.getElementById(namshp),
        frams = shpX_GetFrams(t, ''),
        atr = frams.length > 0 ? frams : (t == 'f' ? 's' : 'b')

    shp.setAttribute(t == 'f' ? 'olga5_frames' : 'olga5_owners', atr)
    window.olga5.o5shp.DoResize(`CC2(${cb}, ${namshp})`)
}

function CC2a(cb) {
    shpX_ChgDirPos(cb)
    window.olga5.o5shp.DoResize(`CC2a(${cb})`)
}

function CC3(cb) {
    "use strict";
    const wshp = window.olga5.o5shp
    if (cb) {
        const errs = [],
            t = cb.id.substr(0, 1),
            n = parseInt(cb.id.substr(5)),
            s = shpX_GetFrams(t, n),
            atr = s.length > 0 ? s : (t == 'f' ? 's' : 'b'),
            shp = document.getElementById('shp' + n)

        if (errs.length > 0)
            console.log("Ошибка в задании '" + u + "' для " + aO5.nam + ": " + errs[0].err)
        else {
            shp.setAttribute(t == 'f' ? 'olga5_frames' : 'olga5_owners', atr)
            wshp.DoResize()
        }
    } else {
        for (const nam of ['body', 'shp0', 'div0', 'div1', 'div2', 'div3', 'div4']) {
            for (const b of ['f', 'o']) {
                for (let n = 0; n < 9; n++) {
                    const div = document.getElementById(b + nam + n)
                    if (div)
                        div.checked = false
                }
            }
        }
        (function SetStartChecks(aO5s) {
            if (!aO5s)
                console.log("aO5s не опр. в SetStartChecks?")
            for (const aO5 of aO5s) {
                const n = parseInt(aO5.id.substr(3))

                for (const b of ['f', 'o']) {
                    const blng = b == 'f' ? aO5.hovered : aO5.located
                    for (const ask of blng.asks) {
                        const div = document.getElementById(b + ask.cod + n)
                        if (div)
                            div.checked = true
                    }
                }
                if (aO5.aO5s.length > 0) SetStartChecks(aO5.aO5s)
            }
        })(wshp.aO5s, 0)
    }
}

let styleCC3a = null
function CC3a(cb, txt) {
    "use strict";
    const wshp = window.olga5.o5shp,
        check3statec = ['такой же', 'прозрачный', 'отличающийся'],
        tab1 = document.getElementById('tab1'),
        cb1w = document.getElementById("bord1w"),
        cb1c = document.getElementById("bord1c"),
        cb1b = document.getElementById("bord1b")

    if (cb.id == 'bord1w') cb.title = (cb.checked ? 'НЕнулевая' : 'нулевая')
    else cb.title = check3statec[Check3state(cb)]
    cb.title = txt + '= ' + cb.title

    let s = ';'
    s += " border-width: " + (!cb1w.checked ? 0 : 3) + 'px;'
    s += " border-color: " + (!cb1c.checked ? 'greenyellow' : (cb1c.indeterminate ? 'transparent' : 'red')) + ';'
    s += " background-color: " + (!cb1b.checked ? 'greenyellow' : (cb1b.indeterminate ? 'transparent' : 'lightgreen')) + ';'
    console.log(s)

    tab1.setAttribute('style', styleCC3a + s)

    wshp.TestCC3a(tab1.pO5)
    wshp.DoResize()
}

function StartBordNames() {
    window.olga5.C.E.AddEventListener('o5shp_scroll', shpX_BordNames)

    const wshp = window.olga5.o5shp
    if (wshp) wshp.DoResize()
}

function Init0() {
    "use strict";
    if (!IsInitEvents()) return
    const Init0i = () => {
        console.log('Init0() --------------')

        const shp1 = document.getElementById('shp1')
        if (shp1) {
            const p = shp1.getElementsByTagName('p')[0]
            p.innerHTML = 'контейнер с копией исходного объекта 12'
        }
        CC()
        // shpX_BordNames()
        shpX_SetWindow(599, 411)
        window.scrollTo(0, 99)
        StartBordNames()
    }
    window.olga5.C.E.AddEventListener('olga5_ready', Init0i)
}

function Init1() {
    "use strict";
    if (!IsInitEvents()) return
    const Init1i = () => {
        console.log('Init2() --------------')

        for (let i = 0; i < 3; i++) {
            const cb = document.getElementById('pshp' + (i + 1))
            cb.title = GetPitchTitle(cb.innerText)
            document.getElementById('ashp' + (i + 1)).title = "сможет подвиснуть по возврате в 'доподвисабельное' состояние"
        }
        shpX_ChgDirPos()
        CC()
        CC1()
        // shpX_BordNames()
        shpX_SetWindow(599, 399)
        window.scrollTo(0, 233)

        StartBordNames()
    }
    // window.aaddEventListener('olga5_ready', Init)
    window.olga5.C.E.AddEventListener('olga5_ready', Init1i)
}

function Init2() {
    "use strict";
    const isi = IsInitEvents()
    if (!isi) return
    const Init2i = () => {
        console.log('Init2() --------------')

        const wshp = window.olga5.o5shp,
            div1 = document.getElementById('div1'),
            div2 = document.getElementById('div2'),
            div3 = document.getElementById('div3')

        // wshp.extraInit = true
        shpX_ChgDirPos()
        CC()
        CC1()
        // ResizeDiv1()

        if (div3) div3.scrollTo(0, 66)
        if (div2) div2.scrollTo(0, 144)
        if (div1) div1.scrollTo(0, 188)

        // shpX_BordNames()
        shpX_SetWindow(822, 422) //444)
        window.scrollTo(0, 333)

        StartBordNames()
    }
    window.olga5.C.E.AddEventListener('olga5_ready', Init2i)
}

function Init3() {
    "use strict"
    const isi = IsInitEvents()
    if (!isi) return
    const Init3i = () => {
        console.log('Init3() --------------')

        const wshp = window.olga5.o5shp,
            div1 = document.getElementById('div1'),
            div2 = document.getElementById('div2'),
            shp0 = document.getElementById('shp0'),
            cb1w = document.getElementById("bord1w"),
            cb1c = document.getElementById("bord1c"),
            cb1b = document.getElementById("bord1b"),
            tab1 = document.getElementById('tab1')

        styleCC3a = tab1.getAttribute('style')
        cb1w.indeterminate = false
        cb1c.indeterminate = false
        cb1b.indeterminate = false
        cb1w.max = cb1w.checked ? (cb1w.indeterminate ? 1 : 2) : 0
        cb1c.max = cb1c.checked ? (cb1c.indeterminate ? 1 : 2) : 0
        cb1b.max = cb1b.checked ? (cb1b.indeterminate ? 1 : 2) : 0

        shpX_ChgDirPos()
        CC()
        CC1()
        CC3()

        const
            Scroll0 = () => { shp0.scrollTo(0, 195) },
            Scroll2 = () => { div2.scrollTo(0, 91); if (shp0) window.setTimeout(Scroll0, 10) },
            Scroll1 = () => { div1.scrollTo(0, 122); if (div2) window.setTimeout(Scroll2, 10) }
        if (div1) window.setTimeout(Scroll1, 10)

        shpX_SetWindow(777, 399)
        window.scrollTo(0, 333)

        StartBordNames()
    }
    window.olga5.C.E.AddEventListener('olga5_ready', Init3i)
}

function Init4() {
    "use strict"
    if (!IsInitEvents()) return
    const Init4i = () => {
        console.log('Init4() --------------')

        const wshp = window.olga5.o5shp,
            div1 = document.getElementById('div1'),
            shp0 = document.getElementById('shp0')

        // wshp.extraInit = true
        shpX_ChgDirPos()
        CC()
        CC1()
        CC3()

        if (div1) div1.scrollTo(0, 55)
        if (shp0) shp0.scrollTo(0, 111)

        // shpX_BordNames()
        shpX_SetWindow(711, 500)
        window.scrollTo(0, 333)

        StartBordNames()
    }
    window.olga5.C.E.AddEventListener('olga5_ready', Init4i)
}

function Init4_test() {
    "use strict"
    const div = document.getElementById('div4'),
        div1 = document.getElementById('div1'),
        timera = '}-------->>    ИНИЦИАЛИЗАЦИЯ Init4'
    console.time(timera)
    for (let i = 0; i < 5000; i++) {
        div.getBoundingClientRect()
        div1.getBoundingClientRect()
    }
    console.timeEnd(timera)
}
