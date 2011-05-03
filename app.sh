#!/bin/sh

. ../scripts/envsetup.sh
export SEADEMO_WORKING_DIR="./"
$RUN_DEBUG$BIN_HOME/seademo $*
