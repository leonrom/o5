/* global document, window, console*/
/* exported _srcEmpty */
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () {
    'use strict';
    let 
        canvas = null,
        navbar = null
    const
		C = window.olga5.C,
        W = {
            modul: 'o5blog',
            Init: BlogInit, // вызывается при инициализации
            // src: document.currentScript.src,
            class: 'olga5_oblog',
            consts: `		
                o5nocss=0;  // 0 - подключаются CSS'ы;
                o5noact=0;  // не исполнять скрипты в теге <body>;
			`,
        },
        attrs = document.currentScript.attributes,
        navbarName = 'navbar-iframe-container',
        hr_id = 'olga5-Start_hr',
        canvasH = 29,
        o5css = `
aside,
header,
footer,
.date-header,
.navbar-right,
.post-summary,
.widget.PopularPosts,
.fauxcolumn-left-outer,
.fauxcolumn-right-outer,
.post-title.entry-title{
	display:none;
}
.main-inner {
    padding-top: 0px;
	padding-bottom: 10px;
}
.post-body-container{
    margin:0 !important;
    padding:0 !important;
}
body,
.content-outer,
.content-fauxcolumn-outer,
.region-inner {
	min-width: 111px;
	max-width: 1960px;
}
.columns.fauxcolumns{
	padding:0;
}
.uncustomized-post-template{
	margin: 0 0 5px 0;
}

#${navbarName} {
	margin-top: 0px;
	overflow: hidden;
	padding-right: 0;
	margin-left: 111px;
	position: fixed;
	width: calc(100% - 250px);
    display: flex;
	height: 30px;
	max-height: 30px;
}
#${navbarName}>iframe{
	background-color: transparent;
	margin-left: -32px;
	width: 236px;
	top: 2px;
	position: relative;
	height:inherit;
}
.content-outer {
  margin-right: 3px !important;
  margin-left: 3px ;
  float: right ;
  width: 95%;
  max-width: 99%  ;
  min-width: 111px;
  right:2%;
  color:black;
}
.content-inner{
	padding: 8px 8px;
}

#${navbarName}>div{
    position: relative;
    width: 100%;
	text-align: center;
	text-align: -moz-center;
	text-align: -webkit-center;
}
#${navbarName}>div>span {
    vertical-align: text-top;
	font-family: serif;
	font-size: large;
}
canvas{
	background-color: floralwhite;
    border-bottom: 2px solid gray;
	width: 100%;
	z-index: 1;
	position: fixed;
	left: 0;
	top: 0;
	height: ${canvasH}px;
}
.${W.class}_dsbl{
	color:lightgray !important;
	font-style: italic;
}
.${W.class}_dsbl:hover{
	color:gray !important;
}
#${hr_id}{
    position: fixed;
    top: ${canvasH}px;
    width: 100%;
    opacity: 0;
}
`,
        CanvasSize = function () {
            const nst = window.getComputedStyle(navbar),
                h = parseFloat(nst.getPropertyValue('height')) || 0
            canvas.style.height = h + 'px'
        },
        // GetCSS = () => {
        //     const chs = document.head.children
        //     for (const ch of chs)
        //         if (ch.nodeName == "STYLE" && ch.id == namo5css)
        //             return ch
        // },
        // FillMenu = function () {
        //     if (C.consts.o5nomnu <= 0) {
        //         const dsbl = W.class + '_dsbl',
        //             id = 'o5mnu-blog'

        //         if (!document.getElementById(id)) {
        //             if (window.olga5.Menu) window.olga5.Menu([
        //                 { span: 'Блог', id: id, left: '5px', top: '5px', add: '233px', base: 'https://olga-5.blogspot.com/2020/02', scroll: '-30' },
        //                 { span: 'Подключение библиотеки', ref: '/olga5-all.html' },
        //                 { span: 'Обработка аудио ссылок', ref: '/olga5-snd.html' },
        //                 { span: 'Именованные ссылки в адресах', ref: '/olga5-ref.html' },
        //                 { span: 'Подвисание тегов на странице', ref: '/olga5-shp.html' },
        //                 { span: 'Всплывающие окна', ref: '/olga5-pop.html' },
        //                 { span: '' },
        //                 { span: 'Меню блога и страниц', ref: '/olga5-mnu.html', title: 'страница еще редактируется', class: dsbl },
        //                 { span: 'Подключение к Blogger`у', ref: '/olga5-blog.html', title: 'страница еще редактируется', class: dsbl },
        //             ])
        //             else
        //                 C.ConsoleError("для '" + W.modul + ".js' нет подключенного модуля 'window.olga5.Menu'", 'o5mnu')
        //         }
        //     } else {
        //         const navs = document.getElementsByClassName('navbar section')
        //         if (navs)
        //             for (const nav of navs)
        //                 nav.style.display = 'none'
        //     }
        // },
        FillNavBar = function () {
            canvas = document.createElement('canvas')

            CanvasSize()
            C.page.AppendChild(document.body, canvas)

            const hr = document.createElement('hr')
            hr.pO5ext = true
            hr.id = hr_id
            C.page.AppendChild(document.body, hr)

            const div = document.createElement('div'),
                libheader = document.getElementsByClassName('header-inner'),
                libtitle = (libheader && libheader.length > 0) ? libheader[0].getElementsByClassName('title') : null,
                a = libtitle ? libtitle[0].getElementsByTagName('a') : null,
                header = a && a[0] ? a[0].innerText.trim() : 'Текст статьи',
                spanT = '<div style="font-size: medium;line-height: normal;">',
                titles = document.getElementsByClassName('post-title entry-title'),
                title = (titles && titles.length > 0) ? titles[0].innerHTML : header,
                spanH = '<div style="color: black;    line-height: normal;font-size: smaller;font-family: serif;font-style: italic;font-stretch: extra-condensed;">'

            div.id = 'd11_header'
            div.innerHTML = spanH + header + '</div>' + spanT + title + '</div>'

            C.page.AppendChild(navbar, div)

            C.E.AddEventListener('resize', CanvasSize)	
        },
        ObserveNavbar = (tag, id) => {
            let mo = null
            const CheckNavLbls = (mutations) => {
                for (const mutation of mutations)
                    for (const node of mutation.addedNodes)
                        if (node.id == id) {
                            FillNavBar()
                            mo.disconnect()
                            mo = null
                            return
                        }
            }
            mo = new MutationObserver(CheckNavLbls)
            mo.observe(tag, { 'childList': true, 'subtree': true });
        },
        SetNavBar = function (navbar) {
            const navlbl = 'navbar-iframe'
            // for (const navlbl of navlbls) {
            if (document.getElementById(navlbl)) {
                FillNavBar()
                return
            }
            ObserveNavbar(navbar, navlbl)

            // let mo = null
            // const CheckNavLbls = (mutations) => {
            //     for (const mutation of mutations)
            //         for (const node of mutation.addedNodes)
            //             if (node.id == navlbl) {
            //                 FillNavBar()
            //                 mo.disconnect()
            //                 mo = null
            //                 return
            //             }
            // }
            // mo = new MutationObserver(CheckNavLbls)
            // mo.observe(navbar, { 'childList': true, 'subtree': true });
        },
        // MakeNavBar = function (c) {
        //     navbar = document.getElementById(navbarName)
        //     if (navbar) SetNavBar(navbar)
        //     else
        //         ObserveNavbar(document, navbarName)
        //     // {
        //     //     let mo = null
        //     //     const CheckNavLbls = (mutations) => {
        //     //         for (const mutation of mutations)
        //     //             for (const node of mutation.addedNodes)
        //     //                 if (node.id == navbarName) {
        //     //                     SetNavBar(node)
        //     //                     mo.disconnect()
        //     //                     mo = null
        //     //                     return
        //     //                 }
        //     //     }
        //     //     mo = new MutationObserver(CheckNavLbls)
        //     //     mo.observe(document, { 'childList': true, 'subtree': true });
        //     // }
        // },
        AddRefToO5 = function () {
            const pagers = document.getElementsByClassName('post-outer-container')

            if (pagers && pagers.length > 0) {
                const myref = document.createElement('div'),
                    pager = pagers[pagers.length - 1],
                    id = 'olga5_post-body-container'
                myref.id = id
                myref.style = `
                    font-family: monospace;
                    font-size: 10px;
                    display: block;
                    white-space: pre;
                    margin: 1px 1px 16px 3px;
                    `
                myref.innerHTML = 'Использовалась <i>библиотека</i> &nbsp;' +
                    '<a href="https://olga-5.blogspot.com/2020/02/olga5-all.html" style="font-size: 12px;" target="olga5-addPage"><code>Olga5</code></a>'
                // pagers[pagers.length-1].appendChild(myref)

                const posts = document.getElementsByClassName('post-body-container')
                if (posts && posts.length > 0) {
                    for (const post of posts)
                        if (!post.getElementById(id))
                            post.appendChild(myref)
                }
                else
                    if (!pager.getElementById(id)) {
                        const comments = pager.getElementsByClassName('comments')
                        if (comments.length > 0) pager.insertBefore(myref, comments[0]);
                        else pager.appendChild(myref)
                    }
            }
        },
        RemoveUnused = () => {
            const unusedClasses = ['post-header-container', 'post-title-container', 'post-sidebar', 'post-bottom']
            for (const unused of unusedClasses) {
                const links = document.getElementsByClassName(unused)
                for (const link of links)
                    if (link.id != navbarName)
                        link.style.display = 'none' ///parentNode.removeChild(link)
            }
        },

        NoAttr = name => !attrs || !attrs[name] || !attrs[name].value

    function BlogInit() { // Модуль инициализации скрипта
        if (!W.isReady) {
            if (NoAttr('o5nocss')) C.ParamsFill(W, o5css)
            else C.ParamsFill(W)

            // if (NoAttr('o5noact')) ActScripts()

            MakeNavBar()
            AddRefToO5()
        }

        RemoveUnused()

        // window.dispatchEvent(new CustomEvent('olga5_sinit', { detail: { modul: W.modul } }))
		C.E.DispatchEvent('olga5_sinit', W.modul)
    }

    if (!window.olga5) window.olga5 = []
    if (!window.olga5.find(w => w.modul == W.modul)) {
        if (window.location.search.match(/(\&|\?|\s)(is|o5)?(-|_)?debug\s*(\s|$|\?|#|&|=\s*\d*)/))
            console.log(`}---< ${document.currentScript.src.indexOf(`/${W.modul}.`) > 0 ? 'загружен  ' : 'включён   '}:  ${W.modul}.js`)
        window.olga5.push(W)
        // window.dispatchEvent(new CustomEvent('olga5_sload', { detail: { modul: W.modul } }))
        C.E.DispatchEvent('olga5_sload', W.modul)
    } else
        console.error('%c%s', "background: yellow; color: black;border: solid 2px red;", `}---< Повтор загрузки '${W.modul}`)
})();
