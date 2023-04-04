#!/bin/bash
cat o5com/CConsole.js o5com/CEncode.js o5com/CApi.js o5com/CParams.js \
    o5com/TagsRef.js o5com/IniScripts.js \
    o5com.js \
  > o5common.js 2> o5.log
	
cat o5shp/AO5shp.js o5shp/DoInit.js o5shp/DoResize.js o5shp/DoScroll.js \
     o5shp.js \
  > o5shp!.js   2>>o5.log  

cat o5snd/AO5snd.js o5snd/Prep.js o5snd/Imgs.js \
    o5snd.js \
  > o5snd!.js   2>>o5.log

cat o5ref.js o5snd!.js o5shp!.js o5pop.js \
    o5common.js \
  > o5.js       2>>o5.log
