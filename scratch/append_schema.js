const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');
let content = fs.readFileSync(schemaPath, 'utf8');

const additions = `
// ==========================================
// MILESTONE 3: QR & CHECK-IN ENGINE
// ==========================================

enum QrStatus {
  ACTIVE
  EXPIRED
  REVOKED
}

enum QrUsagePolicy {
  SINGLE
  MULTIPLE
  UNLIMITED
}

enum QrType {
  REGISTRATION
  INVITATION
  TICKET
  VOLUNTEER
  STAFF
  JUDGE
  CERTIFICATE
  ASSET
  TEMPORARY
}

enum ScanType {
  ENTRY
  EXIT
  SESSION_ENTRY
  SESSION_EXIT
  MEAL
  RESTROOM
  VIP
  VOLUNTEER
  JUDGE
  CERTIFICATE
  EMERGENCY
}

enum ScanResult {
  SUCCESS
  INVALID_QR
  EXPIRED
  REVOKED
  USAGE_LIMIT
  PAYMENT_REQUIRED
  NOT_APPROVED
  OUTSIDE_TIME
  WRONG_VENUE
  ALREADY_CHECKED_IN
}

model ScannerDevice {
  id             String           @id @default(uuid()) @db.Uuid
  publicId       String           @unique @default(dbgenerated("concat('scn_', replace(cast(gen_random_uuid() as text), '-', ''))"))
  organizationId String           @db.Uuid
  organization   Organization     @relation(fields: [organizationId], references: [id])
  name           String
  status         String           @default("ACTIVE") // ACTIVE, INACTIVE, COMPROMISED
  lastSeen       DateTime?
  version        String?
  sessions       CheckInSession[]
  logs           ScanLog[]
  createdAt      DateTime         @default(now())
  updatedAt      DateTime         @updatedAt
}

model CheckInSession {
  id        String        @id @default(uuid()) @db.Uuid
  eventId   String        @db.Uuid
  event     Event         @relation(fields: [eventId], references: [id])
  scannerId String        @db.Uuid
  scanner   ScannerDevice @relation(fields: [scannerId], references: [id])
  operatorId String       @db.Uuid
  operator  User          @relation(fields: [operatorId], references: [id])
  venueId   String?       @db.Uuid
  venue     Venue?        @relation(fields: [venueId], references: [id])
  startAt   DateTime
  endAt     DateTime?
  createdAt DateTime      @default(now())
}

model QRCode {
  id             String        @id @default(uuid()) @db.Uuid
  publicId       String        @unique @default(dbgenerated("concat('qr_', replace(cast(gen_random_uuid() as text), '-', ''))"))
  type           QrType
  referenceId    String        @db.Uuid // UUID of Registration, Invitation, etc.
  token          String        @unique  // Secure random hash
  status         QrStatus      @default(ACTIVE)
  usagePolicy    QrUsagePolicy @default(SINGLE)
  usageLimit     Int           @default(1)
  usageCount     Int           @default(0)
  expiresAt      DateTime?
  encryptedData  String?       // Any encrypted payload if ever needed (optional)
  logs           ScanLog[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt
}

model ScanLog {
  id            String         @id @default(uuid()) @db.Uuid
  qrCodeId      String         @db.Uuid
  qrCode        QRCode         @relation(fields: [qrCodeId], references: [id])
  scannerId     String         @db.Uuid
  scanner       ScannerDevice  @relation(fields: [scannerId], references: [id])
  eventId       String         @db.Uuid
  event         Event          @relation(fields: [eventId], references: [id])
  venueId       String?        @db.Uuid
  venue         Venue?         @relation(fields: [venueId], references: [id])
  scanType      ScanType
  result        ScanResult
  failureReason String?
  device        String         // Device metadata
  gpsLocation   Json?          // GPS metadata
  idempotencyKey String?       @unique // Protects against offline double-syncs
  createdAt     DateTime       @default(now())
}

model Attendance {
  id             String    @id @default(uuid()) @db.Uuid
  eventId        String    @db.Uuid
  event          Event     @relation(fields: [eventId], references: [id])
  userId         String    @db.Uuid
  user           User      @relation(fields: [userId], references: [id])
  scanType       ScanType
  venueId        String?   @db.Uuid
  venue          Venue?    @relation(fields: [venueId], references: [id])
  firstScannedAt DateTime
  lastScannedAt  DateTime
  scanCount      Int       @default(1)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt

  @@unique([eventId, userId, scanType])
}
`;

fs.writeFileSync(schemaPath, content + additions);
console.log('Appended Milestone 3 QR and Check-in models to schema.prisma');
