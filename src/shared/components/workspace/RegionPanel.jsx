import { useState, useCallback } from 'react'
import { cn } from '../../utils'
import { useWorkspaceStore } from '../../../app/stores/workspaceStore'
import { useUIStore } from '../../../app/stores/uiStore'
import { User, Image, Type, Zap, Palette, Square, MoreVertical, Check, Clock, AlertCircle } from 'lucide-react'
import { REGION_COLORS } from '../../constants'

const statusIcons = {
  APPROVED: Check,
  COMPLETED: Check,
  SUBMITTED: Check,
  IN_PROGRESS: Clock,
  PENDING: AlertCircle,
}

const statusLabels = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  APPROVED: 'Approved',
  SUBMITTED: 'Submitted',
}

const REGION_TYPES = ['BACKGROUND', 'CHARACTER', 'TEXT', 'EFFECT', 'TONE', 'OTHER']

const typeIcons = {
  BACKGROUND: Image,
  CHARACTER: User,
  TEXT: Type,
  EFFECT: Zap,
  TONE: Palette,
  OTHER: Square,
}

export function RegionPanel() {
  const regions = useWorkspaceStore((s) => s.regions)
  const selectedRegionId = useWorkspaceStore((s) => s.selectedRegionId)
  const selectRegion = useWorkspaceStore((s) => s.selectRegion)
  const updateRegion = useWorkspaceStore((s) => s.updateRegion)
  const addToast = useUIStore((s) => s.addToast)
  const [editLabel, setEditLabel] = useState('')

  const selectedRegion = regions.find(r => r.id === selectedRegionId)

  const handleLabelSave = useCallback((region) => {
    if (editLabel.trim() && editLabel !== region.label) {
      updateRegion(region.id, { label: editLabel.trim() })
      addToast({ title: 'Region label updated', variant: 'info' })
    }
  }, [editLabel, updateRegion, addToast])

  const handleTypeChange = useCallback((region, type) => {
    updateRegion(region.id, { regionType: type })
    addToast({ title: `Type changed to ${type}`, variant: 'info' })
  }, [updateRegion, addToast])

  if (regions.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-xs text-on-surface-variant/60">No regions defined — select Region tool on canvas to create regions</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4">
      <div className="space-y-2">
        <h4 className="text-sm font-bold text-on-surface flex items-center justify-between">
          Regions
          <span className="text-on-surface-variant font-medium text-xs">{regions.length} Total</span>
        </h4>

        <div className="space-y-2">
          {regions.map((r) => {
            const TypeIcon = typeIcons[r.regionType] || Square
            const StatusIcon = statusIcons[r.status] || AlertCircle
            const color = REGION_COLORS[r.regionType] || '#6b7280'
            const isSelected = selectedRegionId === r.id

            const statusColorClass = {
              APPROVED: 'text-status-success',
              COMPLETED: 'text-status-success',
              SUBMITTED: 'text-primary',
              IN_PROGRESS: 'text-status-warning',
              PENDING: 'text-on-surface-variant',
            }[r.status] || 'text-on-surface-variant'

            return (
              <div key={r.id}>
                <div
                  onClick={() => {
                    selectRegion(isSelected ? null : r.id)
                    if (!isSelected) setEditLabel(r.label || '')
                  }}
                  className={cn(
                    'group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border',
                    isSelected
                      ? 'bg-surface-container border-primary/50'
                      : 'bg-surface-container-lowest border-outline-variant/30 hover:border-primary/50',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center border"
                      style={{
                        backgroundColor: `${color}1a`,
                        borderColor: `${color}33`,
                      }}
                    >
                      <TypeIcon size={20} style={{ color }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-on-surface">{r.label || r.regionType}</div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tighter">
                        <span style={{ color }}>{r.regionType}</span>
                        <span className="text-on-surface-variant font-medium normal-case">·</span>
                        <span className={cn('flex items-center gap-1 font-medium normal-case', statusColorClass)}>
                          <StatusIcon size={11} />
                          {statusLabels[r.status] || r.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <MoreVertical size={16} className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {isSelected && (
                  <div className="px-4 pb-3 pt-2 space-y-2 bg-surface-container-lowest border-x border-b border-outline-variant/30 rounded-b-xl -mt-1">
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">Label</label>
                      <input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onBlur={() => handleLabelSave(r)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.target.blur() } }}
                        className="w-full h-8 px-2.5 text-sm bg-surface-container-low border border-outline-variant/30 outline-none focus:border-primary text-on-surface rounded-lg placeholder:text-on-surface-variant/40"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant block mb-1">Type</label>
                      <div className="flex flex-wrap gap-1.5">
                        {REGION_TYPES.map((t) => {
                          const tc = REGION_COLORS[t]
                          const isActive = r.regionType === t
                          return (
                            <button
                              key={t}
                              onClick={() => handleTypeChange(r, t)}
                              className={cn(
                                'text-xs px-2.5 py-1 rounded-lg border transition-all',
                                isActive
                                  ? 'border-primary text-on-surface font-semibold bg-primary/5'
                                  : 'border-outline-variant/30 text-on-surface-variant hover:text-on-surface hover:border-outline-variant',
                              )}
                            >
                              <span className="inline-block w-2 h-2 mr-1.5 align-middle rounded-sm" style={{ background: tc }} />
                              {t}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
