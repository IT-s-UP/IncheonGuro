$ErrorActionPreference = 'Stop'
$jdk = Get-ChildItem "$env:ProgramFiles\Eclipse Adoptium" -Directory -Filter 'jdk-17*' | Select-Object -First 1
if (!$jdk) { throw 'Java 17 JDK is required.' }
$env:JAVA_HOME = $jdk.FullName
$cacheDir = if ($env:GRADLE_USER_HOME) { $env:GRADLE_USER_HOME } else { Join-Path $env:SystemDrive "Temp\incheonguro-gradle" }
Set-Location $PSScriptRoot
& .\gradlew.bat bootRun --gradle-user-home $cacheDir --no-daemon '--args=--spring.profiles.active=local'
exit $LASTEXITCODE
