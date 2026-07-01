@echo off
echo ==============================================
echo Building Yemen Educational Marketplace APK...
echo ==============================================

set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

cd android
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
