$nodeDir = "C:\Users\Retyan\AppData\Local\Temp\opencode\node-v22.16.0-win-x64"

if (!(Test-Path -LiteralPath $nodeDir)) {
  throw "Node LTS portable tidak ditemukan di $nodeDir"
}

$env:Path = "$nodeDir;$env:Path"

node --version
npm.cmd --version
