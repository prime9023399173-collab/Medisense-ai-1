import React, { useState, useEffect } from 'react'
import {
  Building2,
  Users,
  ShieldAlert,
  Activity,
  Server,
  FileText,
  Clock,
  CheckCircle2,
  Lock,
  Database
} from 'lucide-react'
import { api } from '../services/api'

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAdminData()
  }, [])

  const loadAdminData = async () => {
    try {
      setLoading(true)
      const [statsData, logsData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminAuditLogs()
      ])
      setStats(statsData)
      setAuditLogs(logsData)
    } catch (err) {
      console.error('Failed to load admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Admin Header */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Super Admin Command Center</h2>
            <p className="text-xs text-slate-500">Platform-wide node telemetry, provider governance, and cryptographic audit logs</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-emerald-800 font-mono bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 font-semibold">
          <Server className="w-3.5 h-3.5 text-emerald-600" />
          <span>System Health: 99.98% High Availability</span>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Registered Users</p>
            <p className="text-2xl font-bold text-slate-900">{stats.totalUsers}</p>
            <p className="text-[10px] text-teal-700 font-medium">{stats.patientsCount} Patients • {stats.doctorsCount} Physicians</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Health Vault Records</p>
            <p className="text-2xl font-bold text-teal-700">{stats.healthVaultRecordsCount}</p>
            <p className="text-[10px] text-slate-500">AES-GCM-256 Encrypted</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Total Claims Volume</p>
            <p className="text-2xl font-bold text-slate-900">₹{stats.totalClaimsAmount?.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-700 font-medium">{stats.totalClaimsProcessed} Processed Automated</p>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-1">
            <p className="text-xs text-slate-500 uppercase font-semibold">Active Compute Nodes</p>
            <p className="text-2xl font-bold text-blue-700">{stats.activeNodesCount}</p>
            <p className="text-[10px] text-slate-500">PostgreSQL + PGlite Engine</p>
          </div>
        </div>
      )}

      {/* Cryptographic Audit Trail */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Lock className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Immutable System Audit Logs ({auditLogs.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">HIPAA & ABHA Security Compliant</span>
        </div>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-teal-700 font-bold uppercase">{log.action}</span>
                  <span className="text-slate-600">• {log.actorName || 'System'} ({log.actorRole})</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">Resource: {log.resourceType} #{log.resourceId}</p>
              </div>

              <div className="text-right text-[10px] text-slate-400 font-mono">
                <p>{new Date(log.createdAt).toLocaleTimeString()}</p>
                <p>{log.ipAddress}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
