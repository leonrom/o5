#!/bin/bash
cd ../olga5
cat o5com.js \
    o5com/CConsole.js o5com/CEncode.js o5com/CApi.js o5com/CParams.js o5com/TagsRef.js o5com/IniScripts.js \
  > ../!cc/o5com!.js        2> ../!cc/o5.log

cat o5snd/AO5snd.js o5snd/Prep.js o5snd/Imgs.js o5snd.js \
  > ../!cc/o5snd!.js        2>>../!cc/o5.log
  
cat o5shp/MakeAO5.js o5shp/DoInit.js o5shp/DoResize.js o5shp/DoScroll.js o5shp.js \
  > ../!cc/o5shp!.js        2>>../!cc/o5.log

cat o5dbg/events.js o5dbg/logs.js o5dbg/pos.js o5dbg.js \
  > ../!cc/o5dbg!.js        2>>../!cc/o5.log

cat o5inc.js o5tab.js o5pop.js o5mnu.js \
   > ../!cc/o5add!.js       2>>../!cc/o5.log

cat o5ref.js  \
   > ../!cc/o5ref!.js       2>>../!cc/o5.log

cd ../!cc

cat o5com!.js o5add!.js o5ref!.js o5snd!.js o5shp!.js \
   > ../!cc/o5.js           2>>../!cc/o5.log

cat ../css/olga5-a.css  > ../../tr/css/olga5-a.css
cat ../!cc/o5.js  > ../../tr/js/o5.js
