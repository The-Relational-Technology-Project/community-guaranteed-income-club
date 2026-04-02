import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Mail, Save, Eye, Edit2, ChevronDown, ChevronUp } from "lucide-react";

interface EmailTemplate {
  id: string;
  template_key: string;
  subject: string;
  body_html: string;
  description: string | null;
  is_enabled: boolean;
  updated_at: string;
}

const AdminEmailsTab = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");

  const fetchTemplates = async () => {
    const { data } = await supabase
      .from("email_templates")
      .select("*")
      .order("template_key");
    setTemplates((data as EmailTemplate[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const toggleEnabled = async (template: EmailTemplate) => {
    const { error } = await supabase
      .from("email_templates")
      .update({ is_enabled: !template.is_enabled, updated_at: new Date().toISOString() })
      .eq("id", template.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: template.is_enabled ? "Email flow disabled" : "Email flow enabled" });
      fetchTemplates();
    }
  };

  const startEditing = (template: EmailTemplate) => {
    setEditingId(template.id);
    setEditSubject(template.subject);
    setEditBody(template.body_html);
    setPreviewId(null);
  };

  const saveTemplate = async (templateId: string) => {
    const { error } = await supabase
      .from("email_templates")
      .update({
        subject: editSubject,
        body_html: editBody,
        updated_at: new Date().toISOString(),
      })
      .eq("id", templateId);

    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Template saved!" });
      setEditingId(null);
      fetchTemplates();
    }
  };

  const formatKey = (key: string) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const previewHtml = (html: string) =>
    html
      .replace(/\{\{name\}\}/g, "Maya Johnson")
      .replace(/\{\{amount\}\}/g, "42.50")
      .replace(/\{\{otherName\}\}/g, "Alex Rivera")
      .replace(/\{\{venmoLink\}\}/g, "#")
      .replace(/\{\{profileLink\}\}/g, "#")
      .replace(/\{\{rosterLink\}\}/g, "#")
      .replace(/\{\{#if isSender\}\}/g, "")
      .replace(/\{\{\/if\}\}/g, "")
      .replace(/\{\{#if isReceiver\}\}.*?\{\{\/if\}\}/gs, "");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Automated Email Flows
          </CardTitle>
          <CardDescription>
            Toggle email flows on/off and edit the templates. When enabled, these emails will be sent automatically at the right time. 
            Use {"{{name}}"}, {"{{amount}}"}, {"{{otherName}}"}, {"{{venmoLink}}"} as placeholders.
          </CardDescription>
        </CardHeader>
      </Card>

      {templates.map((template) => {
        const isEditing = editingId === template.id;
        const isPreviewing = previewId === template.id;

        return (
          <Card key={template.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{formatKey(template.template_key)}</CardTitle>
                    <Badge variant={template.is_enabled ? "default" : "secondary"}>
                      {template.is_enabled ? "Active" : "Off"}
                    </Badge>
                  </div>
                  {template.description && (
                    <CardDescription className="mt-1">{template.description}</CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {template.is_enabled ? "On" : "Off"}
                    </span>
                    <Switch
                      checked={template.is_enabled}
                      onCheckedChange={() => toggleEnabled(template)}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Subject Line</label>
                    <Input
                      value={editSubject}
                      onChange={(e) => setEditSubject(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Body (HTML)</label>
                    <Textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={10}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => saveTemplate(template.id)} className="gap-1">
                      <Save className="h-3 w-3" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">Subject:</span>
                    <span className="font-medium">{template.subject}</span>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => startEditing(template)} className="gap-1">
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setPreviewId(isPreviewing ? null : template.id)}
                      className="gap-1"
                    >
                      <Eye className="h-3 w-3" />
                      {isPreviewing ? "Hide Preview" : "Preview"}
                      {isPreviewing ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                  </div>

                  {isPreviewing && (
                    <div className="border rounded-md p-4 bg-background">
                      <p className="text-xs text-muted-foreground mb-2">Preview with sample data:</p>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewHtml(template.body_html) }}
                      />
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground mt-3">
                Last updated: {new Date(template.updated_at).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AdminEmailsTab;
