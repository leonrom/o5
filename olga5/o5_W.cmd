

type o5com.js ^
     o5com\CConsole.js o5com\CEncode.js o5com\CApi.js o5com\CParams.js ^
     o5com\TagsRef.js o5com\IniScripts.js ^
   > o5com!.js  2> o5.log

type o5shp\AO5shp.js o5shp\DoInit.js o5shp\DoResize.js o5shp\DoScroll.js ^
     o5shp.js ^
   > o5shp!.js  2>>o5.log

type o5snd\MakeAO5.js o5snd\Prep.js o5snd\Imgs.js ^
     o5snd.js ^
   > o5snd!.js  2>>o5.log

type o5dbg/events.js o5dbg/logs.js o5dbg/pos.js ^
    o5dbg.js ^
  > o5dbg!.js   2>>o5.log

type o5com!.js ^
     o5ref.js o5tab.js o5snd!.js o5shp!.js o5pop.js o5mnu.js ^     
   > o5.js 2>>o5.log
