# MedianHQ Product Requirements

## Product Overview

MedianHQ is a two-sided mentorship marketplace connecting mentees, including professionals, founders, and career switchers, with vetted mentors.

The platform enables:

- Mentor discovery
- 1:1 booking sessions
- Messaging
- Async Q&A
- Reviews and trust scoring

Business model:

- 2 free sessions per user per month
- Paid sessions: $15 per session
- Pro subscription: NGN 15,000/month
- Enterprise plan for teams

## User Roles

### Mentee

- Sign up and onboard
- Discover mentors
- Book sessions
- Message mentors
- Ask async questions
- Leave reviews

### Mentor

- Apply and get vetted
- Set profile and availability
- Accept bookings
- Conduct sessions
- Earn payouts
- Respond to questions

### Admin

- Manage users
- Moderate content
- Handle disputes
- Monitor analytics

## Core Features: MVP

### 1. Authentication

- Email signup/login
- OAuth: Google, LinkedIn
- Email verification required before booking

### 2. Mentee Onboarding Flow

Steps:

1. User signs up.
2. Select role: Mentee or Mentor.
3. Mentee selects goals using multi-select:
   - Career switch
   - Fundraising
   - Leadership
   - Job search
   - Skills
4. Input role and industry.
5. Select urgency:
   - ASAP
   - Within month
   - Exploring
6. Show matched mentors preview.
7. Prompt to complete profile, optional.

Constraints:

- Booking is blocked until email is verified.

### 3. Mentor Onboarding Flow

#### Phase 1: Application

- Full name
- Role
- Company
- Years of experience
- LinkedIn URL, required
- Expertise areas
- Languages
- 200-word motivation

AI pre-screen:

- Score application
- Reject low-score applications automatically
- Target acceptance rate: approximately 20%

#### Phase 2: Setup

- Bio, 150-300 words
- Profile image
- Expertise tags, max 10
- Session types
- Pricing, free or paid
- Availability calendar

Activation requirements:

- Minimum 2 available slots per week
- Payout setup complete

### 4. Mentor Discovery

Features:

- Full-text search by name, company, and skills
- Filters:
  - Expertise
  - Industry
  - Language
  - Timezone
  - Price, free or paid

Mentor profile shows:

- Avatar
- Name
- Role
- Company
- Bio
- Expertise tags
- Reviews
- Trust score
- Availability

### 5. Booking System

- Mentor defines availability for 30-minute or 60-minute sessions.
- Mentee selects a time slot.
- Booking is instantly confirmed after payment.
- Double booking must be prevented.

Calendar:

- Google/Outlook sync, optional.

Reminders:

- 24 hours before
- 1 hour before
- 10 minutes before

Pre-session:

- User must confirm attendance at 24 hours.

### 6. Session System

- Video session via Daily.co.
- Fallback: Zoom or Google Meet link.
- Shared session notes, optional.
- Session duration: 30 or 60 minutes.

Post-session:

- Both users leave reviews.
- Action items generated, future feature.

### 7. Messaging

- 1:1 chat between mentor and mentee.
- Enabled only after booking is confirmed.
- Realtime messaging.
- Messages stored in database.

### 8. Reviews And Trust Score

Review:

- Rating, 1-5
- Optional comment
- Visible only after both users submit

Trust score calculation:

- Reviews: 40%
- Attendance: 35%
- Response rate: 25%

Used for:

- Ranking mentors
- Visibility in search

### 9. Payments

Session price:

- $15 flat per session

Payment providers:

- Paystack for NGN
- Flutterwave for USD/GBP

Flow:

1. User selects session.
2. Payment is initialized.
3. Payment is confirmed via webhook.
4. Booking is marked confirmed.

Refund rules:

- Cancel more than 24 hours before session: 100% refund
- Cancel less than 24 hours before session: 50% refund
- Mentor no-show: full refund plus NGN 5,000 credit

### 10. Async Q&A

- Mentee posts question to mentor.
- Mentor must respond within 24 hours.
- Response rate is tracked.
- Response rate impacts trust score.

### 11. Admin Dashboard

Modules:

User Management:

- View all users
- Suspend/reactivate users
- View activity

Session Management:

- View sessions
- Track no-shows
- Access session records

Moderation:

- Flagged messages
- Approve/remove content

Finance:

- Revenue tracking
- Payout tracking
- Refund tracking

Disputes:

- Raise dispute
- Resolve dispute
- Issue credits

## Database Schema

### User

- `id`
- `role`: `mentee | mentor | admin`
- `email`
- `name`
- `image`
- `createdAt`

### MentorProfile

- `id`
- `userId`
- `bio`
- `expertise`: array
- `languages`: array
- `price`
- `availability`: JSON
- `trustScore`
- `isVerified`

### Session

- `id`
- `mentorId`
- `menteeId`
- `startTime`
- `duration`
- `status`: `scheduled | completed | cancelled`

### Booking

- `id`
- `sessionId`
- `mentorId`
- `menteeId`
- `status`: `pending | confirmed | cancelled`

### Message

- `id`
- `senderId`
- `receiverId`
- `content`
- `createdAt`

### Review

- `id`
- `sessionId`
- `rating`
- `comment`

### Payment

- `id`
- `userId`
- `amount`
- `currency`
- `status`: `pending | paid | refunded`

## API Endpoints

### Auth

- `POST /auth/signup`
- `POST /auth/login`

### Mentors

- `GET /mentors`
- `GET /mentors/:id`

### Bookings

- `POST /bookings`
- `GET /bookings/:userId`

### Sessions

- `GET /sessions/:id`
- `POST /sessions/:id/complete`

### Messages

- `POST /messages`
- `GET /messages/:chatId`

### Payments

- `POST /payments/init`
- `POST /payments/webhook`

## Business Rules

- Each user gets 2 free sessions per month.
- Messaging is unlocked only after booking.
- 3 no-shows within 90 days triggers review.
- Email verification is required before booking.
- Mentor must have availability to appear in search.

## Edge Cases

- Prevent double booking.
- Handle payment success but booking failure.
- Handle mentor cancellation.
- Handle no available mentors.
- Handle unverified users attempting booking.

## Non-Functional Requirements

- Mobile responsive UI.
- Page load under 2 seconds.
- Realtime messaging latency under 200ms.
- Secure authentication and payments.
- Scalable backend architecture.

## Build Order

1. Authentication
2. User roles
3. Mentor profiles
4. Discovery: search and filters
5. Booking system
6. Payments
7. Messaging
8. Reviews
9. Admin dashboard
10. Async Q&A

## Success Metrics

- Number of sessions booked
- Session completion rate
- Monthly active users
- Revenue
- Mentor response rate
- User satisfaction, NPS
