@echo off
echo ========================================
echo MANUEL PUSH ISLEMI
echo ========================================
echo.
cd /d "%~dp0"

echo 1. Remote degisiklikleri cekiliyor...
git fetch origin main
if %errorlevel% neq 0 (
    echo HATA: Fetch basarisiz!
    pause
    exit /b
)

echo.
echo 2. Mevcut durum kontrol ediliyor...
git status

echo.
echo 3. Remote degisiklikleri merge ediliyor...
git pull origin main --no-rebase
if %errorlevel% neq 0 (
    echo.
    echo UYARI: Pull basarisiz olabilir!
    echo Eger conflict varsa, conflict'leri cozun ve devam edin.
    echo.
    pause
)

echo.
echo 4. Degisiklikler ekleniyor...
git add -A

echo.
echo 5. Commit yapiliyor...
git commit -m "Frontend update - %date% %time%"
if %errorlevel% neq 0 (
    echo UYARI: Commit yapilamadi (degisiklik yok olabilir)
)

echo.
echo 6. GitHub'a push ediliyor...
git push origin main
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo PUSH BASARISIZ!
    echo ========================================
    echo.
    echo Lutfen asagidaki komutlari manuel olarak calistirin:
    echo.
    echo   git pull origin main
    echo   git push origin main
    echo.
    echo Eger hala hata alirsaniz:
    echo   1. Authentication kontrol edin (Personal Access Token)
    echo   2. Conflict varsa cozun
    echo   3. git status ile durumu kontrol edin
    echo.
) else (
    echo.
    echo ========================================
    echo PUSH BASARILI!
    echo ========================================
)

pause
