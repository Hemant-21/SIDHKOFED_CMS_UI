'use client';

/**
 * Document create/edit form. Reuses the shared form framework (<Form>, Field components,
 * BilingualTabs, FormSection), the relationship pickers (master/option hooks), and the document
 * attachment field (shared media pipeline). It NEVER sets publication state (that is the lifecycle
 * actions). Server-side 422 errors map back onto fields via the <Form> wrapper. The slug is shown
 * read-only after creation (immutable; codex §11).
 */

import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { Form } from '@/components/form/form';
import { TextField, TextareaField, SelectField, MultiSelectField, SwitchField, DateField } from '@/components/form/fields';
import { FormSection, FormActions } from '@/components/form/form-section';
import { BilingualTabs } from '@/components/form/bilingual-tabs';
import { useZodForm } from '@/components/form/use-zod-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useMasterOptions } from '@/components/relationships';
import { HIGHLIGHT_LABEL } from '@/constants/status';
import { ROUTES } from '@/constants/routes';
import { useCrudCreate, useCrudUpdate } from '@/hooks/crud';
import { DOCUMENTS_RESOURCE, useFinancialYearOptions } from '../api';
import type { DocumentDetail } from '../types';
import { buildDocumentPayload, documentToForm, emptyDocumentForm, type DocumentFormValues } from '../document-form-payload';
import { DocumentFileField } from './document-file-field';

const schema = z.object({
  title_en: z.string().trim().min(1, 'English title is required.').max(255),
  title_hi: z.string().max(255),
  description_en: z.string(),
  description_hi: z.string(),
  document_type_id: z.string().min(1, 'Document type is required.'),
  file_asset_id: z.string().min(1, 'An attachment is required.'),
  language: z.enum(['en', 'hi']),
  publication_date: z.string(),
  is_public: z.boolean(),
  financial_year_id: z.string(),
  commodity_ids: z.array(z.string()),
  district_ids: z.array(z.string()),
  public_visibility: z.boolean(),
  show_on_homepage: z.boolean(),
  highlight_type: z.string(),
  highlight_start_at: z.string(),
  highlight_end_at: z.string(),
  display_order: z.string(),
  publish_start_at: z.string(),
});

const HIGHLIGHT_OPTIONS = [
  { value: '', label: 'No highlight' },
  ...(Object.keys(HIGHLIGHT_LABEL) as Array<keyof typeof HIGHLIGHT_LABEL>).map((k) => ({ value: k, label: HIGHLIGHT_LABEL[k] })),
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
];

export interface DocumentFormProps {
  document?: DocumentDetail;
}

export function DocumentForm({ document }: DocumentFormProps) {
  const router = useRouter();
  const isEdit = Boolean(document);

  const form = useZodForm<DocumentFormValues>(schema as never, {
    defaultValues: document ? documentToForm(document) : emptyDocumentForm(),
  });

  const highlightType = form.watch('highlight_type');
  const selectedDocumentTypeId = form.watch('document_type_id');

  const documentTypes = useMasterOptions('document-types');
  const commodities = useMasterOptions('commodities');
  const districts = useMasterOptions('districts');
  const financialYears = useFinancialYearOptions();

  const selectedDocumentType = documentTypes.items?.find((t) => t.id === selectedDocumentTypeId);

  const createMutation = useCrudCreate<ReturnType<typeof buildDocumentPayload>, DocumentDetail>(DOCUMENTS_RESOURCE);
  const updateMutation = useCrudUpdate<ReturnType<typeof buildDocumentPayload>, DocumentDetail>(DOCUMENTS_RESOURCE);
  const saving = createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: DocumentFormValues) => {
    const payload = buildDocumentPayload(values);
    if (isEdit && document) {
      const updated = await updateMutation.mutateAsync({ id: document.id, body: payload });
      router.push(`${ROUTES.documents}/${updated.id}`);
    } else {
      const created = await createMutation.mutateAsync(payload);
      router.push(`${ROUTES.documents}/${created.id}`);
    }
  };

  return (
    <Form form={form} onSubmit={onSubmit} className="space-y-8">
      <FormSection title="Content" description="English is required; Hindi is optional (codex §10).">
        <BilingualTabs
          english={
            <>
              <TextField<DocumentFormValues> name="title_en" label="Title (English)" required />
              <TextareaField<DocumentFormValues> name="description_en" label="Description (English)" rows={4} />
            </>
          }
          hindi={
            <>
              <TextField<DocumentFormValues> name="title_hi" label="शीर्षक (Hindi)" />
              <TextareaField<DocumentFormValues> name="description_hi" label="विवरण (Hindi)" rows={4} />
            </>
          }
        />
      </FormSection>

      <FormSection title="Classification" columns={2}>
        <SelectField<DocumentFormValues>
          name="document_type_id"
          label="Document type"
          required
          placeholder="Select document type"
          options={documentTypes.options}
        />
        <SelectField<DocumentFormValues> name="language" label="Language" options={LANGUAGE_OPTIONS} />
        <DateField<DocumentFormValues> name="publication_date" label="Publication date" />
        <SelectField<DocumentFormValues>
          name="financial_year_id"
          label="Financial year"
          placeholder="None"
          options={[{ value: '', label: 'None' }, ...financialYears.options]}
        />
      </FormSection>

      <FormSection title="Attachment" description="Upload the file once; link it by reference (codex §4.5).">
        <DocumentFileField<DocumentFormValues>
          name="file_asset_id"
          label="Document file"
          required
          initialFile={document ? { id: document.file.id, file_name: document.file.file_name } : null}
        />
      </FormSection>

      <FormSection
        title="Destination"
        description="Determined entirely by the selected document type — pick the document type above to change it."
      >
        {selectedDocumentType ? (
          <div className="flex items-center gap-2">
            <Badge tone={selectedDocumentType.document_section === 'notifications' ? 'info' : 'default'} dot>
              {selectedDocumentType.document_section === 'notifications' ? 'Notifications' : 'Publications'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {(selectedDocumentType.document_section === 'notifications'
                ? selectedDocumentType.communication_type?.name_en
                : selectedDocumentType.knowledge_category?.name_en) ?? '—'}
            </span>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Select a document type to see its destination.</p>
        )}
      </FormSection>

      <FormSection title="Relationships" description="Linked master data and reusable records." columns={2}>
        <MultiSelectField<DocumentFormValues> name="commodity_ids" label="Commodities" options={commodities.options} />
        <MultiSelectField<DocumentFormValues> name="district_ids" label="Districts" options={districts.options} />
      </FormSection>

      <FormSection title="Visibility & scheduling" columns={2}>
        <SwitchField<DocumentFormValues> name="is_public" label="Public document" />
        <SwitchField<DocumentFormValues> name="public_visibility" label="Publicly visible" />
        <SwitchField<DocumentFormValues> name="show_on_homepage" label="Show on homepage" />
        <DateField<DocumentFormValues> name="publish_start_at" label="Scheduled publish date" />
        <TextField<DocumentFormValues> name="display_order" label="Display order" type="number" />
        <SelectField<DocumentFormValues> name="highlight_type" label="Highlight" options={HIGHLIGHT_OPTIONS} />
        {highlightType ? (
          <div className="grid grid-cols-2 gap-4 sm:col-span-2">
            <DateField<DocumentFormValues> name="highlight_start_at" label="Highlight from" />
            <DateField<DocumentFormValues> name="highlight_end_at" label="Highlight until" />
          </div>
        ) : null}
      </FormSection>

      {isEdit && document ? (
        <FormSection title="Identifier">
          <div>
            <Label htmlFor="document-slug">Slug (read-only)</Label>
            <Input id="document-slug" value={document.slug} readOnly disabled />
            <p className="mt-1 text-xs text-muted-foreground">The public URL is permanent and cannot be changed after creation.</p>
          </div>
        </FormSection>
      ) : null}

      <FormActions>
        <Button type="button" variant="ghost" onClick={() => router.back()} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" isLoading={saving}>
          {isEdit ? 'Save changes' : 'Create document'}
        </Button>
      </FormActions>
    </Form>
  );
}
