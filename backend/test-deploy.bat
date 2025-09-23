@echo off
REM Vercel Deployment Test Script

echo Starting Vercel deployment test...

REM Deploy test version
echo Deploying test version...
vercel --local-config=vercel-test.json --confirm

echo Test deployment completed!
echo You can now test the endpoints:
echo   - GET /
echo   - GET /health
echo   - GET /test-db

pause