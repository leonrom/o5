/* global document, window, console*/
/* exported olga5_menuPopDn_Click*/
/*jshint asi:true  */
/*jshint esversion: 6*/
(function () { // ============================================================================================
    'use strict'
    const name = window.name,
        css = `
.container {
  width: max-content;
  height: min-content;
  padding: 5px 10px 5px 12px;
  margin: 0;
}
.container>h3 {
    margin-bottom: 2px;
    text-align: center;
	text-align: -moz-center;
	text-align: -webkit-center;
    margin-top: 6px;
}
.container>p {
    margin-top: 4px;
}
body {
  margin: 0 !important;
  padding: 0 !important;
   overflow: hidden;
   width: max-content;
}
pre {
   margin: 0.2em;
   left: 4em;
   /* float: left; */
   overflow: hidden;
}
h4{
   margin-block-start: 0;
   margin-block-end: 0.3em;
}
`,
        Init = (width) => {
            const div = document.getElementsByTagName('div')[0],
                style = div.style,
                GetSize = (wstyle, type) => {
                    style.width = wstyle
                    const nst = window.getComputedStyle(div)
                    return { w: parseInt(nst.width), h: parseInt(nst.height) }
                },
                OnSize = (e) => {
                    console.log(`o5h: data=${e.data} e.timeStamp= ${e.timeStamp}`);
                    const data = JSON.parse(e.data)
                    if (data.code == 'width') {
                        const h = GetSize(`${data.width}px`, 'h').h
                        // div.style.height = `${h}px`
                        window.top.postMessage(`{"name":"${name}", "code":"height", "height":"${h}"}`, '*')
                    }
                },
                wmin = GetSize('min-content', 'w').w + 10, // это добавил paddingRight (?)
                wmax = GetSize('max-content', 'w').w + 10

            style.minWidth = wmin + 'px'
            style.maxWidth = wmax + 'px'

            window.addEventListener('message', OnSize)
            window.top.postMessage(`{"name":"${name}", "code":"init", "wmax":"${wmax}", "wmin":"${wmin}"}`, '*')

            console.log(`o5h: }---> прочитал '${document.title}',-  wmax:${wmax}, wmin:${wmin}`);
        }

    window.top.$o5.InitCSS(css, window.document)
    document.addEventListener('DOMContentLoaded', Init)

    console.log('o5h: window= ' + window.outerHeight, window.outerWidth, window.document.documentURI);
})();
