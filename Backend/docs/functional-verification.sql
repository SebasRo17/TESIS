-- Functional verification helpers for remote staging
-- Replace the values below before executing.

SET @user_id = 0;
SET @course_id = 0;
SET @topic_id = 0;
SET @lesson_id = 0;
SET @variant_id = 0;
SET @exam_id = 0;
SET @attempt_id = 0;

-- Pre-validation

SELECT id, code, title, status
FROM courses
ORDER BY id;

SELECT id, course_id, name, is_active
FROM topics
WHERE course_id = @course_id
ORDER BY id;

SELECT id, course_id, primary_topic_id, title, is_active
FROM lessons
WHERE course_id = @course_id
ORDER BY id;

SELECT id, lesson_id, modality, difficulty_profile, is_active, version
FROM content_variants
WHERE lesson_id = @lesson_id
ORDER BY version DESC, id ASC;

SELECT e.id, e.title, e.mode, e.is_active
FROM exams e
WHERE e.is_active = 1
ORDER BY e.id;

SELECT sr.id, sr.name, sr.scope, sr.priority, sr.is_active
FROM study_rules sr
WHERE sr.is_active = 1
ORDER BY sr.priority ASC, sr.id ASC;

-- T1 auth

SELECT u.id, u.email, u.status, u.created_at
FROM users u
WHERE u.email = 'qa_staging_001@example.com';

SELECT s.id, s.user_id, s.ip, s.user_agent
FROM auth_sessions s
JOIN users u ON u.id = s.user_id
WHERE u.email = 'qa_staging_001@example.com'
ORDER BY s.id DESC;

-- T2 catalog integrity

SELECT t.id AS topic_id, t.course_id, c.title AS course_title
FROM topics t
JOIN courses c ON c.id = t.course_id
WHERE t.id = @topic_id;

SELECT l.id AS lesson_id, l.course_id, l.primary_topic_id, t.name AS topic_name
FROM lessons l
LEFT JOIN topics t ON t.id = l.primary_topic_id
WHERE l.id = @lesson_id;

-- T3 content events

SELECT ce.id, ce.user_id, ce.lesson_id, ce.content_variant_id, ce.event_type, ce.event_value
FROM content_events ce
WHERE ce.user_id = @user_id
  AND ce.content_variant_id = @variant_id
ORDER BY ce.id DESC
LIMIT 10;

-- T4 lesson progress

SELECT lp.id, lp.user_id, lp.lesson_id, lp.status, lp.last_position, lp.completed_at, lp.time_spent_sec
FROM lesson_progress lp
WHERE lp.user_id = @user_id
  AND lp.lesson_id = @lesson_id
ORDER BY lp.id DESC
LIMIT 5;

SELECT l.id AS lesson_id, l.title, lp.status, lp.completed_at
FROM lessons l
LEFT JOIN lesson_progress lp
  ON lp.lesson_id = l.id AND lp.user_id = @user_id
WHERE l.course_id = @course_id
ORDER BY l.id;

-- T5 assessment

SELECT ea.id, ea.user_id, ea.exam_id, ea.started_at, ea.completed_at, ea.score_raw, ea.score_norm
FROM exam_attempts ea
WHERE ea.user_id = @user_id
  AND ea.exam_id = @exam_id
ORDER BY ea.id DESC
LIMIT 10;

SELECT ir.id, ir.attempt_id, ir.item_id, ir.is_correct, ir.time_spent_sec, ir.hints_used, ir.awarded_score
FROM item_responses ir
WHERE ir.attempt_id = @attempt_id
ORDER BY ir.id;

-- T6 mastery

SELECT usm.id, usm.user_id, usm.topic_id, usm.mastery, usm.observations
FROM user_skill_mastery usm
WHERE usm.user_id = @user_id
  AND usm.topic_id = @topic_id
ORDER BY usm.id DESC
LIMIT 5;

SELECT mj.id, mj.user_id, mj.topic_id, mj.source, mj.delta, mj.mastery_before, mj.mastery_after, mj.at
FROM mastery_journal mj
WHERE mj.user_id = @user_id
  AND mj.topic_id = @topic_id
ORDER BY mj.id DESC
LIMIT 10;

-- T7 snapshot support

SELECT sr.id, sr.name, sr.scope, sr.priority, srb.id AS binding_id, srb.course_id, srb.topic_id, srb.user_id
FROM study_rules sr
LEFT JOIN study_rule_bindings srb ON srb.rule_id = sr.id
WHERE sr.is_active = 1
  AND (
    srb.id IS NULL
    OR srb.course_id = @course_id
    OR srb.topic_id = @topic_id
    OR srb.user_id = @user_id
  )
ORDER BY sr.priority ASC, sr.id ASC, srb.id ASC;

SELECT cp.id, cp.lesson_id, cp.required_topic_id, cp.min_mastery
FROM content_prereqs cp
JOIN lessons l ON l.id = cp.lesson_id
WHERE l.course_id = @course_id
ORDER BY cp.id;

-- T8 and T12 orchestrator decisions

SELECT od.id, od.user_id, od.decision_type, od.rationale, od.model_version, od.correlation_id, od.created_at
FROM orchestrator_decisions od
WHERE od.user_id = @user_id
ORDER BY od.id DESC
LIMIT 20;

SELECT od.id, od.decision_type, od.input_snapshot, od.output
FROM orchestrator_decisions od
WHERE od.user_id = @user_id
ORDER BY od.id DESC
LIMIT 5;

-- T10 study plans

SELECT p.id, p.user_id, p.version, p.state, p.source, p.created_at, p.activated_at, p.superseded_at
FROM plans p
WHERE p.user_id = @user_id
ORDER BY p.id DESC
LIMIT 20;

SELECT pi.id, pi.plan_id, pi.content_ref_type, pi.content_ref_id, pi.type, pi.priority, pi.order_n, pi.due_at, pi.metadata
FROM plan_items pi
JOIN plans p ON p.id = pi.plan_id
WHERE p.user_id = @user_id
ORDER BY pi.plan_id DESC, pi.order_n ASC;

-- T13 recent activity

SELECT ce.id, ce.user_id, ce.lesson_id, ce.content_variant_id, ce.event_type
FROM content_events ce
WHERE ce.user_id = @user_id
ORDER BY ce.id DESC
LIMIT 10;

SELECT ea.id, ea.user_id, ea.exam_id, ea.started_at, ea.completed_at
FROM exam_attempts ea
WHERE ea.user_id = @user_id
ORDER BY ea.id DESC
LIMIT 10;
