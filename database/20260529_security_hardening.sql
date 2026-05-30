-- Security hardening migration for existing Supabase projects.
-- Safe to run without reseeding data.

drop policy if exists "Users can update their profile" on profiles;
drop policy if exists "Admins can update profiles" on profiles;
create policy "Admins can update profiles" on profiles for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Users can manage own sessions" on practice_sessions;
drop policy if exists "Users can read own sessions" on practice_sessions;
create policy "Users can read own sessions" on practice_sessions for select using (auth.uid() = user_id);
drop policy if exists "Users can create own sessions" on practice_sessions;
create policy "Users can create own sessions" on practice_sessions for insert with check (auth.uid() = user_id);

drop policy if exists "Users can manage own answers" on user_answers;
drop policy if exists "Users can read own answers" on user_answers;
create policy "Users can read own answers" on user_answers for select using (auth.uid() = user_id);

drop policy if exists "Users can create own session questions" on session_questions;

drop policy if exists "Users can create own scores" on score_results;
drop policy if exists "Users can update own scores" on score_results;

drop policy if exists "Authenticated users can read app settings" on app_settings;
create policy "Authenticated users can read app settings" on app_settings for select to authenticated using (key in ('practice', 'scoring'));

create or replace function public.create_practice_session(
  p_category_id bigint,
  p_topic_id bigint,
  p_mode text,
  p_question_ids bigint[],
  p_duration_seconds int default null,
  p_expires_at timestamptz default null
)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_session_id uuid;
  v_question_id bigint;
  v_position int := 1;
begin
  if auth.uid() is null then
    raise exception 'Login wajib dilakukan';
  end if;

  if p_mode not in ('practice', 'exam') then
    raise exception 'Mode sesi tidak valid';
  end if;

  if p_question_ids is null or array_length(p_question_ids, 1) is null then
    raise exception 'Daftar soal kosong';
  end if;

  insert into public.practice_sessions (
    user_id,
    category_id,
    topic_id,
    mode,
    total_questions,
    duration_seconds,
    expires_at
  ) values (
    auth.uid(),
    p_category_id,
    p_topic_id,
    p_mode,
    array_length(p_question_ids, 1),
    p_duration_seconds,
    p_expires_at
  ) returning id into v_session_id;

  foreach v_question_id in array p_question_ids loop
    if not exists (
      select 1 from public.questions
      where id = v_question_id
        and status = 'published'
    ) then
      raise exception 'Soal sesi tidak valid';
    end if;

    insert into public.session_questions (session_id, question_id, position)
    values (v_session_id, v_question_id, v_position);

    v_position := v_position + 1;
  end loop;

  return v_session_id;
end;
$$;

create or replace function public.finish_session(p_session_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_session public.practice_sessions%rowtype;
  v_total_score int;
  v_answered_questions int;
  v_correct_count int;
begin
  select * into v_session
  from public.practice_sessions
  where id = p_session_id
    and user_id = auth.uid();

  if not found then
    raise exception 'Sesi tidak valid';
  end if;

  if v_session.status = 'finished' then
    return;
  end if;

  select
    coalesce(sum(ua.score), 0)::int,
    count(ua.id)::int,
    count(ua.id) filter (where qo.is_correct)::int
  into v_total_score, v_answered_questions, v_correct_count
  from public.user_answers ua
  left join public.question_options qo on qo.id = ua.selected_option_id
  where ua.session_id = p_session_id
    and ua.user_id = auth.uid();

  update public.practice_sessions
  set status = 'finished', total_score = v_total_score, finished_at = now()
  where id = p_session_id
    and user_id = auth.uid()
    and status = 'ongoing';

  insert into public.score_results (
    session_id,
    user_id,
    category_id,
    topic_id,
    total_questions,
    answered_questions,
    correct_count,
    wrong_count,
    total_score
  ) values (
    v_session.id,
    auth.uid(),
    v_session.category_id,
    v_session.topic_id,
    v_session.total_questions,
    v_answered_questions,
    v_correct_count,
    greatest(v_answered_questions - v_correct_count, 0),
    v_total_score
  )
  on conflict (session_id)
  do update set
    answered_questions = excluded.answered_questions,
    correct_count = excluded.correct_count,
    wrong_count = excluded.wrong_count,
    total_score = excluded.total_score;
end;
$$;

create or replace function public.get_finished_session_review(p_session_id uuid)
returns table (
  "position" int,
  question_id bigint,
  question_text text,
  explanation text,
  category_code text,
  topic_name text,
  options jsonb
)
language sql
security definer set search_path = public
stable
as $$
  select
    sq.position,
    q.id as question_id,
    q.question_text,
    q.explanation,
    c.code as category_code,
    t.name as topic_name,
    coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', qo.id,
          'label', qo.label,
          'option_text', qo.option_text,
          'is_correct', qo.is_correct,
          'score', qo.score
        ) order by qo.label
      ) filter (where qo.id is not null),
      '[]'::jsonb
    ) as options
  from public.session_questions sq
  join public.practice_sessions ps on ps.id = sq.session_id
  join public.questions q on q.id = sq.question_id
  left join public.categories c on c.id = q.category_id
  left join public.topics t on t.id = q.topic_id
  left join public.question_options qo on qo.question_id = q.id
  where sq.session_id = p_session_id
    and ps.user_id = auth.uid()
    and ps.status = 'finished'
  group by sq.position, q.id, q.question_text, q.explanation, c.code, t.name
  order by sq.position;
$$;

grant execute on function public.create_practice_session(bigint, bigint, text, bigint[], int, timestamptz) to authenticated;
grant execute on function public.finish_session(uuid) to authenticated;
grant execute on function public.get_finished_session_review(uuid) to authenticated;
