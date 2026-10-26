# GreenGrid – Testing, Errors & Fixes Report

## 1. Project Information

Project Name: GreenGrid – Smart Energy Management System  
Frontend: React + Vite + Tailwind CSS + Recharts  
Backend: Python + Django + Django REST Framework  
Database: SQLite  
Authentication: JWT / SimpleJWT

## 2. Testing Objective

The existing GreenGrid system was tested to identify functional, integration, runtime, API, and configuration errors before final submission. Only issues reproduced through the running application or confirmed by its API contract are recorded below.

## 3. Testing Environment

- OS: Windows; commands run from PowerShell.
- Node.js: 24.13.0; npm: 11.6.2.
- Frontend installed versions: React 18.3.1, React Router 6.30.6, Vite 5.4.21, Tailwind CSS 3.4.19, Axios 1.20.0, Recharts 2.15.4, lucide-react 0.363.0.
- Python: 3.13.6; Django 4.2.16; Django REST Framework 3.14.0; SimpleJWT 5.3.1; django-cors-headers 4.3.1.
- Other installed backend versions: pandas 3.0.6, NumPy 2.5.3, scikit-learn 1.9.1, APScheduler 3.10.4, PyMySQL 1.1.0, python-decouple 3.8, Pillow 12.3.0, openpyxl 3.1.5.
- Database: project SQLite database `backend/greengrid_dev.sqlite3`; SQLite library 3.50.4. All listed migrations were applied.
- Browser test: Vite at `127.0.0.1:5173`, Django at `127.0.0.1:8000`, using the existing Vite `/api` proxy and seeded local data.
- No backend test files were discovered. Backend endpoint checks used DRF's API client; module workflows were also checked in the browser.
- APScheduler dependency and startup configuration were inspected. The periodic 30-second telemetry job was not observed through a scheduled tick in this pass; Django was run with `--noreload` for the browser test.

## 4. Test Case Summary

| Test ID | Module | Test Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-01 | Login | Sign in with seeded admin credentials | JWT returned and dashboard opens | Login returned 200; dashboard opened and tokens were stored | PASS |
| TC-02 | Dashboard | Open dashboard and load its data | Dashboard renders; required APIs succeed | Dashboard rendered; all three APIs returned 200 | PASS |
| TC-03 | Facilities | Open facilities and load summary/list | Facilities render; APIs succeed | Page rendered; summary and list returned 200 | PASS |
| TC-04 | Energy Monitoring | Open telemetry and consumption chart | Monitoring renders; APIs succeed | Page rendered; both APIs returned 200 | PASS |
| TC-05 | Billing | Load summary, tariff, history, breakdown, and trends | Billing data renders; APIs succeed | Page populated; all five APIs returned 200 | PASS |
| TC-06 | Renewable Energy | Load renewable summary and asset data | Renewable data renders; APIs succeed | Page rendered; all five APIs returned 200 | PASS |
| TC-07 | Analytics | Load filters and analytics dashboard | Analytics renders; APIs succeed | Page rendered; both APIs returned 200 | PASS |
| TC-08 | Forecast | Load filters, forecast series, facilities, and confidence | Forecast renders; APIs succeed | Page rendered; all five APIs returned 200 | PASS |
| TC-09 | Alerts | Load alert summary and list | Alerts render; APIs succeed | Page rendered; both APIs returned 200 | PASS |
| TC-10 | Reports | Load report configuration, preview, history, and data | Reports render; APIs succeed | Page rendered; all five APIs returned 200 | PASS |
| TC-11 | Settings | Load profile and change password | Profile loads; valid password change succeeds | Profile returned 200; corrected password change returned 200 using a temporary test account, which was deleted | PASS |
| TC-12 | Logout / Authentication protection | Log out, clear session, revisit protected route | Logout succeeds and protected route requires login | Logout returned 200; browser auth state cleared; dashboard redirected to login | PASS |

## 5. Errors Found

### Error 1
- Error ID: GG-SET-001
- Module: Settings / password change
- Severity: Medium
- Status: FIXED
- Error Description: The password-change request from Settings omitted a field required by the backend, so the operation returned HTTP 400.
- Steps to Reproduce: Submit the Settings password form with matching current, new, and confirmation values.
- Expected Result: The password is updated and the API returns HTTP 200.
- Actual Result: Before the fix, the API returned HTTP 400 with `confirm_password: This field is required.`
- Root Cause: The backend `ChangePasswordSerializer` requires `current_password`, `new_password`, and `confirm_password`; the frontend sent only the first two.
- Affected File(s): `frontend/src/pages/Settings/SettingsPage.jsx`; contract confirmed in `backend/apps/accounts/serializers.py`.

### Error 2
- Error ID: GG-AUTH-001
- Module: Logout / Authentication protection
- Severity: Medium
- Status: FIXED
- Error Description: The authenticated interface had no logout control, although the auth context and API already implemented logout.
- Steps to Reproduce: Sign in and inspect the authenticated application header and navigation.
- Expected Result: An authenticated user can invoke logout and return to the login screen.
- Actual Result: No visible UI control invoked the existing logout function.
- Root Cause: The authenticated navbar rendered only the account link; it did not expose `AuthContext.logout`.
- Affected File(s): `frontend/src/components/layout/Navbar.jsx`; existing logout implementation in `frontend/src/context/AuthContext.jsx`.

## 6. Fixes Applied

### Fix 1
- Error ID: GG-SET-001
- Root Cause: Settings omitted the serializer-required confirmation field.
- Fix Applied: Added `confirm_password` from the form state to the password-change API payload.
- File(s) Modified: `frontend/src/pages/Settings/SettingsPage.jsx`.
- Verification: A temporary test account logged in, changed its password through the API, authenticated with the new password, and was deleted after the test. The endpoint returned HTTP 200.
- Final Status: FIXED

### Fix 2
- Error ID: GG-AUTH-001
- Root Cause: No navbar action called the existing logout flow.
- Fix Applied: Added an accessible Log out button that calls the auth context, then navigates to `/login`.
- File(s) Modified: `frontend/src/components/layout/Navbar.jsx`.
- Verification: Browser logout returned HTTP 200, cleared access token, refresh token, and user state, and a subsequent `/dashboard` visit redirected to `/login`.
- Final Status: FIXED

## 7. Verification After Fix

- GG-SET-001: Matching password fields were submitted through the corrected API payload; response was HTTP 200 and authentication with the new password succeeded. The temporary account was removed.
- GG-AUTH-001: A seeded authenticated browser session logged out successfully; the logout endpoint returned HTTP 200, local session values were absent afterward, and protected navigation redirected to login.
- All ten authenticated module routes were navigated through the sidebar. Each page rendered its expected heading and every required page API request completed with HTTP 200.
- No browser JavaScript console errors were observed. React Router emitted two future-compatibility warnings; no failed test was attributed to them.
- Auth checks: valid login returned HTTP 200; invalid credentials and an unauthenticated protected API request returned the expected HTTP 401.
- CORS check: preflight from `http://127.0.0.1:5173` returned HTTP 200 with the matching allow-origin header.
- No unexpected HTTP 400, 403, 404, or 500 responses were observed in the final tested workflows. The reproduced Settings HTTP 400 is documented above and passed after the fix.

## 8. Build & Backend Verification

- `npm run build` from `frontend/`: PASS. Vite 5.4.21 transformed 2,369 modules and completed the production build.
- `python manage.py check` from `backend/`: PASS. Django reported no issues (0 silenced).
- Database migration inspection: all listed migrations were applied; authenticated read API queries succeeded.

## 9. Final Testing Summary

- Total test cases: 12
- Passed: 12
- Failed: 0
- Blocked: 0
- Errors found: 2
- Errors fixed and verified: 2
- Remaining issues: No known blocking issues remain after the final verification.

## 10. Remaining Known Issues

No known blocking issues remain after the final verification.