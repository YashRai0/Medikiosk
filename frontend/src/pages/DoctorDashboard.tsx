import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, RefreshCw, UserCheck, Clock, FileText, ChevronRight } from 'lucide-react';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { Card } from '../components/Card';
import { listSessions } from '../api/sessions';

interface OPDQueueItem {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  language: string;
  status: string;
  approvalStatus?: string;
  createdAt: string;
}

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<OPDQueueItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const data = await listSessions();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (e) {
      console.warn('Fallback to local demo list', e);
      setSessions([
        {
          id: 'MK-DEMO-001',
          patientId: 'PAT-DEMO-1',
          patientName: 'Demo Patient',
          patientAge: 42,
          patientGender: 'male',
          language: 'Hindi',
          status: 'history_complete',
          approvalStatus: 'pending',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const filtered = sessions.filter(s => {
    const isApproved = s.approvalStatus === 'approved' || s.status === 'approved';
    if (filter === 'pending') return !isApproved;
    if (filter === 'approved') return isApproved;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto w-full pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Stethoscope className="w-7 h-7 text-teal-600" />
            <h1 className="text-3xl font-extrabold text-navy-900">
              Physician OPD Case Queue
            </h1>
          </div>
          <p className="text-slate-500 text-sm">
            AI-assisted pre-consultation intake drafts awaiting clinical review and verification.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchSessions}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Queue</span>
          </Button>

          <Button
            size="sm"
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold"
            onClick={() => navigate('/doctor/review/MK-DEMO-001')}
          >
            Quick Demo Case (MK-DEMO-001)
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6 bg-slate-200 p-1.5 rounded-2xl inline-flex shadow-inner">
        <button
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            filter === 'all' ? 'bg-white shadow text-teal-700' : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setFilter('all')}
        >
          All Patients ({sessions.length})
        </button>
        <button
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            filter === 'pending' ? 'bg-white shadow text-teal-700' : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setFilter('pending')}
        >
          Pending Review
        </button>
        <button
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
            filter === 'approved' ? 'bg-white shadow text-teal-700' : 'text-slate-600 hover:text-slate-900'
          }`}
          onClick={() => setFilter('approved')}
        >
          Physician Verified
        </button>
      </div>

      {/* OPD Queue Table */}
      <Card className="overflow-hidden border-2 border-slate-200 shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-xs uppercase tracking-wider">
                <th className="p-4 font-extrabold">Time</th>
                <th className="p-4 font-extrabold">Session ID</th>
                <th className="p-4 font-extrabold">Patient Name</th>
                <th className="p-4 font-extrabold">Age / Gender</th>
                <th className="p-4 font-extrabold">Language</th>
                <th className="p-4 font-extrabold">Intake Status</th>
                <th className="p-4 font-extrabold text-right">Clinical Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filtered.length > 0 ? (
                filtered.map((s) => {
                  const isApproved = s.approvalStatus === 'approved' || s.status === 'approved';
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-4 text-slate-500 font-mono">
                        {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-4 font-mono font-bold text-teal-700">{s.id}</td>
                      <td className="p-4 font-bold text-slate-900">{s.patientName}</td>
                      <td className="p-4 text-slate-600 capitalize">
                        {s.patientAge} Y / {s.patientGender}
                      </td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {s.language || 'Hindi'}
                        </span>
                      </td>
                      <td className="p-4">
                        {isApproved ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">
                            <UserCheck className="w-3.5 h-3.5" /> Physician Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                            <Clock className="w-3.5 h-3.5" /> AI Draft Pending
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          variant={isApproved ? 'outline' : 'primary'}
                          className="font-bold inline-flex items-center gap-1"
                          onClick={() => navigate(`/doctor/review/${s.id}`)}
                        >
                          <span>{isApproved ? 'View Verified' : 'Review & Verify'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No sessions found matching this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default DoctorDashboard;
