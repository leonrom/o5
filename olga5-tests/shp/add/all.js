"use strict";
class OO5 {
    #fmtErr = "background: yellow; color: black;"
    #nbsp = '&nbsp;'
    #frame = 'frame'
    #pitch = 'pitch'
    #pmark = 'pmark'
    #level = 'level'
    #alive = 'alive'
    #wshp = null
    #C = null
    #pitches = { 'O': 'наезд', 'P': 'сталк', 'C': 'стиск', 'S': 'сдвиг' }
    #Join = o => {
        let s = ''
        for (const nam in o)
            if (o[nam]) s += nam
        return s
    }
    #BordNames = aO5 => {
        const ps = aO5.shp.getElementsByTagName('p'),
            cls = aO5.cls,
            ss = []
        let
            s = '<b>' + aO5.id + '</b>' +
                `<br/>` +
                '<b>' + this.#Join(cls.puts) + '</b>' +
                ':<b>' + cls.pitch + '</b>(<i>' + this.#pitches[cls.pitch] + '</i>)' +
                ':<b>' + cls.level + '</b>' +
                (cls.alive ? ':<b>A</b><i>live</i>' : '') +
                `<br/>`

        for (const frame of aO5.frames) {
            const
                u1 = (frame.fix && frame.cut) ? 'fc' : (frame.fix ? 'f' : (frame.cut ? 'c' : '')),
                u2 = frame.num ? frame.num : '',
                u = u1 + u2
            ss.push(frame.cod + (u ? ('/' + u) : ''))
        }
        s += ss.join(', ')

        if (ps && ps.length > 0)
            ps[0].innerHTML = s
        else
            console.log("%c%s", this.#fmtErr, `alltst.js->shpX_BordNames(): объект ${aO5.id} `, ` не содержит тег <p>`)
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
                // val = b5.val,
                txt = b.innerText.trim()

            switch (b5.key) {
                case this.#pitch: pitchs.push(txt); break
                case this.#pmark: pmarks.push(txt); break
                case this.#level: levels.push(b.value); break
                case this.#alive: alives.push(b.checked); break    // //  aO5.cls.level + (aO5.cls.alive ? ':A' : ''), 
                case this.#frame:
                    if (txt && !b5.all) {
                        let f5 = frames.find((f => f.nam === b5.nam))
                        if (!f5) {
                            f5 = { nam: b5.nam, f: '', c: '' }
                            frames.push(f5)
                        }
                        f5[txt] = txt // 'i=' + b5.nam + '/' + txt
                    }
            }
        }


        this.#wshp.Frames.ReadAttrs(aO5, [
            pitchs.join('') + ':',
            pmarks.join('') + ':',
            levels.join('') + ':',
            alives.map(f => f ? ':A' : '').join(''),
            frames.map(f => `i=${f.nam}/${f.f}${f.c}`).join(',')
        ])
        this.#wshp.Boards.FindBords(aO5, performance.now())

        this.#BordNames(aO5)

        this.CallScroll('V')     // достаточно по одному из 'V' и 'H'
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
                    key = this.#frame,
                    pdiv = div.getElementsByClassName(key)[0],
                    ps = Array.from(pdiv.getElementsByTagName('p'))
                // FindFrame = id => frame => frame.act.pO5.tag.id === id

                for (const p of ps) {
                    const
                        // id = p.id,
                        icls = p.className.trim(),
                        bs = Array.from(p.getElementsByTagName('b')),
                        nam = Array.from(p.getElementsByTagName('i'))[0].innerText

                    let frame = null
                    if (icls)
                        for (const f of aO5.frames)
                            if (f.act.pO5.tag.id === icls) {
                                frame = f
                                break
                            }

                    if (icls && !document.getElementById(icls)) {
                        p.innerHTML = `<span class="absent"><i>&nbsp;${nam}</i> &nbsp; &nbsp; -</span>`
                        continue
                    }

                    for (const i of [0, 1]) {
                        const
                            b = bs[i],
                            val = (i === 0) ? 'f' : 'c'

                        b.b5 = { aO5: aO5, val: val, div: div, key: key, nam: nam, all: !icls }
                        if (frame)
                            b.innerHTML = ((frame.fix && i === 0) || (frame.cut && i === 1)) ? val : this.#nbsp
                        else
                            b.innerHTML = this.#nbsp

                        div.aO5bs.push(b)
                    }
                }

                pdiv.addEventListener('click', this.CbFram)
            }

        FillFrams()
        FillPitch()
        FillMarks()
        FillLevel()
        FillAlive()
    }
    constructor() {
        this.outlin = { e: '', eOffset: '' }
        this.markout = '     --------------    '
        this.dshps = new Set()
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
            cb.innerHTML = cb.innerHTML === this.#nbsp ? b5.val : this.#nbsp  // переключение 
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
    CbFram = e => {
        const
            cb = e.target,
            b5 = cb.b5
        if (b5) {
            const
                bs = b5.div.aO5bs,
                key = cb.b5.key,
                nval = cb.innerHTML === this.#nbsp ? b5.val : this.#nbsp

            cb.innerHTML = nval
            if (b5.all)             // обработка общей кнопки
                for (const b of bs)
                    if (b !== cb && b.b5.key === key && b.b5.val == b5.val)
                        b.innerHTML = nval

            this.#SetaO5(b5)
        }
    }
    CbVisible = cbx => {
        const
            forclons = cbx.id === 'clons',
            opas = cbx.checked ? 1 : (forclons ? 0.22 : 0.11),
            objs = document.getElementsByClassName(forclons ? 'olga5_clon' : 'olga5_cart')

        for (const obj of objs)
            obj.style.opacity = opas
    }
    CallScroll = s => {  // вызывается из HTML
        this.#wshp.DoChgs.MakeScroll(s.indexOf('V') < 0 ? 0 : 0.1, s.indexOf('H') < 0 ? 0 : 0.1, body, true)
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

        if (!aO5)
            return

        const shp = aO5.shp,
            act = aO5.act
        // mpos = aO5.act.mpos

        document.removeEventListener('mousemove', this.DoMove)

        Object.assign(mpos.div.style, {
            display: 'none',
        })
        mpos.divStrt.aO5 = null
        shp.classList.remove('o5_moved')
        if (!e.o5ignore) { // новое позиционирование
            // const
            //     position = getComputedStyle(shp).position

            // switch (position) {
            //     case 'absolute': shp.style.transform = `translate(${dx}px, ${dy}px)`; break
            //     case 'static': Object.assign(shp.style, { marginLeft: dx + "px", marginTop: dy + "px" }); break
            //     case 'relative':
            //     case 'absolute':
            //     case 'fixed': Object.assign(shp.style, {
            //         top: (mpos.divStrt.oy + mpos.divStrt.y + mpos.mousDiff.dy) + 'px',
            //         left: (mpos.divStrt.ox + mpos.divStrt.x + mpos.mousDiff.dx) + 'px'
            //     })
            // }

            const
                y = mpos.divStrt.oy + mpos.divStrt.y + mpos.mousDiff.dy - mpos.margs.marginTop,
                x = mpos.divStrt.ox + mpos.divStrt.x + mpos.mousDiff.dx - mpos.margs.marginLeft

            shp.style.setProperty('top', y + 'px')
            shp.style.setProperty('left', x + 'px',)
            Object.assign(shp.style, {
                top: y + 'px',
                left: x + 'px'
            })
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
            aAlls = document.body.pO5.aAlls

        for (const xO5 of aAlls)
            if (xO5 !== aO5) {
                const p2 = xO5.pFixs.fixed ? xO5.posCf : xO5.shp.getBoundingClientRect()
                if (
                    (
                        (p1.left <= p2.right && p1.right >= p2.left) ||
                        (p2.left <= p1.right && p2.right >= p1.left)
                    ) && (
                        (p1.top <= p2.bottom && p1.bottom >= p2.top) ||
                        (p2.top <= p1.bottom && p2.bottom >= p1.top)
                    )
                )
                    alert(`Не следует накладывать ${aO5.id} на объект ${xO5.id}`)
                
            }
            
        // this.#wshp.PO5shp.InsertaO5s(aO5)
        
        this.CallScroll('VH')     // достаточно по одному из 'V' и 'H'
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

        if (shp.classList.contains('o5_fixed'))
            return

        if (!mpos.div) {
            Object.assign(mpos, {
                div: shp.cloneNode(false),
                divStrt: { y: 0, x: 0, aO5: null, oy: 0, ox: 0 },
                mousStrt: { y: 0, x: 0, },
                mousDiff: { dy: 0, dx: 0, },
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
                return element.className.match(/olga5_shp[\s:]/)
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
                            console.log(this.markout + 'Прекращено `focusTimer`, причина: ' + e.message);
                            window.clearInterval(focusTimer);
                        }
                    }, 888)
                return true
            }

        this.#wshp = window.olga5.o5shp
        this.#C = window.olga5.C

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
                divX = document.createElement('div'),
                div = divE.parentNode.appendChild(divX)

            div.classList.add('div-shp')
            div.innerHTML = divE.innerHTML
            div.style.opacity = 0.5
            div.aO5bs = []

            const dname = div.getElementsByClassName('name')[0]
            dname.innerText = id.substring(id.length - 1)
            div.title = dname.title = `тег ${id}`

            this.dshps.add({ shp, div })

            const aO5 = shp.aO5shp
            if (aO5)
                this.Activate({ detail: { div, aO5 } })
        }

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


