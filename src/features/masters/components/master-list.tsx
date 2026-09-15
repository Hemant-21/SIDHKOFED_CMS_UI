'use client';

import { useMemo, useState } from 'react';
import { Plus, MoreHorizontal } from 'lucide-react';
import { Card } from '@/components/layout/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dropdown } from '@/components/ui/dropdown';
import { DataTable, useDataTable } from '@/components/data-table';
import { Pagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/feedback/empty-state';
import { Can } from '@/components/auth/can';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useFilters } from '@/hooks/crud';
import { useMasterOptions } from '@/components/relationships';
import { useMasterList, useActivateMaster, useDeactivateMaster } from '../hooks';
import { MasterFormDialog } from './master-form-dialog';
import type { MasterRecord, MasterTypeConfig } from '../types';
import type { ColumnDef } from '@/types/table';

interface MasterListProps {
  config: MasterTypeConfig;
}

export function MasterList({ config }: MasterListProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<MasterRecord | undefined>();

  const categoryActionsDisabled = [
    'event-categories',
    'knowledge-categories',
    'communication-types',
    'procurement-update-categories',
  ].includes(config.key);
  const isBlocks = config.key === 'blocks';
  const isEventTypes = config.key === 'event-types';
  const isProcurementUpdateTypes = config.key === 'procurement-update-types';
  const isDocumentTypes = config.key === 'document-types';
  const defaultSort = config.defaultSort ?? 'display_order';
  const filters = useFilters({ keys: config.filterKeys ?? [] });
  const districts = useMasterOptions('districts', { enabled: isBlocks });
  const eventCategories = useMasterOptions('event-categories', { enabled: isEventTypes });
  const procurementUpdateCategories = useMasterOptions('procurement-update-categories', { enabled: isProcurementUpdateTypes });
  const documentSection = filters.filters.document_section ?? '';
  const knowledgeCategories = useMasterOptions('knowledge-categories', {
    enabled: isDocumentTypes && documentSection !== 'notifications',
  });
  const communicationTypes = useMasterOptions('communication-types', {
    enabled: isDocumentTypes && documentSection === 'notifications',
  });
  const table = useDataTable({ initialSort: { field: defaultSort, direction: 'asc' } });

  const query = useMemo(
    () => ({ ...filters.query, ordering: table.ordering ?? defaultSort }),
    [filters.query, table.ordering, defaultSort],
  );

  const list = useMasterList(config.key, query);
  const activate = useActivateMaster(config.key);
  const deactivate = useDeactivateMaster(config.key);

  const rows = list.data?.items ?? [];
  const pagination = list.data?.pagination;

  const isFy = config.formVariant === 'financial-year';

  const columns = useMemo<ColumnDef<MasterRecord>[]>(
    () => [
      isFy
        ? {
            id: 'label',
            header: 'Label',
            sortField: 'label',
            cell: (r) => <span className="font-medium text-foreground">{r.label as string}</span>,
          }
        : {
            id: 'name_en',
            header: 'Name (English)',
            sortField: 'name_en',
            cell: (r) => <span className="font-medium text-foreground">{r.name_en}</span>,
          },
      isFy
        ? {
            id: 'start_date',
            header: 'Start date',
            sortField: 'start_date',
            cell: (r) => <span className="text-sm text-muted-foreground">{r.start_date as string}</span>,
          }
        : {
            id: 'name_hi',
            header: 'नाम (Hindi)',
            cell: (r) => <span className="text-sm text-muted-foreground">{r.name_hi ?? '—'}</span>,
          },
      ...(isFy
        ? [{
            id: 'end_date',
            header: 'End date',
            sortField: 'end_date',
            cell: (r: MasterRecord) => <span className="text-sm text-muted-foreground">{r.end_date as string}</span>,
          }]
        : [{
            id: 'slug',
            header: 'Slug',
            defaultHidden: true,
            cell: (r: MasterRecord) => <code className="text-xs text-muted-foreground">{r.slug}</code>,
          }]
      ),
      ...(isBlocks ? [{
        id: 'district',
        header: 'District',
        sortField: 'district_id',
        cell: (r: MasterRecord) => {
          const d = r.district as { name_en?: string } | undefined;
          return <span className="text-sm text-muted-foreground">{d?.name_en ?? '—'}</span>;
        },
      }] : []),
      ...(isEventTypes ? [{
        id: 'event_category',
        header: 'Category',
        sortField: 'event_category_id',
        cell: (r: MasterRecord) => {
          const c = r.event_category as { name_en?: string } | undefined;
          return <span className="text-sm text-muted-foreground">{c?.name_en ?? '—'}</span>;
        },
      }] : []),
      ...(isProcurementUpdateTypes ? [{
        id: 'procurement_update_category',
        header: 'Category',
        sortField: 'procurement_update_category_id',
        cell: (r: MasterRecord) => {
          const c = r.procurement_update_category as { name_en?: string } | undefined;
          return <span className="text-sm text-muted-foreground">{c?.name_en ?? '—'}</span>;
        },
      }] : []),
      ...(isDocumentTypes ? [{
        id: 'document_section',
        header: 'Destination',
        cell: (r: MasterRecord) => {
          const section = r.document_section as string | undefined;
          const kc = r.knowledge_category as { name_en?: string } | null | undefined;
          const ct = r.communication_type as { name_en?: string } | null | undefined;
          const parentName = section === 'notifications' ? ct?.name_en : kc?.name_en;
          return (
            <div className="flex items-center gap-1.5">
              <Badge tone={section === 'notifications' ? 'info' : 'default'} dot>
                {section === 'notifications' ? 'Notifications' : 'Publications'}
              </Badge>
              <span className="text-sm text-muted-foreground">{parentName ?? '—'}</span>
            </div>
          );
        },
      }] : []),
      ...(config.hasDisplayOrder !== false ? [{
        id: 'display_order',
        header: 'Order',
        sortField: 'display_order',
        cell: (r: MasterRecord) => <span className="text-sm text-muted-foreground">{r.display_order ?? '—'}</span>,
      }] : []),
      {
        id: 'is_active',
        header: 'Status',
        cell: (r) =>
          r.is_active ? (
            <Badge tone="success" dot>Active</Badge>
          ) : (
            <Badge tone="muted" dot>Inactive</Badge>
          ),
      },
      {
        id: 'actions',
        header: <span className="sr-only">Actions</span>,
        isActionColumn: true,
        align: 'right',
        cell: (r) => {
          const items: Array<{ label: string; onSelect: () => void; disabled?: boolean }> = [];
          if (config.editMode === 'full') {
            items.push({ label: 'Edit', onSelect: () => { setEditRecord(r); setDialogOpen(true); } });
          }
          items.push(
            r.is_active
              ? { label: 'Deactivate', disabled: categoryActionsDisabled, onSelect: () => void deactivate.mutateAsync(r.id) }
              : { label: 'Activate', onSelect: () => void activate.mutateAsync(r.id) },
          );
          return (
            <Can anyOf={['masters.update', 'masters.activate', 'masters.deactivate']}>
              <Dropdown
                trigger={
                  <Button variant="ghost" size="sm" aria-label="Record actions">
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                }
                items={items}
              />
            </Can>
          );
        },
      },
    ],
    [config, categoryActionsDisabled, isFy, isBlocks, isEventTypes, isProcurementUpdateTypes, isDocumentTypes, activate, deactivate],
  );

  const openCreate = () => { setEditRecord(undefined); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditRecord(undefined); };

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <SearchInput
              value={filters.search}
              onValueChange={filters.setSearch}
              placeholder={`Search ${config.label.toLowerCase()}…`}
              className="max-w-xs"
            />
            {isBlocks && (
              <div className="flex items-center gap-1.5">
                <Label htmlFor="master-district-filter" className="sr-only">District</Label>
                <Select
                  id="master-district-filter"
                  value={filters.filters.district_id ?? ''}
                  onChange={(e) => filters.setFilter('district_id', e.target.value || undefined)}
                  options={[{ value: '', label: 'All districts' }, ...districts.options]}
                  className="w-44"
                />
              </div>
            )}
            {isEventTypes && (
              <div className="flex items-center gap-1.5">
                <Label htmlFor="master-category-filter" className="sr-only">Event category</Label>
                <Select
                  id="master-category-filter"
                  value={filters.filters.event_category_id ?? ''}
                  onChange={(e) => filters.setFilter('event_category_id', e.target.value || undefined)}
                  options={[{ value: '', label: 'All categories' }, ...eventCategories.options]}
                  className="w-52"
                />
              </div>
            )}
            {isProcurementUpdateTypes && (
              <div className="flex items-center gap-1.5">
                <Label htmlFor="master-procurement-category-filter" className="sr-only">Procurement update category</Label>
                <Select
                  id="master-procurement-category-filter"
                  value={filters.filters.procurement_update_category_id ?? ''}
                  onChange={(e) => filters.setFilter('procurement_update_category_id', e.target.value || undefined)}
                  options={[{ value: '', label: 'All categories' }, ...procurementUpdateCategories.options]}
                  className="w-52"
                />
              </div>
            )}
            {isDocumentTypes && (
              <div className="flex items-center gap-1.5">
                <Label htmlFor="master-section-filter" className="sr-only">Destination</Label>
                <Select
                  id="master-section-filter"
                  value={documentSection}
                  onChange={(e) => {
                    filters.setFilter('document_section', e.target.value || undefined);
                    filters.setFilter('knowledge_category_id', undefined);
                    filters.setFilter('communication_type_id', undefined);
                  }}
                  options={[
                    { value: '', label: 'All destinations' },
                    { value: 'publications', label: 'Publications' },
                    { value: 'notifications', label: 'Notifications' },
                  ]}
                  className="w-44"
                />
              </div>
            )}
            {isDocumentTypes && documentSection !== 'notifications' && (
              <div className="flex items-center gap-1.5">
                <Label htmlFor="master-kc-filter" className="sr-only">Knowledge category</Label>
                <Select
                  id="master-kc-filter"
                  value={filters.filters.knowledge_category_id ?? ''}
                  onChange={(e) => filters.setFilter('knowledge_category_id', e.target.value || undefined)}
                  options={[{ value: '', label: 'All knowledge categories' }, ...knowledgeCategories.options]}
                  className="w-52"
                />
              </div>
            )}
            {isDocumentTypes && documentSection === 'notifications' && (
              <div className="flex items-center gap-1.5">
                <Label htmlFor="master-ct-filter" className="sr-only">Communication type</Label>
                <Select
                  id="master-ct-filter"
                  value={filters.filters.communication_type_id ?? ''}
                  onChange={(e) => filters.setFilter('communication_type_id', e.target.value || undefined)}
                  options={[{ value: '', label: 'All communication types' }, ...communicationTypes.options]}
                  className="w-52"
                />
              </div>
            )}
            {filters.isActive && (
              <button
                type="button"
                onClick={filters.reset}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Clear filters
              </button>
            )}
          </div>
          {config.editMode === 'full' ? (
            <Can permission="masters.create">
              <Button variant="primary" size="sm" onClick={openCreate} disabled={categoryActionsDisabled}>
                <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Add record
              </Button>
            </Can>
          ) : null}
        </div>

        <Card className="p-0">
          <DataTable<MasterRecord>
            columns={columns}
            data={{
              rows,
              totalItems: pagination?.total_items ?? 0,
              totalPages: pagination?.total_pages ?? 0,
              isLoading: list.isLoading,
              isError: list.isError,
              error: list.error,
            }}
            getRowId={(r) => r.id}
            sort={table.sort}
            onSortChange={table.onSortChange}
            hiddenColumns={table.hiddenColumns}
            onRetry={() => void list.refetch()}
            emptyState={
              <EmptyState
                title={`No ${config.label.toLowerCase()} found`}
                description={
                  filters.isActive
                    ? 'Try a different search term.'
                    : config.editMode === 'full'
                    ? 'Add the first record using the button above.'
                    : 'Records are seeded by the system administrator.'
                }
                action={
                  filters.isActive ? (
                    <Button variant="outline" size="sm" onClick={filters.reset}>
                      Clear search
                    </Button>
                  ) : config.editMode === 'full' ? (
                    <Can permission="masters.create">
                      <Button variant="outline" size="sm" onClick={openCreate} disabled={categoryActionsDisabled}>
                        <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" />
                        Add record
                      </Button>
                    </Can>
                  ) : undefined
                }
              />
            }
          />
        </Card>

        {pagination ? (
          <Pagination
            page={pagination.page}
            pageSize={pagination.page_size}
            totalItems={pagination.total_items}
            totalPages={pagination.total_pages}
            onPageChange={filters.setPage}
          />
        ) : null}
      </div>

      <MasterFormDialog
        open={dialogOpen}
        onClose={closeDialog}
        config={config}
        record={editRecord}
      />
    </>
  );
}
