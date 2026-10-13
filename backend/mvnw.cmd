@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Script for Farm2Door
@REM ----------------------------------------------------------------------------
@echo off
setlocal

set "USER_MAVEN=C:\Users\sarit\.m2\wrapper\dists\apache-maven-3.9.16-bin\5grr65jo27hi51sujmtcldfovl\apache-maven-3.9.16\bin\mvn.cmd"

if exist "%USER_MAVEN%" (
    call "%USER_MAVEN%" %*
) else (
    mvn %*
)
