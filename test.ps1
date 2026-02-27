# Colors
$Green = "`e[32m"
$Blue = "`e[34m"
$Reset = "`e[0m"

Write-Host "${Blue}=== Phase 1: Registering User ===${Reset}"
$registerBody = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

$registerResponse = Invoke-WebRequest -Uri http://localhost:3000/auth/register `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $registerBody

Write-Host "$($registerResponse.Content)" | ConvertFrom-Json | ConvertTo-Json
Write-Host "${Green}✅ User registered${Reset}`n"

# Wait a moment
Start-Sleep -Seconds 1

Write-Host "${Blue}=== Phase 2: Logging In ===${Reset}"
$loginBody = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri http://localhost:3000/auth/login `
  -Method POST `
  -Headers @{"Content-Type" = "application/json"} `
  -Body $loginBody

$loginData = $loginResponse.Content | ConvertFrom-Json
Write-Host ($loginData | ConvertTo-Json)

$TOKEN = $loginData.token
$USER_ID = $loginData.userId

Write-Host "${Green}✅ Logged in successfully${Reset}`n"
Write-Host "Token: $TOKEN`n"

Write-Host "${Blue}=== Phase 3: Listing Files ===${Reset}"
$filesResponse = Invoke-WebRequest -Uri http://localhost:3000/drm/files `
  -Method GET `
  -Headers @{"Authorization" = "Bearer $TOKEN"}

Write-Host ($filesResponse.Content | ConvertFrom-Json | ConvertTo-Json)
Write-Host "${Green}✅ Files listed${Reset}`n"

Write-Host "${Blue}=== Phase 4: Generating Signed Link ===${Reset}"
$linkBody = @{
    contentId = 1
} | ConvertTo-Json

$linkResponse = Invoke-WebRequest -Uri http://localhost:3000/drm/generate-link `
  -Method POST `
  -Headers @{"Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json"} `
  -Body $linkBody

$linkData = $linkResponse.Content | ConvertFrom-Json
Write-Host ($linkData | ConvertTo-Json)

$SIGNED_URL = $linkData.secureUrl
Write-Host "${Green}✅ Signed URL generated${Reset}`n"
Write-Host "URL: $SIGNED_URL`n"

Write-Host "${Blue}=== Phase 5: Downloading Protected Files ===${Reset}"

# Download sample.pdf
Write-Host "Downloading sample.pdf..."
$fileResponse = Invoke-WebRequest -Uri $SIGNED_URL -OutFile "test-sample.pdf"
Write-Host "${Green}✅ Saved as test-sample.pdf${Reset}`n"

# Download confidential-report.pdf
Write-Host "Downloading confidential-report.pdf..."
$reportUrl = "$SIGNED_URL&file=confidential-report.pdf"
$fileResponse = Invoke-WebRequest -Uri $reportUrl -OutFile "test-report.pdf"
Write-Host "${Green}✅ Saved as test-report.pdf${Reset}`n"

# Download technical-specs.pdf
Write-Host "Downloading technical-specs.pdf..."
$specsUrl = "$SIGNED_URL&file=technical-specs.pdf"
$fileResponse = Invoke-WebRequest -Uri $specsUrl -OutFile "test-specs.pdf"
Write-Host "${Green}✅ Saved as test-specs.pdf${Reset}`n"

Write-Host "${Green}🎉 All tests completed!${Reset}"
Write-Host "Check your current directory for the PDF files"