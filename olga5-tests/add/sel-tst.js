
    <script>
    window.addEventListener('olga5_ready', e => {
        const C = window.olga5.C,
            start = document.getElementById('start'),
            strt = start.innerHTML,
            html = document.getElementById('html'),
            rez = document.getElementById('rez'),
            Prt0 = (fun, query) => {
                html.innerText = strt
                console.log(strt)
            },
            PrtS = mtags => {
                for (const mtag of mtags)
                    mtag.tag.innerHTML += (mtag.tag.innerHTML.trim() ? '<br\>' : '') +
                        `<b>${C.MakeObjName(mtag.tag)}</b>: исходный className="${mtag.origcls}"<br\>` +
                        `получено className="${mtag.tag.className}", квалиф.: ${mtag.quals.length > 0 ? mtag.quals.join(', ') : ' -'}`
            },
            Prt = (fun, query) => {
                const tags = C[fun](query, ''),
                    ss = []
                tags.forEach(tag => { ss.push(C.MakeObjName(tag)) })
                rez.innerHTML += `<br/>------ C.<b>${fun}</b>( ${query}, '' ) :    ${ss.join(', ')}`
            }

        Prt0()

        C.QuerySelectorInit(document.querySelectorAll("[class *= 'olga5_Start']"))
        PrtS(C.SelectByClassName('cx', ''))

        Prt('GetTagsByQueryes', '[o5popup],[title]')
        Prt('GetTagsByIds', "i_p3, rez")
        Prt('GetTagsByClassNames', 'olga5_page_header, cx')
        Prt('GetTagsByTagNames', 'span,p')
    })
</script>