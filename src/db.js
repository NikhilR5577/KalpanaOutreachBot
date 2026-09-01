import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

export async function getUnsentHospitals(limit = 5) {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .eq('sent', false)
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getAllHospitals() {
  const { data, error } = await supabase
    .from('hospitals')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addHospital(name, email, city) {
  const { data, error } = await supabase
    .from('hospitals')
    .insert([{ name, email, city }])
    .select();
  if (error) throw error;
  return data[0];
}

export async function addHospitalsBulk(hospitalsArray) {
  const { data, error } = await supabase
    .from('hospitals')
    .insert(hospitalsArray)
    .select();
  if (error) throw error;
  return data;
}

export async function markHospitalSent(id) {
  const { error } = await supabase
    .from('hospitals')
    .update({ sent: true, sent_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function markHospitalReplied(id) {
  const { error } = await supabase
    .from('hospitals')
    .update({ replied: true, replied_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function logOutreachEmail(hospitalId, subject) {
  const { error } = await supabase
    .from('outreach_emails')
    .insert([{ hospital_id: hospitalId, subject }]);
  if (error) throw error;
}

export async function saveReply(hospitalId, fromEmail, subject, preview) {
  const { error } = await supabase
    .from('replies')
    .insert([{ hospital_id: hospitalId, from_email: fromEmail, subject, preview }]);
  if (error) throw error;
}

export async function getLatestReplies(limit = 5) {
  const { data, error } = await supabase
    .from('replies')
    .select('*, hospitals(name, city)')
    .order('received_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function getStats() {
  const [{ count: totalHospitals }, { count: sentCount }, { count: repliedCount }] = await Promise.all([
    supabase.from('hospitals').select('*', { count: 'exact', head: true }),
    supabase.from('hospitals').select('*', { count: 'exact', head: true }).eq('sent', true),
    supabase.from('hospitals').select('*', { count: 'exact', head: true }).eq('replied', true),
  ]);
  return { totalHospitals, sentCount, repliedCount, remaining: totalHospitals - sentCount };
}
