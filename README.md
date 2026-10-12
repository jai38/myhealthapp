# My Health App — Mobile Client

Cross-platform personal health management mobile application built with **React Native**, **TypeScript (Strict Mode)**, and **Expo** (Managed Workflow with Expo Router).

---

## 1. Prerequisites

- **Node.js:** `>=20.0.0` (Verified on Node 22 LTS)
- **Package Manager:** `npm` (`>=10.0.0`)
- **Expo Go App:** Optional, installed on physical Android or iOS device for testing.

---

## 2. Getting Started

### Install Dependencies
```bash
npm install
```

### Run Type Checking & Tests
```bash
npm run typecheck
npm test
```
*Current test suite: 16 passing unit and integration tests (0 failures).*

### Start Local Development Server
```bash
npm start
```
Use the printed QR code to open the application in Expo Go on your mobile device, or press `a` for Android Emulator / `i` for iOS Simulator.

---

## 3. Architecture & Directory Layout

```
myhealthapp/
├── app/                  # Expo Router file-based screens
│   ├── _layout.tsx       # Root stack navigator with SafeAreaProvider
│   └── (tabs)/           # Main bottom-tab navigation group
│       ├── _layout.tsx   # Tab bar definition
│       ├── index.tsx     # Home Dashboard (regimen overview, upload workflow)
│       ├── timeline.tsx  # Chronological medical history
│       ├── medications.tsx # Medication Centre (Current vs Past)
│       └── profile.tsx   # Patient Profile & Privacy Settings
├── components/           # Atomic, accessible UI primitives (WCAG 2.2 AA)
│   ├── Button.tsx        # 48dp touch targets, variants, loading state
│   ├── Card.tsx          # Calm elevated and outlined card containers
│   ├── Badge.tsx         # Clinical status indicators
│   ├── Input.tsx         # Accessible text input with error states
│   ├── ScreenLayout.tsx  # Responsive SafeArea container
│   ├── DocumentPickerModal.tsx # Document capture (Camera, Gallery, PDF)
│   └── DocumentPreview.tsx     # Zoomable, multi-page document viewer
├── features/             # Feature-specific workflows
│   └── prescriptions/
│       └── ReviewPrescriptionScreen.tsx # Interactive patient review & correction UI
├── services/             # Core application services
│   ├── api/              # Type-safe API client with Zod response validation
│   ├── documents/        # File validation (15MB limit) & upload orchestration
│   └── notifications/    # Actual-Count Notification Scheduler (ADR-006)
├── theme/                # Design tokens (Colors, Typography, Spacing, Shadows)
└── test/                 # Automated Vitest regression test suites
    ├── api-client.test.ts
    ├── file-validator.test.ts
    ├── scheduler.test.ts
    └── upload-service.test.ts
```

---

## 4. Phase 2 Features (Prescription Pipeline)

- **Document Picker & Validator:** Validates format (JPEG, PNG, PDF) and enforces 15MB file ceiling with user-friendly error banners.
- **Document Preview:** Side-by-side zoomable document explorer (+/-, reset, expand) maintaining immutable source evidence.
- **Patient Review Interface:** Side-by-side review flagging low-confidence text with warning badges, permitting full editing, adding/removing medicines, and explicitly requiring patient review before confirmation.
- **Safety Invariant:** Historical prescriptions default to inactive (`is_active_medication: false`) to prevent unwanted dose alarms.
