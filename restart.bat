@echo off
if [%1] == [/p] goto PULL
if [%1] == [/P] goto PULL
if [%1] == [-p] goto PULL
if [%1] == [-P] goto PULL

call pm2 restart mas
goto END

:PULL
call pm2 delete mas
git pull
call pm2 start index.js --name mas

:END
