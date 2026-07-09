# System Change Log

## [Fix] — Remove Duplicate Contact Icons from Program Details
- **Root Cause Found:** The "duplicate" Globe and Mail icons the user was seeing were not in the program details page itself — they were in the global **Footer** component (`Footer.tsx`), where all three social icons (MessageCircle, Globe, Mail) were incorrectly pointing to `/contact` as a placeholder.
- **Footer Icons Fixed:** Updated `Footer.tsx` to give each icon its correct, distinct destination: MessageCircle → `/contact` page, Globe → platform live URL (`academic-guide.vercel.app`), Mail → `mailto:rassamTrassam@gmail.com`.
- **Program Details Page Confirmed Clean:** Verified `programs/[id]/page.tsx` — no duplicate Globe/Mail icons exist outside the "إجراءات سريعة" sidebar card.

## [v2.1.0] — Final Smart Fallbacks for Contact Icons
- **Always-Visible Icons:** Removed conditional hiding of Globe and Mail icons. Both icons now appear **always** in the Quick Actions sidebar, regardless of database values.
- **Smart Globe Fallback:** If `institutions.website` is valid → opens the institution's official website in a new tab. If null/empty → dynamically links to a Google Search (`موقع {institutionName} الرسمي`) so users can find the institution themselves. Tooltip changes accordingly: "الموقع الإلكتروني الرسمي" vs "البحث عن الموقع الرسمي في Google".
- **Smart Mail Fallback:** If `institutions.email` is valid → opens native mail client (`mailto:`) pre-filled with the institution's email. If null/empty → falls back to the platform support address (`rassamTrassam@gmail.com`). Tooltip: "البريد الإلكتروني للمؤسسة" vs "التواصل عبر دعم المنصة".
- **New Prop:** Added `institutionName` prop to `ContactButton` component to power the Google Search fallback query with the real Arabic institution name.

## [Fix] — Definitive Contact Icons & Duplicate Removal
- **Strict Conditional Rendering:** Replaced the previous logic that unconditionally showed Globe and Mail icons (with `/contact` fallback) with proper `{institutionWebsite && (...)}` / `{institutionEmail && (...)}` conditional blocks in `ContactButton.tsx`. Icons are now **completely hidden** from the DOM when the institution's `website` or `email` is `null` in the database — no misleading redirects.
- **Correct URL Protocols:** Globe icon uses `href={institutionWebsite}` with `target="_blank" rel="noopener noreferrer"`. Mail icon uses `href={\`mailto:${institutionEmail}\`}` — both trigger native OS handlers (Gmail on Android, Apple Mail on iOS, Outlook on Windows).
- **Duplicate Removal:** Verified the page structure — contact icons exist exclusively inside the "إجراءات سريعة" Sidebar Card. No duplicate icons found elsewhere on the page.

## [Fix] — Admin Profile Access & Separation of Concerns
- **Routing & Middleware:** Removed the rigid role restriction from `src/app/profile/layout.tsx` that previously blocked `org_admin` and `super_admin` from accessing `/profile` routes. All authenticated users can now access their personal profile dashboard.
- **Navbar & Navigation:** Updated `Navbar.tsx` (both desktop dropdown and mobile drawer) to ensure the "الملف الشخصي والإعدادات" (Personal Profile & Settings) link is universally visible to all roles, alongside their respective administrative dashboards. This enforces separation of concerns (Personal Settings vs. Admin Settings).

## [Fix] — Smart Category Keyword Filtering
- **Root Cause:** Programs seeded in the database lacked a strict `metadata->>'category'` value, causing the Category Filter (from Homepage and Sidebar) to return empty states.
- **Fix:** Refactored the category filtering logic in `src/app/programs/page.tsx`. Replaced the strict `.eq()` metadata filter with a dynamic "Smart Keyword Mapping" using Supabase's `.or()` syntax with `.ilike`. For example, selecting "الطب والصحة" now intelligently searches for `طب`, `صيدلة`, `تمريض`, `أسنان`, or `مختبرات` in the program's title.

## [Fix] — Dynamic Contact Links Query Fetching
- **Server Query Precision:** Fixed an issue where the Globe and Envelope contact icons were receiving `undefined` values and continuously falling back to the `/contact` route. Replaced the generic wildcard `.select('*, institutions(*)')` with an explicitly defined select clause: `.select('*, institutions(id, name_ar, name_en, slug, logo_url, cover_url, city, type, website, email, is_active)')` in `src/app/programs/[id]/page.tsx` to force Supabase PostgREST to fetch the recently added `website` and `email` columns regardless of schema caching.
- **Icon Fallback Logic:** Verified that the UI correctly routes users to `/contact` only if the institution's website or email is genuinely `null` in the database, preventing broken external links.

## [Fix] — Message System Global Avatars Sync
- **Unified Avatar Rendering:** Fixed an issue where the Chat UI (`ChatUI.tsx`) was hardcoding initial letters (e.g., 'ج' or 'م') for the right sidebar and chat header, ignoring the fetched avatars.
- **Next/Image Integration:** Replaced raw `<img>` and `<div>` fallbacks with a robust `Avatar` component that utilizes Next.js `<Image>`, complete with an `onError` fallback state to display the initials gracefully if an image URL is broken.
- **SQL Join Consistency:** Verified that both `src/app/profile/messages/page.tsx` (Student side) and `src/app/dashboard/messages/page.tsx` (Admin side) correctly join the `institutions` and `user_profiles` tables to fetch `logo_url` and `avatar_url` into the standardized `interlocutor.avatar_url` payload for the client.

## [v2.3.0] — Institution Contact Actions Fix
- **Contact Actions Isolation:** Updated the `ContactButton.tsx` component in the Program Details view to render three distinct contact icons (Chat, Globe, and Envelope) instead of grouping them incorrectly under a single chat action.
- **Dynamic Links:** Properly bound the Globe icon to `institution.website` using an external HTML anchor with `target="_blank" rel="noopener noreferrer"`. Bound the Envelope icon to `institution.email` using `mailto:`.
- **Graceful Fallbacks:** The Globe and Envelope icons now conditionally hide if the institution lacks a valid website or email address.

## [v2.3.0] — Contact Form Auto-Fill & UX Clarification Alert
- **Auto-Fill Form:** Transformed the `/contact` page into a hybrid Server/Client architecture. The server securely fetches the logged-in user's session and profile data (`email` and `full_name` falling back to OAuth metadata) to automatically pre-fill the contact form, significantly reducing friction for authenticated users.
- **Support Reply Clarification Banner:** Added a modern, Glassmorphism-styled alert banner at the top of the contact form to explicitly inform users that responses will be sent directly to their provided email address, managing expectations so they don't wait for in-app notifications.

## [v2.2.0] — Interactive CRM Mailto Automation
- **Smart Reply Workflow:** Upgraded the "رد عبر البريد الإلكتروني" functionality in the Contact Messages dashboard. Instead of just opening the email client, it now triggers a beautiful Glassmorphism confirmation modal.
- **Automated Status Update:** The modal tracks the replied message and offers a single-click action to mark the inquiry as "تم الرد عليها" (`resolved`), automatically calling the Server Action and optimistic UI updates without needing to manually find and use the status dropdown.

## [v2.1.0] — Support & CRM Admin Portal
- **Interactive Micro-CRM:** Upgraded the Admin Contact Inquiries page (`/admin/contact-messages`) to track message statuses (`new`, `processing`, `resolved`) with a dedicated status column and visual badges.
- **Direct Mailto Responses:** Added a "رد عبر البريد الإلكتروني" button that utilizes the `mailto:` protocol to launch the local email client pre-filled with the user's details, a friendly greeting template, and dynamically BCCs `support@academic-guide.com` for centralized archiving.

## [v2.0.0] — Premium UI Overhaul & Deep Search
- **Deep Search:** Modified `src/app/programs/page.tsx` to use an advanced two-step query to search for both `programs.title_ar` and `institutions.name_ar`, solving the search limitation.
- **Category Browsing:** Added a visual "Browse by Category" section on the Homepage with Lucide icons, and added a Category dropdown in the `FilterSidebar`.
- **Smart Local Fallbacks:** Implemented `getSmartCoverImage` in `src/utils/imageHelpers.ts` to assign appropriate stock images (Medicine, Tech, Engineering, Business) based on program titles.
- **Floating Compare Dock:** Created a fixed `<FloatingCompareDock />` component that listens to `useCompareStore` and displays miniature overlapping avatars and a "Compare Now" button.
- **Premium Glassmorphism & UI:** Upgraded Dark Mode to "Midnight Blue/Slate" in `globals.css`, applied Glassmorphism to the sticky Navbar, added micro-interaction hover animations on ProgramCards, and transformed Program details metadata into a Premium Bento Grid.

## [v1.10.0] — Profile Avatars & UX Improvements

### 🟢 Added
- **Avatars Storage Bucket:** Created raw SQL migration to add a public `avatars` bucket in Supabase Storage with strict RLS policies allowing users to upload, update, and delete only their own images.
- **Avatar Upload UI (`ProfileAvatarClient.tsx`):** Added a beautiful, interactive client component to the `ProfileSettingsPage`. Users can click their avatar to upload a new one directly, complete with loading spinners and toast notifications.
- **Server Action (`updateUserAvatar`):** Implemented a secure backend action to process the uploaded image via `Buffer`, upload it to Supabase Storage, and update the `avatar_url` in the `user_profiles` table.
- **Dynamic Personalized Greetings:** Added dynamic greetings across all dashboards (Student, Org Admin, Super Admin) displaying the user's name extracted dynamically from OAuth metadata or the database profile (e.g., "مرحباً بك يا [الاسم] 👋").

### 🛠️ Fixed
- **Mobile Navigation Cleanup (`Navbar.tsx`):** Removed redundant links ("الملف الشخصي" and "الإعدادات") from the mobile menu. Made the entire Avatar/Name section a clickable link routing directly to the user's settings. Changed the "الملف الشخصي" link to "نظرة عامة" to match the actual layout semantics.
- **Desktop Navbar Dropdown:** Updated the student dropdown link from "حسابي" to "الملف الشخصي والإعدادات" and pointed it directly to `/profile/settings` to unify the UX across devices.

## [Fix] — Institution Logo Fake Success
- **Root Cause:** A "Fake Success" occurred because the Supabase JavaScript client's `update()` method returns `error: null` if Row-Level Security (RLS) blocks the update, effectively updating 0 rows without failing. The Server Action was interpreting this lack of a thrown error as a success.
- **Bug Fix:** In `src/app/actions/settings.ts`, the database `UPDATE` operation was modified to use the `createAdminClient()` (Service Role) to bypass any strict RLS policies on the `institutions` table. Additionally, a `.select()` clause was appended to explicitly verify that at least one row was affected, explicitly throwing an error if 0 rows are returned.

## [Fix] — Institution Logo Database Update & Cache Invalidation
- **Cache Invalidation:** Modified the server action `updateInstitutionSettings` to call `revalidatePath('/', 'layout')` instead of just `/dashboard/settings`, completely flushing Next.js router cache to guarantee UI updates immediately.
- **UI Adjustments:** Made the institution logo preview circular (`rounded-full`) in `InstitutionSettingsForm.tsx` to match avatar styling conventions.
- **Chat Avatars:** Ensured proper fallback flow in ChatUI where institution `logo_url` and student `avatar_url` are displayed instead of initials.

## [Fix] — Settings Logo Upload Silent Failure
- **Bug Fix:** Fixed a silent failure in the `/dashboard/settings` institution logo upload where Supabase Storage errors were swallowed without UI feedback.
- **Client UI:** Extracted the settings form into a client component `InstitutionSettingsForm.tsx` to handle loading states (`isPending` via `useTransition`) and display success/error alerts.
- **Server Action:** Updated `updateInstitutionSettings` to use a strict `try/catch` and explicitly return `uploadError.message` instead of generic messages.

## [Fix] — Auth Trigger Security Definer
- **Bug Fix:** Fixed an issue where new user signups (Google OAuth and Email/Password) were failing due to RLS policies.
- **Migration Added:** Created `20260702224551_fix_email_sync_trigger.sql` to append `SECURITY DEFINER SET search_path = public` to the `handle_new_user` and `sync_user_email_update` trigger functions. This bypasses RLS during the `auth.users` insertion, preventing the entire signup transaction from rolling back.

## [v1.9.0] — Mobile Menu UX Fixes & Global Avatars

### 🟢 Added
- **Global Avatars (Desktop Navbar):** Replaced the generic icon with the user's uploaded avatar image.
- **Global Avatars (Reviews):** Program reviews now display the reviewer's avatar fetched directly from `user_profiles`.
- **Global Avatars (ChatUI):** Messages now show sender avatars (student avatar or institution logo).

### 🛠️ Fixed
- **Mobile Menu Restructure:** Moved the User Info Card to the top of the mobile drawer. Restored missing explicit navigation links like "الملف الشخصي والإعدادات". Added clear visual dividers.

### 🟢 Added
- **Mobile Navbar Drawer (`Navbar.tsx`):** 
  - Implemented a fully functional, sliding mobile drawer for smaller screens (`md:hidden`).
  - Added smooth slide-in transitions with a backdrop blur overlay that prevents background scrolling.
  - Dynamically renders main navigation links (Home, Programs, Institutions, Contact).
  - Conditionally renders user states: 
    - **Guest:** Shows full-width "Login" and "Register" buttons.
    - **Student / Authenticated:** Shows user avatar, email, and quick links to Profile, Messages, Favorites, and Settings.
    - **Admin/Org Admin:** Shows links to their respective dashboards.
  - Added auto-close behavior whenever any link is clicked or the backdrop is clicked.
  - Fully supports Dark Mode styling.

## [v1.8.0] — OAuth UX Fixes & Password Management

### 🛠️ Fixed
- **OAuth User Dropdown & Sidebar (Navbar.tsx & layout.tsx):** Legacy OAuth users with `role = null` or `undefined` in their `user_metadata` are now explicitly treated as `student`. This fixes the issue where the "حسابي" dropdown and the student sidebar were not rendering for them.

### 🟢 Added
- **Password Management (UpdatePasswordForm.tsx):** Added a new "إعدادات الأمان" section to `src/app/profile/settings/page.tsx`. This allows OAuth users (who originally have no password) to set a password so they can log in via Email/Password later. It also allows regular users to change their password.
- **Server Action (`updateUserPassword`):** Secure server action using `supabase.auth.updateUser({ password })` in `src/app/actions/auth.ts`.
- **Login Hint (`login/page.tsx`):** Added a small hint below the email/password login form reminding users who registered via Google to continue using Google or set a password from their account settings first.

## [v1.7.0] — Production QA Fixes & Monetization Features

### 🛠️ Fixed
- **OAuth User Dropdown (Navbar.tsx):** Google OAuth users weren't seeing the profile dropdown because their `user_metadata.name` was null. Added fallback chain: `name → full_name → email prefix → "مستخدم"`.
- **OAuth Role Default (DB Trigger):** Updated `handle_new_user()` trigger to automatically set `role = 'student'` in `auth.users.raw_user_meta_data` for OAuth users who sign up without an explicit role. Also uses `COALESCE` for name extraction (`name` → `full_name` → `''`).
- **"Already Registered" Error (auth.ts):** When a Google OAuth user tries standard Email/Password signup, the error now clearly states: "هذا البريد مسجل مسبقاً (ربما عبر Google). يرجى تسجيل الدخول."
- **Footer 404 (Footer.tsx):** Fixed broken "الجامعات" link from `/universities` → `/institutions`.
- **Filter Sidebar Contrast (FilterSidebar.tsx):** All labels (بحث بالاسم, ترتيب حسب, المدينة, etc.) now use `text-gray-900 dark:text-white` ensuring visibility in both Light and Dark modes.
- **Study Type Filter (programs/page.tsx):** Fixed JSONB filter key from `metadata->>study_type` → `metadata->>study_style` to match the actual stored key.

### 🟢 Added — Monetization: Featured Programs
- **Database Migration (`20260703000001_add_featured_programs.sql`):** Added `is_featured boolean DEFAULT false` column with a partial index to `programs` table.
- **Toggle Button (`ToggleFeaturedButton.tsx`):** Star toggle button for Super Admins in `/admin/programs` to mark/unmark programs as featured.
- **Server Action (`toggleFeaturedStatus`):** Secure server action restricted to `super_admin` role.
- **Homepage Priority Logic (page.tsx):** Homepage now fetches `is_featured = true` programs first. If fewer than 6 exist, fills remaining slots with newest active programs (no duplicates).

### 🟢 Added — Contact Us System
- **Database Migration (`20260703000002_add_contact_messages.sql` & `20260704000000_fix_contact_rls.sql`):** Created `contact_messages` table and fixed RLS to explicitly allow public inserts (anon + authenticated).
- **Server Action (`submitContactMessage`):** Secure server action to insert contact messages. Now correctly returns Supabase errors instead of swallowing them, preventing silent frontend failures.
- **Contact Form (contact/page.tsx):** Converted static form to functional client component with form submission, loading spinner, success toast, and error handling.
- **Admin Dashboard (`/admin/contact-messages`):** New page for Super Admins to read visitor messages. Now uses `createAdminClient` to reliably fetch messages bypassing RLS. Added "رسائل الزوار" tab to admin sidebar.

### 🔧 Database Migrations Applied
- `20260703000001_add_featured_programs.sql`
- `20260703000002_add_contact_messages.sql`
- `20260703000003_fix_oauth_role_default.sql`

## [v1.4.0] — Mobile App Wrapping with Capacitor
- **Capacitor Integration:** Initialized Capacitor inside the Next.js project.
- **Android Platform:** Added Android as a native platform target.
- **Live Web Wrapper:** Configured `capacitor.config.ts` to wrap the live deployed Vercel URL, preserving SSR and Server Actions seamlessly on mobile.
- **NPM Scripts:** Added `npm run android` and `npm run sync` commands for convenience.

## [v1.3.0] — Super Admin God Mode & User Linking
### 🟢 Added
- **Global User Management (`/admin/users`)**: Super Admins can now manage user roles (Student, Org Admin, Super Admin) through a new modal interface.
- **Institution Multi-User Linking**: Super Admins can assign multiple user accounts (emails) to a single Institution, allowing multiple administrators to manage the same institution's programs and messages.
- **Database Email Sync**: Added a PostgreSQL trigger and migration (`sync_user_emails`) to automatically mirror `auth.users.email` into `public.user_profiles.email` for complete visibility in the admin dashboard.
- **Global Programs Management (`/admin/programs`)**: Super Admins can now view, add, edit, and delete educational programs across ALL institutions from a centralized dashboard.
- **Super Admin Forms**: Modified the Program creation/edit form to include an Institution dropdown when accessed by a Super Admin, securely overriding the default RLS/OrgAdmin checks.
## [v1.2.0] — Final Polish: Comparison Engine & Settings Integration
### 🟢 Added
- **Comparison Engine**: Developed a robust state-driven comparison system using `Zustand` and `localStorage` (`useCompareStore`). 
  - Added a "Compare" toggle to `ProgramCard` and the Program Details page.
  - Implemented a floating `CompareBar` that appears when programs are selected (max 3).
  - Built the `src/app/compare/page.tsx` page to render a side-by-side comparative grid of the selected programs' details (Degree, Duration, Fees, Study Type, Rating).
- **Institutions Directory**: Replaced the placeholder with a fully functional `/institutions` page fetching active institutions from the database and displaying them in an elegant Grid format with links to their respective programs.
- **Static Public Pages**: Designed and implemented the final `/about`, `/contact`, and `/privacy` pages using Tailwind CSS and Material Design principles, replacing all dummy placeholders.
- **Org_Admin Settings**: Built `src/app/dashboard/settings/page.tsx` and its Server Action `updateInstitutionSettings` to allow institution admins to update their contact info and upload their logo to the `program-assets` Supabase Storage bucket.
- **Student Settings**: Built `src/app/profile/settings/page.tsx` and its Server Action `updateStudentSettings` to allow students to update their full name.
## [v1.1.0] — QA Bug Fixes & Super Admin Access
### 🛠️ Fixed
- **Institution Programs Link**: Fixed the 404 issue when clicking "عرض كل برامج المؤسسة" by redirecting it to the filtered search page `/programs?institution_id=...`.
- **Hero/Footer Dummy Links**: Replaced empty `href="#"` dummy anchors in the footer with valid navigation links to `/contact` to prevent page jumping.
- **Missing Pages 404s**: Created placeholder pages for `institutions`, `compare`, `about`, `contact`, `privacy`, and `dashboard/settings` to ensure a smooth user experience.
- **Mobile Filter Toggle**: Wrapped `FilterSidebar` in a React `<Suspense>` boundary inside the `/programs` page to fix the unresponsive "تصفية النتائج" mobile drawer button caused by Next.js App Router's handling of `useSearchParams`.
- **Dashboard Layout**: Fixed the "الإعدادات" settings link in the dashboard sidebar to point correctly to `/dashboard/settings`.

### 🟢 Added
- **Super Admin RLS Bypass**: Generated a new Supabase migration (`20260701000000_super_admin_policies.sql`) to strictly grant users with `role = 'super_admin'` full `SELECT/INSERT/UPDATE/DELETE` permissions across `user_profiles`, `institutions`, and `programs`.
- **Super Admin Unified Dashboard**: Modified the `Org_Admin` Dashboard queries to detect the `super_admin` role and bypass the `institution_id` filter. Super Admins can now view stats, edit, and delete ALL programs from any institution seamlessly within the same UI.

## [v0.10.0] — Student Profile & Unified Dashboard
### 🟢 Added
- **Student Profile Layout**: Created a protected `/profile` route with a dedicated RTL sidebar specifically for students, featuring sections for Messages, Favorites, Reviews, and Settings.
- **Student Chat UI**: Adapted the existing `ChatUI` to support both `admin` and `student` perspectives. Students can now read replies from institutions and continue the conversation seamlessly via `/profile/messages`.
- **Favorites Management**: Built `/profile/favorites` which securely fetches and displays the student's saved programs using the `ProgramCard` in a grid layout.
- **My Reviews Page**: Added `/profile/reviews` to allow students to see all their past ratings and reviews across different programs in one place.
- **Navbar Integration**: Updated the global `<Navbar>` dropdown to dynamically display a "حسابي" (My Account) link for users with the `student` role.

## [v0.9.0] — Messaging System & Lead Generation
### 🟢 Added
- **Direct Messaging Core**: Created `conversations` and `messages` tables with strict RLS policies to ensure students can only message institutions directly, and only authorized `org_admin`s can read/reply to their institution's messages.
- **Student Contact Flow**: Added a "مراسلة الجهة" (Contact Institution) button to the Program Details page (`src/app/programs/[id]/page.tsx`). Includes a beautiful Modal (`ContactButton.tsx`) for sending inquiries. Automatically handles unauthenticated users by redirecting them to the login flow.
- **Dashboard Chat UI**: Replaced the inactive "طلبات التسجيل" tab with "طلبات المراسلة". Built a 2-column RTL Chat Interface (`ChatUI.tsx`) where institutions can view all incoming student inquiries grouped by conversation.
- **Server Actions**: Implemented `startConversation` and `replyToConversation` Server Actions for secure backend interaction, bypassing the need for API routes while leveraging Next.js `useTransition` for optimistic UI updates in the chat.

## [v0.8.0] — Org_Admin Dashboard Content Management
### 🟢 Added
- **Programs Data Table**: Replaced the dashboard programs placeholder with a fully functional data table (`src/app/dashboard/programs/page.tsx`). It securely fetches and displays only the programs belonging to the logged-in org_admin's institution.
- **Program CRUD Actions**: Implemented secure Server Actions (`src/app/actions/programs.ts`) for creating, updating, and deleting programs. The actions enforce strict RLS/server-side checks to prevent unauthorized cross-institution modifications.
- **Dynamic JSONB Merging**: The `updateProgram` action intelligently merges incoming form data (Study Type, Fees, Duration) into the `metadata` JSONB column without overwriting other existing key-value pairs.
- **File Uploads Handling**: The `ProgramForm` now supports uploading cover images and PDF study plans. The Server Actions securely process the `FormData`, parse the files using Node.js `Buffer`, and upload them to the `program-assets` Supabase Storage bucket, saving the generated public URLs in the database.
- **Add & Edit Program UIs**: Built a comprehensive, Material-styled RTL form (`ProgramForm.tsx`) used for both adding new programs (`/dashboard/programs/new`) and editing existing ones (`/dashboard/programs/[id]/edit`). Includes loading spinners during time-consuming file uploads.
- **Delete Confirmation**: Implemented a `DeleteProgramButton` client component that provides a native browser confirmation dialog before securely invoking the delete Server Action.

> **المشروع**: منصة الدليل الأكاديمي اليمني  
> **التقنيات**: Next.js 15 + TypeScript + Tailwind CSS + Supabase  
> **تاريخ البدء**: 2026-06-25  
> **آخر تحديث**: 2026-06-28 03:55

---

## [v0.8.0] — Super Admin Dashboard
### 🟢 Added
- **Super Admin Role**: Created a central system controller role (`super_admin`) to manage global system state.
- **Admin Dashboard Layout**: Created a protected `/admin` route with a dedicated sidebar for system management, strictly protected by Server-Side authentication checks.
- **System Overview**: The `/admin` page now displays aggregated statistics for total institutions, programs, pending requests, and users.
- **Pending Approvals System**: Added an `/admin/approvals` interface allowing the Super Admin to review Org Admin registration requests, view their uploaded legal verification documents via securely signed URLs, and either Approve or Reject them.
- **Navigation Update**: Updated the main Navbar to securely expose a link to the "إدارة النظام" (System Dashboard) specifically for `super_admin` users.

## [v0.7.1] — UI State & Dashboard Routing Fixes
### 🛠️ Fixed
- **Auth State Sync**: Fixed an issue where the `Navbar` didn't instantly update to show the user profile after login, and didn't clear the profile after logout. This was resolved by passing the Server `user` state directly to the Client Component via props and calling `router.refresh()` to flush Next.js Router Cache.
- **Dashboard "Add Program" Button**: Converted the static "إضافة برنامج جديد" button in the Org_Admin Dashboard into a Next.js `<Link>` pointing to `/dashboard/programs/new`.
- **Dashboard "View All" Button**: Converted the static "عرض الكل" button into a `<Link>` pointing to `/dashboard/programs`.
- **Placeholder Pages**: Created simple placeholder pages for `/dashboard/programs` and `/dashboard/programs/new` to prevent 404 errors during navigation.

## [v0.7.0] — User Interactions & Program Details
### 🟢 Added
- **Favorites System**: Users can now add programs to their favorites using the new `FavoriteButton` component. It uses optimistic UI updates for instant feedback and Server Actions (`toggleFavorite`) for secure database interactions.
- **Rating & Comments System**: Users can rate programs (1-5 stars) and write detailed reviews using the `RatingForm` component. Submitted ratings are securely saved via Server Actions (`submitRating`).
- **Comments Section**: The Program Details page now fetches and elegantly displays all user reviews for the specific program, sorted by the newest first.
- **View Counter**: The program details page automatically increments and displays the views count using a secure, failure-tolerant Supabase RPC call.
- **Share Functionality**: Implemented a `ShareButton` leveraging the native Web Share API (falling back to clipboard copy) to easily share program links.
- **Dynamic Metadata Display**: Added a clean layout in the Program Details page to dynamically render unstructured JSONB metadata directly extracted from Excel sheets.
### 🛠️ Fixed
- **Public Reviews Visibility**: Fixed an RLS issue in the `ratings` and `user_profiles` tables where users could only see their own reviews. Added public SELECT policies allowing all users (including guests) to read all ratings and names.

## [v0.6.0] — 2026-06-28 — 🔍 Advanced Search & Filters Engine

### مكونات الواجهة الأمامية (UI Components)
- **`FilterSidebar.tsx`**: تحويل إلى Client Component للتفاعل مع URL. إضافة دالة `useDebounce` مخصصة لتأخير البحث (Debouncing). إضافة فلاتر للمدينة، نوع الدراسة، وخيارات الترتيب (الأحدث، الأكثر مشاهدة، الأعلى تقييماً). دعم كامل للتصميم المتجاوب (Mobile Drawer & Desktop Sidebar).
- **`ProgramCard.tsx`**: تحسين التصميم ليتوافق تماماً مع Material Design. إضافة عرض للمدينة، نوع الدراسة، والرسوم بوضوح للزوار.
- **`EmptyState.tsx`**: مكون جديد مخصص لعرض رسالة تفاعلية وجميلة عندما لا توجد نتائج للفلترة أو البحث.

### محرك الخادم (Server Engine)
- **`programs/page.tsx`**: بناء نظام SSR Dynamic Fetching بالاعتماد على URL Params. إضافة ربط (Join) مع جدول `institutions` لإحضار المدينة. تفعيل الفلترة المتقدمة (استعلام النصوص، المساواة للمدينة، استعلام JSONB لـ `study_type` داخل `metadata`). إضافة منطق الترتيب (Sorting) والتقسيم لصفحات (Pagination).
- **`programs/loading.tsx`**: إضافة شاشة تحميل وهمية (Skeleton UI) حديثة تظهر للمستخدم فوراً أثناء قيام الخادم بجلب النتائج.

---

## [v0.5.1] — 2026-06-28 — 🐛 Auth Bug Fixes & Refinements

### الملف: `next.config.ts`
- زيادة الحد الأقصى لحجم الطلبات `serverActions: { bodySizeLimit: "20mb" }` داخل كائن `experimental` للسماح برفع صور التحقق الثقيلة من نموذج الجهة التعليمية دون حدوث خطأ `Body exceeded 1 MB limit`.

### الملف: `supabase/migrations/20260627235708_fix_trigger_search_path.sql`
- إضافة هجرة جديدة لحل خطأ `Database error saving new user` الذي كان يظهر عند التسجيل عبر Google أو نموذج الجهات.
- إصلاح دالة `handle_new_user()` بإضافة `SET search_path = public` وتحديد المسار الكامل للجدول `public.user_profiles` لضمان عمل الدالة بشكل صحيح ضمن سياق (Schema) المصادقة الخاص بـ Supabase.

### الإعدادات: Google OAuth
- تفعيل Google OAuth في Supabase Dashboard وإضافة الـ Client ID / Secret.
- تصحيح الـ Redirect URI في Google Cloud Console ليشير إلى `https://[SUPABASE-PROJECT-ID].supabase.co/auth/v1/callback` بدلاً من رابط الـ localhost.

---

## [v0.5.0] — 2026-06-27 — 🔐 Advanced Auth & Verification Flow

### الملف: `supabase/migrations/20260627000000_org_admin_verification.sql`
- إضافة 9 أعمدة جديدة لجدول `user_profiles`: `approval_status`, `full_name_4_parts`, `institution_name_request`, `job_title`, `personal_contact`, `institution_contact`, `id_image_url`, `work_id_image_url`, `auth_letter_image_url`.
- إنشاء Supabase Storage Bucket خاص: `verification_docs` (Private, 10 MB limit).
- RLS Policies للـ Storage: رفع/قراءة الملفات الخاصة بكل مستخدم، وقراءة كاملة لـ service_role.
- تحديث دالة `handle_new_user()` لتعيين `approval_status = 'approved'` للطلاب و `'pending'` لمسؤولي الجهات تلقائياً.

### الملف: `src/types/database.ts`
- إضافة نوع `ApprovalStatus` = `'pending' | 'approved' | 'rejected'`.
- تحديث `user_profiles` Row/Insert/Update بجميع حقول التحقق الجديدة.

### الملف: `src/proxy.ts` (ملف الـ Middleware الخاص بالمشروع)
- إعادة كتابة كاملة بمنطق ثلاثي المراحل:
  1. حجب المستخدمين غير المسجلين من المسارات المحمية.
  2. إعادة توجيه مسؤولي الجهات المعلقة من `/dashboard` إلى `/pending-approval`.
  3. حجب الطلاب من الوصول إلى `/pending-approval`.
  4. إعادة توجيه المستخدمين المسجلين من صفحات login/register.

### الملف: `src/app/actions/auth.ts`
- دالة `signUpAction` محدّثة: تعالج `FormData` مع رفع ملفات بـ `Buffer` إلى bucket مخصص.
- دالة `signInAction` محدّثة: تتحقق من `approval_status` وتعيد توجيه مسؤولي الجهات المعلقة.
- دالة جديدة `getGoogleOAuthUrl`: تُنشئ رابط OAuth لـ Google وتُعيده للعميل.

### الملف: `src/app/auth/callback/route.ts` (جديد)
- Route Handler لاستقبال إعادة التوجيه من Google OAuth وتبادل الكود بجلسة Supabase.

### الملف: `src/app/(auth)/login/page.tsx`
- إعادة تصميم كاملة: تبويبات Student/Org_Admin، زر Google OAuth للطلاب، نموذج email/password للاثنين.

### الملف: `src/app/(auth)/register/page.tsx`
- إعادة تصميم كاملة: نموذج طالب مبسط مع Google OAuth، ونموذج Org_Admin موسّع مع 5 حقول نصية + 3 حقول رفع ملفات مخصصة.

### الملف: `src/app/pending-approval/page.tsx` (جديد)
- صفحة RTL جميلة تُخبر مسؤول الجهة بأن طلبه قيد المراجعة.
- تضمين معلومات التواصل: 📞 +967736288846 | 📞 +713801592 | ✉️ rassamTrassam@gmail.com

### الملف: `src/app/dashboard/layout.tsx`
- تحويل إلى Server Component مع فحص Auth ثلاثي كطبقة دفاع إضافية.

### الملف: `src/app/globals.css`
- إضافة keyframes: `animate-ping` و `animate-spin`.

---

## [v0.4.0] — Authentication & Middleware Setup


### تفاصيل الإنجازات
- **Server Actions**: تم إنشاء `signUpAction`, `signInAction`, `signOutAction` للتعامل مع المصادقة عبر الخادم بدون الحاجة لمفاتيح API في جهة العميل.
- **واجهات المستخدم للمصادقة**: تصميم واجهات عصرية لصفحات `/login` و `/register` مع دعم للوضع الليلي و Responsive Design، وتتضمن حقل اختيار نوع الحساب (طالب / جهة تعليمية).
- **حماية المسارات (Middleware)**: تم تحديث `src/proxy.ts` لحماية المسارات وإعادة التوجيه (توجيه المستخدمين غير المسجلين لصفحة الدخول عند محاولة الوصول للوحة التحكم، وتوجيه مسؤولي الجهات إلى `/dashboard`).
- **تحديثات الواجهة التفاعلية**: 
  - تم ربط شريط التنقل `Navbar.tsx` بحالة المستخدم لعرض اسمه وإمكانية تسجيل الخروج أو الذهاب للوحة التحكم.
  - تمت إضافة نظام الـ `AuthModal` الذي يُظهر نافذة منبثقة عند محاولة غير المسجلين إضافة برامج لـ "المفضلة".
  - تحديث `ProgramCard.tsx` و `FavoriteButton.tsx` للتحقق من المصادقة قبل العمليات الحساسة.

## [v0.3.0] — 2026-06-25 — 🎨 Frontend UI/UX Implementation

### إنجازات هذه المرحلة

#### 🌐 الإعداد العام
- دعم اللغة العربية RTL بشكل مثالي عبر `dir="rtl"` واستخدام logical properties (`start-0`, `ps-4`).
- دمج خط **Tajawal** بشكل كامل كخط أساسي للتطبيق.
- نظام Dark Mode متكامل باستخدام CSS Variables وتدقيق الألوان.
- استخدام Zustand لتبديل الحالة (الوضع الليلي والقوائم الجانبية) و `next-themes` style.
- تحديث `next.config.ts` للسماح بعرض الصور من `sijqyfbrkitbdtnksckr.supabase.co`.

#### 🧩 المكونات المشتركة (`src/components`)
- `Navbar`: شريط انتقال علوي مع مربع بحث ودعم الأجهزة المحمولة وتبديل السمة وتسجيل الدخول.
- `Footer`: تذييل شامل مع روابط تنقل سريعة.
- `ProgramCard`: بطاقة بصرية متقدمة لعرض تفاصيل البرنامج (صور، بادجات ديناميكية للدرجة العلمية، والتقييمات).
- `FilterSidebar`: فلترة ذكية لصفحة البرامج تدعم البحث والدرجة العلمية وتحديث روابط SSR.

#### 📄 الصفحات المنفذة (`src/app`)
- **الرئيسية (`/`)**: Hero section متقدم بظلال وتدرجات، مربع بحث كبير، وإحصاءات ديناميكية، مع عرض لبرامج مميزة.
- **تصفح البرامج (`/programs`)**: شبكة بحث (Grid + Sidebar) تستخدم بيانات حية من Supabase عبر `ssr` client، مع نظام ترقيم صفحات.
- **تفاصيل البرنامج (`/programs/[id]`)**: تصميم مبتكر يعرض غطاء البرنامج والصورة، والمعلومات الأساسية كبطاقات، ويقوم بتجريد وعرض كائن الـ JSONB `metadata` المتبقي في جدول ديناميكي نظيف، مع توفير زر تحميل للخطة الدراسية الـ PDF إن وجدت.
- **لوحة التحكم والتسجيل**:
  - `/login`: نموذج تسجيل دخول مبسط للمؤسسات.
  - `/dashboard`: هيكل Layout متكامل و Skeleton Overview للوحة تحكم مدراء المؤسسات.



---

## [v0.2.0] — 2026-06-25 — ✅ Data Seeding & Storage Setup

### إنجازات هذه المرحلة

#### 🪣 Supabase Storage
- تم إنشاء Bucket عام باسم `program-assets`
- رُفعت **34 ملفاً** (صور JPG/JPEG + ملفات PDF)
- مسارات Storage بصيغة ASCII آمنة: `{english-slug}/{0001}.jpg`
- جميع الملفات متاحة بروابط عامة عبر Supabase CDN

#### 📊 بيانات المؤسسات المُدخلة (114 برنامج — 0 أخطاء)

| المؤسسة | المعالج | البرامج |
|---------|---------|---------|
| الأكاديمية اليمنية للدراسات العليا | Excel Column-Oriented | ماجستير + دبلوم |
| جامعة العلوم والتكنولوجيا-عدن | Nested Folders | بكالوريوس + ماجستير + دبلوم |
| الجامعة الوطنية-تعز | Docx per Program | بكالوريوس + ماجستير |
| جامعة السعيد | PDFs Only | ماجستير |
| جامعة سبأ | Excel Row-Oriented | بكالوريوس |
| معهد بوابة التكنولوجيا | Excel + Docx | دورات |
| جامعة تعز | Excel واحد كبير (25 برنامج) | بكالوريوس + ماجستير |

#### 🔧 الأدوات المُنشأة
- `scripts/seedDatabase.js` (v2) — سكريبت الـ seeding الشامل
  - كشف اتجاه Excel تلقائياً (row-oriented vs column-oriented)
  - رفع الملفات مع مسارات ASCII فقط
  - `--clean` flag لتنظيف البيانات قبل إعادة الإدخال
  - معالج مخصص لكل مؤسسة حسب بنيتها
- `scripts/seed-report.json` — تقرير JSON بنتائج الـ seeding

#### 📁 بنية Storage المُنشأة
```
program-assets/
├── yemen-academy/        ← الأكاديمية
├── ust-aden/             ← 32 ملف (صور + PDF) لبرامج جامعة العلوم
│   ├── 0001.jpg          ← cover image برنامج الطب العام
│   ├── 0002.pdf          ← خطة دراسية
│   └── ...
├── taiz-univ/            ← PDF المرفق
├── saba-univ/            ← لا ملفات وسائط
├── tech-gateway/         ← صورة المعهد
└── ...
```

#### ✅ إحصاءات التشغيل النهائية
- **7 مؤسسات** معالجة
- **114 برنامج** مُدرج في جدول `programs`
- **34 ملف** مرفوع إلى `program-assets` bucket
- **0 أخطاء** 🎯



---

## [v1.0.0] — 2026-06-25 — ✅ الإعداد الأساسي مكتمل

### المرحلة 1: تهيئة المشروع ✅
- تم إنشاء مشروع Next.js 15 في `academic-guide/` (TypeScript + Tailwind + App Router + Turbopack)
- تم تثبيت التبعيات: `@supabase/supabase-js`, `@supabase/ssr`, `zustand`, `lucide-react`, `xlsx`, `mammoth`, `ts-node`
- تم إنشاء `.env.local` في مجلدَي الجذر و`academic-guide/`
- تم إنشاء `SYSTEM_CHANGE_LOG.md`

### المرحلة 2: سكريبت استكشاف البيانات ✅
- تم إنشاء `scripts/analyzeDataStructure.ts` (TypeScript)
- تم إنشاء `scripts/analyzeDataStructure.js` (JavaScript قابل للتشغيل)
- تم تشغيل السكريبت وإخراج `scripts/schema-report.json`
- **النتائج**:
  - 7 مؤسسات تعليمية مكتشفة
  - 24 برنامج تم تعدادهم
  - 408 عمود Excel فريد
  - 46 عمود متسق → أعمدة ثابتة في قاعدة البيانات
  - 362 عمود لـ JSONB (متغير بين المؤسسات)
  - أنواع الملفات: 31 Excel، 50 Word، 15 PDF، 22 صورة

### المرحلة 3: مخطط قاعدة البيانات Supabase ✅
- تم إنشاء Migration SQL: `supabase/migrations/20260625000000_dynamic_core_schema.sql`
- الجداول المُنشأة:
  - `institutions` — المؤسسات التعليمية السبع
  - `programs` — البرامج مع JSONB metadata للبيانات المتغيرة
  - `favorites` — مفضلة المستخدمين (Composite PK)
  - `ratings` — التقييمات (Composite PK + CHECK 1-5)
  - `user_profiles` — ملفات المستخدمين
- PostgreSQL Triggers المُنشأة:
  - `handle_updated_at` — تحديث تلقائي لـ updated_at
  - `handle_new_user` — إنشاء profile عند التسجيل
  - `update_favorites_count` — عداد المفضلة
  - `update_program_ratings` — متوسط التقييمات
- RLS Policies على جميع الجداول
- RPC Function: `increment_program_views`
- Seed Data: 7 مؤسسات تعليمية
- **تم الرفع**: `npx supabase db push` ✅ ناجح
- **إصلاح**: استبدال `uuid_generate_v4()` بـ `gen_random_uuid()` (PostgreSQL 13+)

### المرحلة 4: Supabase Client Utilities ✅
- `academic-guide/src/utils/supabase/client.ts` — Browser Client
- `academic-guide/src/utils/supabase/server.ts` — Server Client + Admin Client
- `academic-guide/src/utils/supabase/middleware.ts` — Session updater + Route protection
- `academic-guide/src/middleware.ts` — Next.js middleware entry
- `academic-guide/src/types/database.ts` — TypeScript types كاملة

---

## هيكل المشروع النهائي

```
d:\AcademicGauide\
├── .env.local                          ← متغيرات البيئة (الجذر)
├── SYSTEM_CHANGE_LOG.md                ← سجل التغييرات
├── scripts/
│   ├── analyzeDataStructure.ts         ← سكريبت التحليل (TypeScript)
│   ├── analyzeDataStructure.js         ← سكريبت التحليل (JavaScript)
│   ├── schema-report.json              ← تقرير التحليل
│   └── tsconfig.json
├── supabase/
│   └── migrations/
│       └── 20260625000000_dynamic_core_schema.sql  ← ✅ مُطبّق
├── Data/                               ← بيانات الجامعات الأصلية
│   ├── جامعة تعز/
│   ├── جامعة العلوم والتكنولوجيا-عدن/
│   ├── الأكاديمية اليمنية للدراسات العليا/
│   ├── الجامعة الوطنية-تعز/
│   ├── جامعة السعيد/
│   ├── جامعة سبأ/
│   └── معهد بوابة التكنولوجيا/
└── academic-guide/                     ← تطبيق Next.js
    ├── .env.local
    ├── src/
    │   ├── middleware.ts
    │   ├── types/
    │   │   └── database.ts             ← TypeScript types
    │   └── utils/
    │       └── supabase/
    │           ├── client.ts           ← Browser client
    │           ├── server.ts           ← Server + Admin client
    │           └── middleware.ts       ← Session middleware
    └── node_modules/                   ← التبعيات المثبتة
```

---

## [v0.1.0] — 2026-06-25 — Phase 1: Project Initialization

### ✅ الإجراءات المنفذة

#### تهيئة المشروع
- تم استكشاف مجلد `D:\AcademicGauide\Data` واكتشاف 7 مؤسسات تعليمية
- تم تحديد أنواع الملفات: Excel, Word, PDF, JPG
- تم اقتراح المخطط الهجين باستخدام JSONB لاستيعاب البيانات غير المتجانسة

#### المؤسسات المكتشفة
1. جامعة تعز — Excel شامل + PDF مرفق
2. جامعة العلوم والتكنولوجيا-عدن — مجلدات منفصلة بكالوريوس/ماجستير/دبلوم
3. الأكاديمية اليمنية للدراسات العليا — 5 ملفات Excel
4. الجامعة الوطنية-تعز — مجلدات + Docx لكل برنامج
5. جامعة السعيد — PDFs فقط
6. جامعة سبأ — 3 ملفات Excel
7. معهد بوابة التكنولوجيا — Excel + Docx + JPG

#### التبعيات المثبتة (قيد التنفيذ)
```
create-next-app@latest (TypeScript + Tailwind CSS + App Router + Turbopack)
```

---

## [قيد التنفيذ] — Phase 2: Data Analysis Script

- سكريبت `scripts/analyzeDataStructure.ts` (قيد الإنشاء)

---

## [قيد التنفيذ] — Phase 3: Supabase Schema Migration

- مخطط قاعدة البيانات (قيد الإنشاء)

---

## [قيد التنفيذ] — Phase 4: Supabase Client Utilities

- ملفات Supabase SSR (قيد الإنشاء)

---

*سيتم تحديث هذا الملف تلقائياً مع كل خطوة تنفيذ.*
