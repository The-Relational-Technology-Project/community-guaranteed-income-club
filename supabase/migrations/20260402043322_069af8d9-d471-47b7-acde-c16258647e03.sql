
CREATE TABLE public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key text UNIQUE NOT NULL,
  subject text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '',
  description text,
  is_enabled boolean NOT NULL DEFAULT false,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage email templates"
  ON public.email_templates FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view enabled templates"
  ON public.email_templates FOR SELECT TO authenticated
  USING (is_enabled = true);

-- Seed default email templates
INSERT INTO public.email_templates (template_key, subject, body_html, description, is_enabled) VALUES
(
  'monthly_calculation',
  'Your Monthly Redistribution Assignment',
  '<h2>Hi {{name}},</h2><p>The monthly redistribution has been calculated!</p><p>{{#if isSender}}You are sending <strong>${{amount}}</strong> to <strong>{{otherName}}</strong>.{{/if}}{{#if isReceiver}}You will receive <strong>${{amount}}</strong> from <strong>{{otherName}}</strong>.{{/if}}</p><p><a href="{{venmoLink}}">Open Venmo to send payment</a></p><p>Thank you for being part of the Baltimore Community GI Program! 💛</p>',
  'Sent to each participant after the monthly calculation runs with their personalized transaction details.',
  false
),
(
  'income_update_reminder',
  'Time to Update Your Income for This Month',
  '<h2>Hi {{name}},</h2><p>It''s the start of a new month! Please log in and update your post-tax monthly income if it has changed.</p><p><a href="{{profileLink}}">Update your profile</a></p><p>Accurate income info ensures fair redistribution for everyone. Thank you!</p>',
  'Sent at the start of each month asking participants to update their income.',
  false
),
(
  'welcome_new_member',
  'Welcome to the Baltimore Community GI Program!',
  '<h2>Welcome, {{name}}!</h2><p>Thank you for joining the Baltimore Community Guaranteed Income Program. We''re excited to have you as part of our community.</p><p>Here''s what to expect:</p><ul><li>On the 1st of each month, we calculate redistribution amounts</li><li>You''ll receive a notification with your send/receive assignment</li><li>Use Venmo to complete your transaction</li></ul><p><a href="{{rosterLink}}">Meet the community</a></p>',
  'Sent when a new member is activated from the waitlist or signs up.',
  false
),
(
  'payment_reminder',
  'Friendly Reminder: Complete Your Transaction',
  '<h2>Hi {{name}},</h2><p>Just a friendly reminder that your transaction of <strong>${{amount}}</strong> to <strong>{{otherName}}</strong> hasn''t been confirmed yet.</p><p><a href="{{venmoLink}}">Open Venmo to send</a></p><p>Please complete it when you get a chance. Thank you!</p>',
  'Sent a few days after calculation if the sender hasn''t confirmed payment.',
  false
);
