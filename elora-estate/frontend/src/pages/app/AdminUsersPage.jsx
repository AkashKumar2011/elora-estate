import { useEffect, useState, useCallback } from 'react';
import * as adminUsersApi from '../../api/adminUsers';
import Button from '../../components/Button';
import Chip from '../../components/Chip';

const PERMISSION_LABELS = {
  viewClientInfo: 'Client info',
  viewClientNotes: 'Client notes',
  viewBrokerInfo: 'Broker info',
  viewCompanyReports: 'Company reports',
  viewVisitInfo: 'Visit info',
};

function PermissionsEditor({ user, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = async (key) => {
    await adminUsersApi.updateUserPermissions(user._id, { [key]: !user.permissions?.[key] });
    onChange();
  };

  if (!isOpen) {
    return (
      <Button size="sm" variant="ghost" onClick={() => setIsOpen(true)}>
        Permissions
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
        <Chip key={key} size="sm" selected={!!user.permissions?.[key]} onClick={() => toggle(key)}>
          {label}
        </Chip>
      ))}
    </div>
  );
}

function UserRow({ user, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 flex-wrap">
      <div className="min-w-0">
        <p className="font-medium">{user.name} <span className="text-harbor text-xs capitalize font-normal">({user.role.replace('_', ' ')})</span></p>
        <p className="text-harbor text-xs font-mono">{user.mobile}</p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {user.status === 'pending_approval' && (
          <>
            <Button size="sm" onClick={async () => { await adminUsersApi.approveUser(user._id); onChange(); }}>Approve</Button>
            <Button size="sm" variant="outline" onClick={async () => { await adminUsersApi.rejectUser(user._id); onChange(); }}>Reject</Button>
          </>
        )}
        {user.status === 'active' && (
          <>
            {user.role === 'owner_caretaker' && <PermissionsEditor user={user} onChange={onChange} />}
            <Button size="sm" variant="ghost" onClick={async () => { await adminUsersApi.deactivateUser(user._id); onChange(); }}>Deactivate</Button>
          </>
        )}
        {user.status === 'deactivated' && (
          <Button size="sm" variant="outline" onClick={async () => { await adminUsersApi.reactivateUser(user._id); onChange(); }}>Reactivate</Button>
        )}
        <span className="text-xs px-2 py-1 rounded-full border border-harbor-200 capitalize whitespace-nowrap">
          {user.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (role) params.role = role;
      if (status) params.status = status;
      const { data } = await adminUsersApi.listInternalUsers(params);
      setUsers(data.users);
    } finally {
      setIsLoading(false);
    }
  }, [role, status]);

  useEffect(() => {
    load();
  }, [load]);

  const pendingCount = users.filter((u) => u.status === 'pending_approval').length;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
      <h1 className="font-display text-2xl mb-1">Users</h1>
      {pendingCount > 0 && !status && (
        <p className="text-laterite-700 text-sm mb-4">{pendingCount} account{pendingCount > 1 ? 's' : ''} waiting for approval.</p>
      )}

      <div className="flex flex-wrap gap-4 mb-5">
        <div className="flex gap-1.5">
          <Chip size="sm" selected={role === ''} onClick={() => setRole('')}>All roles</Chip>
          <Chip size="sm" selected={role === 'broker'} onClick={() => setRole('broker')}>Broker</Chip>
          <Chip size="sm" selected={role === 'owner_caretaker'} onClick={() => setRole('owner_caretaker')}>Owner/Caretaker</Chip>
        </div>
        <div className="flex gap-1.5">
          <Chip size="sm" selected={status === ''} onClick={() => setStatus('')}>All statuses</Chip>
          <Chip size="sm" selected={status === 'pending_approval'} onClick={() => setStatus('pending_approval')}>Pending</Chip>
          <Chip size="sm" selected={status === 'active'} onClick={() => setStatus('active')}>Active</Chip>
          <Chip size="sm" selected={status === 'deactivated'} onClick={() => setStatus('deactivated')}>Deactivated</Chip>
        </div>
      </div>

      {isLoading ? (
        <p className="text-harbor">Loading…</p>
      ) : users.length === 0 ? (
        <p className="text-harbor">No users match this filter.</p>
      ) : (
        <div className="border border-harbor-200 bg-chalk divide-y divide-harbor-200">
          {users.map((u) => (
            <UserRow key={u._id} user={u} onChange={load} />
          ))}
        </div>
      )}
    </div>
  );
}
