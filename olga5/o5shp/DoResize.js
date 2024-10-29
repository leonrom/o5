/* global window */
/*jshint asi:true  */
/*jshint strict:true  */
/*jshint esversion: 6 */
//!
(function () {              // ---------------------------------------------- o5shp/DoResize ---
    "use strict"

    const
        olga5_modul = "o5shp",
        // modulname = 'DoResize',
        C = window.olga5.C,
        DoResize = () => {
            for (const aO5 of wshp.aO5s)
                aO5.Resize()
        },
        wshp = C.ModulAddSub(olga5_modul, DoResize)
})();
