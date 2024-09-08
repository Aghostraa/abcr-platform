import { NextApiRequest, NextApiResponse } from 'next';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = createRouteHandlerClient({ cookies });
  const { action } = req.query;
  const { taskId } = req.body;

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Get user role
  const { data: role, error: roleError } = await supabase.rpc('get_user_role', { user_email: user.email });
  if (roleError) {
    return res.status(500).json({ error: 'Error fetching user role' });
  }

  switch (action) {
    case 'apply':
      if (['member', 'manager', 'admin'].includes(role)) {
        const { error } = await supabase
          .from('tasks')
          .update({ applicant_id: user.id, status: 'applied' })
          .eq('id', taskId);
        if (error) return res.status(500).json({ error: 'Error applying for task' });
        return res.status(200).json({ message: 'Successfully applied for task' });
      }
      break;
    case 'approve-application':
      if (['manager', 'admin'].includes(role)) {
        const { error } = await supabase
          .from('tasks')
          .update({ status: 'in_progress' })
          .eq('id', taskId);
        if (error) return res.status(500).json({ error: 'Error approving application' });
        return res.status(200).json({ message: 'Successfully approved application' });
      }
      break;
    case 'mark-done':
      const { error: markDoneError } = await supabase
        .from('tasks')
        .update({ status: 'pending_approval', completed_at: new Date().toISOString() })
        .eq('id', taskId)
        .eq('applicant_id', user.id);
      if (markDoneError) return res.status(500).json({ error: 'Error marking task as done' });
      return res.status(200).json({ message: 'Successfully marked task as done' });
    case 'approve-completion':
      if (['manager', 'admin'].includes(role)) {
        const { error } = await supabase
          .from('tasks')
          .update({ 
            status: 'completed', 
            approved_by: user.id, 
            approved_at: new Date().toISOString() 
          })
          .eq('id', taskId);
        if (error) return res.status(500).json({ error: 'Error approving task completion' });
        return res.status(200).json({ message: 'Successfully approved task completion' });
      }
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  return res.status(403).json({ error: 'Forbidden' });
}