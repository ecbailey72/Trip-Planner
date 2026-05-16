import { useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API_URL || '/api';

const PHASES = [
  { value: 'preTrip',    label: 'Pre-trip' },
  { value: 'duringTrip', label: 'During trip' },
  { value: 'postTrip',   label: 'Post-trip' },
];

const emptyForm = {
  title: '',
  notes: '',
  phase: 'preTrip',
  dueDateType: 'relative',
  absoluteDueDate: '',
  relativeDueDays: '',
  status: 'todo'
};

function StatusIcon({ status, onClick }) {
  if (status === 'complete') return (
    <svg onClick={onClick} width="26" height="26" viewBox="0 0 26 26" style={{ cursor: 'pointer', flexShrink: 0 }}>
      <circle cx="13" cy="13" r="12" fill="#1B2A4A"/>
      <path d="M8 13l4 4L18 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
  if (status === 'inProgress') return (
    <svg onClick={onClick} width="26" height="26" viewBox="0 0 26 26" style={{ cursor: 'pointer', flexShrink: 0 }}>
      <circle cx="13" cy="13" r="12" fill="none" stroke="#BA7517" strokeWidth="2.5"/>
      <path d="M13 1 A12 12 0 0 1 25 13" stroke="#BA7517" strokeWidth="3" strokeLinecap="round" fill="none"/>
      <circle cx="13" cy="13" r="4" fill="#BA7517"/>
    </svg>
  );
  return (
    <svg onClick={onClick} width="26" height="26" viewBox="0 0 26 26" style={{ cursor: 'pointer', flexShrink: 0 }}>
      <circle cx="13" cy="13" r="12" fill="none" stroke="#ccc" strokeWidth="2"/>
    </svg>
  );
}

function ChecklistTab({ tripId, tripStartDate }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [activePhase, setActivePhase] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [form, setForm] = useState(emptyForm);

  useEffect(() => { fetchTasks(); }, [tripId]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/trips/${tripId}/tasks`);
      setTasks(sortTasks(res.data));
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const sortTasks = (taskList) => {
    return [...taskList].sort((a, b) => {
      // First sort by phase
      const phaseOrder = { preTrip: 0, duringTrip: 1, postTrip: 2 };
      if (phaseOrder[a.phase] !== phaseOrder[b.phase]) return phaseOrder[a.phase] - phaseOrder[b.phase];
      // Then by due date — tasks with no due date go to bottom
      const getSort = (t) => {
        if (t.dueDateType === 'absolute' && t.absoluteDueDate) return t.absoluteDueDate;
        if (t.dueDateType === 'relative' && t.relativeDueDays !== '') return null; // handle numerically
        return 'zzz';
      };
      const aAbsolute = getSort(a);
      const bAbsolute = getSort(b);
      // Both relative — sort numerically
      if (a.dueDateType === 'relative' && b.dueDateType === 'relative' && a.relativeDueDays !== '' && b.relativeDueDays !== '') {
        return Number(a.relativeDueDays) - Number(b.relativeDueDays);
      }
      // Both absolute — sort by date string
      if (aAbsolute && bAbsolute && aAbsolute !== 'zzz' && bAbsolute !== 'zzz') return aAbsolute.localeCompare(bAbsolute);
      // No due date goes to bottom
      if (aAbsolute === 'zzz' && bAbsolute !== 'zzz') return 1;
      if (aAbsolute !== 'zzz' && bAbsolute === 'zzz') return -1;
      return 0;
    });
  };

  const openForm = (task = null) => {
    if (task) {
      setEditingTask(task);
      setForm({
        title: task.title,
        notes: task.notes || '',
        phase: task.phase,
        dueDateType: task.dueDateType,
        absoluteDueDate: task.absoluteDueDate || '',
        relativeDueDays: task.relativeDueDays || '',
        status: task.status
      });
    } else {
      setEditingTask(null);
      setForm(emptyForm);
    }
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title) return alert('Please enter a task title');
    try {
      if (editingTask) {
        const res = await axios.put(`${API}/trips/${tripId}/tasks/${editingTask._id}`, form);
        setTasks(sortTasks(tasks.map(t => t._id === editingTask._id ? res.data : t)));
      } else {
        const res = await axios.post(`${API}/trips/${tripId}/tasks`, form);
        setTasks(sortTasks([...tasks, res.data]));
      }
      setShowForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Error saving task:', err);
      alert('Error saving task.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await axios.delete(`${API}/trips/${tripId}/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const cycleStatus = async (task) => {
    const next = task.status === 'todo' ? 'inProgress' : task.status === 'inProgress' ? 'complete' : 'todo';
    const completedDate = next === 'complete' ? new Date().toISOString().split('T')[0] : '';
    try {
      const res = await axios.put(`${API}/trips/${tripId}/tasks/${task._id}`, { ...task, status: next, completedDate });
      setTasks(sortTasks(tasks.map(t => t._id === task._id ? res.data : t)));
    } catch (err) {
      console.error('Error updating task:', err);
    }
  };

  const getDueLabel = (task) => {
    if (task.dueDateType === 'absolute' && task.absoluteDueDate) {
      const due = new Date(task.absoluteDueDate + 'T12:00:00');
      const today = new Date();
      const diffDays = Math.ceil((due - today) / 86400000);
      if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`, color: '#cc4444' };
      if (diffDays === 0) return { text: 'Due today', color: '#BA7517' };
      if (diffDays <= 2) return { text: `Due in ${diffDays} day${diffDays !== 1 ? 's' : ''}`, color: '#BA7517' };
      return { text: `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`, color: '#888' };
    }
    if (task.dueDateType === 'relative' && task.relativeDueDays && tripStartDate) {
      const start = new Date(tripStartDate + 'T12:00:00');
      const due = new Date(start.getTime() + task.relativeDueDays * 86400000);
      const today = new Date();
      const diffDays = Math.ceil((due - today) / 86400000);
      const label = task.relativeDueDays < 0
        ? `${Math.abs(task.relativeDueDays)} days before departure`
        : `${task.relativeDueDays} days after departure`;
      if (diffDays < 0 && task.status !== 'complete') return { text: `Overdue · ${label}`, color: '#cc4444' };
      return { text: label, color: '#888' };
    }
    return null;
  };

  // Filter tasks
  const filtered = tasks.filter(t => {
    if (activePhase !== 'all' && t.phase !== activePhase) return false;
    if (activeStatus === 'active' && t.status === 'complete') return false;
    if (activeStatus !== 'all' && activeStatus !== 'active' && t.status !== activeStatus) return false;
    return true;
  });

  // Group by phase
  const grouped = filtered.reduce((acc, t) => {
    if (!acc[t.phase]) acc[t.phase] = [];
    acc[t.phase].push(t);
    return acc;
  }, {});

  const complete = tasks.filter(t => t.status === 'complete').length;
  const total = tasks.length;
  const pct = total > 0 ? Math.round(complete / total * 100) : 0;

  const phaseLabel = (p) => ({ preTrip: 'Pre-trip', duringTrip: 'During trip', postTrip: 'Post-trip' }[p] || p);

  return (
    <div>
      {/* Progress bar */}
      {total > 0 && (
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#888', marginBottom: '6px' }}>
            <span>{complete} of {total} complete</span>
            <span>{pct}%</span>
          </div>
          <div style={{ height: '6px', background: '#e0e0e0', borderRadius: '3px' }}>
            <div style={{ height: '6px', borderRadius: '3px', background: '#1B2A4A', width: `${pct}%`, transition: 'width 0.3s' }} />
          </div>
          <div style={{ display: 'flex', gap: '14px', marginTop: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>✓ {complete} done</span>
            <span style={{ fontSize: '12px', color: '#BA7517' }}>◑ {tasks.filter(t => t.status === 'inProgress').length} in progress</span>
            <span style={{ fontSize: '12px', color: '#888' }}>○ {tasks.filter(t => t.status === 'todo').length} to do</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1rem' }}>
        {['all', 'active', 'todo', 'inProgress', 'complete'].map(f => (
          <button key={f} onClick={() => setActiveStatus(f)}
            style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '20px', border: '1px solid #ccc', background: activeStatus === f ? '#1a1a18' : 'transparent', color: activeStatus === f ? 'white' : '#666', cursor: 'pointer' }}>
            {f === 'all' ? 'All' : f === 'active' ? 'Active' : f === 'inProgress' ? 'In progress' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
        <div style={{ borderLeft: '1px solid #ddd', margin: '0 4px' }} />
        {['all', 'preTrip', 'duringTrip', 'postTrip'].map(p => (
          <button key={p} onClick={() => setActivePhase(p)}
            style={{ padding: '4px 12px', fontSize: '12px', borderRadius: '20px', border: '1px solid #ccc', background: activePhase === p ? '#1B2A4A' : 'transparent', color: activePhase === p ? 'white' : '#666', cursor: 'pointer' }}>
            {p === 'all' ? 'All phases' : phaseLabel(p)}
          </button>
        ))}
      </div>

      {/* Add task button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button onClick={() => openForm()}
          style={{ padding: '8px 16px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>
          + Add Task
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#f5f5f5', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '16px', fontWeight: '600' }}>{editingTask ? 'Edit Task' : 'New Task'}</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Task *</label>
              <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="What needs to be done?"
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Phase</label>
              <select value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                {PHASES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Status</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="todo">To do</option>
                <option value="inProgress">In progress</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Due date type</label>
              <select value={form.dueDateType} onChange={e => setForm({ ...form, dueDateType: e.target.value })}
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }}>
                <option value="relative">Relative to departure</option>
                <option value="absolute">Specific date</option>
              </select>
            </div>

            {form.dueDateType === 'absolute' ? (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Due date</label>
                <input type="date" value={form.absoluteDueDate} onChange={e => setForm({ ...form, absoluteDueDate: e.target.value })}
                  style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                  {form.phase === 'preTrip' ? 'Days before departure' : form.phase === 'postTrip' ? 'Days after return' : 'Days after departure'}
                </label>
                <input type="number" min="0" value={Math.abs(form.relativeDueDays || 0) || ''} 
                  onChange={e => {
                    const val = parseInt(e.target.value) || '';
                    const signed = val === '' ? '' : form.phase === 'preTrip' ? -Math.abs(val) : Math.abs(val);
                    setForm({ ...form, relativeDueDays: signed });
                  }}
                  placeholder="e.g. 14"
                  style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
                <div style={{ fontSize: '11px', color: '#888', marginTop: '3px' }}>
                  {form.phase === 'preTrip' ? 'How many days before departure' : form.phase === 'postTrip' ? 'How many days after you return' : 'Which day of the trip'}
                </div>
              </div>
            )}

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Notes</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                placeholder="Reference info, confirmation numbers, links..."
                style={{ width: '100%', padding: '8px 10px', fontSize: '14px', borderRadius: '6px', border: '1px solid #ccc' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSave}
              style={{ padding: '8px 20px', background: '#1B2A4A', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              {editingTask ? 'Save changes' : 'Add task'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingTask(null); }}
              style={{ padding: '8px 20px', background: 'transparent', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Tasks list */}
      {loading ? (
        <p style={{ color: '#888' }}>Loading checklist...</p>
      ) : filtered.length === 0 ? (
        <p style={{ color: '#888', fontSize: '13px' }}>{tasks.length === 0 ? 'No tasks yet. Add your first task!' : 'No tasks match this filter.'}</p>
      ) : (
        <div>
          {(activePhase === 'all' ? ['preTrip', 'duringTrip', 'postTrip'] : [activePhase]).map(phase => {
            const phaseTasks = grouped[phase];
            if (!phaseTasks || phaseTasks.length === 0) return null;
            return (
              <div key={phase} style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  {phaseLabel(phase)}
                </div>
                <div style={{ background: 'white', border: '1px solid #e0e0e0', borderRadius: '12px', padding: '0 1rem' }}>
                  {phaseTasks.map((task, idx) => {
                    const dueInfo = getDueLabel(task);
                    return (
                      <div key={task._id} style={{
                        display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 0',
                        borderBottom: idx < phaseTasks.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}>
                        <StatusIcon status={task.status} onClick={() => cycleStatus(task)} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                            <div style={{ fontSize: '14px', fontWeight: '500', color: task.status === 'complete' ? '#aaa' : '#1a1a18', textDecoration: task.status === 'complete' ? 'line-through' : 'none' }}>
                              {task.title}
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                              <button onClick={() => openForm(task)}
                                style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #ccc', borderRadius: '6px', background: 'transparent', color: '#555', cursor: 'pointer' }}>Edit</button>
                              <button onClick={() => handleDelete(task._id)}
                                style={{ fontSize: '11px', padding: '2px 8px', border: '1px solid #ffcccc', borderRadius: '6px', background: 'transparent', color: '#cc4444', cursor: 'pointer' }}>Delete</button>
                            </div>
                          </div>
                          {dueInfo && task.status !== 'complete' && (
                            <div style={{ fontSize: '11px', color: dueInfo.color, marginTop: '2px', fontWeight: dueInfo.color === '#cc4444' ? '600' : '400' }}>
                              {dueInfo.text}
                            </div>
                          )}
                          {task.notes && (
                            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px', padding: '4px 8px', background: '#f8f8f5', borderLeft: '2px solid #ddd' }}>
                              {task.notes}
                            </div>
                          )}
                          <div style={{ marginTop: '6px' }}>
                            <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '20px', fontWeight: '500',
                              background: task.status === 'complete' ? '#EEF1F8' : task.status === 'inProgress' ? '#FAEEDA' : '#f0f0f0',
                              color: task.status === 'complete' ? '#1B2A4A' : task.status === 'inProgress' ? '#BA7517' : '#888'
                            }}>
                              {task.status === 'complete' ? 'Complete' : task.status === 'inProgress' ? 'In progress' : 'To do'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ChecklistTab;
