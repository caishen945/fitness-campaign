# Badge Mapping Manual Regression Checklist

Scope:
- admin/public/src/pages/SystemSettings.js
- admin/public/src/components/EmailConfigWizard.js
- frontend/public/pages/Team.js

What to verify:
1. Version badge uses green style for current version
2. Service status badges show green when running
3. Wizard progress counter badge uses primary style and updates as steps advance
4. Team commissions and rewards tables map statuses to colors:
   - paid -> success (green)
   - pending -> warning (yellow)
   - failed/rejected -> danger (red)
5. Unknown category/code falls back to secondary (gray)
6. Light/Dark modes keep badge text readable
7. Mobile viewport does not wrap badges incorrectly

Steps:
1. Open Admin -> Settings. Confirm version badge and system status badges.
2. Open Email Config Wizard, move through steps; check progress badge and bar.
3. Open Frontend Team page with data covering paid/pending/failed states; validate badge colors and labels.
4. Temporarily inject an unknown status via DevTools to confirm gray fallback.

Record template:
- Page: 
- Scenario: 
- Steps: 
- Expected: 
- Actual: 
- Screenshot: 
- Result: Pass/Fail

