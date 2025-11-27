"use strict";
const
    fmtOK = "background: darkseagreen; color: black;",
    fmtErr = "background: greenyellow;; color: black;",
    markout = '  пример  '
let o5debug;
class OO5 {
    #nbsp = '&nbsp;'
    #frame = 'frame'
    #pitch = 'pitch'
    #pmark = 'pmark'
    #level = 'level'
    #alive = 'alive'
    #wshp = null
    #C = null
    #pitches = { 'O': 'наезд', 'P': 'сталк', 'C': 'стиск', 'S': 'сдвиг' }
    #BordNames = aO5 => {
        const ps = aO5.shp.getElementsByTagName('p'),
            cls = aO5.cls,
            puts = cls.puts,
            ss = []
        let
            s = '<b><u>' + aO5.id + '</u></b>' +
                `<br/>` +
                '<b>' + (puts.T ? 'T' : '') + (puts.L ? 'L' : '') + (puts.R ? 'R' : '') + (puts.B ? 'B' : '') + '</b>' +
                ',<b>' + cls.pitch + '</b>(<i>' + this.#pitches[cls.pitch] + '</i>)' +
                (cls.alive ? ',<b>A</b><i>live</i>' : '') +
                ',<b>' + cls.level + '</b>' +
                `<br/>`

        for (const frame of aO5.frms.frames)
            ss.push(frame.pO5.name)
        s += 'fix: ' + ss.join(', ') + `<br/>`
        s += 'cut: ' + aO5.frms.tagCut.id

        if (ps && ps.length > 0)
            ps[0].innerHTML = s
        else
            console.log("%c%s", fmtErr, `${markout}shpX_BordNames(): объект ${aO5.id} `, ` не содержит тег <p>`)
    }
    #SetaO5 = b5 => {
        const
            pmarks = [],
            pitchs = [],
            levels = [],
            alives = [],
            frames = [],
            aO5 = b5.aO5,
            bs = b5.div.aO5bs

        for (const b of bs) {
            const
                b5 = b.b5,
                txt = b.innerText.trim()

            // if (b.id === 'div4-b1')
            //     console.log(1)
            switch (b5.key) {
                case this.#pitch: pitchs.push(txt); break
                case this.#pmark: pmarks.push(txt); break
                case this.#level: levels.push(b.value); break
                case this.#alive: alives.push(b.checked); break    // //  aO5.cls.level + (aO5.cls.alive ? ':A' : ''), 
                case this.#frame:
                    if (txt) {
                        let f5 = frames.find((f => f.nam === b5.nam))
                        if (!f5) {
                            f5 = { nam: b5.nam, cut: b5.cut }
                            frames.push(f5)
                        }
                        f5[txt] = txt
                    }
            }
        }

        aO5.act.quals =
            pmarks.join('') +
            pitchs.join('') +
            alives.map(f => f ? 'A' : '').join('') +
            levels.join('') + ':' +
            frames.map(f => `i=${f.nam}${f.cut ? '/c' : ''}`).join(',')

        this.#wshp.DoInit.ReadAttrs(aO5)

        for (const x of 'TLRB')
            if (aO5.fixs[x].isP) {
                const
                    p = aO5.fixs[x].xO5,
                    name = p ? p.name.substring(1) : ''
                if (name && !frames.find(frame => frame.nam === name && !frame.cut))
                    aO5.DoFix(x)
            }

        if (o5debug)
            console.log("%c%s", fmtOK, `${markout}изменено ${aO5.id} `, aO5.act.quals)
        this.#BordNames(aO5)
        this.#wshp.DoChgs.MakeScroll(0.1, 0.1, aO5.base.pBase.pO5, true)
        this.#wshp.DoChgs.MakeScroll(-0.1, -0.1, aO5.base.pBase.pO5, true)
    }
    #InitCtrls = (aO5, div) => {
        const
            FillMarks = () => {
                const
                    key = this.#pmark,
                    pdiv = div.getElementsByClassName(key)[0],
                    sps = pdiv.getElementsByTagName('span')

                for (const sp of sps) {
                    const
                        cls = sp.className.trim(),
                        b = sp.getElementsByTagName('b')[0]

                    b.innerHTML = aO5.cls.puts[cls] ? cls : this.#nbsp
                    b.b5 = { aO5: aO5, val: cls, div: div, key: key }
                    b.addEventListener('click', this.CbMark)
                    div.aO5bs.push(b)
                }
            },
            FillPitch = () => {
                const
                    key = this.#pitch,
                    pdiv = div.getElementsByClassName(key)[0],
                    sps = pdiv.getElementsByTagName('span')

                for (const sp of sps) {
                    const
                        cls = sp.className.trim(),
                        b = sp.getElementsByTagName('b')[0]

                    b.innerHTML = aO5.cls.pitch === cls ? cls : this.#nbsp
                    b.addEventListener('click', this.CbPitch)
                    b.b5 = { aO5: aO5, val: cls, div: div, key: key }
                    div.aO5bs.push(b)
                }
            },
            FillLevel = () => {
                const
                    key = this.#level,
                    inp = Array.from(div.getElementsByClassName(key))[0]

                inp.b5 = { aO5: aO5, val: aO5.cls.level, div: div, key: key, title: 'уровень/level' }
                inp.title = `${inp.b5.title}= ${aO5.cls.level}`
                inp.value = aO5.cls.level
                // почему для shp2 при -1 показывает 0 ?                
                inp.addEventListener('input', this.CbLevel)
                div.aO5bs.push(inp)
            },
            FillAlive = () => {
                const
                    key = this.#alive,
                    cb = Array.from(div.getElementsByClassName(key))[0]

                cb.b5 = { aO5: aO5, val: aO5.cls.level, div: div, key: key, title: 'автовозврат после сдвига' }
                cb.title = `${cb.b5.title}= ${aO5.cls.alive}`
                cb.checked = aO5.cls.alive
                cb.addEventListener('change', this.CbAlive)
                div.aO5bs.push(cb)
            },
            FillFrams = () => {
                const
                    isdis = 'disable',
                    key = this.#frame,
                    pid = aO5.base.pBase.pO5.id,
                    pdiv = div.getElementsByClassName(key)[0],
                    ps = Array.from(pdiv.getElementsByTagName('p')),
                    StopPropagation = e => {
                        e.preventDefault();
                        e.stopPropagation();
                    },
                    AskScroll = e => {
                        const btn = document.getElementById('btnScrollHead')
                        if (btn) {
                            if (document.getElementById(e.target.innerText))
                                btn.innerText = e.target.innerText
                            else
                                console.error(`нет такого контейнера '${e.target.innerText}' `)
                        }
                        else
                            console.error(`нет кнопки "btnScrollHead" ??`)
                    }
                let found = false   // признак что наден базовый div (т.е. div3)
                for (const p of ps) {
                    const
                        icls = p.className.trim(),
                        bs = Array.from(p.getElementsByTagName('b')),
                        is0 = Array.from(p.getElementsByTagName('i'))[0],
                        nam = is0.innerText,
                        isbase = pid === icls,
                        frame = Array.from(aO5.frms.frames).find(f => f.pO5.tag.id === icls)

                    const c0 = 'f', c1 = 'c', cc = this.#nbsp
                    is0.classList.add('button')
                    is0.title = "Выбор для скроллинга желтыми 'TLRB'"
                    is0.addEventListener('contextmenu', StopPropagation)
                    is0.addEventListener('mouseup', AskScroll)

                    // if (p.className === 'div4')
                    //     console.log(2)                    
                    let v0 = '?', v1 = '?'
                    if (isbase) {
                        v0 = frame ? c0 : cc
                        found = true
                    }
                    else
                        if (found) {
                            bs[0].classList.add(isdis)
                            v0 = cc
                        }
                        else {
                            v0 = frame ? c0 : cc
                            bs[1].classList.add(isdis)
                        }

                    if (found)
                        v1 = (aO5.frms.tagCut.id === icls) ? c1 : cc
                    else {
                        const pO5 = document.getElementById(icls)
                        bs[1].classList.add(isdis)
                        v1 = cc
                    }

                    for (const i of [0, 1]) {
                        const
                            b = bs[i],
                            cut = i === 1,
                            val = cut ? c1 : c0

                        b.b5 = { aO5, div, key, nam, val, cut }

                        b.title = cut ? 'обрезание (сзади)' : 'фиксация (по ходу)'
                        b.innerHTML = i === 0 ? v0 : v1
                        b.id = p.className + '-b' + i
                        div.aO5bs.push(b)
                    }
                    if (!bs[0].classList.contains(isdis)) bs[0].addEventListener('click', this.CbFramF)
                    if (!bs[1].classList.contains(isdis)) bs[1].addEventListener('click', this.CbFramC)
                }
            }

        FillFrams()
        FillPitch()
        FillMarks()
        FillLevel()
        FillAlive()
    }
    constructor() {
        this.outlin = { e: '', eOffset: '' }
        this.dshps = new Set()
    }
    CallScroll = m => {  // вызывается из HTML
        const
            btn = document.getElementById('btnScrollHead'),
            nam = btn.innerText,
            bord = document.getElementById(nam)
        let scV = 0, scH = 0
        switch (m) {
            case 'T': scV = 0.1; break
            case 'L': scH = 0.1; break
            case 'R': scH = -0.1; break
            case 'B': scV = -0.1; break
        }
        this.#wshp.DoChgs.MakeScroll(scV, scH, bord.pO5, true)
    }
    CbLevel = e => {
        const
            inp = e.target,
            b5 = inp.b5

        b5.aO5.cls.level = inp.value
        inp.title = `${b5.title}= ${b5.aO5.cls.level}`
        this.#SetaO5(b5)
    }
    CbAlive = e => {
        const
            cb = e.target,
            b5 = cb.b5

        b5.aO5.cls.alive = cb.checked
        if (cb.checked)
            for (const x of 'TLRB')
                b5.aO5.hidden[x] = false

        cb.title = `${b5.title}= '${b5.aO5.cls.alive ? 'ДА' : 'нет'}'`
        this.#SetaO5(b5)
    }
    CbMark = e => {
        const
            cb = e.target,
            b5 = cb.b5
        if (b5) {
            if (cb.innerHTML === this.#nbsp) cb.innerHTML = b5.val      // переключение
            else {
                cb.innerHTML = this.#nbsp
                /*					 
                    расфиксация по 'o' 				
                */
                const o = b5.val,
                    aO5 = b5.aO5
                if (aO5.IsP(o, true)) {
                    aO5.DoFix(o)

                    if ('TB'.includes(o)) aO5.posC.top = aO5.posO.top
                    else aO5.posC.left = aO5.posO.left
                }
            }

            this.#SetaO5(b5)
        }
    }
    CbPitch = e => {
        const
            cb = e.target,
            b5 = cb.b5
        if (b5) {
            const
                bs = b5.div.aO5bs,
                key = cb.b5.key

            cb.innerHTML = b5.val
            for (const b of bs)
                if (b !== cb && b.b5.key === key)
                    b.innerHTML = this.#nbsp
            this.#SetaO5(b5)
        }
    }
    CbFramC = e => {
        const c1 = 'c', cc = this.#nbsp,
            cb = e.target,
            key = this.#frame,
            pdiv = cb.b5.div.getElementsByClassName(key)[0],
            ps = Array.from(pdiv.getElementsByTagName('p'))
        for (const p of ps) {
            const bs = Array.from(p.getElementsByTagName('b'))
            bs[1].innerHTML = cc
        }
        cb.innerHTML = c1
        this.#SetaO5(cb.b5)
    }
    CbFramF = e => {
        const c0 = 'f', cc = this.#nbsp,
            cb = e.target

        cb.innerHTML = cb.innerHTML === cc ? c0 : cc

        this.#SetaO5(cb.b5)
    }
    CbVisible = cbx => {
        const
            forclons = cbx.id === 'clons',
            opas = cbx.checked ? 1 : (forclons ? 0.22 : 0.11),
            objs = document.getElementsByClassName(forclons ? 'olga5_clon' : 'olga5_cart')

        for (const obj of objs)
            obj.style.opacity = opas
    }
    OutLines = cbx => {
        const
            outlin = this.outlin,
            objs = document.querySelectorAll('.olga5_shp, .olga5_cart')

        if (outlin.e == '')
            for (const obj of objs) {
                const nst = window.getComputedStyle(obj)
                if (parseFloat(nst.outlineWidth) > 0.1) {
                    outlin.e = nst.outlineColor + ' ' + nst.outlineStyle + ' ' + nst.outlineWidth
                    outlin.eOffset = nst.outlineOffset
                    break
                }
            }

        for (const obj of objs)
            Object.assign(obj.style, {
                outline: cbx.checked ? outlin.e : 'none',
                outlineOffset: cbx.checked ? outlin.eOffset : '0',
            })
    }
    Activate = e => {
        const aO5 = e.detail.aO5,
            shp = aO5.shp
        let div = e.detail.div
        if (!div)
            for (const dshp of this.dshps)
                if (dshp.shp === shp) {
                    div = dshp.div
                    break
                }
        if (div) {
            div.style.opacity = 1
            this.#InitCtrls(aO5, div)
            this.#BordNames(aO5)
        }
        else
            console.error(`Activate - не найден div для aO5=${aO5.id}`)

        this.ActFix({ detail: { aO5: aO5, fix: false, activate: true } })
    }
    mpos = {}
    StopMove = e => {
        const
            mpos = this.mpos,
            aO5 = mpos.divStrt ? mpos.divStrt.aO5 : null

        if (!aO5) return
        if (o5debug)
            console.log("%c%s", fmtOK, `${markout}новое позиционирование ${aO5.id} `)

        const shp = aO5.shp,
            act = aO5.act

        document.removeEventListener('mousemove', this.DoMove)

        Object.assign(mpos.div.style, {
            display: 'none',
        })
        mpos.divStrt.aO5 = null
        shp.classList.remove('o5_moved')
        if (!e.o5ignore) { // новое позиционирование
            // const
            //     y = mpos.divStrt.oy + mpos.divStrt.y + mpos.mousDiff.dy - mpos.margs.marginTop,
            //     x = mpos.divStrt.ox + mpos.divStrt.x + mpos.mousDiff.dx - mpos.margs.marginLeft

            // // shp.style.setProperty('top', y + 'px')
            // // shp.style.setProperty('left', x + 'px',)
            // Object.assign(shp.style, {                top: y + 'px',                left: x + 'px'            })

            const
                t = aO5.transform,
                add = t.add,
                tac = t.tac

            if (shp.classList.contains('rs-moveable')) {
                add.x += mpos.mousDiff.dx
                add.y += mpos.mousDiff.dy
                tac.x = t.x + add.x
                tac.y = t.y + add.y
                shp.style.transform = `translate(${tac.x}px, ${tac.y}px)`
            }
            // console.log(`add=[${add.x.toFixed(1).padStart(5)}, ${('' + add.x.toFixed(1)).padStart(5)}], ` +
            //     `mouseDiff=[${('' + mouseDiff.dx.toFixed(1)).padStart(5)}, ${('' + mouseDiff.dx.toFixed(1)).padStart(5)}]`
            // )

            if (act.clon) {
                act.clon.parentNode.removeChild(act.clon);
                // delete act.clon; 
                act.clon = null
                act.cart.parentNode.removeChild(act.cart);
                // delete act.cart; // 
                act.cart = null
            }
        }

        const
            p1 = aO5.shp.getBoundingClientRect(),
            aAlls = aO5.base.pBase.aAll      //  document.body.pO5.aAlls

        for (const xO5 of aAlls)
            if (xO5 !== aO5) {
                const
                    pF = xO5.fixs,
                    p2 = (pF.T.xO5 || pF.L.xO5 || pF.R.xO5 || pF.B.xO5) ? xO5.posC : xO5.shp.getBoundingClientRect()
                if (
                    (
                        (p1.left <= p2.right && p1.right >= p2.left) ||
                        (p2.left <= p1.right && p2.right >= p1.left)
                    ) && (
                        (p1.top <= p2.bottom && p1.bottom >= p2.top) ||
                        (p2.top <= p1.bottom && p2.bottom >= p1.top)
                    )
                ) {
                    const s = `Не следует накладывать ${aO5.id} на объект ${xO5.id}`
                    console.log("%c%s", fmtErr, `${markout}${s} `)
                    // alert(s)
                }
            }

        aO5.base.pBase.ReorderAO5s()
        this.#wshp.DoChgs.MakeScroll(0.1, 0.1, aO5.base.pBase.pO5, true)
    }
    DoMove = e => {
        const mpos = this.mpos
        Object.assign(mpos.mousDiff, {
            dy: e.pageY - mpos.mousStrt.y,
            dx: e.pageX - mpos.mousStrt.x,
        })
        Object.assign(mpos.div.style, {
            top: (mpos.divStrt.y + mpos.mousDiff.dy) + 'px',
            left: (mpos.divStrt.x + mpos.mousDiff.dx) + 'px',
        })
    }
    StartMove = e => {
        const
            shp = e.currentTarget,
            aO5 = shp.aO5shp,
            mpos = this.mpos

        if (shp.classList.contains('o5_fixed') ||
            !shp.classList.contains('rs-moveable')
        )
            return

        if (!mpos.div) {
            Object.assign(mpos, {
                div: shp.cloneNode(false),
                divStrt: { y: 0, x: 0, aO5: null, oy: 0, ox: 0 },
                mousDiff: { dy: 0, dx: 0, },
                mousStrt: { y: 0, x: 0, },
                margs: { y: 0, x: 0, },
            })
            Object.freeze(mpos)

            mpos.div.id = 'o5moved'

            Object.assign(mpos.div.style, {
                opacity: 0.4,
                position: 'fixed',
                cursor: 'grabbing',
                outline: "dashed blue 2px"
            })
            document.body.appendChild(mpos.div)
        }

        mpos.divStrt.aO5 = aO5

        const p = aO5.act.shdw.getBoundingClientRect()
        Object.assign(mpos.divStrt, {
            y: p.y,
            x: p.x,
            oy: shp.offsetTop - p.y,
            ox: shp.offsetLeft - p.x,
        })

        const nst = window.getComputedStyle(shp)
        Object.assign(mpos.margs, {
            marginTop: parseFloat(nst.marginTop), //nst.getPropertyValue('margin-top'),
            marginLeft: parseFloat(nst.marginLeft), //nst.getPropertyValue('margin-left'),
            borderWidth: parseFloat(nst.borderTopWidth) + parseFloat(nst.borderRightWidth),
            borderHeight: parseFloat(nst.borderTopWidth) + parseFloat(nst.borderBottomWidth),
        })
        Object.assign(mpos.div.style, {
            display: '',
            border: 'none',
            padding: '6px',
            top: p.top + 'px',
            left: p.left + 'px',
            width: (p.width - mpos.margs.borderWidth) + 'px',
            height: (p.height - mpos.margs.borderHeight) + 'px',
            margin: 0,
        })
        Object.assign(mpos.mousStrt, { x: e.pageX, y: e.pageY })

        this.DoMove(e)
        shp.classList.add('o5_moved')
        document.addEventListener('mousemove', this.DoMove)
    }
    ActFix = e => {
        const
            mpos = this.mpos,
            aO5 = e.detail.aO5,
            fix = e.detail.fix,
            activate = e.detail.activate,
            shp = aO5.shp,
            fixed = shp.classList.contains('o5_fixed')

        if (fix) {
            if (mpos.divStrt && mpos.divStrt.aO5)
                this.StopMove({ currentTarget: shp, o5ignore: true })

            if (!fixed)
                shp.classList.add('o5_fixed')
        } else
            if (fixed)
                shp.classList.remove('o5_fixed')

        if (activate) {
            document.addEventListener('mouseup', this.StopMove)
            shp.addEventListener('mousedown', this.StartMove)
        }
    }
    InitShp = () => {
        const
            elements = document.querySelectorAll('[class*="olga5_shp"]'),
            tags = Array.from(elements).filter(element => {
                return element.className.match(/olga5_shp[\s:]/) && !element.classList.contains('o5shp_none')
            }),
            divE = document.getElementById('div-etalon'),
            clons = document.getElementById('clons'),
            carts = document.getElementById('carts'),
            outli = document.getElementById('outli'),
            SetWindow = () => {    // w0, h0
                const
                    ref1 = document.getElementById('ref1'),
                    ref0 = document.getElementById('ref0')
                ref1.scrollIntoView({ behavior: 'smooth', block: 'start' })
                ref1.addEventListener('click', e => {
                    ref0.scrollIntoView({ behavior: 'smooth', block: 'start' })
                })

                if (window.name.indexOf('olga5_popup') < 0) // если НЕ было открыто из родителя ---
                    return

                this.#C.E.AddEventListener('beforeunload', function () {
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
                            console.log("%c%s", fmtErr, `${markout}Прекращено 'focusTimer': `, e.message)
                            window.clearInterval(focusTimer);
                        }
                    }, 888)
                return true
            }

        this.#wshp = window.olga5.o5shp
        this.#C = window.olga5.C
        o5debug = this.#C.consts.o5debug

        SetWindow()

        clons.checked = false
        carts.checked = true
        outli.checked = false

        this.CbVisible(clons)
        this.CbVisible(carts)
        this.OutLines(outli)

        for (const tag of tags) {
            if (tag.classList.contains('o5shp_none')) continue

            const
                shp = tag,
                id = shp.id,
                aO5 = shp.aO5shp,
                divX = document.createElement('div'),
                div = divE.parentNode.appendChild(divX)

            if (aO5.transform.p === 'relative' || aO5.transform.p === 'static')
                tag.classList.add('rs-moveable')

            div.classList.add('div-shp')
            div.innerHTML = divE.innerHTML
            div.style.opacity = 0.5
            div.aO5bs = []

            const dname = div.getElementsByClassName('name')[0]
            dname.innerText = id.substring(id.length - 1)
            div.title = dname.title = `тег ${id}`

            this.dshps.add({ shp, div })

            if (aO5)
                this.Activate({ detail: { div, aO5 } })
        }

        if (o5debug)
            console.log("%c%s", fmtOK, `${markout}  --- инициирован скрипт тестового примера --- `)

        window.addEventListener('o5_containers', this.Activate)
        window.addEventListener('o5_fixed', this.ActFix)
    }
}

const oo5 = new OO5()

window.addEventListener('o5_isInited', oo5.InitShp)
window.addEventListener("wheel", function (event) {
    if (event.deltaX !== 0) {
        event.preventDefault(); // Останавливает горизонтальную прокрутку
    }
}, { passive: false })


