@echo off
echo ==============================================
echo Building الدليل الأكاديمي APK...
echo ==============================================

rem Try Android Studio JBR first, then fallback to other JDK paths
if exist "C:\Program Files\Android\Android Studio\jbr" (
    set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
) else if exist "C:\Program Files\Android\jdk\jdk-8.0.302.8-hotspot" (
    set JAVA_HOME=C:\Program Files\Android\jdk\jdk-8.0.302.8-hotspot
) else if exist "C:\Program Files\Java\jdk-17" (
    set JAVA_HOME=C:\Program Files\Java\jdk-17
)
set PATH=%JAVA_HOME%\bin;%PATH%

echo Using JAVA_HOME=%JAVA_HOME%
"%JAVA_HOME%\bin\java" -version 2>&1

cd /d "%~dp0android"
call gradlew assembleDebug

echo.
echo ==============================================
if %ERRORLEVEL% EQU 0 (
    echo BUILD SUCCESSFUL!
    echo Your APK is located at:
    echo %~dp0android\app\build\outputs\apk\debug\app-debug.apk
) else (
    echo BUILD FAILED. Please check the errors above.
)
echo ==============================================
pause
