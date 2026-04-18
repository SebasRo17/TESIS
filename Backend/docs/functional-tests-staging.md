# Functional Testing Guide for Remote Staging

This guide turns the functional testing plan into an executable checklist for the current backend.

It is aligned to the real routes that exist today and explicitly marks what is:

- `cumple`
- `cumple con adaptacion`
- `bloqueado por implementacion actual`

## Scope and current constraints

- Main environment: `remote staging`
- Source of truth: current backend implementation
- IA validation scope: current backend behavior
- Evidence format per test:
  - HTTP request
  - HTTP response
  - SQL verification

Known constraints in the current backend:

- `POST /orchestrator/next` does not exist
- `GET /me/dashboard` does not exist
- Orchestrator currently uses a `rule-based` decision client
- There is no real Steven, Elias, Alejandro runtime integration yet
- Real IA-driven insertion into `content_variants` is not available yet

## Required access

- `baseUrl` for remote staging, for example `https://staging.example.com/api`
- API test user credentials or permission to register a new one
- Database access for verification, ideally read-only
- Optional internal keys if internal routes must be tested:
  - `MASTERY_INTERNAL_API_KEY`
  - `STUDY_PLANS_INTERNAL_API_KEY`
  - `ORCHESTRATOR_INTERNAL_API_KEY`

## Test variables

Use these placeholders through the whole flow:

```text
BASE_URL=
ACCESS_TOKEN=
USER_ID=
COURSE_ID=
TOPIC_ID=
LESSON_ID=
VARIANT_ID=
EXAM_ID=
ATTEMPT_ID=
PLAN_ID=
PLAN_ITEM_ID=
```

## Pre-validation checklist

Before running the main tests, confirm:

- At least one active course exists
- The selected course has active topics
- The selected topic has at least one active lesson
- The selected lesson has at least one active content variant
- The selected course has at least one active exam
- There are active study rules available

Use the SQL helper file:

- [functional-verification.sql](D:/REPOS/TESIS/Backend/docs/functional-verification.sql)

## Execution order

Run tests in this order:

1. Auth
2. Catalog
3. Content open
4. Lesson progress
5. Assessment
6. Mastery validation
7. Snapshot
8. Orchestrator decision
9. Study plan update
10. Decision audit
11. Next activity with adaptation
12. Composite dashboard with adaptation

## Test 1: Register and login

Status: `cumple`

### Register

```bash
curl -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "qa_staging_001@example.com",
    "password": "Password123!",
    "confirmPassword": "Password123!",
    "firstName": "QA",
    "lastName": "Staging"
  }'
```

Validate:

- HTTP success
- `accessToken` present
- user exists in `users`
- session exists in `auth_sessions`

### Login

```bash
curl -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "qa_staging_001@example.com",
    "password": "Password123!"
  }'
```

Validate:

- HTTP success
- `accessToken` and `refreshToken` returned
- protected request works:

```bash
curl "$BASE_URL/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

## Test 2: Academic catalog

Status: `cumple`

### Courses

```bash
curl "$BASE_URL/courses"
```

Pick one active course and store `COURSE_ID`.

### Topics by course

```bash
curl "$BASE_URL/courses/$COURSE_ID/topics" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Pick one active topic and store `TOPIC_ID`.

### Lessons by topic

```bash
curl "$BASE_URL/topics/$TOPIC_ID/lessons" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Pick one lesson and store `LESSON_ID`.

Validate:

- Course -> topic -> lesson relationships are consistent in DB

## Test 3: Open lesson content

Status: `cumple`

### Get content variants by lesson

```bash
curl "$BASE_URL/lessons/$LESSON_ID/content" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Pick one variant and store `VARIANT_ID`.

### Register content open event

```bash
curl -X POST "$BASE_URL/content/$VARIANT_ID/events" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "eventType": "open",
    "metadata": {
      "source": "functional-test",
      "testCase": "T3"
    }
  }'
```

Validate:

- Variant belongs to the selected lesson
- Event exists in `content_events`
- `lesson_id`, `content_variant_id`, `event_type` are correct

## Test 4: Lesson progress

Status: `cumple`

### Start lesson progress

```bash
curl -X POST "$BASE_URL/lessons/$LESSON_ID/progress/start" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Complete lesson progress

```bash
curl -X POST "$BASE_URL/lessons/$LESSON_ID/progress/complete" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Validate aggregate progress

```bash
curl "$BASE_URL/me/courses/$COURSE_ID/progress" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Validate:

- `lesson_progress` row exists
- `status = completed`
- `completed_at` is not null
- aggregate progress increased

## Test 5: Assessment flow

Status: `cumple`

### Get exams by course

```bash
curl "$BASE_URL/courses/$COURSE_ID/exams" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Pick one exam and store `EXAM_ID`.

### Start exam attempt

```bash
curl -X POST "$BASE_URL/exams/$EXAM_ID/attempts" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Store `ATTEMPT_ID`.

### Submit responses

Use at least one real item from the selected exam:

```bash
curl -X POST "$BASE_URL/exam-attempts/$ATTEMPT_ID/responses" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": 1,
    "answer": { "value": "A" },
    "timeSpentSec": 25,
    "hintsUsed": 0
  }'
```

### Finish attempt

```bash
curl -X POST "$BASE_URL/exam-attempts/$ATTEMPT_ID/finish" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Optional detail readback

```bash
curl "$BASE_URL/exam-attempts/$ATTEMPT_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Validate:

- `exam_attempts` row exists
- `item_responses` rows exist
- `completed_at` is set
- scores were calculated

## Test 6: Mastery update

Status: `cumple` or `bloqueado parcial por integracion`

### Read current mastery

```bash
curl "$BASE_URL/me/topics/$TOPIC_ID/mastery" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Read mastery journal

```bash
curl "$BASE_URL/me/topics/$TOPIC_ID/mastery/journal" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Expected validation:

- If the assessment flow updates mastery automatically, verify:
  - new snapshot in `user_skill_mastery`
  - new row in `mastery_journal`
- If no new mastery exists after finishing the exam:
  - mark as `bloqueado parcial por integracion assessment -> mastery`
  - optionally test manual internal update only if internal key is available:

```bash
curl -X POST "$BASE_URL/mastery/update" \
  -H "x-internal-api-key: $MASTERY_INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 0,
    "topicId": 0,
    "source": "orchestrator",
    "delta": 0.15,
    "observationsDelta": 1
  }'
```

## Test 7: Snapshot build

Status: `cumple`

```bash
curl "$BASE_URL/orchestrator/users/$USER_ID/snapshot?courseId=$COURSE_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Validate snapshot includes:

- `mastery`
- `progress`
- `plan`
- `studyRules`
- `eligibility`
- `lastActions`

Adaptation note:

- `assessment_summary` is not a dedicated field
- use `lastActions.examAttempts` as the current assessment evidence

## Test 8: Orchestrator decision

Status: `cumple`

```bash
curl -X POST "$BASE_URL/orchestrator/users/$USER_ID/decide" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": $COURSE_ID
  }"
```

Validate:

- response contains a structured decision
- `orchestrator_decisions` has a new row
- decision payload is persisted

Possible current decisions in the backend:

- `next`
- `reinforce_topic`
- `feedback`
- `update_plan` only if produced by the configured decision client

## Test 9: Real IA content generation

Status: `bloqueado por implementacion actual`

Cannot be marked as passed today because:

- there is no live Elias/Alejandro integration
- orchestrator does not create new rows in `content_variants`
- no external model generation pipeline is wired in the backend runtime

Evidence to capture:

- current orchestrator implementation is rule-based
- no new `content_variants` row is created by a real IA call

## Test 10: Study plan update

Status: `cumple`

This test applies when a decision creates a new plan or when a plan is created through the internal route for controlled validation.

### Read active plan

```bash
curl "$BASE_URL/me/courses/$COURSE_ID/study-plan" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Read plan history

```bash
curl "$BASE_URL/me/courses/$COURSE_ID/study-plans" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

### Optional internal create plan test

```bash
curl -X POST "$BASE_URL/study-plans" \
  -H "x-internal-api-key: $STUDY_PLANS_INTERNAL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 0,
    "courseId": 0,
    "source": "functional-test",
    "state": "active",
    "items": [
      {
        "contentRefType": "lesson",
        "contentRefId": 0,
        "type": "lesson",
        "priority": 0.9,
        "orderN": 1
      }
    ]
  }'
```

Validate:

- new active plan exists
- previous active plan for the course is superseded
- `plan_items` are ordered correctly

## Test 11: Next activity selection

Status: `cumple con adaptacion`

Backend adaptation:

- there is no `POST /orchestrator/next`
- use orchestrator decision + study plan next item

### Step 1

```bash
curl -X POST "$BASE_URL/orchestrator/users/$USER_ID/decide" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"courseId\": $COURSE_ID
  }"
```

### Step 2

```bash
curl "$BASE_URL/me/courses/$COURSE_ID/study-plan/next" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Validate:

- frontend has enough data to redirect to the next resource

## Test 12: Decision audit

Status: `cumple`

```bash
curl "$BASE_URL/orchestrator/users/$USER_ID/decisions" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Validate:

- latest decision exists
- payload matches the last orchestrator action
- timestamps are coherent

## Test 13: Composite dashboard

Status: `cumple con adaptacion`

Backend adaptation:

- there is no `GET /me/dashboard`
- compose the dashboard view from existing routes

Use:

```bash
curl "$BASE_URL/me/courses/$COURSE_ID/progress" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```bash
curl "$BASE_URL/me/courses/$COURSE_ID/mastery" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```bash
curl "$BASE_URL/me/progress/recent" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

```bash
curl "$BASE_URL/me/courses/$COURSE_ID/study-plan/next" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

Validate:

- progress is coherent
- mastery is coherent
- recent activity matches latest actions
- next activity is available when a plan exists

## Test 14: Full end-to-end adaptive flow

Status: `bloqueado parcial por implementacion actual`

What can be executed today:

- login
- open lesson
- complete lesson
- resolve exam
- verify mastery state
- build snapshot
- run orchestrator decision
- verify plan and decision audit

What cannot be marked as fully passed today:

- real IA content generation into `content_variants`
- automatic adaptive content generation by external models
- complete frontend redirection based on a dedicated orchestrator next endpoint

## Final thesis scenario

Status: `bloqueado parcial por implementacion actual`

Target scenario:

- user fails algebra evaluation
- low mastery detected
- orchestrator decides `reinforce_topic`
- IA generates reinforcement exercises
- new content is stored
- plan updates automatically
- frontend shows reinforcement flow

Current backend reality:

- low mastery can be detected
- orchestrator can emit or simulate reinforcement behavior
- content interaction can be registered
- decision audit can be persisted
- no real IA-generated reinforcement content is inserted yet

## Result matrix

Use this matrix during execution:

| Test | Name | Current status target |
| --- | --- | --- |
| 1 | Register and login | cumple |
| 2 | Academic catalog | cumple |
| 3 | Open lesson content | cumple |
| 4 | Lesson progress | cumple |
| 5 | Assessment flow | cumple |
| 6 | Mastery update | cumple o bloqueado parcial |
| 7 | Snapshot build | cumple |
| 8 | Orchestrator decision | cumple |
| 9 | Real IA content generation | bloqueado |
| 10 | Study plan update | cumple |
| 11 | Next activity selection | cumple con adaptacion |
| 12 | Decision audit | cumple |
| 13 | Composite dashboard | cumple con adaptacion |
| 14 | Full adaptive e2e | bloqueado parcial |
| Final | Thesis adaptive scenario | bloqueado parcial |

## Evidence template

For each executed test, capture:

```text
Test ID:
Date:
Environment:
User:
Endpoint:
Request:
Response status:
Response summary:
SQL verification:
Result:
Notes:
```
