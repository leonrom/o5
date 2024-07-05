/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
/*
 * ToDO (когда-то сделать):
 */
(function () { // ============================================================================================
    'use strict';
    const olga5_script = document.currentScript, // || document.scripts[document.scripts.length - 1],
        olga5_snam = olga5_script.src.replace(/(\S+\/)|(.js$)/, ''),
        olga5_class = 'olga5-popdown',
        cls_selected = 'selected',
        olPaddingLeft = 32,
        ololPaddingLeft = 22,
        divPaddingLeft = 4,
        divMarginLeft = 33,
        divBorderWidth = 1,
        divPadding = 4,
        divMargin = 8,
        css = `
        body.${olga5_class} {
            margin: 0;
            padding: 0;
            background-color: palegreen;
        }        
.${olga5_class} h3:first-child {
    margin-bottom: 2px;
    text-align: center;
	text-align: -moz-center;
	text-align: -webkit-center;
    margin-top: 6px;
}
.${olga5_class} div:first-child {
    margin: 0;
    padding: 4px 6px 2px 8px;
}
.${olga5_class} iframe {
	border: none;
    width: 100%;
}
.${olga5_class} div.onstart>iframe { height: 9999px; }
.${olga5_class} div.isshown>iframe { height: min-content;}

.${olga5_class} ol {
	list-style: none;
    line-height: 1.5em;
	counter-reset: li;
    width:  max-content;
    padding-left: ${olPaddingLeft}px;
    white-space: nowrap;
    overflow: hidden;
}
ol.${olga5_class} ol { padding-left: ${ololPaddingLeft}px; }
ol.${olga5_class} ul {
	list-style: none;
	padding-inline-start: 1em;
}
ol.${olga5_class} div { cursor: default;}
ol.${olga5_class} ul li:before { content: ' '; }
ol.${olga5_class}>li span {
	font-weight: normal;
	font-size: medium;
}
ol.${olga5_class} li>span {
	cursor: pointer;
    padding-right:4px;
    outline: none;
}
ol.${olga5_class} li:hover>span{
    background-color: antiquewhite;
}
ol.${olga5_class} li.${cls_selected}>span{
    background-color:azure;
    outline: 1px solid limegreen;
    padding-left: 4px;
}
ol.${olga5_class}>li.${cls_selected}>span,
ol.${olga5_class}>li:hover>span {
	font-size: large;
}
ol.${olga5_class}>li.${cls_selected}>span {
	font-size: large;
	font-weight: bold;
}
.${olga5_class} code {
    color: blue;
    font-weight: bold;
}
// .${olga5_class} span[title] {
// 	background-color: cyan;
// 	padding: 0px 4px 2px 4px;
// 	border-radius: 5px;
// }
ol.${olga5_class}>li>span code {
	font-family: monospace;
}
ol.${olga5_class} li.${cls_selected}>input {
	opacity: 1;
	cursor: pointer;
}
ol.${olga5_class} li>input {
	opacity: 0
}
.${olga5_class} ol li:before {
	counter-increment: li;
	content: counters(li, '.') '. ';
}
ol.${olga5_class} li>div {
    border: none;
	padding: ${divPadding}px;
	padding-left: ${divPaddingLeft}px;
	margin: ${divMargin}px;
	margin-left: ${divMarginLeft}px;
	background-color: transparent;
    max-width: 99%;
    height: min-content;
}
ol.${olga5_class} li>div.onstart {
    max-width: 9999px;
	width: 9999px;
    height: 0px;
    opacity:0;
}
ol.${olga5_class} li>div.isshown {
    max-width: 99%;
	border: ${divBorderWidth}px solid aqua;
	background-color: azure;
    opacity:1;
    padding-bottom: 0;
    margin-left: -15px;
}
ol.${olga5_class}>li>div { display: none; }
ol.${olga5_class}>li.${cls_selected}>div{ display: block;}
ol.${olga5_class}>li>div {
	border: none;
	padding: 0;
	margin: 0;
	background-color: transparent;
}
ol.${olga5_class} li>div h4 {
	margin-block-start: 0.33em;
	margin-block-end: 0.33em;
	margin-left: 2em;
	font-style: italic;
}
ol.${olga5_class} li>div pre {
	vertical-align: baseline;
	text-align: left;
	text-align: -moz-left;
	text-align: -webkit-left;
	font-size: x-small;
	font-family: monospace;
	border: solid lightpink 1px;
	background-color: beige;
	width: max-content;
	max-width: 99%;
	padding: 3px;
	padding-right: 12px;
	padding-left: 6px;
}
`,
        divs = {},
        InitCSS = (css, doc = document) => {
            const id = olga5_class + '_internal'

            if (doc.getElementById(id)) return

            const cs1 = css.replaceAll(/\/\*.*\*\//g, ''), // лучше так, по-отдельности
                str = cs1.replaceAll(/\/\/.*\n/g, '\n').replace(/\/\/.*$/, ''),
                styl = doc.createElement('style')

            styl.setAttribute('type', 'text/css');
            styl.id = id
            doc.head.appendChild(styl).innerHTML = str
        },
        CheckParent = (li, checked) => {
            let p = li.parentElement
            while (p && p.nodeName != 'LI') p = p.parentElement
            if (p && p.nodeName == 'LI') {
                if (checked) p.$o5.checked = true
                else {
                    const ol = li.$o5.ol
                    p.$o5.checked = false
                    for (const l of ol.$o5.lis)
                        p.$o5.checked |= l.$o5.checked
                }
            }
        },
        SwitchLis = (li, Fun) => {
            const ols = li.getElementsByTagName('ol')
            if (ols && ols.length > 0) {
                const lis = ols[0].$o5.lis
                for (const l of lis) {
                    Fun(l)
                    SwitchLis(l, Fun)
                }
            }
        },
        OpenH = (li) => {
            li.classList.add(cls_selected)
            li.$o5.ol.li = li
            if (!li.id) return

            if (!li.$o5.input) { // добавляется только после первого клика,- если было подчёркивание
                const spans = li.getElementsByTagName('span'),
                    input = document.createElement('input')

                li.$o5.span.title += ", CheckBox справа - удержание на экране."

                input.title = 'Удержание раздела на экране'
                input.id = 'input-' + li.id
                input.type = 'checkbox'
                input.$o5 = { li: li }
                input.addEventListener('click', (e) => {
                    const input = e.target,
                        li = input.$o5.li,
                        checked = input.checked
                    li.$o5.checked = checked
                    CheckParent(li, checked)
                })
                if (spans && spans.length > 0) li.insertBefore(input, spans[0].nextSibling);
                else li.appendChild(input)

                li.$o5.input = input
                // console.log('--> input+ ' + li.$o5.input.id + ' для li=' + li.id);
            }
            if (li.id.includes('_')) {
                const nam = li.id
                if (!divs[nam]) {
                    const div = document.createElement('div')

                    div.classList.add('onstart')
                    div.id = 'div-' + nam
                    div.innerHTML = `
<iframe src="./parts/${nam}.html"
    name="${nam}"
    sandbox="allow-scripts allow-same-origin"
>
<h1>браузер не поддерживает отображение &lt;<b>iframe</b>&gt;</h1>
</iframe>
`
                    if (li.$o5.div)
                        alert("повторное добавление 'li.$o5.div' ?");
                    li.appendChild(div)
                    li.$o5.div = div
                    divs[nam] = div
                }
                // console.log('--> div  + ' + li.$o5.div.id + ' для li=' + li.id);
            }
            SwitchLis(li, (l) => { if (l.$o5.checked) OpenH(l) })
            MousePosToLi(li)
        },
        MousePosToLi = (li) => {
            // const w = li.$o5.span.getBoundingClientRect(),
            //     left = w.left + 5,
            //     top = w.top + w.height / 2            
        },
        CloseH = (li) => {
            if (!li.$o5.checked)
                li.classList.remove(cls_selected)

            SwitchLis(li, (l) => { CloseH(l) })

            if (li.$o5.div) {
                // console.log('--> div  - ' + li.$o5.div.id + ' для li=' + li.id);
                li.removeChild(li.$o5.div)
                li.$o5.div = null
                divs[li.id] = null
            }
        },
        InputCheck = (li, input) => {
            const checked = !input.checked
            input.checked = checked
            li.$o5.checked = checked
            CheckParent(li, checked)
        },
        allTitles = {
            isShown: true,
            Hide: (id) => {
                if (!id.includes('_') || !allTitles.isShown) return
                allTitles.isShown = false

                const lis = document.getElementsByTagName('li')
                for (const li of lis) {
                    li.$o5.span.title = ''
                    const inputs = li.getElementsByTagName('input')
                    if (inputs && inputs.length > 0)
                        inputs[0].title = ''
                }
            },
        },
        SpanClick = function (e) { // д.б. именно 'function', чтобы ловило 'this' !
            const li = this.$o5.li, // e.target.$o5.li,
                ol = li.$o5.ol,
                input = li.$o5.input
            if (input && input.checked) InputCheck(li, input)
            else {
                allTitles.Hide(li.id)

                for (const l of ol.$o5.lis)
                    if (!l.$o5.checked) CloseH(l)

                if (li === ol.li) ol.li = null
                else OpenH(li)
            }
        },
        SpanDblClick = function (e) { // д.б. именно 'function', чтобы ловило 'this' !
            const li = this.$o5.li,
                input = li.$o5.input
            if (input) InputCheck(li, input)
            // e.cancelBubble = true
        },
        WndInit = function () {
            const ols = document.getElementsByTagName('ol'),
                strt = document.getElementsByTagName('div')[0],
                oldW = { timeResize: 0, innerHeight: 0, innerWidth: 0, afterWidth: false },
                OnMessage = (e) => {
                    if (!e.isTrusted) return
        
                    console.log('0 e.data=' + e.data);
        
                    const data = JSON.parse(e.data),
                        div = divs[data.name],
                        iframe = div.getElementsByTagName('iframe')[0]
        
                    if (data.code == "height") {
                        iframe.style.height = (data.height) + 'px'
                        div.style.height = (data.height) + 'px'
                    }
                    else if (data.code == "init") {
                        div.classList.add('isshown')
                        div.classList.remove('onstart')
                        oldW.wmax = data.wmax
                        oldW.wmin = data.wmin
        
                        SetWidth()
                    }
                },
                OnResize = (e) => {
                    if (oldW.innerWidth == window.innerWidth) return
        
                    Object.assign(oldW, { innerWidth: window.innerWidth })
        
                    if (oldW.afterWidth) {
                        oldW.afterWidth = false
                        return
                    }
        
                    const snst = window.getComputedStyle(strt),
                        wbkg = parseInt(snst.width) - parseInt(snst.paddingRight)
        
                    SetWidth()
                },
                OnKeyUp = (e) => { console.log(` key=${e.key}`) },
                SetWidth = () => {
                    const snst = window.getComputedStyle(strt),
                        brds = olPaddingLeft + ololPaddingLeft + divPaddingLeft + divMarginLeft + 2 * divBorderWidth + divPadding + divMargin,
                        w = parseInt(snst.width) - brds,
                        width = w > oldW.wmax ? oldW.wmax : (w < oldW.wmin ? oldW.wmin : w)
                    // console.log(`width= ${width}, w= ${w}`);
                    for (const nam in divs) {
                        const div = divs[nam]
                        if (div) {
                            const iframe = div.getElementsByTagName('iframe')[0],
                                cW = iframe.contentWindow
                            div.style.width = `${width}px`
                            cW.postMessage(`{"code":"width",  "width":${width}}`, '*')
                        }
                    }
                }

            InitCSS(css)

            for (const ol of ols) {
                ol.$o5 = { lis: ol.querySelectorAll(':scope>li'), li: null, checked: false }
                Object.seal(ol.$o5)
                for (const li of ol.$o5.lis) {
                    const span = li.getElementsByTagName('span')[0]
                    span.$o5 = { li: li }
                    span.addEventListener('click', SpanClick) // , {capture: true})
                    span.addEventListener('dblclick', SpanDblClick)
                    span.title += '\nКлик - ' + (li.id.indexOf('_') > 0 ? 'показ раздела справки' : 'содержание раздела справки')
                    li.$o5 = { ol: ol, div: null, span: span, input: null, checked: false }
                    Object.seal(li.$o5)

                }
            }

            window.addEventListener('message', OnMessage)
            window.addEventListener('resize', OnResize)
            window.addEventListener('keyup', OnKeyUp)
        }

    window.$o5 = { InitCSS: InitCSS }

    const
        W = {
            modul: 'o5help',
            Init: WndInit,
        },
        AutoInit = e => { // автономный запуск
            if (!Array.from(document.scripts).find(script => script.src.match(/\/o5(com|common)?.js$/)))
                W.Init()
        }

    document.addEventListener('DOMContentLoaded', AutoInit)

    if (!window.olga5) window.olga5 = []
    if (!window.olga5.find(w => w.modul == W.modul)) {
        if (window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/))
            console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
        window.olga5.push(W)
        window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
    } else
        console.error('%c%s', "background: yellow; color: black;border: solid 2px red;", `}---< Повтор загрузки '${W.modul}`)
})();
