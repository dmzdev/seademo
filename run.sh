#!/bin/sh

. ../scripts/envsetup.sh

export DMZ_APP_NAME=seademo

$RUN_DEBUG$BIN_HOME/dmzAppQt -f config/runtime.xml config/resource.xml config/common.xml config/canvas.xml config/input.xml config/js.xml config/version.xml $*
