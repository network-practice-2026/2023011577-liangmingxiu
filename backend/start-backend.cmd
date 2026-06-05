@echo off
setlocal

cd /d %~dp0

mvn -q spring-boot:run
