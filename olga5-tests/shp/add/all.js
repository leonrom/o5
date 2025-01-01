"use strict";
class OO5 {
    #fmtErr = "background: yellow; color: black;"
    #BordNames = () => {
        const wshp = window.olga5.o5shp
        if (!wshp) return

        // const tshpsp = document.getElementById('tshpsp'),

        const
            pitches = { 'O': 'наезд', 'P': 'сталк', 'C': 'стиск', 'S': 'сдвиг' },
            Sid = (t, pO5) => {
                const nam = pO5 ? (pO5.id ? pO5.id : (pO5.current.nodeName)) : '?'
                return ' <i>' + t + '</i>=' + nam + ', '
            },
            Join = o => {
                let s = ''
                for (const nam in o)
                    if (o[nam]) s += nam
                return s
            }

        for (const aO5 of wshp.aO5s) {
            const ps = aO5.shp.getElementsByTagName('p'),
                cls = aO5.cls,
                ss = []
            let
                s = ' &nbsp; &nbsp; &nbsp; &nbsp; <b>' + aO5.id + '</b>' +
                    `<br/>` + 
                    '&nbsp;<b>' + Join(cls.puts) + '</b>' +
                    ':<b>' + cls.pitch + '</b>(' + pitches[cls.pitch] + ')' +
                    (cls.alive ? ':<b>A</b>live' : '') +
                    (cls.level > 0 ? ':<b>' + cls.level + '</b>' : '') +
                    `<br/>&nbsp;`

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
    }
    #Checked = b => ['f', 'c', 'T', 'B', 'L', 'R'].includes(b.innerHTML)
    #SetaO5 = aO5 => {
        const
            sb = [],
            sm = []
        for (const b of this.#bs) {
            const b5 = b.b5
            if (b5.bnam && b5.aO5 == aO5 && this.#Checked(b))
                sb.push('i=' + b5.bnam + (b5.isfix ? '/f' : '/c'))
            if (b5.put && b5.aO5 == aO5 && this.#Checked(b))
                sm.push(b5.put)
        }
        // b5.aO5.act.fromTest[cbx.className] = ss.join(',')
        aO5.Resize([sm.join(''), sb.join(',')])
    }
    #SetWindow = () => {    // w0, h0
        if (window.name.indexOf('olga5_popup') < 0) // если НЕ было открыто из родителя ---
            return

        // const aw = window.screen.availWidth,
        //     ah = window.screen.availHeight,
        //     w = aw > w0 ? w0 : aw,
        //     h = ah > h0 ? h0 : ah

        // window.resizeTo(w, h)
        // window.moveTo(aw - w - 5, 5)
        // console.log(this.markout + `PopUp: w0=${w0}, aw=${aw}, w=${w}, aw - w=${aw - w}`)

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
                    console.log(this.markout + 'Прекращено `focusTimer`, причина: ' + e.message);
                    window.clearInterval(focusTimer);
                }
            }, 888)
        return true
    }

    #regex = /'([^']*)'/g
    #bs = []
    #InitCbs = clas => {
        const
            spans = Array.from(document.getElementsByClassName(clas)),
            aO5s = olga5.o5shp.shps.map(shp => shp.aO5shp)

        for (const span of spans) {
            const
                childs = span.childNodes,
                clss = span.className.split(/\s+/g)

            let m = 0
            for (let i = 0; i < childs.length; i++) {
                const b = childs[i]
                if (b.nodeName == 'B') {
                    const
                        isframe = clas == 'frame',
                        isfix = (m++ === 0),
                        idshp = clss[1],
                        val = clss[2],
                        aO5 = aO5s.find(aO5 => aO5.id == idshp)

                    b.b5 = { aO5: aO5, clas: clas, idshp: idshp, isfix: isfix }
                    if (isframe) b.b5.bnam = val
                    else b.b5.put = val

                    this.#bs.push(b)
                    b.addEventListener('click', b.b5.clas == 'frame' ? this.CbBord : this.CbMark)

                    if (aO5)
                        b.classList.add('active')

                    if (m > 1)
                        break
                }
            }
        }
    }
    #InitCbMarks = () => {
        const
            clas = 'pmark',
            NamPos = mark => {
                switch (mark) {
                    case 'T': return 'ВЕРХ'
                    case 'B': return 'НИЗ'
                    case 'L': return 'ЛЕВО'
                    case 'R': return 'ПРАВО'
                }
                return 'х.з.'
            }

        this.#InitCbs(clas)

        for (const shp of olga5.o5shp.shps) {
            const
                aO5 = shp.aO5shp,
                idshp = aO5.id

            for (const put in aO5.cls.puts) {
                const b = this.#bs.find(b => b.b5.clas == clas && b.b5.idshp == idshp && b.b5.put == put)
                if (b) {
                    b.innerHTML = aO5.cls.puts[put].trim() ? put : '&nbsp;'
                    b.title = NamPos(put)
                }
                else
                    console.log("%c%s", this.#fmtErr, `нет 'b[${put}]' для aO5=${idshp}`)
            }
        }

        this.#BordNames()
    }
    #InitCbBords = () => {
        const
            clas = 'frame'

        this.#InitCbs(clas)

        for (const shp of olga5.o5shp.shps) {
            const
                aO5 = shp.aO5shp,
                idshp = aO5.id
            for (const frame of aO5.frames) {
                const
                    bnam = frame.pO5.id

                for (const isfix of [true, false]) {
                    const b = this.#bs.find(b =>
                        b.b5.clas == clas && b.b5.idshp == idshp && b.b5.bnam == bnam && b.b5.isfix === isfix)
                    if (b)
                        b.innerHTML = isfix ? (frame.fix ? 'f' : '&nbsp;') : (frame.cut ? 'c' : '&nbsp;')
                    else
                        console.log("%c%s", this.#fmtErr, `нет '${isfix ? 'fix' : 'cut'}'-контейнера  '${bnam}' для aO5=${idshp}`)
                }

            }
        }
    }
    #InitShps = () => {        // активирую все, не дожидаясь появления (напр. в тестах)
        for (const shp of olga5.o5shp.shps)
            if (!shp.aO5shp)
                olga5.o5shp.AO5shp(shp)
    }

    constructor() {
        this.outlin = { e: '', eOffset: '' }
        this.markout = '     --------------    '
        this.start = true
    }

    CbVisible = (cbx, names) => {
        const
            forclons = names === 'clons',
            opas = cbx.checked ? 1 : (forclons ? 0.22 : 0.11),
            objs = document.getElementsByClassName(forclons ? 'olga5_clon' : 'olga5_cart')

        for (const obj of objs)
            obj.style.opacity = opas

        cbx.nextSibling.nodeValue = names + cbx.checked ? 'видно' : 'тени'
    }
    OutLines = cbx => {
        const
            outlin = this.outlin,
            objs = document.querySelectorAll('.olga5_shp, .olga5_cart')
        // objs = document.getElementsByClassName('olga5_shp')

        if (outlin.e == '') {
            for (const obj of objs) {
                const nst = window.getComputedStyle(obj)
                if (parseFloat(nst.outlineWidth) > 0.1) {
                    outlin.e = nst.outlineColor + ' ' + nst.outlineStyle + ' ' + nst.outlineWidth
                    outlin.eOffset = nst.outlineOffset
                    break
                }
            }
        }

        for (const obj of objs)
            Object.assign(obj.style, {
                outline: cbx.checked ? outlin.e : 'none',
                outlineOffset: cbx.checked ? outlin.eOffset : '0',
            })

        cbx.nextSibling.nodeValue = cbx.checked ? ' с ' : 'без '
    }
    CbMark = e => {
        const
            cbx = e.target,
            b5 = cbx.b5

        if (!b5)
            return

        const
            // puts = b5.aO5.cls.puts,
            // mark = !b5.on ? b5.mark : '',
            check = this.#Checked(cbx),
            nchck = check ? '&nbsp' : b5.put  // переключение 

        cbx.innerHTML = nchck
        // puts[b5.mark] = mark
        // b5.on = !b5.on

        this.#SetaO5(b5.aO5)
        this.#BordNames()
        window.olga5.o5shp.DoResize()
    }
    CbBord = e => {
        const
            cbx = e.target,
            b5 = cbx.b5

        if (!b5)
            return

        const
            idshp = cbx.b5.idshp,
            isfix = cbx.b5.isfix,
            check = this.#Checked(cbx),
            nchck = check ? '&nbsp' : (isfix ? 'f' : 'c')  // переключение 

        if (b5.bnam) {     // обработка общей кнопки
            const bAll = this.#bs.find(b => b.b5.idshp == idshp && b.b5.isfix == isfix && !b.b5.bnam)
            if (bAll)
                bAll.innerHTML = '&nbsp;'
        }
        else
            for (const b of this.#bs)
                if (b.b5.idshp == idshp && b.b5.isfix == isfix && b.b5.bnam)
                    b.innerHTML = nchck

        cbx.innerHTML = nchck

        this.#SetaO5(b5.aO5)
        this.#BordNames()
        window.olga5.o5shp.DoResize()
    }

    SetSize = (style, w, h) => {
        if (w !== false) style.width = w + "px"
        if (h !== false) style.height = h + "px"
    }
    SetPos = (i, dw, dh) => {
        const
            int1 = this.dics[i - 1].int,
            div2 = this.dics[i].div,
            w = div2.offsetWidth + dw,
            h = div2.offsetHeight + dh

        div2.style.left = (w + 20) + "px"
        div2.style.top = (h + 40) + "px"
        int1.scrollTo(w, h)
    }

    dics = []
    InitDivs = () => {
        for (let i = 0; i < 5; i++) {
            this.dics[i] = {
                div: document.getElementById('div' + i),
                int: document.getElementById('int' + i),
                cbo: document.getElementById('cbo' + i),
            }
        }
        this.dics[5] = {
            div: document.getElementById('shp1')
        }
        const div0 = this.dics[0].div
        this.hd0 = div0 ? (div0.offsetHeight - 5) : 0
    }
    OnResize = () => {
        const
            hB = window.innerHeight, // body.clientHeight,
            wB = window.innerWidth   // body.clientWidth,
        let
            h = hB,
            w = wB - 200

        window.scrollTo(0, this.hd0)

        this.SetSize(this.dics[1].div.style, w, h)

        for (let i = 2; i < 5; i++)
            this.SetPos(i, 0, 0)

        body.style.height = this.hd0 + this.dics[1].div.offsetHeight
    }
    OnScroll = e => {
        // console.log(`this.start 1= ${this.start}`)
        if (e.detail.start) {
            if (this.start) {
                this.#SetWindow()
                this.start = false

                this.#InitShps()
                this.#InitCbBords()
                this.#InitCbMarks()
            }
            // this.BordNames()
        }
    }
    InitShp = () => {
        this.OnResize()
        this.SetPos(5, 240, 100)
    }
}

const
    oo5 = new OO5()

window.addEventListener('o5_isInited', oo5.InitShp)
window.addEventListener('o5_onScroll', oo5.OnScroll)
window.addEventListener('resize', oo5.OnResize)
document.addEventListener('DOMContentLoaded', oo5.InitDivs)