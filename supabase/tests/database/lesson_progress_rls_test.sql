begin;

create extension if not exists pgtap with schema extensions;
select plan(7);

insert into auth.users (id, email)
values
  ('123e4567-e89b-12d3-a456-426614174000', 'learner-one@test.local'),
  ('987fcdeb-51a2-43d7-9012-345678901234', 'learner-two@test.local');

insert into public.enrollments (user_id, course_id)
values
  ('123e4567-e89b-12d3-a456-426614174000', 'data-science'),
  ('987fcdeb-51a2-43d7-9012-345678901234', 'ai-ethics');

insert into public.lesson_progress (user_id, course_id, lesson_id)
values
  ('123e4567-e89b-12d3-a456-426614174000', 'data-science', 'data-science-lesson-1'),
  ('987fcdeb-51a2-43d7-9012-345678901234', 'ai-ethics', 'ai-ethics-lesson-1');

set local role authenticated;
set local request.jwt.claim.sub = '123e4567-e89b-12d3-a456-426614174000';

select results_eq(
  $$select lesson_id from public.lesson_progress order by lesson_id$$,
  array['data-science-lesson-1'::text],
  'A learner reads only their own progress'
);

select results_eq(
  $$insert into public.lesson_progress (user_id, course_id, lesson_id)
    values ('123e4567-e89b-12d3-a456-426614174000', 'data-science', 'data-science-lesson-2')
    returning lesson_id$$,
  array['data-science-lesson-2'::text],
  'A learner can save progress for their enrolled course'
);

select throws_ok(
  $$insert into public.lesson_progress (user_id, course_id, lesson_id)
    values ('987fcdeb-51a2-43d7-9012-345678901234', 'ai-ethics', 'ai-ethics-lesson-2')$$,
  '42501',
  null,
  'A learner cannot write another learner progress'
);

select throws_ok(
  $$insert into public.lesson_progress (user_id, course_id, lesson_id)
    values ('123e4567-e89b-12d3-a456-426614174000', 'cyber-security', 'cyber-security-lesson-1')$$,
  '42501',
  null,
  'A learner cannot save progress before enrollment'
);

select throws_ok(
  $$insert into public.enrollments (user_id, course_id)
    values ('123e4567-e89b-12d3-a456-426614174000', 'unlisted-course')$$,
  '23514',
  null,
  'An enrollment must reference a course in the catalog'
);

select throws_ok(
  $$insert into public.lesson_progress (user_id, course_id, lesson_id)
    values ('123e4567-e89b-12d3-a456-426614174000', 'data-science', 'web-development-lesson-2')$$,
  '23514',
  null,
  'A lesson must belong to the selected course'
);

set local request.jwt.claim.sub = '987fcdeb-51a2-43d7-9012-345678901234';
select results_eq(
  $$select lesson_id from public.lesson_progress order by lesson_id$$,
  array['ai-ethics-lesson-1'::text],
  'A second lear