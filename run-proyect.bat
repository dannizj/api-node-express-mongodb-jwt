@echo off
set "PATH=%LOCALAPPDATA%\Programs\nodejs;%LOCALAPPDATA%\Programs\MongoDB\Server\9.0.4\bin;%PATH%"

start "MongoDB" cmd.exe /k "mongod.exe --dbpath C:\data\db"

start "API Node" cmd.exe /k "cd /d D:\Documentos\Proyectos\Backend\Nodejs\api-node-express-mongodb-jwt && npm start"