#!/bin/sh
DEPTH=../../..
lmk -m opt -b
cp -RL $DEPTH/bin/macos-opt/SEADEMO.app $DEPTH
mkdir $DEPTH/SEADEMO.app/Contents/Frameworks/Qt
mkdir $DEPTH/SEADEMO.app/Contents/Frameworks/Qt/plugins
mkdir $DEPTH/SEADEMO.app/Contents/Frameworks/Qt/plugins/imageformats
mkdir $DEPTH/SEADEMO.app/Contents/Frameworks/Qt/plugins/phonon_backend
mkdir $DEPTH/SEADEMO.app/Contents/Frameworks/v8/
cp $DEPTH/depend/Qt/QtCore $DEPTH/SEADEMO.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtGui $DEPTH/SEADEMO.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtXml $DEPTH/SEADEMO.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtSvg $DEPTH/SEADEMO.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtOpenGL $DEPTH/SEADEMO.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtWebKit $DEPTH/SEADEMO.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/QtNetwork $DEPTH/SEADEMO.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/phonon $DEPTH/SEADEMO.app/Contents/Frameworks/Qt
cp $DEPTH/depend/Qt/imageformats/libqgif.dylib $DEPTH/SEADEMO.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqjpeg.dylib $DEPTH/SEADEMO.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqtiff.dylib $DEPTH/SEADEMO.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/imageformats/libqsvg.dylib $DEPTH/SEADEMO.app/Contents/Frameworks/Qt/plugins/imageformats
cp $DEPTH/depend/Qt/phonon_backend/libphonon_qt7.dylib $DEPTH/SEADEMO.app/Contents/Frameworks/Qt/plugins/phonon_backend/
if [ -d $DEPTH/depend/QtGui.framework/Versions/4/Resources/qt_menu.nib ] ; then
cp -R $DEPTH/depend/QtGui.framework/Versions/4/Resources/qt_menu.nib $DEPTH/SEADEMO.app/Contents/Resources
fi
cp $DEPTH/depend/v8/lib/libv8.dylib $DEPTH/SEADEMO.app/Contents/Frameworks/v8/
TARGET=$DEPTH/SEADEMO-`cat $DEPTH/tmp/macos-opt/seademoapp/buildnumber.txt`.dmg
hdiutil create -srcfolder $DEPTH/SEADEMO.app $TARGET
hdiutil internet-enable -yes -verbose $TARGET
rm -rf $DEPTH/SEADEMO.app/
INSTALLER_PATH=$DEPTH/installers
if [ ! -d $INSTALLER_PATH ] ; then
   mkdir $INSTALLER_PATH
fi
mv $TARGET $INSTALLER_PATH
