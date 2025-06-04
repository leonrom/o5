"use strict";
class OO5 {
    #fmtErr = "background: yellow; color: black;"
    #BordNames = () => {
        const wshp = window.olga5.o5shp
        if (!wshp) return

        const
            pitches = { 'O': 'наезд', 'P': 'сталк', 'C': 'стиск', 'S': 'сдвиг' },
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
                s = '<b>' + aO5.name + '</b>' +
                    `<br/>` +
                    '<b>' + Join(cls.puts) + '</b>' +
                    ':<b>' + cls.pitch + '</b>(' + pitches[cls.pitch] + ')' +
                    (cls.alive ? ':<b>A</b>live' : '') +
                    (cls.level > 0 ? ':<b>' + cls.level + '</b>' : '') +
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
    }
    #Checked = b => ['f', 'c', 'T', 'B', 'L', 'R', 'O', 'P', 'C', 'S'].includes(b.innerHTML)
    #SetaO5 = aO5 => {
        const
            sb = [],
            sm = [],
            ss = []

        for (const b of this.#bs)
            if (this.#Checked(b)) {
                const b5 = b.b5

                switch (b5.clas) {
                    case 'frame': if (b5.aO5 == aO5)
                        sb.push('i=' + b5.val + (b5.isfix ? '/f' : '/c'))
                        break;
                    case 'pmark': if (b5.aO5 == aO5)
                        sm.push(b5.val)
                        break;
                    case 'pshft': if (b5.aO5 == aO5 && b.classList.contains('select'))
                        ss.push(b5.val)
                        break;
                }
            }

        aO5.ReadAttrs([sm.join('') + ':' + ss.join('') + ':' + aO5.cls.level, sb.join(',')])

        this.#BordNames()

        const wshp = window.olga5.o5shp
        wshp.DoResize()
        wshp.OnScroll()

        // this.#BordNames()
        // window.olga5.o5shp.DoResize()
    }
    #SetWindow = () => {    // w0, h0
        if (window.name.indexOf('olga5_popup') < 0) // если НЕ было открыто из родителя ---
            return

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

                    b.b5 = { aO5: aO5, clas: clas, idshp: idshp, isfix: isfix, val: val, }
                    Object.seal(b.b5)

                    let Fun = null
                    switch (b.b5.clas) {
                        case 'frame': Fun = this.CbBord; break;
                        case 'pmark': Fun = this.CbMark; break;
                        case 'pshft': Fun = this.CbShft; break;
                    }
                    b.addEventListener('click', Fun)

                    this.#bs.push(b)

                    if (aO5)
                        b.classList.add('active')

                    if (m > 1)
                        break
                }
            }
        }
        return spans.length
    }
    #InitCbMarks = () => {
        const clas = 'pmark'
        if (!this.#InitCbs(clas))
            return

        for (const shp of olga5.o5shp.shps) {
            const
                aO5 = shp.aO5shp,
                idshp = aO5.id

            for (const put in aO5.cls.puts) {
                const b = this.#bs.find(b => b.b5.clas == clas && b.b5.idshp == idshp && b.b5.val == put)
                if (b)
                    b.innerHTML = aO5.cls.puts[put].trim() ? put : '&nbsp;'
                else
                    console.log("%c%s", this.#fmtErr, `нет 'b[${put}]' для aO5=${idshp}`)
            }
        }

        this.#BordNames()
    }
    #InitCbShfts = () => {
        const clas = 'pshft'
        if (!this.#InitCbs(clas))
            return

        for (const shp of olga5.o5shp.shps) {
            const
                aO5 = shp.aO5shp,
                idshp = aO5.id,
                errs = []
            for (const put of ['O', 'P', 'C', 'S']) {
                const b = this.#bs.find(b => b.b5.clas == clas && b.b5.idshp == idshp && b.b5.val == put)
                if (b)
                    b.innerHTML = put
                else
                    errs.push(`b[${put}]`)
            }
            if (errs.length)
                console.log("%c%s", this.#fmtErr, `${clas}: нет ${errs.join(', ')} для aO5=${idshp}`)
        }

        this.#BordNames()
    }
    #InitCbBords = () => {
        const clas = 'frame'
        if (!this.#InitCbs(clas))
            return

        for (const shp of olga5.o5shp.shps) {
            const
                aO5 = shp.aO5shp,
                idshp = aO5.id,
                errs = []
            for (const frame of aO5.frames) {
                const
                    bnam = frame.tag.id

                for (const isfix of [true, false]) {
                    const b = this.#bs.find(b =>
                        b.b5.clas == clas && b.b5.idshp == idshp && b.b5.val == bnam && b.b5.isfix === isfix)
                    if (b)
                        b.innerHTML = isfix ? (frame.fix ? 'f' : '&nbsp;') : (frame.cut ? 'c' : '&nbsp;')
                    else
                        errs.push(`'${bnam}/${isfix ? 'fix' : 'cut'}' для тега '${idshp}'`)
                }
            }
            if (errs.length)
                console.log("%c%s", this.#fmtErr, `Для ${aO5.name} нет контейнеров ${errs.join(', ')}`)
        }
    }
    #InitCtrls = () => {
        let aO5, clas;
        const
            Funs = { 'frame': this.CbBord, 'pmark': this.CbMark, 'pshft': this.CbShft, 'level': this.CbLevel }
        divE = document.getElementById('div-etalon'),
            errors = [],
            FillFrams = () => {
                const
                    errs = [],
                    spans = Array.from(aO5.shp.getElementsByClassName(clas)),
                    Addb = (b, val, isfix) => {
                        b.b5 = { aO5: aO5, clas: clas, val: val, isfix: isfix }
                        b.addEventListener('click', Funs[clas])
                        this.#bs.push(b)
                    },
                    Fillbs = (sp, idshp) => {
                        sp.aO5found = true
                        bs = sp.getElementsByTagName('b')
                        for (const isfix of [true, false]) {
                            const b = bs[i]
                            b.innerHTML = isfix ? (frame.fix ? 'f' : '&nbsp;') : (frame.cut ? 'c' : '&nbsp;')
                            Addb(b, bs[i].innerHTML, isfix)
                        }
                    }

                clas = 'frame'
                for (const frame of aO5.frames) {
                    const
                        idshp = frame.tag.id,
                        sp = spans.find(sp => sp.classList.contains(idshp))

                    if (sp)
                        Fillbs(sp, idshp)
                    else
                        errs.push(`нет фрейма '${frame.s}'`)
                }
                const sp = spans.find(sp => sp.className.trim() === clas)
                Fillbs(sp, '&nbsp;')

                for (const sp of aO5.spans)
                    if (!sp.aO5found)
                        errs.push(`лишний фрейм '${sp.className}'`)

                if (errs.length > 0)
                    errors.push(`${aO5.name}: %{errs.join(', ')}`)
            },
            Getbs = (nam, list) => {
                const
                    errs = [],
                    spans = Array.from(aO5.shp.getElementsByClassName(clas))
                // bs = Getbs(clas)
                for (const val of list) {
                    const bs = spans.find(bs => bs.classList.contains(val))
                    if (bs)
                        Addb(bs.getElementsByTagName('b')[0], val)
                    else
                        errs.push(`нет ${nam} 'bs[${val}]'`)
                }

                return errs
            },
            FillShfts = () => {
                clas = 'pshft'
                const errs = Getbs('сдвига', ['O', 'P', 'C', 'S'])
                if (errs.length > 0)
                    errors.push(`${aO5.name}: %{errs.join(', ')}`)
            },
            FillMarks = () => {
                clas = 'pmark'
                const errs = Getbs('фрейма', ['T', 'B', 'L', 'R'])
                if (errs.length > 0)
                    errors.push(`${aO5.name}: %{errs.join(', ')}`)
            },
            FillLevel = () => {
                clas = 'level'
                const
                    bs = Getbs(clas)

                Object.assign(inp = bs[0], { aO5: aO5, value: aO5.cls.level, onchange: Funs[clas], })
            }

        for (const shp of olga5.o5shp.shps) {
            const
                divX = document.createElement('div'),
                div = divE.parentNode.appendChild(divX)
            let errs;

            aO5 = shp.aO5shp
            div.classList.add('div-shp')
            div.innerHTML = divE.innerHTML
            div.getElementsByClassName('name')[0].innerText = shp.id

            FillFrams()
            FillShfts()
            FillMarks()
            FillLevel()
        }
        if (errors.length)
            window.olga5.C.ConsoleError(`Ошибки инициализации тест. примера`, errors.length, errors)
    }
    #InitShps = () => {        // активирую все, не дожидаясь появления (напр. в тестах)
        for (const shp of olga5.o5shp.shps)
            if (!shp.aO5shp)
                olga5.o5shp.AO5shp(shp)

        const wshp = window.olga5.o5shp
        wshp.DoResize()
    }

    constructor() {
        this.outlin = { e: '', eOffset: '' }
        this.markout = '     --------------    '
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

        // cbx.nextSibling.nodeValue = cbx.checked ? ' с ' : 'без '
    }
    CbLevel = e => {
        const
            inp = e.target

        aO5.cls.level = inp.value
        this.#SetaO5(b5.aO5)
    }
    CbShft = e => {
        const
            cbx = e.target,
            b5 = cbx.b5

        if (!b5)
            return

        const
            check = this.#Checked(cbx)

        cbx.classList.add('select')

        for (const b of this.#bs)
            if (b.b5.clas === b5.clas && b.b5.aO5 === b5.aO5 && b.b5 !== b5)
                b.classList.remove('select')

        this.#SetaO5(b5.aO5)
    }
    CbMark = e => {
        const
            cbx = e.target,
            b5 = cbx.b5

        if (!b5)
            return

        const
            check = this.#Checked(cbx),
            nchck = check ? '&nbsp' : b5.val  // переключение 

        cbx.innerHTML = nchck

        this.#SetaO5(b5.aO5)
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

        if (b5.val) {     // обработка общей кнопки
            const bAll = this.#bs.find(b => b.b5.idshp == idshp && b.b5.isfix == isfix && !b.b5.val)
            if (bAll)
                bAll.innerHTML = '&nbsp;'
        }
        else
            for (const b of this.#bs)
                if (b.b5.idshp == idshp && b.b5.isfix == isfix && b.b5.val)
                    b.innerHTML = nchck

        cbx.innerHTML = nchck

        this.#SetaO5(b5.aO5)
    }

    InitShp = () => {
        this.#SetWindow()
        this.#InitShps()
        this.#InitCtrls()
        // this.#InitCbBords()
        // this.#InitCbMarks()
        // this.#InitCbShfts()

    }
}

const oo5 = new OO5()

window.addEventListener('o5_isInited', oo5.InitShp)