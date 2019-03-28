#!/bin/bash -x
src="src.rdl"
ohtml="manual.html"
otex="oae_reference"
oplain="説明書.txt"

${TOOLSDIR}/rdlconv.x -f "html" -o "${ohtml}" "${src}"
sed -i '/^<head>$/s-$-<title>omopaedit 簡易マニュアル</title>-' "${ohtml}"

#${TOOLSDIR}/rdlconv.x -f "tex" -o "${otex}.tex" "${src}"
#${TEXDIR}/platex --kanji=utf8 "${otex}"
#${TEXDIR}/platex --kanji=utf8 "${otex}"
#${TEXDIR}/dvipdfmx -p a4 "${otex}"

${TOOLSDIR}/rdlconv.x -f "plain" -o "${oplain}" "${src}"
unix2dos "${oplain}"
