# Hostel Management System: CODE MAP & Feature Deep Dive

This document maps out the implementation details for core functionalities across the server-side controllers, models, and client-side JavaScript/EJS views.

---

## 1. Form and Input Validation

Validation ensures data integrity and security, implemented across the schema (Mongoose Models), server-side logic (Controllers/index.js), and client-side forms (public/js and views/EJS).

### a. Server-Side Controllers (Request Validation)

| File                                                                                                                                     | Lines                 | Validation Notes                                                                                    |
| :--------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- | :-------------------------------------------------------------------------------------------------- |
| [`controllers/authController.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/controllers/authController.js)         | 163, 173/250, 345–352 | Invalid OTP response; validate required fields; invalid credentials handling (login).               |
| [`controllers/userController.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/controllers/userController.js)         | 79, 123, 127/131      | Invalid warden ID format; missing required fields; invalid fee type/status (admin/warden ops).      |
| [`controllers/chatRoomController.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/controllers/chatRoomController.js) | 85, 95, 133           | Missing required fields; hostel required for student-access rooms; invalid room ID (chat room ops). |
| [`index.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/index.js) (Global)                                          | 271, 507, 513         | Invalid warden ID format; invalid email; invalid phone number (server-side input validation).       |

### b. Schema-Level Validation (Models)

| File                                                                                                               | Lines                     | Required Fields                         |
| :----------------------------------------------------------------------------------------------------------------- | :------------------------ | :-------------------------------------- |
| [`models/chatroom.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/models/chatroom.js)         | 7, 11, 31, 35, 43         | Required fields for chat room creation. |
| [`models/user.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/models/user.js)                 | 9, 13, 22, 36             | Required fields for user records.       |
| [`models/problem.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/models/problem.js)           | 8, 12, 16, 20, 24, 39, 43 | Required fields for problem tickets.    |
| [`models/otp.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/models/otp.js)                   | 6, 11                     | Required fields for OTP verification.   |
| [`models/announcement.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/models/announcement.js) | 7, 11                     | Required fields for announcements.      |

### c. Client-Side Validation (Views/Forms)

| File                                                                                                                                           | Lines                                           | Feature/Notes                                                                                                        |
| :--------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------- | :------------------------------------------------------------------------------------------------------------------- |
| [`public/js/problems.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/public/js/problems.js)                               | 29–39                                           | Client-side **presence checks** before image upload/problem submission (student add problem).                        |
| [`views/contact.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/contact.ejs)                                       | 870–878, 926–933, 941–951, 1027–1028, 1213–1221 | HTML constraints (name/email/phone/message); submit-time `checkValidity`/`reportValidity` (help request form).       |
| [`views/signup.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/signup.ejs)                                         | 139–157, 164, 199, 209, 278–283, 422–471        | HTML constraints (name/roll/email/room/password/OTP); **client regex checks** + password match; OTP gating (signup). |
| [`views/register.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/register.ejs)                                     | 162                                             | Date input pattern (registration autofill page).                                                                     |
| [`views/partials/dashboard/student.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/partials/dashboard/student.ejs) | 238, 252, 283, 323                              | `required` inputs for problem submission (student dashboard).                                                        |

---

## 2. Asynchronous Requests (API Calls)

This section details where `fetch` or AJAX calls are made for dynamic data loading, form submissions, and background processing.

### a. Client JavaScript (`public/js/`)

| File                                                                                                                           | Lines        | Endpoint Actions                                                                                |
| :----------------------------------------------------------------------------------------------------------------------------- | :----------- | :---------------------------------------------------------------------------------------------- |
| [`public/js/problems.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/public/js/problems.js)               | 47–51, 59–71 | **Upload image to Cloudinary**; POST problem to `/services/problems/add` (student add problem). |
| [`public/js/dashboardCharts.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/public/js/dashboardCharts.js) | 542–569      | **Fetch filtered feedback stats** from `/api/feedback/stats` (dashboard charts).                |

### b. Embedded Views (`views/`)

| File                                                                                                                                           | Lines            | Endpoint Actions                                                                                               |
| :--------------------------------------------------------------------------------------------------------------------------------------------- | :--------------- | :------------------------------------------------------------------------------------------------------------- |
| [`views/signup.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/signup.ejs)                                         | 372, 485, 538    | POST `/auth/generate-otp`; resend OTP; POST `/auth/verify-otp` (signup OTP flow).                              |
| [`views/login.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/login.ejs)                                           | 158              | POST `/auth/login` (user login).                                                                               |
| [`views/problems.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/problems.ejs)                                     | 813, 866         | POST `/services/problems/add`; POST `/services/problems/statusChange` (student/warden problem actions).        |
| [`views/partials/dashboard/admin.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/partials/dashboard/admin.ejs)     | 1250, 1317, 1367 | POST status change; POST add warden; admin action fetch (admin dashboard).                                     |
| [`views/partials/dashboard/warden.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/partials/dashboard/warden.ejs)   | 722              | POST `/services/problems/statusChange` (warden status updates).                                                |
| [`views/partials/dashboard/student.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/partials/dashboard/student.ejs) | 735, 812         | Feature fetch; POST `/services/problems/add` (student dashboard submit).                                       |
| [`views/contact.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/contact.ejs)                                       | 1264             | POST `/submit-help-request` (help request submission).                                                         |
| [`views/announcements.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/announcements.ejs)                           | 352              | DELETE `/announcements/delete/:id` (delete announcement).                                                      |
| [`views/studentList.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/studentList.ejs)                               | 857, 895, 1126   | POST `/send-fee-reminder`; POST `/send-bulk-fee-reminders`; GET `/services/fee-status` (fee reminders/status). |
| [`views/register.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/register.ejs)                                     | 486              | GET `/services/users/by-roll/:roll` (registration autofill).                                                   |
| [`views/chatRoom.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/chatRoom.ejs)                                     | 468, 658         | POST `/services/chatRoom/create`; DELETE `/services/chatRoom/delete/:id` (chat room management).               |

---

## 3. Dynamic HTML and DOM Manipulation

This outlines client-side script responsible for updating the user interface, handling events, and providing responsive feedback without full page reloads.

### a. Client JavaScript (`public/js/`)

| File                                                                                                                           | Lines                     | Feature/Notes                                                                                     |
| :----------------------------------------------------------------------------------------------------------------------------- | :------------------------ | :------------------------------------------------------------------------------------------------ |
| [`public/js/menu.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/public/js/menu.js)                       | 1–151                     | **Day tab switching**, collapsible meals, ratings display (menu page UI).                         |
| [`public/js/dashboardCharts.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/public/js/dashboardCharts.js) | 519–532, 579–605, 560/564 | **Toggle hostel/mess views**; init and event listeners; show/hide mess comparison (dashboard UI). |
| [`public/js/adminDashboard.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/public/js/adminDashboard.js)   | 371–402, 363, 400         | Init + **filter listeners**; clear chart containers; smooth scrolling (admin dashboard).          |
| [`public/js/wardenDashboard.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/public/js/wardenDashboard.js) | 219–231, 208, 226         | Init + filter listeners; clear chart containers; smooth scrolling (warden dashboard).             |
| [`public/js/navbar.js`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/public/js/navbar.js)                   | 10–133                    | Header/nav color and **dropdown behaviors** via class toggles (global navigation).                |

### b. Embedded Views (`views/`)

| File                                                                                                                                         | Lines                                                                                    | DOM Manipulation Details                                                                                                                          |
| :------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| [`views/chatRoom.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/chatRoom.ejs)                                   | 496–499, 564/692/765, 678–680 \& 751–753, 396–435                                        | `createElement`/`setAttribute` for room cards; container `innerHTML` updates; transition styles; **class toggles/show-hide** (chat room list UI). |
| [`views/chatRoomView.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/chatRoomView.ejs)                           | 262–292, 343–374, 424/429                                                                | Attachment preview show/hide; create/append message nodes; window hooks (chat messages UI).                                                       |
| [`views/contact.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/contact.ejs)                                     | 1190–1211, 1197–1200 \& 1223 \& 1288–1289, 1226/1236/1278/1345/1357, 1191/1205/1208/1285 | **Character count**; class toggles; `innerHTML`/`textContent` updates (help request form UX).                                                     |
| [`views/announcements.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/announcements.ejs)                         | 327–337                                                                                  | **Modal open/close** class toggles (announcement deletion confirmation).                                                                          |
| [`views/register.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/register.ejs)                                   | 442–449, 478/481/489/499/501/505/518                                                     | Modal show/hide via classes; prompt text updates (registration UI).                                                                               |
| [`views/studentList.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/studentList.ejs)                             | 768–930 \& 1114–1215, 1162/1167, 829                                                     | **Filters, search, and row actions**; status `innerHTML`; count `textContent` (student list/fee reminders UI).                                    |
| [`views/partials/dashboard/admin.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/partials/dashboard/admin.ejs)   | 1229–1399, 1443/1445                                                                     | Filters/search/list DOM updates; **inline `style` display toggles** (admin problems UI).                                                          |
| [`views/partials/dashboard/warden.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/partials/dashboard/warden.ejs) | 755–808, 799/801                                                                         | Filters/search/list DOM updates; inline `style` display toggles (warden problems UI).                                                             |
| [`views/partials/navbar.ejs`](https://github.com/abhiraj2404/Hostel_Management_FFSD/blob/main/views/partials/navbar.ejs)                     | 143–201                                                                                  | Dropdown/menu show-hide via class and `innerHTML` toggles (navbar).                                                                               |
